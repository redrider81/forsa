import type { ContractCounterpartyType, ContractStatus } from "@/lib/portal/types";

/**
 * Presentation rules for the consumer withdrawal function (ångerfunktion).
 *
 * These decide only what the UI shows. The database function
 * exercise_contract_withdrawal() is the authority: it re-checks ownership,
 * classification, signature state and the deadline server-side, whatever
 * the UI believed.
 */

export const counterpartyTypeLabel: Record<ContractCounterpartyType, string> = {
  consumer: "Konsumentavtal",
  business: "Företagsavtal",
};

export const COUNTERPARTY_UNCLASSIFIED_LABEL = "Avtalstyp ej angiven";

export type WithdrawalSubject = {
  status: ContractStatus;
  counterpartyType: ContractCounterpartyType | null;
  clientSignedAt: string | null;
  withdrawalDeadline: string | null;
  withdrawal: { requestedAt: string } | null;
};

/** Statuses in which the client has signed and the contract can be withdrawn from. */
const WITHDRAWABLE_STATUSES: readonly ContractStatus[] = ["kund_signerad", "signerat", "arkiverat"];

export function canShowWithdrawalFunction(contract: WithdrawalSubject, now: Date = new Date()): boolean {
  if (contract.counterpartyType !== "consumer") return false;
  if (contract.withdrawal) return false;
  if (!contract.clientSignedAt) return false;
  if (!WITHDRAWABLE_STATUSES.includes(contract.status)) return false;
  if (contract.withdrawalDeadline && now.getTime() >= new Date(contract.withdrawalDeadline).getTime()) {
    return false;
  }
  return true;
}

const stockholmDate = new Intl.DateTimeFormat("sv-SE", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Stockholm",
});

const stockholmDateTime = new Intl.DateTimeFormat("sv-SE", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Stockholm",
});

/**
 * The stored deadline is the exclusive instant the period ends — midnight
 * Stockholm time after the last day. People think in "the last day", so
 * that is what is shown.
 */
export function formatWithdrawalLastDay(deadlineIso: string): string {
  return stockholmDate.format(new Date(new Date(deadlineIso).getTime() - 1));
}

/** Timestamps are always shown in Swedish time, never sliced from UTC. */
export function formatStockholmDateTime(iso: string): string {
  return stockholmDateTime.format(new Date(iso));
}
