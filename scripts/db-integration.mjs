/**
 * Databasintegrationstester för CVB Base mot produktionens behörighetsmodell.
 *
 *   npm run test:db
 *
 * Startar en isolerad engångscontainer med samma Supabase Postgres-image som
 * produktionen, sätter produktionens default privileges (tests/db/00), kör
 * samtliga migreringar och sedan testfilerna tests/db/[1-9]*.sql som
 * portalens egna roller (authenticated/anon via JWT-claims — aldrig
 * service_role). Containern tas alltid bort efteråt; inga andra containrar
 * eller volymer berörs. Kräver Docker. Inga npm-beroenden.
 *
 * Varje testfil skriver `NOTICE:  ok - …` per godkänd kontroll. Körningen
 * underkänns vid varje ERROR och om antalet ok-rader inte är exakt lika med
 * antalet ok-kontroller i filerna (så att ett överhoppat test inte kan passera).
 */

import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MIGRATIONS = join(ROOT, "supabase", "migrations");
const TESTS = join(ROOT, "tests", "db");
// Samma image som produktionsprojektet kör (Postgres 17.6.1.155).
const IMAGE = process.env.CVB_DB_TEST_IMAGE ?? "public.ecr.aws/supabase/postgres:17.6.1.155";
const CONTAINER = `cvb-db-integration-${process.pid}-${randomBytes(3).toString("hex")}`;
const PASSWORD = randomBytes(16).toString("hex");

// Rena datamigreringar som uppdaterar produktionens seedade demokonton
// (Carolinas coachrad m.fl.). De innehåller ingen schema-, RLS- eller
// behörighetsändring och kan inte köras mot en tom databas.
const DATA_ONLY_SEED_MIGRATIONS = new Set([
  "20260826180000_cvb_base_demo_data.sql",
  "20260826210000_cvb_base_public_calendar_demo.sql",
  "20260826221000_cvb_base_fixed_block_demo.sql",
  "20260826223000_cvb_base_enable_1300_1500_block.sql",
]);

function docker(args, options = {}) {
  return spawnSync("docker", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, ...options });
}

function psql(file, { user = "postgres", stopOnError = true, singleTransaction = false } = {}) {
  const args = ["exec", "-e", `PGPASSWORD=${PASSWORD}`, CONTAINER, "psql", "-h", "localhost", "-U", user, "-d", "postgres", "-X", "-q"];
  args.push("-v", `ON_ERROR_STOP=${stopOnError ? 1 : 0}`);
  if (singleTransaction) args.push("--single-transaction");
  args.push("-f", file);
  const result = docker(args);
  return { status: result.status, output: `${result.stdout ?? ""}${result.stderr ?? ""}` };
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function waitForDatabase() {
  const deadline = Date.now() + 180_000;
  while (Date.now() < deadline) {
    const logs = docker(["logs", CONTAINER]);
    const initDone = `${logs.stdout}${logs.stderr}`.includes("PostgreSQL init process complete");
    if (initDone && docker(["exec", CONTAINER, "pg_isready", "-h", "localhost", "-U", "postgres"]).status === 0) return;
    sleep(1000);
  }
  throw new Error("Databasen startade inte inom 180 s.");
}

function cleanup() {
  docker(["rm", "-f", CONTAINER]);
}

function main() {
  if (docker(["version", "--format", "{{.Server.Version}}"]).status !== 0) {
    console.error("Docker krävs för databasintegrationstesterna.");
    process.exit(2);
  }

  console.log(`Startar isolerad databas (${IMAGE}) …`);
  const run = docker([
    "run", "-d", "--name", CONTAINER,
    "-e", `POSTGRES_PASSWORD=${PASSWORD}`,
    "-v", `${MIGRATIONS}:/migrations:ro`,
    "-v", `${TESTS}:/tests:ro`,
    IMAGE,
  ]);
  if (run.status !== 0) throw new Error(`docker run misslyckades: ${run.stderr}`);
  waitForDatabase();

  const env = psql("/tests/00_environment.sql", { user: "supabase_admin" });
  if (env.status !== 0) throw new Error(`Miljösteget misslyckades:\n${env.output}`);

  const migrations = readdirSync(MIGRATIONS).filter((f) => f.endsWith(".sql")).sort();
  let applied = 0;
  for (const file of migrations) {
    if (DATA_ONLY_SEED_MIGRATIONS.has(file)) {
      console.log(`  skip ${file} (datamigrering för produktionens seed)`);
      continue;
    }
    const result = psql(`/migrations/${file}`, { singleTransaction: true });
    if (result.status !== 0) throw new Error(`Migreringen ${file} misslyckades:\n${result.output}`);
    applied += 1;
  }
  console.log(`  ${applied} migreringar applicerade, ${DATA_ONLY_SEED_MIGRATIONS.size} datamigreringar överhoppade`);

  const testFiles = readdirSync(TESTS).filter((f) => /^[1-9].*\.sql$/.test(f)).sort();
  let failures = 0;
  let passed = 0;
  for (const file of testFiles) {
    const source = readFileSync(join(TESTS, file), "utf8");
    const expected = (source.match(/raise notice 'ok - /g) ?? []).length;
    // Fixtures must apply completely; test files run on so every failure shows.
    const isFixture = file.startsWith("10_");
    const user = /^\d+_plpgsql/.test(file) ? "supabase_admin" : "postgres";
    const result = psql(`/tests/${file}`, { user, stopOnError: isFixture });
    const oks = result.output.split("\n").filter((line) => line.includes("NOTICE:  ok - "));
    const errors = result.output.split("\n").filter((line) => /\bERROR:/.test(line));
    passed += oks.length;
    const fileFailed = result.status !== 0 || errors.length > 0 || oks.length !== expected;
    console.log(`${fileFailed ? "FAIL" : "ok  "} ${file}  ${oks.length}/${expected}`);
    if (fileFailed) {
      failures += 1;
      for (const line of errors) console.log(`       ${line.trim()}`);
      if (oks.length !== expected) console.log(`       förväntade ${expected} ok-kontroller, fick ${oks.length}`);
      if (isFixture) console.log(result.output);
    }
  }

  console.log(`\n${passed} kontroller godkända i ${testFiles.length} filer, ${failures} filer underkända.`);
  return failures === 0;
}

let ok = false;
try {
  ok = main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
} finally {
  cleanup();
}
process.exit(ok ? 0 : 1);
