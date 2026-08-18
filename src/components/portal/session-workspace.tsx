"use client";

import { useRef, useState } from "react";
import { AiDisclaimer, AiResult, AiSkeleton } from "@/components/portal/ai-result";
import { Panel, PanelHeading, SectionLabel } from "@/components/portal/ui";

type Stage = "idle" | "loading" | "draft" | "error";

const quickActions = [
  { label: "Lägg till insikt", prefix: "Insikt: " },
  { label: "Lägg till åtagande", prefix: "Åtagande: " },
  { label: "Följ upp", prefix: "Att följa upp: " },
] as const;

/**
 * Coachens arbetsyta under och efter sessionen. Anteckningarna är privata och
 * ligger kvar i webbläsaren tills coachen väljer att skapa en sammanfattning.
 */
export default function SessionWorkspace({
  clientId,
  sessionId,
  clientFirstName,
}: {
  clientId: string;
  sessionId: string;
  clientFirstName: string;
}) {
  const [notes, setNotes] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [approved, setApproved] = useState(false);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  function addLine(prefix: string) {
    setNotes((current) => {
      const separator = current.length === 0 || current.endsWith("\n") ? "" : "\n";
      return `${current}${separator}${prefix}`;
    });
    requestAnimationFrame(() => {
      const element = notesRef.current;
      if (!element) return;
      element.focus();
      element.setSelectionRange(element.value.length, element.value.length);
      element.scrollTop = element.scrollHeight;
    });
  }

  async function createSummary() {
    if (notes.trim().length < 15) {
      setError("Skriv några anteckningar från samtalet först.");
      setStage("error");
      return;
    }
    setStage("loading");
    setError(null);
    setApproved(false);
    setEditing(false);
    try {
      const response = await fetch("/api/portal/ai/sessionssammanfattning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, sessionId, notes }),
      });
      const data = (await response.json()) as { ok: boolean; text?: string; error?: string };
      if (!response.ok || !data.ok || !data.text) {
        setError(data.error ?? "Det gick inte att skapa sammanställningen just nu. Försök igen.");
        setStage("error");
        return;
      }
      setDraft(data.text);
      setStage("draft");
    } catch {
      setError("Det gick inte att nå tjänsten just nu. Kontrollera uppkopplingen och försök igen.");
      setStage("error");
    }
  }

  return (
    <>
      <Panel>
        <PanelHeading label="Under sessionen" title="Anteckningar" />
        <p className="mt-2.5 text-[0.875rem] leading-relaxed text-zinc-500">
          Dina anteckningar är privata. De delas varken med {clientFirstName} eller med någon
          organisation.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => addLine(action.prefix)}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-zinc-200 bg-[#faf9f7] px-3.5 py-2 text-[0.8125rem] text-zinc-700 transition-colors duration-200 hover:border-zinc-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <span aria-hidden="true" className="text-zinc-400">+</span>
              {action.label}
            </button>
          ))}
        </div>

        <label htmlFor="session-notes" className="sr-only">
          Anteckningar från samtalet
        </label>
        <textarea
          id="session-notes"
          ref={notesRef}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={8}
          placeholder="Kort om vad klienten tog upp, vad som blev tydligt och vad hon själv sa att hon ska göra…"
          className="mt-4 w-full resize-y rounded-2xl border border-zinc-200 bg-[#faf9f7] px-4 py-3.5 text-[0.9375rem] leading-[1.7] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/15"
        />
      </Panel>

      <Panel>
        <PanelHeading label="Efter sessionen" title="Skapa sammanfattning" />
        <p className="mt-2.5 text-[0.875rem] leading-relaxed text-zinc-500">
          AI:n strukturerar dina anteckningar. Du redigerar, granskar och godkänner innan något delas
          med {clientFirstName}.
        </p>

        <button
          type="button"
          onClick={() => void createSummary()}
          disabled={stage === "loading"}
          className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-zinc-50 transition-colors duration-200 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300 sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          {stage === "loading" ? "Strukturerar…" : "Skapa sammanfattning"}
        </button>

        {stage === "loading" ? (
          <div className="mt-5">
            <AiSkeleton label="Strukturerar dina anteckningar…" />
          </div>
        ) : null}

        {stage === "error" ? (
          <div className="mt-5 rounded-2xl border border-zinc-200 bg-[#faf9f7] p-4">
            <p className="text-[0.9375rem] leading-relaxed text-zinc-700">{error}</p>
            <button
              type="button"
              onClick={() => void createSummary()}
              className="mt-3 inline-flex min-h-10 items-center rounded-full border border-zinc-300 px-4 py-2 text-[0.8125rem] font-medium text-zinc-700 transition-colors hover:border-zinc-500 hover:bg-white"
            >
              Försök igen
            </button>
          </div>
        ) : null}

        {stage === "draft" ? (
          <article className="mt-5 rounded-2xl border border-zinc-200/90 bg-[#faf9f7] p-4 md:p-5">
            <div className="mb-4">
              <SectionLabel>{approved ? "Godkänd sammanfattning" : "Utkast · ej godkänt"}</SectionLabel>
            </div>

            {editing ? (
              <>
                <label htmlFor="summary-draft" className="sr-only">
                  Redigera sammanfattningen
                </label>
                <textarea
                  id="summary-draft"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  rows={16}
                  className="w-full resize-y rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-[0.9375rem] leading-[1.7] text-zinc-800 focus:border-zinc-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/15"
                />
              </>
            ) : (
              <AiResult text={draft} />
            )}

            <div className="mt-4">
              <AiDisclaimer>
                AI-genererat utkast utifrån dina anteckningar. Ingenting delas med klienten förrän du
                har godkänt det.
              </AiDisclaimer>
            </div>

            <div className="mt-4 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => setEditing((value) => !value)}
                className="inline-flex min-h-10 items-center rounded-full border border-zinc-300 px-4 py-2 text-[0.8125rem] font-medium text-zinc-700 transition-colors hover:border-zinc-500 hover:bg-white"
              >
                {editing ? "Klar med redigering" : "Redigera"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setApproved(true);
                  setEditing(false);
                }}
                className="inline-flex min-h-10 items-center rounded-full bg-zinc-900 px-4 py-2 text-[0.8125rem] font-medium text-zinc-50 transition-colors hover:bg-zinc-700"
              >
                Godkänn och dela
              </button>
              <button
                type="button"
                onClick={() => void createSummary()}
                className="inline-flex min-h-10 items-center rounded-full px-4 py-2 text-[0.8125rem] font-medium text-zinc-500 transition-colors hover:text-zinc-800"
              >
                Generera om
              </button>
            </div>

            {approved ? (
              <p role="status" className="mt-3.5 text-[0.8125rem] leading-relaxed text-[#7d6432]">
                Godkänd. Sammanfattningen är delad med {clientFirstName} och sparad i klientens material.
              </p>
            ) : null}
          </article>
        ) : null}
      </Panel>
    </>
  );
}
