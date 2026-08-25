"use client";

import { useState } from "react";
import type { BookingRequest } from "@/lib/portal/booking";
import { formatShortDate } from "@/lib/portal/format";
import { Panel, PanelHeading, portalButtonClass, Divider } from "@/components/portal/ui";

export default function DashboardBookingRequests({ bookingRequests }: { bookingRequests: BookingRequest[] }) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processed, setProcessed] = useState<Set<string>>(new Set());

  const incomingRequests = bookingRequests.filter((br) => br.requestedByRole === "klient" && !processed.has(br.id));

  if (incomingRequests.length === 0) return null;

  async function handleAction(bookingId: string, action: "accept" | "decline") {
    setProcessingId(bookingId);
    try {
      await fetch("/api/portal/booking", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          action,
        }),
      });
      setProcessed((prev) => new Set([...prev, bookingId]));
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <Panel>
      <PanelHeading label="Bokningsförfrågningar" title="Väntande bokningsförfrågningar" />
      <div className="mt-4">
        {incomingRequests.map((request, index) => (
          <div key={request.id}>
            {index > 0 ? <Divider /> : null}
            <div className="space-y-2 py-3">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[0.9375rem] font-semibold text-zinc-900">{request.clientName}</p>
                  <p className="mt-1 text-[0.8125rem] text-zinc-600">
                    {formatShortDate(request.date)} kl. {request.time} · {request.durationMinutes} min
                  </p>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  disabled={processingId === request.id}
                  onClick={() => handleAction(request.id, "accept")}
                  className={portalButtonClass}
                >
                  {processingId === request.id ? "…" : "Acceptera"}
                </button>
                <button
                  type="button"
                  disabled={processingId === request.id}
                  onClick={() => handleAction(request.id, "decline")}
                  className={`${portalButtonClass} bg-zinc-200 text-zinc-900 hover:bg-zinc-300`}
                >
                  {processingId === request.id ? "…" : "Avböj"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
