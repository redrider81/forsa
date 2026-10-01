"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Panel, PanelHeading, portalButtonClass, portalGhostButtonClass } from "@/components/portal/ui";

const stockholm = new Intl.DateTimeFormat("sv-SE", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Stockholm",
});

/** Shown to Carolina when the client has an open erasure request. */
export default function SpecialCategoryErasurePanel({
  clientId,
  requestedAt,
  cutoff,
}: {
  clientId: string;
  requestedAt: string;
  cutoff: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<"idle" | "confirm" | "saving">("idle");
  const [error, setError] = useState("");

  async function erase() {
    setStep("saving");
    setError("");
    try {
      const response = await fetch(`/api/portal/klienter/${clientId}/kansliga-uppgifter/radera`, { method: "POST" });
      const result = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) {
        setError(result.error ?? "Raderingen kunde inte genomföras.");
        setStep("confirm");
        return;
      }
      router.refresh();
    } catch {
      setError("Raderingen kunde inte genomföras.");
      setStep("confirm");
    }
  }

  return (
    <Panel>
      <PanelHeading label="Kräver åtgärd" title="Begäran om radering" />
      <p className="mt-3 text-[0.875rem] leading-relaxed text-zinc-600">
        Klienten begärde {stockholm.format(new Date(requestedAt))} radering av innehåll som omfattades av det återkallade
        samtycket till behandling av känsliga personuppgifter — allt sådant innehåll fram till{" "}
        {stockholm.format(new Date(cutoff))}.
      </p>
      {step === "idle" ? (
        <div className="mt-4">
          <button type="button" onClick={() => setStep("confirm")} className={portalButtonClass}>
            Genomför radering
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="text-[0.8125rem] leading-relaxed text-zinc-600">
            Reflektioner, förberedelser, noteringar, åtaganden, insikter, sammanfattningar, sessionernas fokus och dina
            anteckningar fram till återkallelsen raderas. Avtal, signaturer, bokningar och samtyckeshistoriken berörs inte.
            Raderingen kan inte ångras.
          </p>
          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={step === "saving"} onClick={() => void erase()} className={portalButtonClass}>
              {step === "saving" ? "Raderar…" : "Bekräfta radering"}
            </button>
            <button
              type="button"
              disabled={step === "saving"}
              onClick={() => setStep("idle")}
              className={portalGhostButtonClass}
            >
              Avbryt
            </button>
          </div>
          {error ? (
            <p className="text-[0.8125rem] text-red-600" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      )}
    </Panel>
  );
}
