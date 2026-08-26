"use client";

import { useState } from "react";
import type { PublicBookingRequest } from "@/lib/portal/availability";
import { Divider, Panel, PanelHeading, portalButtonSmClass, portalGhostButtonClass } from "@/components/portal/ui";

function formatDateTime(iso: string): string {
  const [datePart, timePart] = iso.split("T");
  const [year, month, day] = datePart.split("-");
  const time = timePart ? timePart.slice(0, 5) : "";
  return `${day}/${month}/${year} kl. ${time}`;
}

export default function PublicBookingRequestsPanel({ requests }: { requests: PublicBookingRequest[] }) {
  const [items, setItems] = useState(requests);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function respond(id: string, action: "accept" | "decline") {
    setBusyId(id);
    try {
      const response = await fetch(`/api/portal/tillganglighet/forfragningar/${id}/svara`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (response.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }
    } finally {
      setBusyId(null);
    }
  }

  if (items.length === 0) return null;

  return (
    <Panel>
      <PanelHeading label="Hemsidan" title="Bokningsförfrågningar från hemsidan" />
      <div className="mt-4">
        {items.map((request, index) => (
          <div key={request.id}>
            {index > 0 ? <Divider /> : null}
            <div className="py-3.5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[0.9375rem] font-medium text-zinc-900">{request.name}</p>
                  <p className="mt-0.5 text-[0.8125rem] text-zinc-500">
                    {formatDateTime(request.requestedStartAt)}
                  </p>
                  <p className="mt-0.5 text-[0.8125rem] text-zinc-500">
                    {request.email}
                    {request.phone ? ` · ${request.phone}` : ""}
                  </p>
                  {request.message ? (
                    <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-zinc-600">{request.message}</p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busyId === request.id}
                    onClick={() => respond(request.id, "accept")}
                    className={portalButtonSmClass}
                  >
                    Godkänn
                  </button>
                  <button
                    type="button"
                    disabled={busyId === request.id}
                    onClick={() => respond(request.id, "decline")}
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
    </Panel>
  );
}
