"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ClientLifecycleStatus } from "@/lib/portal/types";
import { formatDate } from "@/lib/portal/format";
import { Panel, Tag, portalButtonClass, portalFieldClass, portalOutlineButtonClass, portalPrimaryButtonClass } from "@/components/portal/ui";

type View = "idle" | "confirm-end" | "confirm-delete-1" | "confirm-delete-2";

export default function ClientLifecycleActions({
  clientId,
  clientName,
  status,
  endedAt,
}: {
  clientId: string;
  clientName: string;
  status: ClientLifecycleStatus;
  endedAt: string | null;
}) {
  const router = useRouter();
  const [view, setView] = useState<View>("idle");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmName, setConfirmName] = useState("");

  async function endClient() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/portal/klienter/${clientId}/end`, { method: "POST" });
      if (!response.ok) throw new Error("failed");
      setView("idle");
      router.refresh();
    } catch {
      setError("Kunde inte avsluta klienten.");
    } finally {
      setBusy(false);
    }
  }

  async function reactivate() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/portal/klienter/${clientId}/reactivate`, { method: "POST" });
      if (!response.ok) throw new Error("failed");
      router.refresh();
    } catch {
      setError("Kunde inte återaktivera klienten.");
    } finally {
      setBusy(false);
    }
  }

  async function deletePermanently() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/portal/klienter/${clientId}/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmName }),
      });
      const payload = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        setError(payload.error ?? "Klienten kunde inte raderas.");
        setBusy(false);
        return;
      }
      router.push("/portal/klienter");
      router.refresh();
    } catch {
      setError("Klienten kunde inte raderas.");
      setBusy(false);
    }
  }

  if (status === "aktiv") {
    if (view === "confirm-end") {
      return (
        <Panel>
          <p className="text-[0.9375rem] font-medium text-zinc-900">AVSLUTA KLIENT</p>
          <p className="mt-2 text-[0.875rem] leading-relaxed text-zinc-600">
            Klientrelationen avslutas men all historik, avtal, sessioner och dokument finns kvar.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setView("idle")} className={portalOutlineButtonClass} disabled={busy}>
              Avbryt
            </button>
            <button type="button" onClick={endClient} className={portalButtonClass} disabled={busy}>
              {busy ? "Avslutar…" : "Avsluta klient"}
            </button>
          </div>
          {error && <p className="mt-3 text-[0.8125rem] text-red-600">{error}</p>}
        </Panel>
      );
    }
    return (
      <button type="button" onClick={() => setView("confirm-end")} className={portalOutlineButtonClass}>
        Avsluta klient
      </button>
    );
  }

  // status === "avslutad"
  return (
    <Panel>
      <div className="flex flex-wrap items-center gap-3">
        <Tag tone="neutral">AVSLUTAD</Tag>
        {endedAt && <span className="text-[0.8125rem] text-zinc-500">Avslutad {formatDate(endedAt.slice(0, 10))}</span>}
      </div>

      {view === "idle" && (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button type="button" onClick={reactivate} className={portalPrimaryButtonClass} disabled={busy}>
            {busy ? "Återaktiverar…" : "Återaktivera klient"}
          </button>
          <button
            type="button"
            onClick={() => setView("confirm-delete-1")}
            className={portalOutlineButtonClass}
            style={{ borderColor: "#DEC3C0", color: "#8F514B" }}
          >
            Radera klient
          </button>
        </div>
      )}

      {view === "confirm-delete-1" && (
        <div className="mt-5">
          <p className="text-[0.9375rem] font-medium text-zinc-900">RADERA KLIENT</p>
          <p className="mt-2 text-[0.875rem] leading-relaxed text-zinc-600">
            Permanent radering tar bort klientens coachingdata. Åtgärden går inte att ångra.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setView("idle")} className={portalOutlineButtonClass}>
              Avbryt
            </button>
            <button
              type="button"
              onClick={() => setView("confirm-delete-2")}
              className={portalOutlineButtonClass}
              style={{ borderColor: "#DEC3C0", color: "#8F514B" }}
            >
              Fortsätt
            </button>
          </div>
        </div>
      )}

      {view === "confirm-delete-2" && (
        <div className="mt-5">
          <p className="text-[0.875rem] leading-relaxed text-zinc-700">
            Skriv klientens namn för att bekräfta permanent radering.
          </p>
          <input
            type="text"
            value={confirmName}
            onChange={(event) => setConfirmName(event.target.value)}
            placeholder={clientName}
            className={`mt-3 ${portalFieldClass}`}
          />
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setView("idle");
                setConfirmName("");
              }}
              className={portalOutlineButtonClass}
              disabled={busy}
            >
              Avbryt
            </button>
            <button
              type="button"
              onClick={deletePermanently}
              disabled={confirmName !== clientName || busy}
              className={portalOutlineButtonClass}
              style={{ borderColor: "#DEC3C0", color: "#8F514B" }}
            >
              {busy ? "Raderar…" : "Radera permanent"}
            </button>
          </div>
          {error && <p className="mt-3 text-[0.8125rem] text-red-600">{error}</p>}
        </div>
      )}
    </Panel>
  );
}
