"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PortalAccessState } from "@/lib/portal/client-invitations";
import type { PortalTagTone } from "@/lib/portal/status-tones";
import { Panel, PanelHeading, Tag, portalButtonClass } from "@/components/portal/ui";

export type ClientAccessView = {
  state: PortalAccessState;
  recipientEmail: string | null;
  lastAttemptAt: string | null;
  providerAcceptedAt: string | null;
  activatedAt: string | null;
  pendingStale: boolean;
};

const stockholmDateTime = new Intl.DateTimeFormat("sv-SE", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Stockholm",
});

function when(iso: string | null): string {
  if (!iso) return "";
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? "" : stockholmDateTime.format(parsed);
}

function presentation(access: ClientAccessView): { label: string; tone: PortalTagTone; text: string } {
  switch (access.state) {
    case "activated":
      return {
        label: "AKTIVERAT",
        tone: "completed",
        text: access.activatedAt
          ? `Klienten aktiverade sitt konto ${when(access.activatedAt)} och kan logga in.`
          : "Klienten har ett aktiverat konto och kan logga in.",
      };
    case "sent":
      return {
        label: "INBJUDAN SKICKAD",
        tone: "active",
        text: `Inbjudan lämnades till e-posttjänsten ${when(access.providerAcceptedAt)}${access.recipientEmail ? ` för ${access.recipientEmail}` : ""}. Det betyder inte att klienten har fått eller öppnat den. Kontot visas som aktiverat först när klienten har valt ett lösenord.`,
      };
    case "failed":
      return {
        label: "LEVERANS MISSLYCKADES",
        tone: "action",
        text: "Inbjudan kunde inte skickas. Inget har nått klienten. Försök igen.",
      };
    case "pending":
      return access.pendingStale
        ? {
            label: "AVBRUTEN",
            tone: "action",
            text: "Det senaste försöket slutfördes inte. Skicka inbjudan igen.",
          }
        : {
            label: "SKICKAS",
            tone: "prep",
            text: "Inbjudan håller på att skickas. Uppdatera sidan om en stund.",
          };
    default:
      return {
        label: "EJ INBJUDEN",
        tone: "neutral",
        text: "Klienten har ännu inte bjudits in till CVB Base.",
      };
  }
}

export default function ClientAccessPanel({
  clientId,
  clientActive,
  access,
}: {
  clientId: string;
  clientActive: boolean;
  access: ClientAccessView | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function invite() {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(`/api/portal/klienter/${clientId}/inbjudan`, { method: "POST" });
      const payload = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        setError(payload.error ?? "Inbjudan kunde inte skickas. Försök igen.");
      } else {
        setNotice("Inbjudan har skickats.");
      }
      router.refresh();
    } catch {
      setError("Det gick inte att nå tjänsten just nu. Försök igen.");
    } finally {
      setBusy(false);
    }
  }

  if (!access) {
    return (
      <Panel>
        <PanelHeading label="Konto" title="Tillgång till CVB Base" />
        <p className="mt-3 text-[0.875rem] leading-relaxed text-zinc-600">Kontostatus kunde inte hämtas just nu.</p>
      </Panel>
    );
  }

  const view = presentation(access);
  const inFlight = access.state === "pending" && !access.pendingStale;
  const canInvite = clientActive && access.state !== "activated" && !inFlight;
  const firstInvite = access.state === "not_invited";

  return (
    <Panel>
      <PanelHeading label="Konto" title="Tillgång till CVB Base" />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Tag tone={view.tone}>{view.label}</Tag>
      </div>
      <p className="mt-3 max-w-prose text-[0.875rem] leading-relaxed text-zinc-600">{view.text}</p>

      {!clientActive && access.state !== "activated" ? (
        <p className="mt-3 text-[0.8125rem] leading-relaxed text-zinc-500">
          Klienten är avslutad. Återaktivera klienten för att kunna skicka en inbjudan.
        </p>
      ) : null}

      {canInvite ? (
        <div className="mt-5">
          <button type="button" onClick={invite} disabled={busy} className={portalButtonClass}>
            {busy ? "Skickar…" : firstInvite ? "Skicka inbjudan" : "Skicka ny inbjudan"}
          </button>
          {!firstInvite ? (
            <p className="mt-2 text-[0.8125rem] leading-relaxed text-zinc-500">
              En ny inbjudan gör den tidigare länken ogiltig.
            </p>
          ) : null}
        </div>
      ) : null}

      {notice ? (
        <p role="status" className="mt-3 text-[0.8125rem] text-zinc-700">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-3 text-[0.8125rem] leading-relaxed text-red-600">
          {error}
        </p>
      ) : null}
    </Panel>
  );
}
