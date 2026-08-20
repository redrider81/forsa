/** Validering av uppladdade filer — även i demo. */

export const MAX_MATERIAL_FILE_BYTES = 10 * 1024 * 1024;

const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "image/png",
  "image/jpeg",
]);

const BLOCKED_EXTENSIONS = new Set([
  ".exe",
  ".js",
  ".mjs",
  ".html",
  ".htm",
  ".svg",
  ".sh",
  ".bat",
  ".cmd",
  ".php",
  ".zip",
  ".rar",
  ".7z",
]);

export function sanitiseFileName(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? "fil";
  return base.replace(/[^\w\s.\-åäöÅÄÖ]/g, "_").slice(0, 120) || "fil";
}

export function fileExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot).toLowerCase() : "";
}

export type FileValidationResult =
  | { ok: true; mimeType: string }
  | { ok: false; error: string };

export function validateMaterialFile(
  fileName: string,
  mimeType: string,
  sizeBytes: number,
): FileValidationResult {
  if (sizeBytes <= 0) {
    return { ok: false, error: "Filen är tom." };
  }
  if (sizeBytes > MAX_MATERIAL_FILE_BYTES) {
    return { ok: false, error: "Filen är för stor. Max 10 MB i demoläget." };
  }

  const ext = fileExtension(fileName);
  if (BLOCKED_EXTENSIONS.has(ext)) {
    return { ok: false, error: "Den här filtypen stöds inte." };
  }

  const normalisedMime = mimeType.toLowerCase().split(";")[0]?.trim() ?? "";
  if (!ALLOWED_MIME.has(normalisedMime)) {
    return { ok: false, error: "Den här filtypen stöds inte. Använd PDF, Office, text eller bild." };
  }

  return { ok: true, mimeType: normalisedMime };
}

export function inferTitleFromFileName(fileName: string): string {
  const sanitised = sanitiseFileName(fileName);
  const dot = sanitised.lastIndexOf(".");
  return dot > 0 ? sanitised.slice(0, dot) : sanitised;
}
