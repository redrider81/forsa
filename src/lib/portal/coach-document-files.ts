"use client";

/**
 * Fillagring för klientdokument i Supabase Storage (bucket coach-documents).
 * Sökväg: {coach_id}/clients/{client_id}/{document_id}/{file_name}.
 */

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const BUCKET = "coach-documents";

function objectPath(coachId: string, clientId: string, documentId: string, fileName: string): string {
  return `${coachId}/clients/${clientId}/${documentId}/${fileName}`;
}

/**
 * Laddar upp filbytes till Storage och sparar sedan sökvägen på
 * dokumentposten (RLS tillåter coachen att uppdatera dokument för sina egna
 * klienter).
 */
export async function uploadDocumentFile(
  documentId: string,
  coachId: string,
  clientId: string,
  file: File,
): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  const path = objectPath(coachId, clientId, documentId, file.name);

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

export async function deleteDocumentFile(
  documentId: string,
  coachId: string,
  clientId: string,
  fileName: string,
): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  await supabase.storage.from(BUCKET).remove([objectPath(coachId, clientId, documentId, fileName)]);
}

export async function openStoredDocumentFile(
  documentId: string,
  coachId: string,
  clientId: string,
  fileName: string,
): Promise<boolean> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(objectPath(coachId, clientId, documentId, fileName), 60);
  if (error || !data?.signedUrl) return false;

  const anchor = document.createElement("a");
  anchor.href = data.signedUrl;
  anchor.download = fileName;
  anchor.rel = "noopener";
  anchor.click();
  return true;
}
