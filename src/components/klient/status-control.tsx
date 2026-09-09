"use client";

import { useState } from "react";
import { MetaLabel, StatusBadge } from "@/components/klient/klient-ui";
import { QuietStatusPill } from "@/components/klient/bento";
import type { CommitmentStatus } from "@/lib/portal/types";

const statusOptions: Array<{ value: CommitmentStatus; label: string }> = [
  { value: "oppet", label: "Ej startat" },
  { value: "pagar", label: "Pågående" },
  { value: "genomfort", label: "Genomfört" },
];

type Props = {
  commitmentId: string;
  status: CommitmentStatus;
  disabled?: boolean;
  onChange: (status: CommitmentStatus) => void;
  align?: "left" | "right";
  /** Bento-kort: bara pillen, ingen "Status"-etikett ovanför. */
  compact?: boolean;
};

/** Badge i vila — select vid interaktion. Behåller keyboard och touch. */
export default function StatusControl({
  commitmentId,
  status,
  disabled = false,
  onChange,
  align = "right",
  compact = false,
}: Props) {
  const [editing, setEditing] = useState(false);
  const selectId = `status-select-${commitmentId}`;

  if (editing) {
    return (
      <div className={align === "right" ? "md:text-right" : ""}>
        {compact ? null : <MetaLabel className="text-stone-600">Status</MetaLabel>}
        <label htmlFor={selectId} className="sr-only">
          Ändra status
        </label>
        <select
          id={selectId}
          autoFocus
          value={status}
          disabled={disabled}
          onBlur={() => setEditing(false)}
          onChange={(event) => {
            onChange(event.target.value as CommitmentStatus);
            setEditing(false);
          }}
          className={`klient-swap ${compact ? "" : "mt-1"} min-h-11 w-full max-w-[11rem] rounded-full border border-[var(--klient-border-muted)] bg-white px-3 py-2 text-[0.8125rem] font-medium text-stone-900 focus:border-stone-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--klient-focus-ring)] disabled:opacity-50 md:min-h-9 md:py-1.5 md:text-[0.75rem]`}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className={align === "right" ? "md:text-right" : ""}>
      {compact ? null : <MetaLabel className="text-stone-600">Status</MetaLabel>}
      <button
        type="button"
        disabled={disabled}
        aria-label={`Status: ${statusOptions.find((o) => o.value === status)?.label}. Klicka för att ändra.`}
        onClick={() => setEditing(true)}
        className={`${compact ? "" : "mt-1"} inline-flex min-h-11 items-center rounded-full transition-opacity duration-150 hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--klient-focus-ring)] focus-visible:ring-offset-2 disabled:opacity-50 motion-reduce:transition-none`}
      >
        {compact ? <QuietStatusPill status={status} /> : <StatusBadge status={status} />}
      </button>
    </div>
  );
}
