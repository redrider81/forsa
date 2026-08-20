"use client";

import { useRef, useState } from "react";
import { AiDisclaimer, AiResult, AiResultActions, AiSkeleton } from "@/components/portal/ai-result";
import {
  AiActionButton,
  Panel,
  PanelHeading,
  portalButtonSmClass,
  portalChipClass,
  portalInsetClass,
  portalOutlineButtonClass,
  portalTextareaClass,
  SectionLabel,
} from "@/components/portal/ui";

type Stage = "idle" | "loading" | "draft" | "error";

/**
 * Insikten och åtagandet är klientens, inte coachens. Prefixen är formulerade
 * så att anteckningen alltid pekar tillbaka på klientens eget ägarskap.
 */
const quickActions = [
  { label: "Klientens insikt", prefix: "Klientens insikt: " },
  { label: "Klientens åtagande", prefix: "Klientens åtagande: " },
  { label: "Att följa upp", prefix: "Att följa upp: " },
] as const;

/**
 * Coachens arbetsyta under och efter sessionen. Anteckningarna är privata och
 * ligger kvar i webbläsaren tills coachen väljer att skapa en sammanfattning.
 */
export default function SessionWorkspace({
  clientId,
  sessionId,
  clientName,
  clientFirstName,
}: {
  clientId: string;
  sessionId: string;
  clientName: string;
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
          Privata. Delas varken med {clientFirstName} eller uppdragsgivaren.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => addLine(action.prefix)}
              className={portalChipClass}
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
          placeholder="Fokus, klientens insikter, klientens åtaganden, uppföljning."
          className={`mt-4 ${portalTextareaClass} rounded-2xl px-4 py-3.5 placeholder:text-zinc-400`}
        />
      </Panel>

      <Panel>
        <PanelHeading label="Efter sessionen" title="Skapa sammanfattning" />
        <p className="mt-2.5 text-[0.875rem] leading-relaxed text-zinc-500">
          Struktureras från dina anteckningar. Redigera, granska och godkänn innan delning.
        </p>

        <AiActionButton
          onClick={() => void createSummary()}
          disabled={stage === "loading"}
          className="mt-5 w-full sm:w-auto"
        >
          {stage === "loading" ? "Strukturerar…" : "Skapa sammanfattning"}
        </AiActionButton>

        {stage === "loading" ? (
          <div className="mt-5">
            <AiSkeleton label="Strukturerar underlag…" />
          </div>
        ) : null}

        {stage === "error" ? (
          <div className={`mt-5 ${portalInsetClass}`}>
            <p className="text-[0.9375rem] leading-relaxed text-zinc-700">{error}</p>
            <AiActionButton compact onClick={() => void createSummary()} className="mt-3">
              Försök igen
            </AiActionButton>
          </div>
        ) : null}

        {stage === "draft" ? (
          <article className={`mt-5 ${portalInsetClass}`}>
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
                  className={`${portalTextareaClass} bg-white`}
                />
              </>
            ) : (
              <AiResult text={draft} />
            )}

            <AiResultActions
              text={draft}
              emailSubject={`CVB Coaching – Sessionssammanfattning för ${clientName}`}
            />

            <div className="mt-4">
              <AiDisclaimer>
                Genererat utkast från dina anteckningar. Delas först efter godkännande.
              </AiDisclaimer>
            </div>

            <div className="mt-4 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => setEditing((value) => !value)}
                className={portalOutlineButtonClass}
              >
                {editing ? "Klar med redigering" : "Redigera"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setApproved(true);
                  setEditing(false);
                }}
                className={portalButtonSmClass}
              >
                Godkänn och dela
              </button>
              <AiActionButton compact onClick={() => void createSummary()}>
                Generera om
              </AiActionButton>
            </div>

            {approved ? (
              <p role="status" className="mt-3.5 text-[0.8125rem] leading-relaxed text-[#7d6432]">
                Godkänd och delad med {clientFirstName}.
              </p>
            ) : null}
          </article>
        ) : null}
      </Panel>
    </>
  );
}
