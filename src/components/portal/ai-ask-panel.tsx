"use client";

import { useRef, useState } from "react";
import { AiDisclaimer, AiResult, AiResultActions, AiSkeleton } from "@/components/portal/ai-result";
import {
  AiActionButton,
  AiSparkleIcon,
  Panel,
  portalAiChipClass,
  portalGhostButtonClass,
  portalInsetClass,
  portalTextareaClass,
  SectionLabel,
} from "@/components/portal/ui";

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
  emailSubject,
}: {
  contextType: ContextType;
  contextId: string;
  title: string;
  scopeNote: string;
  suggestions: Array<{ label: string; question: string }>;
  placeholder: string;
  emailSubject: string;
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
      <SectionLabel>Sammanställt underlag</SectionLabel>
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
            className={portalAiChipClass}
          >
            {suggestion.label}
            <AiSparkleIcon className="size-3.5" />
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
          className={`${portalTextareaClass} resize-none rounded-2xl px-4 py-3.5 leading-[1.6] placeholder:text-zinc-400`}
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-[0.75rem] text-zinc-400">Endast aktuell kontext.</p>
          <AiActionButton type="submit" disabled={loading || question.trim().length === 0}>
            {loading ? "Sammanställer…" : "Fråga"}
          </AiActionButton>
        </div>
      </form>

      <div ref={resultRef} className="mt-6">
        {loading ? (
          <AiSkeleton
            label="Sammanställer underlag…"
          />
        ) : null}

        {!loading && error ? (
          <div className={portalInsetClass}>
            <p className="text-[0.9375rem] leading-relaxed text-zinc-700">{error}</p>
            {askedQuestion ? (
              <AiActionButton compact onClick={() => void ask(askedQuestion)} className="mt-3">
                Försök igen
              </AiActionButton>
            ) : null}
          </div>
        ) : null}

        {!loading && answer ? (
          <article className={portalInsetClass}>
            {askedQuestion ? (
              <p className="mb-4 border-l-2 border-zinc-300 pl-3 text-[0.8125rem] leading-relaxed text-zinc-500">
                {askedQuestion}
              </p>
            ) : null}

            <AiResult text={answer.text} />

            {!answer.refused ? (
              <>
                <AiResultActions text={answer.text} emailSubject={emailSubject} />

                {answer.sources.length > 0 ? (
                  <div className="mt-5 border-t border-[var(--klient-border-muted)] pt-4">
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
                    Genererat underlag för granskning. Kan bygga på dina arbetsanteckningar och är
                    inte avsett att delas vidare.
                  </AiDisclaimer>
                </div>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  <AiActionButton
                    compact
                    type="button"
                    onClick={() => askedQuestion && void ask(askedQuestion)}
                  >
                    Generera om
                  </AiActionButton>
                  <button
                    type="button"
                    onClick={() => {
                      setAnswer(null);
                      setAskedQuestion(null);
                      setQuestion("");
                    }}
                    className={portalGhostButtonClass}
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
