"use client";

import { useState } from "react";
import type { ContractCounterpartyType } from "@/lib/portal/types";
import type { Contract } from "@/lib/portal/contracts";
import {
  counterpartyTypeLabel,
  formatStockholmDateTime,
  formatWithdrawalLastDay,
} from "@/lib/portal/contract-withdrawal-rules";
import { LEGAL_PATHS } from "@/lib/legal/links";
import { generalTermsVersionHref } from "@/lib/legal/terms-versions";
import { Panel, SectionLabel, portalButtonClass, portalGhostButtonClass } from "@/components/portal/ui";

const inlineLinkClass =
  "underline decoration-zinc-400 underline-offset-2 transition-colors hover:text-zinc-900 hover:decoration-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2";

/**
 * Opens the general terms in a new tab, so the signing state on this page —
 * including an unticked or ticked checkbox — is never lost.
 */
export function TermsLink({ children, version }: { children: React.ReactNode; version?: string }) {
  // With a version: exactly the text pinned to the contract, not "current".
  const href = version ? generalTermsVersionHref(version) : LEGAL_PATHS.terms;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={inlineLinkClass}>
      {children}
    </a>
  );
}

// ---------------------------------------------------------------- coach: classification

export function CounterpartyTypeControl({
  value,
  disabled,
  onChange,
}: {
  value: ContractCounterpartyType | null;
  disabled?: boolean;
  onChange: (value: ContractCounterpartyType) => void;
}) {
  return (
    <fieldset disabled={disabled}>
      <legend>
        <SectionLabel>Avtalstyp</SectionLabel>
      </legend>
      <div className="mt-2 flex flex-wrap gap-4">
        {(["consumer", "business"] as const).map((type) => (
          <label key={type} className="flex items-center gap-2 text-[0.9375rem] text-zinc-800">
            <input
              type="radio"
              name="counterpartyType"
              value={type}
              checked={value === type}
              onChange={() => onChange(type)}
              className="h-4 w-4 border-zinc-300"
            />
            {counterpartyTypeLabel[type]}
          </label>
        ))}
      </div>
      <p className="mt-2 max-w-prose text-[0.8125rem] leading-relaxed text-zinc-500">
        Konsumentavtal: klienten ingår avtalet som privatperson. Klienten får då 14 dagars ångerrätt och en
        funktion för att ångra avtalet i CVB Base. Företagsavtal: avtalet ingås för ett företag eller en
        organisation. Avtalstypen måste anges innan avtalet skickas och kan inte ändras efter att klienten har
        signerat.
      </p>
    </fieldset>
  );
}

// ---------------------------------------------------------------- client: before signing

export function ConsumerSigningInformation({
  earlyStart,
  onEarlyStartChange,
  termsVersion,
}: {
  earlyStart: boolean;
  onEarlyStartChange: (value: boolean) => void;
  termsVersion: string;
}) {
  return (
    <div className="mb-5 rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-4 text-[0.875rem] leading-relaxed text-zinc-700">
      <p className="font-medium text-zinc-900">Ångerrätt</p>
      <p className="mt-1.5">
        Det här är ett konsumentavtal. Du har rätt att ångra avtalet inom 14 dagar från att det har ingåtts, det
        vill säga från att både du och Carolina har signerat. Du ångrar dig enkelt via Ångra avtalet här på
        avtalet i CVB Base, eller genom att mejla CVB Coaching. Mer information finns i de{" "}
        <TermsLink version={termsVersion}>allmänna villkoren</TermsLink>.
      </p>
      <label className="mt-4 flex items-start gap-2.5 text-zinc-800">
        <input
          type="checkbox"
          checked={earlyStart}
          onChange={(event) => onEarlyStartChange(event.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-300"
        />
        <span>
          Valfritt: Jag begär att coachingen påbörjas under ångerfristen. Jag förstår att jag, om jag ångrar
          avtalet, betalar för den del av tjänsten som utförts fram till dess, och att ångerrätten upphör om
          tjänsten har utförts helt.
        </span>
      </label>
    </div>
  );
}

// ---------------------------------------------------------------- both: facts after signing

export function ConsumerContractFacts({ contract }: { contract: Contract }) {
  const termsLine = contract.generalTermsVersion ? (
    <p>
      Allmänna villkor:{" "}
      <TermsLink version={contract.generalTermsVersion}>version {contract.generalTermsVersion}</TermsLink>.
    </p>
  ) : (
    <p>Allmänna villkor: version ej registrerad på avtalet (äldre avtal).</p>
  );
  if (contract.counterpartyType !== "consumer") {
    return <div className="mt-4 space-y-1 text-[0.8125rem] text-zinc-500">{termsLine}</div>;
  }
  return (
    <div className="mt-4 space-y-1 text-[0.8125rem] text-zinc-500">
      {termsLine}
      {contract.withdrawalDeadline ? (
        <p>Konsumentavtal · ångerfristens sista dag {formatWithdrawalLastDay(contract.withdrawalDeadline)}.</p>
      ) : (
        <p>Konsumentavtal · ångerfristen börjar när båda parter har signerat.</p>
      )}
      {contract.earlyPerformanceRequestedAt ? (
        <p>
          Klienten begärde att coachingen påbörjas under ångerfristen (
          {formatStockholmDateTime(contract.earlyPerformanceRequestedAt)}).
        </p>
      ) : null}
    </div>
  );
}

export function WithdrawalRecordPanel({
  contract,
  viewerRole,
}: {
  contract: Contract;
  viewerRole: "coach" | "klient";
}) {
  const withdrawal = contract.withdrawal;
  if (!withdrawal) return null;
  return (
    <Panel>
      <p className="text-[0.9375rem] font-medium text-zinc-900">Ångerrätten har utövats</p>
      <p className="mt-1.5 text-[0.9375rem] text-zinc-700">
        {viewerRole === "klient" ? "Din begäran att ångra avtalet" : `Begäran från ${withdrawal.requesterName} att ångra avtalet`}{" "}
        registrerades {formatStockholmDateTime(withdrawal.requestedAt)}.
      </p>
      <p className="mt-3 text-[0.8125rem] leading-relaxed text-zinc-500">
        {viewerRole === "klient"
          ? `Ett mottagningsbevis skickas till ${withdrawal.receiptEmail}. `
          : ""}
        Avtalet och signaturerna finns kvar som historik.
      </p>
    </Panel>
  );
}

// ---------------------------------------------------------------- client: the withdrawal function

type WithdrawState = "idle" | "confirming" | "submitting" | "error";

export function ClientWithdrawalPanel({
  contract,
  onWithdrawn,
}: {
  contract: Contract;
  onWithdrawn: (requestedAt: string) => void;
}) {
  const [state, setState] = useState<WithdrawState>("idle");
  const [error, setError] = useState("");

  async function confirm() {
    setState("submitting");
    setError("");
    try {
      const response = await fetch(`/api/portal/avtal/${contract.id}/angra`, { method: "POST" });
      const result = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        withdrawal?: { requestedAt: string };
      };
      if (!response.ok || !result.ok || !result.withdrawal) {
        setError(result.error ?? "Begäran kunde inte registreras just nu. Försök igen om en stund.");
        setState("error");
        return;
      }
      onWithdrawn(result.withdrawal.requestedAt);
    } catch {
      setError("Begäran kunde inte registreras just nu. Försök igen om en stund.");
      setState("error");
    }
  }

  return (
    <Panel>
      <h2 className="text-[0.9375rem] font-medium text-zinc-900">Ångra avtal</h2>
      <p className="mt-1.5 text-[0.875rem] leading-relaxed text-zinc-600">
        {contract.withdrawalDeadline
          ? `Du kan ångra avtalet till och med ${formatWithdrawalLastDay(contract.withdrawalDeadline)}.`
          : "Du kan ångra avtalet redan nu. Ångerfristen på 14 dagar börjar när Carolina har signerat."}
      </p>

      {state === "idle" ? (
        <div className="mt-4">
          <button type="button" onClick={() => setState("confirming")} className={portalGhostButtonClass}>
            Ångra avtalet här
          </button>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-4">
          <dl className="grid grid-cols-1 gap-3 text-[0.875rem] sm:grid-cols-2">
            <div>
              <dt className="text-zinc-500">Avtal som ångras</dt>
              <dd className="mt-0.5 font-medium text-zinc-900">{contract.title}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Namn</dt>
              <dd className="mt-0.5 font-medium text-zinc-900">{contract.clientName ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Ångerfristens sista dag</dt>
              <dd className="mt-0.5 font-medium text-zinc-900">
                {contract.withdrawalDeadline
                  ? formatWithdrawalLastDay(contract.withdrawalDeadline)
                  : "Börjar löpa när Carolina har signerat"}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Mottagningsbevis skickas till</dt>
              <dd className="mt-0.5 font-medium text-zinc-900">{contract.clientEmail || "—"}</dd>
            </div>
          </dl>
          <p className="mt-4 text-[0.875rem] leading-relaxed text-zinc-700">
            När du bekräftar registreras att du ångrar avtalet och du får ett mottagningsbevis via e-post. Avtalet
            upphör att gälla och Carolina meddelas. Har du begärt att coachingen skulle påbörjas under ångerfristen
            betalar du för den del som hunnit utföras. Avtalet och signaturerna finns kvar som historik.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={confirm}
              disabled={state === "submitting"}
              className={portalButtonClass}
            >
              {state === "submitting" ? "Registrerar…" : "Bekräfta att jag ångrar avtalet"}
            </button>
            <button
              type="button"
              onClick={() => setState("idle")}
              disabled={state === "submitting"}
              className={portalGhostButtonClass}
            >
              Avbryt
            </button>
          </div>
          {state === "error" && error ? (
            <p className="mt-3 text-[0.8125rem] text-red-600" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      )}
    </Panel>
  );
}

// ---------------------------------------------------------------- coach: confirmation status

/** Shape of the coach-visible confirmation state (address and body are never sent here). */
export type ContractConfirmationView = {
  status: "pending" | "sending" | "sent" | "failed";
  lastAttemptAt: string | null;
  providerAcceptedAt: string | null;
};

export function ContractConfirmationStatus({ confirmation }: { confirmation: ContractConfirmationView }) {
  const text =
    confirmation.status === "sent"
      ? `Avtalsbekräftelse skickad till klienten${
          confirmation.providerAcceptedAt ? ` ${formatStockholmDateTime(confirmation.providerAcceptedAt)}` : ""
        }.`
      : confirmation.status === "failed"
        ? "Avtalsbekräftelsen kunde inte skickas. Skicka om den under Översikt → Mejl som behöver skickas om. Avtalet är signerat och påverkas inte."
        : "Avtalsbekräftelsen till klienten väntar på att skickas.";
  return <p className="mt-1 text-[0.8125rem] text-zinc-500">{text}</p>;
}
