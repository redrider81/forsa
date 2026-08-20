"use client";

/** Enhet-lokal fillagring för demoläge. Överlever refresh och omstart i samma webbläsare. */

const PREFIX = "cvb_material_file:";

function storageKey(materialId: string, clientId: string): string {
  return `${PREFIX}${clientId}:${materialId}`;
}

export type StoredMaterialFile = {
  mimeType: string;
  fileName: string;
  base64: string;
};

export async function fileToStoredPayload(file: File): Promise<StoredMaterialFile> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return {
    mimeType: file.type,
    fileName: file.name,
    base64: btoa(binary),
  };
}

export function storeMaterialFile(
  materialId: string,
  clientId: string,
  payload: StoredMaterialFile,
): void {
  localStorage.setItem(storageKey(materialId, clientId), JSON.stringify(payload));
}

export function getMaterialFile(
  materialId: string,
  clientId: string,
): StoredMaterialFile | null {
  try {
    const raw = localStorage.getItem(storageKey(materialId, clientId));
    if (!raw) return null;
    return JSON.parse(raw) as StoredMaterialFile;
  } catch {
    return null;
  }
}

export function deleteMaterialFile(materialId: string, clientId: string): void {
  localStorage.removeItem(storageKey(materialId, clientId));
}

export function openStoredMaterialFile(
  materialId: string,
  clientId: string,
  fileName: string,
): boolean {
  const stored = getMaterialFile(materialId, clientId);
  if (!stored) return false;

  const binary = atob(stored.base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: stored.mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName || stored.fileName;
  anchor.rel = "noopener";
  anchor.click();
  URL.revokeObjectURL(url);
  return true;
}

export function canPreviewInline(mimeType?: string): boolean {
  if (!mimeType) return false;
  return (
    mimeType.startsWith("image/") ||
    mimeType === "application/pdf" ||
    mimeType === "text/plain"
  );
}

export function previewStoredMaterialFile(materialId: string, clientId: string): string | null {
  const stored = getMaterialFile(materialId, clientId);
  if (!stored || !canPreviewInline(stored.mimeType)) return null;
  return `data:${stored.mimeType};base64,${stored.base64}`;
}
