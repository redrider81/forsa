import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DeleteClientBlockReason = "SIGNED_CONTRACT_BLOCK" | "DOCUMENT_BLOCK" | "OTHER";

type RpcResult = { ok: true } | { ok: false; error: string; blockReason?: DeleteClientBlockReason };

function toBlockReason(message: string): DeleteClientBlockReason | undefined {
  if (message.includes("SIGNED_CONTRACT_BLOCK")) return "SIGNED_CONTRACT_BLOCK";
  if (message.includes("DOCUMENT_BLOCK")) return "DOCUMENT_BLOCK";
  return undefined;
}

export async function endClient(clientId: string): Promise<RpcResult> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("end_coach_client", { p_client_id: clientId });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function reactivateClient(clientId: string): Promise<RpcResult> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("reactivate_coach_client", { p_client_id: clientId });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteClientPermanently(clientId: string): Promise<RpcResult> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("delete_coach_client", { p_client_id: clientId });
  if (error) return { ok: false, error: error.message, blockReason: toBlockReason(error.message) };
  return { ok: true };
}
