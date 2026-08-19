"use client";

import { useRef, useState } from "react";
import { AiDisclaimer, AiResult, AiSkeleton } from "@/components/portal/ai-result";
import { Panel, SectionLabel } from "@/components/portal/ui";

type ContextType = "klient" | "organisation";

type AiResponse = {
  ok: boolean;
  text?: string;
  error?: string;
  sources?: string[];
  refused?: boolean;
};

export default function AiAskPanel({
  contextType,
  contextId,
  title,
  scopeNote,
  suggestions,
  placeholder,
}: {
  contextType: ContextType;
  contextId: string;
  title: string;
  scopeNote: string;
  suggestions: Array<{ label: string; question: string }>;
  placeholder: string;
}) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<{ text: string; sources: string[]; refused: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [askedQuestion, setAskedQuestion] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  async function ask(value: string) {
    const trimmed = value.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);
    setAnswer(null);
    setAskedQuestion(trimmed);

    const endpoint =
      contextType === "klient" ? "/api/portal/ai/klient" : "/api/portal/ai/organisation";
    const payload =
      contextType === "klient"
        ? { clientId: contextId, mode: "fraga", question: trimmed }
        : { engagementId: contextId, question: trimmed };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as AiResponse;
      if (!response.ok || !data.ok || !data.text) {
        setError(data.error ?? "Det gick inte att skapa sammanställningen just nu. Försök igen.");
      } else {
        setAnswer({ text: data.text, sources: data.sources ?? [], refused: Boolean(data.refused) });
      }
    } catch {
      setError("Det gick inte att nå tjänsten just nu. Kontrollera uppkopplingen och försök igen.");
    } finally {
      setLoading(false);
      requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    }
  }

  return (
    <Panel className="scroll-mt-24">
      <SectionLabel>AI-underlag</SectionLabel>
      <h2 className="mt-2.5 text-[1.3rem] font-medium leading-[1.25] tracking-tight text-zinc-900">
        {title}
      </h2>
      <p className="mt-2.5 text-[0.875rem] leading-relaxed text-zinc-500">{scopeNote}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.label}
            type="button"
            disabled={loading}
            onClick={() => {
              setQuestion(suggestion.question);
              void ask(suggestion.question);
            }}
            className="min-h-11 rounded-full border border-zinc-200 bg-[#faf9f7] px-3.5 py-2.5 text-[0.8125rem] leading-tight text-zinc-700 transition-colors duration-200 hover:border-zinc-300 hover:bg-white disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            {suggestion.label}
          </button>
        ))}
      </div>

      <form
        className="mt-5"
        onSubmit={(event) => {
          event.preventDefault();
          void ask(question);
        }}
      >
        <label htmlFor={`ai-question-${contextId}`} className="sr-only">
          {title}
        </label>
        <textarea
          id={`ai-question-${contextId}`}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={3}
          placeholder={placeholder}
          enterKeyHint="send"
          className="w-full resize-none rounded-2xl border border-zinc-200 bg-[#faf9f7] px-4 py-3.5 text-[0.9375rem] leading-[1.6] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/15"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-[0.75rem] text-zinc-400">Endast aktuell kontext.</p>
          <button
            type="submit"
            disabled={loading || question.trim().length === 0}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-50 transition-colors duration-200 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            {loading ? "Sammanställer…" : "Fråga"}
          </button>
        </div>
      </form>

      <div ref={resultRef} className="mt-6">
        {loading ? (
          <AiSkeleton
            label="Sammanställer underlag…"
          />
        ) : null}

        {!loading && error ? (
          <div className="rounded-2xl border border-zinc-200 bg-[#faf9f7] p-4">
            <p className="text-[0.9375rem] leading-relaxed text-zinc-700">{error}</p>
            {askedQuestion ? (
              <button
                type="button"
                onClick={() => void ask(askedQuestion)}
                className="mt-3 inline-flex min-h-10 items-center rounded-full border border-zinc-300 px-4 py-2 text-[0.8125rem] font-medium text-zinc-700 transition-colors hover:border-zinc-500 hover:bg-white"
              >
                Försök igen
              </button>
            ) : null}
          </div>
        ) : null}

        {!loading && answer ? (
          <article className="rounded-2xl border border-zinc-200/90 bg-[#faf9f7] p-4 md:p-5">
            {askedQuestion ? (
              <p className="mb-4 border-l-2 border-zinc-300 pl-3 text-[0.8125rem] leading-relaxed text-zinc-500">
                {askedQuestion}
              </p>
            ) : null}

            <AiResult text={answer.text} />

            {!answer.refused ? (
              <>
                {answer.sources.length > 0 ? (
                  <div className="mt-5 border-t border-zinc-200 pt-4">
                    <SectionLabel>Underlag</SectionLabel>
                    <ul className="mt-2.5 space-y-1.5">
                      {answer.sources.map((source) => (
                        <li key={source} className="text-[0.8125rem] leading-relaxed text-zinc-500">
                          {source}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <div className="mt-4">
                  <AiDisclaimer>
                    AI-genererat underlag för granskning. Kan bygga på dina arbetsanteckningar och är
                    inte avsett att delas vidare.
                  </AiDisclaimer>
                </div>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => askedQuestion && void ask(askedQuestion)}
                    className="inline-flex min-h-10 items-center rounded-full border border-zinc-300 px-4 py-2 text-[0.8125rem] font-medium text-zinc-700 transition-colors hover:border-zinc-500 hover:bg-white"
                  >
                    Generera om
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAnswer(null);
                      setAskedQuestion(null);
                      setQuestion("");
                    }}
                    className="inline-flex min-h-10 items-center rounded-full px-4 py-2 text-[0.8125rem] font-medium text-zinc-500 transition-colors hover:text-zinc-800"
                  >
                    Rensa
                  </button>
                </div>
              </>
            ) : null}
          </article>
        ) : null}
      </div>
    </Panel>
  );
}
