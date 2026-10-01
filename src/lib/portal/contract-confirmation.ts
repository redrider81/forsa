import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isEmailSendEnabled } from "@/lib/email/result-email";
import type { BookingEmailProvider } from "@/lib/email/booking-provider";
import { resolveOperatorRecipient, sanitizeError } from "@/lib/portal/booking-notifications";
import { getContract, listContractSignatures } from "@/lib/portal/contracts";
import {
  buildContractConfirmationEmail,
  type ContractConfirmationContext,
} from "@/lib/email/contract-confirmation-email";
import { formattedPostalAddress, LEGAL_ENTITY, legalPartyName } from "@/lib/legal/company";
import { generalTermsDocument } from "@/lib/legal/content/terms";

/**
 * Avtalsbekräftelse — post-commit dispatch.
 *
 * The database queues exactly one confirmation row when a consumer contract
 * is countersigned (sign_contract_as_coach). Everything here runs after that
 * commit, as the owning coach: a failed send is recorded and stays retryable
 * from the dashboard, and can never touch the contract or its signatures.
 *
 * The first rendering is stored on the row and every retry sends that same
 * text, so the client always receives the version that was signed.
 */

export type ConfirmationStatus = "pending" | "sending" | "sent" | "failed";

type ConfirmationRecord = {
  status: ConfirmationStatus;
  recipientEmail: string | null;
  idempotencyKey: string;
  renderedSubject: string | null;
  renderedBody: string | null;
  lastAttemptAt: string | null;
  providerAcceptedAt: string | null;
};

/** Coach-only (RLS). */
async function getConfirmationRecord(contractId: string): Promise<ConfirmationRecord | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("contract_confirmation_notifications")
    .select("status, recipient_email, idempotency_key, rendered_subject, rendered_body, last_attempt_at, provider_accepted_at")
    .eq("contract_id", contractId)
    .maybeSingle();
  if (!data) return null;
  return {
    status: data.status as ConfirmationStatus,
    recipientEmail: data.recipient_email,
    idempotencyKey: data.idempotency_key,
    renderedSubject: data.rendered_subject,
    renderedBody: data.rendered_body,
    lastAttemptAt: data.last_attempt_at,
    providerAcceptedAt: data.provider_accepted_at,
  };
}

export type ContractConfirmationState = {
  status: ConfirmationStatus;
  lastAttemptAt: string | null;
  providerAcceptedAt: string | null;
};

/** What the coach's contract view shows. Never exposes the address or body. */
export async function getContractConfirmationState(contractId: string): Promise<ContractConfirmationState | null> {
  const record = await getConfirmationRecord(contractId);
  if (!record) return null;
  return {
    status: record.status,
    lastAttemptAt: record.lastAttemptAt,
    providerAcceptedAt: record.providerAcceptedAt,
  };
}

/** Built only from the locked, signed contract and its signatures. */
export async function loadContractConfirmationContext(
  contractId: string,
): Promise<ContractConfirmationContext | null> {
  const [contract, signatures] = await Promise.all([getContract(contractId), listContractSignatures(contractId)]);
  if (!contract || contract.status !== "signerat" || !contract.counterpartyType || !contract.coachSignedAt) {
    return null;
  }
  const clientSignature = signatures.find(
    (s) => s.signerRole === "klient" && s.contractVersionId === contract.versionId,
  );
  const coachSignature = signatures.find(
    (s) => s.signerRole === "coach" && s.contractVersionId === contract.versionId,
  );
  if (!clientSignature || !coachSignature) return null;

  // Exactly the terms version pinned to this contract — never "whatever is
  // current now". Without a provable version there is nothing to render.
  const terms = generalTermsDocument(contract.generalTermsVersion, "sv");
  if (!terms || !contract.generalTermsVersion) return null;

  return {
    contractId: contract.id,
    versionId: contract.versionId,
    title: contract.title,
    clientName: contract.clientName ?? clientSignature.signerName,
    counterpartyType: contract.counterpartyType,
    clientSignerName: clientSignature.signerName,
    clientSignedAt: clientSignature.signedAt,
    coachSignerName: coachSignature.signerName,
    concludedAt: contract.coachSignedAt,
    priceAmount: contract.priceAmount,
    currency: contract.currency,
    paymentTerms: contract.paymentTerms,
    content: contract.content,
    withdrawalDeadline: contract.withdrawalDeadline,
    earlyPerformanceRequestedAt: contract.earlyPerformanceRequestedAt,
    party: {
      tradeName: LEGAL_ENTITY.tradeName,
      name: legalPartyName(),
      address: formattedPostalAddress(),
      email: LEGAL_ENTITY.legalEmail,
    },
    terms,
    termsVersion: contract.generalTermsVersion,
  };
}

type RecordArgs = {
  contractId: string;
  status: "sending" | "sent" | "failed";
  renderedSubject?: string | null;
  renderedBody?: string | null;
  termsVersion?: string | null;
  providerMessageId?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
};

async function recordResult(args: RecordArgs): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("record_contract_confirmation_result", {
    p_contract_id: args.contractId,
    p_status: args.status,
    p_rendered_subject: args.renderedSubject ?? null,
    p_rendered_body: args.renderedBody ?? null,
    p_terms_version: args.termsVersion ?? null,
    p_provider_message_id: args.providerMessageId ?? null,
    p_error_code: args.errorCode ?? null,
    p_error_message: args.errorMessage ?? null,
  });
  if (error) {
    // Best-effort relative to the signature, which is already committed.
    console.error("[CVB Coaching] Kunde inte skriva status för avtalsbekräftelse", { status: args.status });
  }
}

export type ContractConfirmationOutcome =
  | { status: "sent"; simulated: boolean; alreadySent?: boolean }
  | { status: "failed"; errorCode: string }
  | { status: "skipped" };

/**
 * Attempts the queued confirmation for one contract. Always resolves — the
 * signing response is never turned into a failure by email.
 */
export async function dispatchContractConfirmation(
  contractId: string,
  options?: { provider?: BookingEmailProvider },
): Promise<ContractConfirmationOutcome> {
  try {
    const record = await getConfirmationRecord(contractId);
    if (!record) return { status: "skipped" };
    if (record.status === "sent") return { status: "sent", simulated: false, alreadySent: true };

    let subject = record.renderedSubject;
    let body = record.renderedBody;
    let termsVersion: string | null = null;
    if (!subject || !body) {
      const context = await loadContractConfirmationContext(contractId);
      if (!context) {
        await recordResult({
          contractId,
          status: "failed",
          errorCode: "contract_not_renderable",
          errorMessage: "Avtalet är inte slutligt signerat eller saknar registrerad villkorsversion.",
        });
        return { status: "failed", errorCode: "contract_not_renderable" };
      }
      const email = buildContractConfirmationEmail(context);
      subject = email.subject;
      body = email.body;
      termsVersion = context.termsVersion;
    }

    // The snapshot is written once by the database; later values are ignored.
    await recordResult({ contractId, status: "sending", renderedSubject: subject, renderedBody: body, termsVersion });

    if (!record.recipientEmail) {
      await recordResult({
        contractId,
        status: "failed",
        errorCode: "missing_recipient",
        errorMessage: "Klienten saknar e-postadress.",
      });
      return { status: "failed", errorCode: "missing_recipient" };
    }

    if (!isEmailSendEnabled()) {
      console.info("[CVB Coaching] Avtalsbekräftelse simulerad (EMAIL_SEND_ENABLED !== true)", {
        subjectLength: subject.length,
        bodyLength: body.length,
      });
      await recordResult({ contractId, status: "sent", providerMessageId: "simulated" });
      return { status: "sent", simulated: true };
    }

    const from = process.env.EMAIL_FROM?.trim();
    if (!from) {
      await recordResult({
        contractId,
        status: "failed",
        errorCode: "missing_from_address",
        errorMessage: "EMAIL_FROM saknas i den här miljön.",
      });
      return { status: "failed", errorCode: "missing_from_address" };
    }

    try {
      const provider =
        options?.provider ?? (await import("@/lib/email/booking-provider")).createResendBookingProvider();
      const result = await provider.send({
        from,
        to: record.recipientEmail,
        subject,
        body,
        idempotencyKey: record.idempotencyKey,
        replyTo: resolveOperatorRecipient(),
      });
      await recordResult({ contractId, status: "sent", providerMessageId: result.id });
      return { status: "sent", simulated: false };
    } catch (error) {
      const sanitized = sanitizeError(error);
      console.error("[CVB Coaching] Avtalsbekräftelse kunde inte skickas", { errorCode: sanitized.code });
      await recordResult({
        contractId,
        status: "failed",
        errorCode: sanitized.code,
        errorMessage: sanitized.message,
      });
      return { status: "failed", errorCode: sanitized.code };
    }
  } catch {
    return { status: "failed", errorCode: "dispatch_error" };
  }
}

export type FailedContractConfirmation = {
  contractId: string;
  label: string;
  clientName: string;
  contractTitle: string;
  queuedAt: string;
};

/** Coach-only, RLS-scoped. Never selects the address, body or provider error text. */
export async function listFailedContractConfirmations(): Promise<FailedContractConfirmation[]> {
  const supabase = await createSupabaseServerClient();
  const { data: failed } = await supabase
    .from("contract_confirmation_notifications")
    .select("contract_id, created_at")
    .eq("status", "failed")
    .order("created_at", { ascending: true });
  if (!failed || failed.length === 0) return [];

  const { data: contracts } = await supabase
    .from("contracts")
    .select("id, title, clients(name)")
    .in("id", failed.map((row) => row.contract_id));
  const byId = new Map((contracts ?? []).map((row) => [row.id, row]));

  return failed.flatMap((row) => {
    const contract = byId.get(row.contract_id);
    if (!contract) return [];
    const client = contract.clients as { name?: string } | null;
    return [
      {
        contractId: row.contract_id,
        label: "Avtalsbekräftelse till klient",
        clientName: client?.name ?? "Klient",
        contractTitle: contract.title,
        queuedAt: row.created_at,
      },
    ];
  });
}
