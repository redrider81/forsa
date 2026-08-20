"use client";

import { useState } from "react";
import { MetaLabel, StatusBadge } from "@/components/klient/klient-ui";
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
};

/** Badge i vila — select vid interaktion. Behåller keyboard och touch. */
export default function StatusControl({
  commitmentId,
  status,
  disabled = false,
  onChange,
  align = "right",
}: Props) {
  const [editing, setEditing] = useState(false);
  const selectId = `status-select-${commitmentId}`;

  if (editing) {
    return (
      <div className={align === "right" ? "md:text-right" : ""}>
        <MetaLabel className="text-zinc-600">Status</MetaLabel>
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
          className="mt-1 min-h-11 w-full max-w-[11rem] rounded-full border border-[#e6e0d3] bg-white px-3 py-2 text-[0.8125rem] font-medium text-zinc-900 focus:border-zinc-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/15 disabled:opacity-50 md:min-h-9 md:py-1.5 md:text-[0.75rem]"
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
      <MetaLabel className="text-zinc-600">Status</MetaLabel>
      <button
        type="button"
        disabled={disabled}
        aria-label={`Status: ${statusOptions.find((o) => o.value === status)?.label}. Klicka för att ändra.`}
        onClick={() => setEditing(true)}
        className="mt-1 inline-flex min-h-11 items-center rounded-full transition-opacity duration-150 hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/15 focus-visible:ring-offset-2 disabled:opacity-50 motion-reduce:transition-none"
      >
        <StatusBadge status={status} />
      </button>
    </div>
  );
}
