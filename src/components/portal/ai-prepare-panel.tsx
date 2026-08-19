"use client";

import { useState } from "react";
import { AiDisclaimer, AiResult, AiSkeleton } from "@/components/portal/ai-result";
import { Panel, SectionLabel } from "@/components/portal/ui";

type Status = "idle" | "loading" | "ready" | "error";

export default function AiPreparePanel({
  clientId,
  clientFirstName,
  nextSessionLabel,
}: {
  clientId: string;
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
        <button
          type="button"
          onClick={() => void generate()}
          className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-zinc-50 transition-colors duration-200 hover:bg-zinc-700 sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Förbered session
        </button>
      ) : null}

      {status === "loading" ? (
        <div className="mt-5">
          <AiSkeleton label="Sammanställer underlag…" />
        </div>
      ) : null}

      {status === "error" ? (
        <div className="mt-5 rounded-2xl border border-zinc-200 bg-[#faf9f7] p-4">
          <p className="text-[0.9375rem] leading-relaxed text-zinc-700">{error}</p>
          <button
            type="button"
            onClick={() => void generate()}
            className="mt-3 inline-flex min-h-10 items-center rounded-full border border-zinc-300 px-4 py-2 text-[0.8125rem] font-medium text-zinc-700 transition-colors hover:border-zinc-500 hover:bg-white"
          >
            Försök igen
          </button>
        </div>
      ) : null}

      {status === "ready" ? (
        <article className="mt-5 rounded-2xl border border-zinc-200/90 bg-[#faf9f7] p-4 md:p-5">
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
                className="w-full resize-y rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-[0.9375rem] leading-[1.7] text-zinc-800 focus:border-zinc-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/15"
              />
            </>
          ) : (
            <AiResult text={draft} />
          )}

          {sources.length > 0 ? (
            <div className="mt-5 border-t border-zinc-200 pt-4">
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
              AI-genererat underlag för granskning. Kan bygga på dina arbetsanteckningar och är inte
              avsett att delas med klienten.
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
              Godkänn
            </button>
            <button
              type="button"
              onClick={() => void generate()}
              className="inline-flex min-h-10 items-center rounded-full px-4 py-2 text-[0.8125rem] font-medium text-zinc-500 transition-colors hover:text-zinc-800"
            >
              Generera om
            </button>
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
