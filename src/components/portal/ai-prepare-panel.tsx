"use client";

import { useState } from "react";
import { AiDisclaimer, AiResult, AiResultActions, AiSkeleton } from "@/components/portal/ai-result";
import {
  AiActionButton,
  Panel,
  portalButtonSmClass,
  portalInsetClass,
  portalOutlineButtonClass,
  portalTextareaClass,
  SectionLabel,
} from "@/components/portal/ui";

type Status = "idle" | "loading" | "ready" | "error";

export default function AiPreparePanel({
  clientId,
  clientName,
  clientFirstName,
  nextSessionLabel,
}: {
  clientId: string;
  clientName: string;
  clientFirstName: string;
  nextSessionLabel: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [draft, setDraft] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [approved, setApproved] = useState(false);

  async function generate() {
    setStatus("loading");
    setError(null);
    setApproved(false);
    setEditing(false);
    try {
      const response = await fetch("/api/portal/ai/klient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, mode: "forbered" }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        text?: string;
        error?: string;
        sources?: string[];
      };
      if (!response.ok || !data.ok || !data.text) {
        setError(data.error ?? "Det gick inte att skapa underlaget just nu. Försök igen.");
        setStatus("error");
        return;
      }
      setDraft(data.text);
      setSources(data.sources ?? []);
      setStatus("ready");
    } catch {
      setError("Det gick inte att nå tjänsten just nu. Kontrollera uppkopplingen och försök igen.");
      setStatus("error");
    }
  }

  return (
    <Panel>
      <SectionLabel>Förberedelse</SectionLabel>
      <h2 className="mt-2.5 text-[1.3rem] font-medium leading-[1.25] tracking-tight text-zinc-900">
        Förberedelse inför nästa session
      </h2>
      <p className="mt-2.5 text-[0.875rem] leading-relaxed text-zinc-500">
        {nextSessionLabel} Underlag: utvecklingsmål, sessioner, {clientFirstName}s reflektioner och
        åtaganden samt dina arbetsanteckningar.
      </p>

      {status === "idle" ? (
        <AiActionButton onClick={() => void generate()} className="mt-5 w-full sm:w-auto">
          Förbered session
        </AiActionButton>
      ) : null}

      {status === "loading" ? (
        <div className="mt-5">
          <AiSkeleton label="Sammanställer underlag…" />
        </div>
      ) : null}

      {status === "error" ? (
        <div className={`mt-5 ${portalInsetClass}`}>
          <p className="text-[0.9375rem] leading-relaxed text-zinc-700">{error}</p>
          <AiActionButton compact onClick={() => void generate()} className="mt-3">
            Försök igen
          </AiActionButton>
        </div>
      ) : null}

      {status === "ready" ? (
        <article className={`mt-5 ${portalInsetClass}`}>
          {editing ? (
            <>
              <label htmlFor="prepare-draft" className="sr-only">
                Redigera underlaget
              </label>
              <textarea
                id="prepare-draft"
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
            emailSubject={`CVB Coaching – Förberedelse inför samtal med ${clientName}`}
          />

          {sources.length > 0 ? (
            <div className="mt-5 border-t border-[var(--klient-border-muted)] pt-4">
              <SectionLabel>Underlag</SectionLabel>
              <ul className="mt-2.5 space-y-1.5">
                {sources.map((source) => (
                  <li key={source} className="text-[0.8125rem] leading-relaxed text-zinc-500">
                    {source}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-4">
            <AiDisclaimer>
              Genererat underlag för granskning. Kan bygga på dina arbetsanteckningar och är inte
              avsett att delas med klienten.
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
              Godkänn
            </button>
            <AiActionButton compact onClick={() => void generate()}>
              Generera om
            </AiActionButton>
          </div>

          {approved ? (
            <p
              role="status"
              className="mt-3.5 text-[0.8125rem] leading-relaxed text-[#7d6432]"
            >
              Godkänt.
            </p>
          ) : null}
        </article>
      ) : null}
    </Panel>
  );
}
