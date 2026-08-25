"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Commitment, DevelopmentGoal } from "@/lib/portal/types";
import {
  Panel,
  PanelHeading,
  SectionLabel,
  Tag,
  portalButtonClass,
  portalTextareaClass,
} from "@/components/portal/ui";

export default function MeetingWorkspace({
  sessionId,
  initialClientFocus,
  initialDesiredOutcome,
  exploreContext,
  goal,
  openCommitments,
  initialCoachNotes,
}: {
  sessionId: string;
  initialClientFocus: string;
  initialDesiredOutcome: string;
  exploreContext: string;
  goal: DevelopmentGoal;
  openCommitments: Commitment[];
  initialCoachNotes: string;
}) {
  const router = useRouter();
  const [clientFocus, setClientFocus] = useState(initialClientFocus);
  const [desiredOutcome, setDesiredOutcome] = useState(initialDesiredOutcome);
  const [explore, setExplore] = useState(exploreContext);
  const [agreementBusy, setAgreementBusy] = useState(false);
  const [agreementSaved, setAgreementSaved] = useState(false);

  const [notes, setNotes] = useState(initialCoachNotes);
  const [notesBusy, setNotesBusy] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  const [showClosePanel, setShowClosePanel] = useState(false);
  const [awareness, setAwareness] = useState("");
  const [insights, setInsights] = useState("");
  const [commitments, setCommitments] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [nextFocus, setNextFocus] = useState("");
  const [completingSession, setCompletingSession] = useState(false);

  async function saveAgreement() {
    setAgreementBusy(true);
    setAgreementSaved(false);
    await fetch("/api/portal/mote/agreement", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, clientFocus, desiredOutcome, exploration: explore }),
    });
    setAgreementBusy(false);
    setAgreementSaved(true);
  }

  async function saveNotes() {
    setNotesBusy(true);
    setNotesSaved(false);
    await fetch("/api/portal/mote/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, notes }),
    });
    setNotesBusy(false);
    setNotesSaved(true);
  }

  async function completeSession() {
    setCompletingSession(true);
    const insightsArray = insights
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const commitmentsArray = commitments
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const followUpArray = followUp
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    try {
      const response = await fetch("/api/portal/mote/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          awareness,
          insights: insightsArray,
          commitments: commitmentsArray,
          follow_up: followUpArray,
          possible_next_focus: nextFocus,
        }),
      });

      if (response.ok) {
        router.push("/portal");
      }
    } finally {
      setCompletingSession(false);
    }
  }

  return (
    <>
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={() => setShowClosePanel(!showClosePanel)}
          className="text-[0.9375rem] font-medium text-red-600 hover:text-red-700"
        >
          Avsluta möte
        </button>
      </div>

      {showClosePanel && (
        <Panel>
          <PanelHeading label="Avsluta session" title="Sessionens lärande och nästa steg" />
          <div className="mt-5 space-y-6">
            <div>
              <SectionLabel>Dagens önskade utfall</SectionLabel>
              <p className="mt-2.5 text-[0.9375rem] leading-[1.7] text-zinc-700">{desiredOutcome}</p>
            </div>

            <div className="border-t border-zinc-200/80 pt-6">
              <SectionLabel>Vad har blivit tydligare?</SectionLabel>
              <textarea
                value={awareness}
                onChange={(event) => setAwareness(event.target.value)}
                rows={3}
                className={`mt-2 ${portalTextareaClass}`}
              />
            </div>

            <div className="border-t border-zinc-200/80 pt-6">
              <SectionLabel>Vad tar klienten med sig?</SectionLabel>
              <textarea
                value={insights}
                onChange={(event) => setInsights(event.target.value)}
                rows={3}
                placeholder="En insikt per rad"
                className={`mt-2 ${portalTextareaClass}`}
              />
            </div>

            <div className="border-t border-zinc-200/80 pt-6">
              <SectionLabel>Vad vill klienten göra eller reflektera över härnäst?</SectionLabel>
              <textarea
                value={commitments}
                onChange={(event) => setCommitments(event.target.value)}
                rows={3}
                placeholder="En åtgärd per rad"
                className={`mt-2 ${portalTextareaClass}`}
              />
            </div>

            <div className="border-t border-zinc-200/80 pt-6">
              <SectionLabel>Hur vill klienten själv följa upp detta?</SectionLabel>
              <textarea
                value={followUp}
                onChange={(event) => setFollowUp(event.target.value)}
                rows={3}
                placeholder="En uppföljning per rad"
                className={`mt-2 ${portalTextareaClass}`}
              />
            </div>

            <div className="border-t border-zinc-200/80 pt-6">
              <SectionLabel>Möjligt fokus framåt</SectionLabel>
              <textarea
                value={nextFocus}
                onChange={(event) => setNextFocus(event.target.value)}
                rows={2}
                className={`mt-2 ${portalTextareaClass}`}
              />
            </div>

            <div className="border-t border-zinc-200/80 pt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowClosePanel(false)}
                disabled={completingSession}
                className={`${portalButtonClass} bg-zinc-200 text-zinc-900 hover:bg-zinc-300`}
              >
                Avbryt
              </button>
              <button
                type="button"
                onClick={completeSession}
                disabled={completingSession}
                className={portalButtonClass}
              >
                {completingSession ? "Slutför…" : "Slutför session"}
              </button>
            </div>
          </div>
        </Panel>
      )}

      <Panel>
        <PanelHeading label="Dagens överenskommelse" title="Samtalets riktning" />
        <div className="mt-5 space-y-5">
          <div>
            <SectionLabel>Vad vill klienten uppnå idag?</SectionLabel>
            <textarea
              value={clientFocus}
              onChange={(event) => {
                setClientFocus(event.target.value);
                setAgreementSaved(false);
              }}
              rows={3}
              className={`mt-2 ${portalTextareaClass}`}
            />
          </div>
          <div className="border-t border-zinc-200/80 pt-5">
            <SectionLabel>Hur ser ett värdefullt resultat ut?</SectionLabel>
            <textarea
              value={desiredOutcome}
              onChange={(event) => {
                setDesiredOutcome(event.target.value);
                setAgreementSaved(false);
              }}
              rows={3}
              className={`mt-2 ${portalTextareaClass}`}
            />
          </div>
          <div className="border-t border-zinc-200/80 pt-5">
            <SectionLabel>Vad behöver utforskas?</SectionLabel>
            <textarea
              value={explore}
              onChange={(event) => {
                setExplore(event.target.value);
                setAgreementSaved(false);
              }}
              rows={3}
              className={`mt-2 ${portalTextareaClass}`}
            />
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={saveAgreement} disabled={agreementBusy} className={portalButtonClass}>
              {agreementBusy ? "Sparar…" : "Spara"}
            </button>
            {agreementSaved ? <span className="text-[0.8125rem] text-zinc-500">Sparat.</span> : null}
          </div>
        </div>
      </Panel>

      <Panel>
        <PanelHeading label="Kontext" title="Utvecklingsmål och tidigare åtaganden" />
        <div className="mt-5 space-y-5">
          <div>
            <SectionLabel>Utvecklingsmål</SectionLabel>
            <p className="mt-2.5 text-[0.9375rem] leading-[1.7] text-zinc-700">{goal.headline}</p>
          </div>
          <div className="border-t border-zinc-200/80 pt-5">
            <SectionLabel>Föregående åtaganden</SectionLabel>
            {openCommitments.length === 0 ? (
              <p className="mt-2.5 text-[0.875rem] text-zinc-500">Inga öppna åtaganden.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {openCommitments.map((commitment) => (
                  <li key={commitment.id} className="flex items-start justify-between gap-4">
                    <span className="text-[0.9375rem] leading-[1.6] text-zinc-700">{commitment.text}</span>
                    <Tag tone={commitment.status === "pagar" ? "progress" : "open"}>
                      {commitment.status === "pagar" ? "Pågår" : "Öppet"}
                    </Tag>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Panel>

      <Panel>
        <PanelHeading label="Coach privat" title="Privata coachanteckningar" action={<Tag tone="private">Endast du</Tag>} />
        <div className="mt-5">
          <textarea
            value={notes}
            onChange={(event) => {
              setNotes(event.target.value);
              setNotesSaved(false);
            }}
            rows={8}
            placeholder="Anteckningar under samtalet — delas aldrig med klienten."
            className={`${portalTextareaClass}`}
          />
          <div className="mt-4 flex items-center gap-3">
            <button type="button" onClick={saveNotes} disabled={notesBusy} className={portalButtonClass}>
              {notesBusy ? "Sparar…" : "Spara anteckningar"}
            </button>
            {notesSaved ? <span className="text-[0.8125rem] text-zinc-500">Sparat.</span> : null}
          </div>
        </div>
      </Panel>
    </>
  );
}
