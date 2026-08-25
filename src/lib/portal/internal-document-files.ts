"use client";

/**
 * Fillagring för Carolinas interna dokumentarkiv i Supabase Storage (samma
 * bucket som klientdokument, coach-documents). Sökväg:
 * {coach_id}/internal/{document_id}/{file_name}.
 */

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const BUCKET = "coach-documents";

function objectPath(coachId: string, documentId: string, fileName: string): string {
  return `${coachId}/internal/${documentId}/${fileName}`;
}

export async function uploadInternalDocumentFile(
  documentId: string,
  coachId: string,
  file: File,
): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const path = objectPath(coachId, documentId, file.name);

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: true,
  });
  if (uploadError) throw uploadError;

  const { error: updateError } = await supabase
    .from("documents")
    .update({
      storage_path: path,
      file_name: file.name,
      mime_type: file.type || null,
      size_bytes: file.size,
    })
    .eq("id", documentId);
  if (updateError) throw updateError;
}

export async function deleteInternalDocumentFile(
  documentId: string,
  coachId: string,
  fileName: string,
): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  await supabase.storage.from(BUCKET).remove([objectPath(coachId, documentId, fileName)]);
}

export async function openStoredInternalDocumentFile(
  documentId: string,
  coachId: string,
  fileName: string,
): Promise<boolean> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(objectPath(coachId, documentId, fileName), 60);
  if (error || !data?.signedUrl) return false;

  const anchor = document.createElement("a");
  anchor.href = data.signedUrl;
  anchor.download = fileName;
  anchor.rel = "noopener";
  anchor.click();
  return true;
}
