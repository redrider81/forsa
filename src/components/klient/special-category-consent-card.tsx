"use client";

import { useState } from "react";
import { Body, Card, CardTitle, Label, Muted, klientButtonClass, klientGhostButtonClass } from "@/components/klient/klient-ui";
import {
  activeConsent,
  canRequestErasure,
  restrictionCutoff,
  type SpecialCategoryConsentRecord,
  type SpecialCategoryErasureRequest,
} from "@/lib/portal/special-category-consent-rules";

const stockholm = new Intl.DateTimeFormat("sv-SE", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Stockholm",
});

function when(iso: string): string {
  return stockholm.format(new Date(iso));
}

type Step = "idle" | "confirm-withdraw" | "confirm-erasure" | "saving";

/**
 * Explicit, separate and voluntary consent for special categories of
 * personal data (GDPR art. 9.2 a). Not part of the contract, the general
 * terms or the privacy policy. The checkbox starts unticked; withdrawing
 * needs its own confirmation and says what it does and does not affect.
 */
export default function SpecialCategoryConsentCard({
  initialHistory,
  initialErasureRequests = [],
}: {
  initialHistory: SpecialCategoryConsentRecord[];
  initialErasureRequests?: SpecialCategoryErasureRequest[];
}) {
  const [history, setHistory] = useState(initialHistory);
  const [erasureRequests, setErasureRequests] = useState(initialErasureRequests);
  const [agreed, setAgreed] = useState(false);
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState("");

  const active = activeConsent(history);
  const cutoff = restrictionCutoff(history);
  const openRequest = erasureRequests.find((request) => request.completedAt === null) ?? null;
  const completedRequest = erasureRequests.find((request) => request.completedAt !== null) ?? null;
  const erasable = canRequestErasure(history, erasureRequests);

  async function submit(action: "grant" | "withdraw" | "request_erasure") {
    setStep("saving");
    setError("");
    try {
      const response = await fetch("/api/klient/samtycke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const result = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        history?: SpecialCategoryConsentRecord[];
        erasureRequests?: SpecialCategoryErasureRequest[];
      };
      if (!response.ok || !result.ok || !result.history) {
        setError(result.error ?? "Ditt val kunde inte sparas just nu. Försök igen.");
        setStep("idle");
        return;
      }
      setHistory(result.history);
      setErasureRequests(result.erasureRequests ?? []);
      setAgreed(false);
      setStep("idle");
    } catch {
      setError("Ditt val kunde inte sparas just nu. Försök igen.");
      setStep("idle");
    }
  }

  return (
    <Card>
      <Label>Samtycke</Label>
      <CardTitle>Känsliga personuppgifter</CardTitle>
      <div className="mt-4 space-y-3">
        <Body>
          I coachingen kan du själv välja att dela information som kan vara känslig enligt dataskyddsreglerna, till
          exempel uppgifter om hälsa. Om du gör det behöver CVB Coaching kunna behandla informationen för att
          genomföra coachingen.
        </Body>
        <Muted>
          Samtycket gäller sådant du själv skriver i CVB Base eller berättar i samtalen och som Carolina dokumenterar —
          reflektioner, förberedelser, noteringar, åtaganden, sessionsinnehåll och sammanfattningar. Med samtycke kan
          det innehållet också ingå i underlaget när Carolina använder AI-stödet i CVB Base. Utan aktivt samtycke hålls
          reflektioner, förberedelser och noteringar du skriver privata för dig: Carolina ser dem inte och de används inte
          i AI-stödet, inte heller om du lämnar samtycke senare. Samtycket är frivilligt och coachingen kan genomföras
          utan det.
        </Muted>
      </div>

      <div className="mt-5 rounded-xl bg-[var(--klient-text-block-bg)] p-4" role="status" aria-live="polite">
        {active ? (
          <p className="text-[0.875rem] font-medium text-zinc-800">
            Samtycke lämnat {when(active.grantedAt)}.
          </p>
        ) : cutoff ? (
          <div className="space-y-1.5">
            <p className="text-[0.875rem] font-medium text-zinc-800">
              Samtycket återkallades {when(cutoff)}. Inget aktivt samtycke.
            </p>
            <p className="text-[0.8125rem] leading-relaxed text-zinc-600">
              Innehåll du lämnat fram till dess är begränsat: Carolina använder det inte längre i coachingen och det ingår
              inte i AI-stödet. Du kan fortfarande se det här i CVB Base.
            </p>
            {openRequest ? (
              <p className="text-[0.8125rem] leading-relaxed text-zinc-600">
                Du begärde radering {when(openRequest.requestedAt)}. Carolina genomför raderingen.
              </p>
            ) : completedRequest?.completedAt ? (
              <p className="text-[0.8125rem] leading-relaxed text-zinc-600">
                Det begränsade innehållet raderades {when(completedRequest.completedAt)}.
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-[0.875rem] font-medium text-zinc-800">Du har inte lämnat något samtycke.</p>
        )}
      </div>

      {erasable && step === "idle" ? (
        <div className="mt-5">
          <button type="button" onClick={() => setStep("confirm-erasure")} className={klientGhostButtonClass}>
            Begär radering av begränsat innehåll
          </button>
        </div>
      ) : null}

      {erasable && step === "confirm-erasure" ? (
        <div className="mt-5 space-y-4 rounded-xl border border-[#ece7dc] p-4">
          <Muted>
            Reflektioner, förberedelser, noteringar, åtaganden, insikter, sessionernas innehåll och sammanfattningar samt
            Carolinas anteckningar fram till återkallelsen raderas. Avtal, bokningar, samtyckeshistoriken och uppgifter
            som måste sparas enligt lag raderas inte. Raderingen kan inte ångras.
          </Muted>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => void submit("request_erasure")} className={klientButtonClass}>
              Begär radering
            </button>
            <button type="button" onClick={() => setStep("idle")} className={klientGhostButtonClass}>
              Avbryt
            </button>
          </div>
        </div>
      ) : null}

      {!active && step !== "confirm-erasure" ? (
        <div className="mt-5 space-y-4">
          <label className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed text-zinc-800">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-300"
            />
            <span>
              Jag samtycker till att CVB Coaching behandlar känsliga personuppgifter som jag själv väljer att dela i
              coachingen, på det sätt som beskrivs ovan.
            </span>
          </label>
          <button
            type="button"
            disabled={!agreed || step === "saving"}
            onClick={() => void submit("grant")}
            className={klientButtonClass}
          >
            {step === "saving" ? "Sparar…" : "Lämna samtycke"}
          </button>
        </div>
      ) : !active ? null : step === "idle" ? (
        <div className="mt-5">
          <button type="button" onClick={() => setStep("confirm-withdraw")} className={klientGhostButtonClass}>
            Återkalla samtycke
          </button>
        </div>
      ) : (
        <div className="mt-5 space-y-4 rounded-xl border border-[#ece7dc] p-4">
          <Muted>
            När du återkallar samtycket slutar CVB Coaching från och med nu att behandla känsliga personuppgifter med stöd
            av samtycket, och AI-stödet använder inte längre samtalsinnehåll från din coaching. Det du har lämnat hittills
            begränsas och används inte längre i coachingen. Behandling som skett innan påverkas inte. Du kan begära att
            innehåll som bara behandlats med stöd av samtycket raderas — vissa uppgifter, till exempel avtal, kan behöva
            sparas om lag kräver det. Dela inte nya känsliga uppgifter efter återkallelsen.
          </Muted>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={step === "saving"}
              onClick={() => void submit("withdraw")}
              className={klientButtonClass}
            >
              {step === "saving" ? "Sparar…" : "Bekräfta återkallelse"}
            </button>
            <button
              type="button"
              disabled={step === "saving"}
              onClick={() => setStep("idle")}
              className={klientGhostButtonClass}
            >
              Avbryt
            </button>
          </div>
        </div>
      )}

      {error ? (
        <p className="mt-3 text-[0.8125rem] text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </Card>
  );
}
