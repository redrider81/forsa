import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TablesUpdate } from "@/lib/supabase/database.types";
import type { ContractContent, ContractSignerRole, ContractStatus } from "@/lib/portal/types";

export type {
  ContractContent,
  ContractCustomField,
  ContractFieldType,
  ContractSection,
  ContractSignerRole,
  ContractStatus,
} from "@/lib/portal/types";

export const EMPTY_CONTRACT_CONTENT: ContractContent = { sections: [], fields: [] };

export type ContractTemplate = {
  id: string;
  coachId: string;
  name: string;
  title: string;
  content: ContractContent;
  createdAt: string;
  updatedAt: string;
};

export type Contract = {
  id: string;
  coachId: string;
  clientId: string;
  clientName?: string;
  engagementId: string | null;
  templateId: string | null;
  title: string;
  content: ContractContent;
  priceAmount: number | null;
  currency: string;
  paymentTerms: string | null;
  status: ContractStatus;
  versionId: string;
  sentAt: string | null;
  clientSignedAt: string | null;
  coachSignedAt: string | null;
  lockedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ContractSignature = {
  id: string;
  contractId: string;
  signerRole: ContractSignerRole;
  signerName: string;
  signerEmail: string;
  contractVersionId: string;
  signedAt: string;
};

function toContent(raw: unknown): ContractContent {
  if (!raw || typeof raw !== "object") return { ...EMPTY_CONTRACT_CONTENT };
  const value = raw as Partial<ContractContent>;
  return {
    sections: Array.isArray(value.sections) ? value.sections : [],
    fields: Array.isArray(value.fields) ? value.fields : [],
  };
}

function toTemplate(row: Record<string, unknown>): ContractTemplate {
  return {
    id: row.id as string,
    coachId: row.coach_id as string,
    name: row.name as string,
    title: row.title as string,
    content: toContent(row.content),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function toContract(row: Record<string, unknown>): Contract {
  return {
    id: row.id as string,
    coachId: row.coach_id as string,
    clientId: row.client_id as string,
    clientName: (row.clients as { name?: string } | null)?.name,
    engagementId: (row.engagement_id as string | null) ?? null,
    templateId: (row.template_id as string | null) ?? null,
    title: row.title as string,
    content: toContent(row.content),
    priceAmount: row.price_amount === null || row.price_amount === undefined ? null : Number(row.price_amount),
    currency: row.currency as string,
    paymentTerms: (row.payment_terms as string | null) ?? null,
    status: row.status as ContractStatus,
    versionId: row.version_id as string,
    sentAt: (row.sent_at as string | null) ?? null,
    clientSignedAt: (row.client_signed_at as string | null) ?? null,
    coachSignedAt: (row.coach_signed_at as string | null) ?? null,
    lockedAt: (row.locked_at as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function toSignature(row: Record<string, unknown>): ContractSignature {
  return {
    id: row.id as string,
    contractId: row.contract_id as string,
    signerRole: row.signer_role as ContractSignerRole,
    signerName: row.signer_name as string,
    signerEmail: row.signer_email as string,
    contractVersionId: row.contract_version_id as string,
    signedAt: row.signed_at as string,
  };
}

// -------------------------------------------------------------- templates

export async function listContractTemplates(): Promise<ContractTemplate[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("contract_templates").select("*").order("created_at", { ascending: false });
  return (data ?? []).map(toTemplate);
}

export async function createContractTemplate(input: {
  coachId: string;
  name: string;
  title: string;
  content: ContractContent;
}): Promise<ContractTemplate | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("contract_templates")
    .insert({ coach_id: input.coachId, name: input.name, title: input.title, content: input.content })
    .select("*")
    .single();
  if (error || !data) return null;
  return toTemplate(data);
}

export async function updateContractTemplate(
  id: string,
  input: { name?: string; title?: string; content?: ContractContent },
): Promise<ContractTemplate | null> {
  const supabase = await createSupabaseServerClient();
  const patch: TablesUpdate<"contract_templates"> = { updated_at: new Date().toISOString() };
  if (input.name !== undefined) patch.name = input.name;
  if (input.title !== undefined) patch.title = input.title;
  if (input.content !== undefined) patch.content = input.content;

  const { data, error } = await supabase.from("contract_templates").update(patch).eq("id", id).select("*").single();
  if (error || !data) return null;
  return toTemplate(data);
}

export async function deleteContractTemplate(id: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("contract_templates").delete().eq("id", id);
  return !error;
}

// -------------------------------------------------------------- contracts

export async function listCoachContracts(): Promise<Contract[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("contracts")
    .select("*, clients(name)")
    .order("created_at", { ascending: false });
  return (data ?? []).map(toContract);
}

export async function listClientContractsForCoach(clientId: string): Promise<Contract[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("contracts")
    .select("*, clients(name)")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  return (data ?? []).map(toContract);
}

export async function listOwnClientContracts(): Promise<Contract[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("contracts").select("*").order("created_at", { ascending: false });
  return (data ?? []).map(toContract);
}

export async function getContract(id: string): Promise<Contract | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("contracts").select("*, clients(name)").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return toContract(data);
}

export async function listContractSignatures(contractId: string): Promise<ContractSignature[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("contract_signatures")
    .select("*")
    .eq("contract_id", contractId)
    .order("signed_at", { ascending: true });
  return (data ?? []).map(toSignature);
}

export async function createContract(input: {
  coachId: string;
  clientId: string;
  engagementId: string | null;
  templateId: string | null;
  title: string;
  content: ContractContent;
  priceAmount: number | null;
  currency: string;
  paymentTerms: string | null;
}): Promise<Contract | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("contracts")
    .insert({
      coach_id: input.coachId,
      client_id: input.clientId,
      engagement_id: input.engagementId,
      template_id: input.templateId,
      title: input.title,
      content: input.content,
      price_amount: input.priceAmount,
      currency: input.currency,
      payment_terms: input.paymentTerms,
    })
    .select("*, clients(name)")
    .single();
  if (error || !data) return null;
  return toContract(data);
}

export async function updateContractDraft(
  id: string,
  input: {
    title?: string;
    content?: ContractContent;
    engagementId?: string | null;
    priceAmount?: number | null;
    currency?: string;
    paymentTerms?: string | null;
  },
): Promise<Contract | null> {
  const supabase = await createSupabaseServerClient();
  const patch: TablesUpdate<"contracts"> = { updated_at: new Date().toISOString() };
  if (input.title !== undefined) patch.title = input.title;
  if (input.content !== undefined) patch.content = input.content;
  if (input.engagementId !== undefined) patch.engagement_id = input.engagementId;
  if (input.priceAmount !== undefined) patch.price_amount = input.priceAmount;
  if (input.currency !== undefined) patch.currency = input.currency;
  if (input.paymentTerms !== undefined) patch.payment_terms = input.paymentTerms;

  const { data, error } = await supabase
    .from("contracts")
    .update(patch)
    .eq("id", id)
    .select("*, clients(name)")
    .single();
  if (error || !data) return null;
  return toContract(data);
}

// -------------------------------------------------------------- signing

export async function sendContractForSignature(contractId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("send_contract_for_signature", { p_contract_id: contractId });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signContractAsClient(
  contractId: string,
  versionId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("sign_contract_as_client", {
    p_contract_id: contractId,
    p_version_id: versionId,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signContractAsCoach(
  contractId: string,
  versionId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("sign_contract_as_coach", {
    p_contract_id: contractId,
    p_version_id: versionId,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
