import { readCoachSession } from "@/lib/portal/session";
import { clearDemoState } from "@/lib/portal/store/demo-store";

/**
 * Återställer demoläget till seed-datan.
 * Endast coachen får anropa detta — klienten ska aldrig kunna radera sitt eget
 * eller någon annans underlag.
 */
export async function POST() {
  const session = await readCoachSession();
  if (!session) {
    return Response.json({ ok: false, error: "Endast coachen kan återställa demoläget." }, { status: 401 });
  }

  await clearDemoState();
  return Response.json({ ok: true });
}
