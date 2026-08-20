/**
 * Tolkar AI-svarets text till block så att det kan presenteras med samma
 * typografi som resten av produkten i stället för som rå text.
 * Ren funktion utan beroenden — enhetstestas.
 */

export type AiBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "bullet"; text: string };

const KNOWN_HEADINGS = new Set(
  [
    "sammanfattning",
    "underlag",
    "underlag från klienthistoriken",
    "underlag från uppdraget",
    "aktuellt fokus",
    "förändring sedan föregående session",
    "öppna åtaganden",
    "återkommande teman",
    "möjligt att utforska",
    "osäkerheter",
    "att förbereda",
    "utvecklingsmål",
    "fokus från föregående session",
    "klientens viktigaste egna insikter",
    "klientens viktigaste insikter",
    "tidigare åtaganden",
    "vad som hänt sedan föregående session",
    "öppna frågor",
    "möjliga områden att utforska",
    "fokus för sessionen",
    "ökad medvetenhet",
    "nya perspektiv",
    "klientens åtaganden",
    "att följa upp",
    "möjligt nästa fokus",
  ].map((item) => item.toLowerCase()),
);

function stripMarkdown(line: string): string {
  return line
    .replace(/^#{1,6}\s*/, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/^\*\*|\*\*$/g, "")
    .replace(/^__|__$/g, "")
    .trim();
}

function looksLikeHeading(line: string): boolean {
  const normalised = line.replace(/:$/, "").toLowerCase().trim();
  if (KNOWN_HEADINGS.has(normalised)) return true;
  if (line.length > 58) return false;
  if (/[.!?,;]$/.test(line)) return false;
  if (line.endsWith(":")) return true;
  const words = line.split(/\s+/);
  return words.length <= 6 && /^[A-ZÅÄÖ]/.test(line);
}

export function parseAiText(raw: string): AiBlock[] {
  const blocks: AiBlock[] = [];

  for (const rawLine of raw.split(/\r?\n/)) {
    const line = stripMarkdown(rawLine);
    if (!line) continue;

    const bulletMatch = line.match(/^(?:[-–—•*]|\d+[.)])\s+(.*)$/);
    if (bulletMatch) {
      blocks.push({ type: "bullet", text: bulletMatch[1].trim() });
      continue;
    }

    if (looksLikeHeading(line)) {
      blocks.push({ type: "heading", text: line.replace(/:$/, "") });
      continue;
    }

    blocks.push({ type: "paragraph", text: line });
  }

  return blocks;
}

/** Plain text for clipboard and e-post — headings, bullets, utan markdown. */
export function formatAiTextPlain(raw: string): string {
  const lines: string[] = [];

  for (const block of parseAiText(raw)) {
    if (block.type === "heading") {
      if (lines.length > 0) lines.push("");
      lines.push(block.text);
      lines.push("");
      continue;
    }
    if (block.type === "bullet") {
      lines.push(`• ${block.text}`);
      continue;
    }
    lines.push(block.text);
  }

  return lines.join("\n").trim();
}
