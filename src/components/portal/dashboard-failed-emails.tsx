"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Divider, Panel, PanelHeading, portalButtonSmClass } from "@/components/portal/ui";

/**
 * Coach-only view of booking emails that could not be sent.
 *
 * Operational clarity, not a developer console: it says who the message was
 * for and which booking it belonged to, and nothing else. Provider errors,
 * error codes, recipient addresses, idempotency keys, dispatch tokens and
 * database identifiers are never fetched by the server query that feeds
 * this, so they cannot appear here.
 *
 * Retry reuses the existing coach-authorised route. This component never
 * creates a notification event and never touches booking state.
 */

export type FailedEmailItem = {
  requestId: string;
  eventType: string;
  label: string;
  visitorName: string;
  requestedStartAt: string;
  requestedEndAt: string;
  canRetry: boolean;
};

// timestamptz must be converted, never string-sliced — slicing shows UTC and
// silently drifts by an hour across DST.
const stockholmDate = new Intl.DateTimeFormat("sv-SE", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "Europe/Stockholm",
});

const stockholmTime = new Intl.DateTimeFormat("sv-SE", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Stockholm",
});

function formatWindow(startAt: string, endAt: string): string {
  const parts = stockholmDate.formatToParts(new Date(startAt));
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${part("day")}/${part("month")} · ${stockholmTime.format(new Date(startAt))}–${stockholmTime.format(new Date(endAt))}`;
}

function itemKey(item: FailedEmailItem): string {
  return `${item.requestId}:${item.eventType}`;
}

export default function DashboardFailedEmails({ items }: { items: FailedEmailItem[] }) {
  const router = useRouter();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [resolved, setResolved] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  const visible = items.filter((item) => !resolved.has(itemKey(item)));
  if (visible.length === 0) return null;

  async function retry(item: FailedEmailItem) {
    const key = itemKey(item);
    // One send at a time: a second click while a request is in flight is
    // ignored, and the button itself is disabled meanwhile.
    if (busyKey) return;
    setBusyKey(key);
    setError("");
    try {
      const response = await fetch(
        `/api/portal/tillganglighet/forfragningar/${item.requestId}/skicka-om`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventType: item.eventType }),
        },
      );
      const result = (await response.json().catch(() => ({}))) as { ok?: boolean };
      if (!response.ok || !result.ok) {
        setError("Mejlet kunde inte skickas just nu. Försök igen senare.");
        return;
      }
      setResolved((prev) => new Set([...prev, key]));
      router.refresh();
    } catch {
      setError("Mejlet kunde inte skickas just nu. Försök igen senare.");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <Panel>
      <PanelHeading label="Kräver åtgärd" title="Mejl som behöver skickas om" />

      <p className="mt-3 text-[0.8125rem] leading-relaxed text-zinc-600">
        {visible.length === 1
          ? "1 bokningsmejl kunde inte skickas."
          : `${visible.length} bokningsmejl kunde inte skickas.`}{" "}
        Bokningen och tidsfönstret påverkas inte.
      </p>

      <div className="mt-4">
        {visible.map((item, index) => {
          const key = itemKey(item);
          const busy = busyKey === key;
          return (
            <div key={key}>
              {index > 0 ? <Divider /> : null}
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 py-3">
                <div className="min-w-0">
                  <p className="text-[0.9375rem] font-medium text-zinc-900">{item.label}</p>
                  <p className="mt-0.5 text-[0.8125rem] text-zinc-500">
                    {item.visitorName} ·{" "}
                    <span className="tabular-nums">
                      {formatWindow(item.requestedStartAt, item.requestedEndAt)}
                    </span>
                  </p>
                  <p className="mt-0.5 text-[0.8125rem] text-zinc-500">Kunde inte skickas</p>
                </div>
                {item.canRetry ? (
                  <button
                    type="button"
                    disabled={busy || busyKey !== null}
                    onClick={() => retry(item)}
                    className={portalButtonSmClass}
                  >
                    {busy ? "Skickar…" : "Skicka igen"}
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {error ? (
        <p className="mt-3 text-[0.8125rem] leading-relaxed text-zinc-600" role="alert">
          {error}
        </p>
      ) : null}
    </Panel>
  );
}
