import Link from "next/link";
import type { PublicBookingRequest } from "@/lib/portal/availability";
import { Divider, Panel, PanelHeading, portalLinkButtonClass } from "@/components/portal/ui";

/**
 * Pending first-contact requests from the public website, surfaced on the
 * main overview so they are not only discoverable under Kalender.
 *
 * Deliberately read-only. Accept and decline stay in one place — the
 * detailed Kalender view — so the booking lifecycle is never duplicated
 * across two components.
 */

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
  const window = `${stockholmTime.format(new Date(startAt))}–${stockholmTime.format(new Date(endAt))}`;
  return `${part("day")}/${part("month")} · ${window}`;
}

const MAX_VISIBLE = 4;

export default function DashboardWebsiteRequests({
  pending,
}: {
  pending: PublicBookingRequest[];
}) {
  if (pending.length === 0) return null;

  const visible = pending.slice(0, MAX_VISIBLE);
  const hidden = pending.length - visible.length;

  return (
    <Panel>
      <PanelHeading label="Kräver åtgärd" title="Förfrågningar från hemsidan" />

      <p className="mt-3 text-[0.8125rem] leading-relaxed text-zinc-600">
        {pending.length === 1
          ? "1 förfrågan om inledande samtal väntar på svar."
          : `${pending.length} förfrågningar om inledande samtal väntar på svar.`}{" "}
        Tidsfönstret är blockerat tills du svarar.
      </p>

      <div className="mt-4">
        {visible.map((request, index) => (
          <div key={request.id}>
            {index > 0 ? <Divider /> : null}
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
              <p className="text-[0.9375rem] font-medium text-zinc-900">{request.name}</p>
              <p className="text-[0.8125rem] tabular-nums text-zinc-500">
                {formatWindow(request.requestedStartAt, request.requestedEndAt)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {hidden > 0 ? (
        <p className="mt-1 text-[0.8125rem] text-zinc-500">
          {hidden === 1 ? "+ 1 till" : `+ ${hidden} till`}
        </p>
      ) : null}

      <div className="mt-5">
        <Link href="/cvb-base/kalender" className={portalLinkButtonClass}>
          Godkänn eller avböj i kalendern
        </Link>
      </div>
    </Panel>
  );
}
