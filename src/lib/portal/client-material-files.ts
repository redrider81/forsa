"use client";

/** Fillagring för klientmaterial i Supabase Storage (bucket coaching-materials). */

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const BUCKET = "coaching-materials";

function objectPath(materialId: string, clientId: string, fileName: string): string {
  return `${clientId}/${materialId}/${fileName}`;
}

/**
 * Laddar upp filbytes till Storage och sparar sedan sökvägen på
 * materialposten (RLS tillåter klienten att uppdatera storage_path på sitt
 * eget material). hasFilePayload blir sant för klienten först när båda
 * stegen är klara.
 */
export async function uploadMaterialFile(
  materialId: string,
  clientId: string,
  file: File,
): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const path = objectPath(materialId, clientId, file.name);

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: true,
  });
  if (uploadError) throw uploadError;

  const { error: updateError } = await supabase
    .from("materials")
    .update({ storage_path: path })
    .eq("id", materialId);
  if (updateError) throw updateError;
}

export async function deleteMaterialFile(
  materialId: string,
  clientId: string,
  fileName: string,
): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  await supabase.storage.from(BUCKET).remove([objectPath(materialId, clientId, fileName)]);
}

export async function openStoredMaterialFile(
  materialId: string,
  clientId: string,
  fileName: string,
): Promise<boolean> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(objectPath(materialId, clientId, fileName), 60);
  if (error || !data?.signedUrl) return false;

  const anchor = document.createElement("a");
  anchor.href = data.signedUrl;
  anchor.download = fileName;
  anchor.rel = "noopener";
  anchor.click();
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

export async function previewStoredMaterialFile(
  materialId: string,
  clientId: string,
  fileName: string,
  mimeType?: string,
): Promise<string | null> {
  if (!canPreviewInline(mimeType)) return null;
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(objectPath(materialId, clientId, fileName), 60);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
