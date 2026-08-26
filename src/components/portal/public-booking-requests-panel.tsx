"use client";

import { useState } from "react";
import type { PublicBookingRequest } from "@/lib/portal/availability";
import { Divider, Panel, PanelHeading, portalButtonSmClass, portalGhostButtonClass } from "@/components/portal/ui";

// timestamptz must be converted, never string-sliced — slicing shows UTC and
// silently drifts by an hour across DST.
const stockholmDate = new Intl.DateTimeFormat("sv-SE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Europe/Stockholm",
});

const stockholmTime = new Intl.DateTimeFormat("sv-SE", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Stockholm",
});

function formatStockholmDate(iso: string): string {
  const parts = stockholmDate.formatToParts(new Date(iso));
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${part("day")}/${part("month")}/${part("year")}`;
}

function formatReservation(startAt: string, endAt: string): string {
  return `${formatStockholmDate(startAt)} kl. ${stockholmTime.format(new Date(startAt))}–${stockholmTime.format(new Date(endAt))}`;
}

function RequestDetails({ request }: { request: PublicBookingRequest }) {
  return (
    <div>
      <p className="text-[0.9375rem] font-medium text-zinc-900">{request.name}</p>
      <p className="mt-0.5 text-[0.8125rem] text-zinc-500">
        {formatReservation(request.requestedStartAt, request.requestedEndAt)}
      </p>
      <p className="mt-0.5 text-[0.8125rem] text-zinc-500">
        {request.email}
        {request.phone ? ` · ${request.phone}` : ""}
      </p>
      {request.message ? (
        <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-zinc-600">{request.message}</p>
      ) : null}
    </div>
  );
}

export default function PublicBookingRequestsPanel({
  pending,
  accepted,
}: {
  pending: PublicBookingRequest[];
  accepted: PublicBookingRequest[];
}) {
  const [pendingItems, setPendingItems] = useState(pending);
  const [acceptedItems, setAcceptedItems] = useState(accepted);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function respond(request: PublicBookingRequest, action: "accept" | "decline" | "cancel") {
    setBusyId(request.id);
    try {
      const response = await fetch(`/api/portal/tillganglighet/forfragningar/${request.id}/svara`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) return;

      if (action === "accept") {
        // Stays visible — the slot is still blocked, so Carolina must be
        // able to see and cancel it.
        setPendingItems((prev) => prev.filter((item) => item.id !== request.id));
        setAcceptedItems((prev) =>
          [...prev, { ...request, status: "accepted" as const }].sort((a, b) =>
            a.requestedStartAt.localeCompare(b.requestedStartAt),
          ),
        );
      } else if (action === "decline") {
        setPendingItems((prev) => prev.filter((item) => item.id !== request.id));
      } else {
        setAcceptedItems((prev) => prev.filter((item) => item.id !== request.id));
      }
    } finally {
      setBusyId(null);
    }
  }

  if (pendingItems.length === 0 && acceptedItems.length === 0) return null;

  return (
    <Panel>
      <PanelHeading label="Hemsidan" title="Bokningar från hemsidan" />

      {pendingItems.length > 0 && (
        <div className="mt-4">
          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-zinc-500">Väntar på svar</p>
          {pendingItems.map((request, index) => (
            <div key={request.id}>
              {index > 0 ? <Divider /> : null}
              <div className="py-3.5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <RequestDetails request={request} />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={busyId === request.id}
                      onClick={() => respond(request, "accept")}
                      className={portalButtonSmClass}
                    >
                      Godkänn
                    </button>
                    <button
                      type="button"
                      disabled={busyId === request.id}
                      onClick={() => respond(request, "decline")}
                      className={portalGhostButtonClass}
                    >
                      Avböj
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {acceptedItems.length > 0 && (
        <div className={pendingItems.length > 0 ? "mt-6 border-t border-zinc-200/80 pt-5" : "mt-4"}>
          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-zinc-500">Bekräftade</p>
          {acceptedItems.map((request, index) => (
            <div key={request.id}>
              {index > 0 ? <Divider /> : null}
              <div className="py-3.5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <RequestDetails request={request} />
                  <button
                    type="button"
                    disabled={busyId === request.id}
                    onClick={() => respond(request, "cancel")}
                    className={portalGhostButtonClass}
                  >
                    Avboka
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
