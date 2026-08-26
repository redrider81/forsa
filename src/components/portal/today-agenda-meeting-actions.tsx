"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  portalFieldClass,
  portalPrimaryButtonSmClass,
  portalSecondaryButtonSmClass,
  SectionLabel,
} from "@/components/portal/ui";

type SessionOption = { id: string; number: number; date: string; time: string };
export type MeetableClient = { id: string; name: string; sessions: SessionOption[] };

export function TodayAgendaMeetingActions({
  sessionId,
  clients,
}: {
  sessionId: string;
  clients: MeetableClient[];
}) {
  const router = useRouter();
  const [showSelector, setShowSelector] = useState(false);
  const [clientId, setClientId] = useState("");
  const [otherSessionId, setOtherSessionId] = useState("");

  const selectedClient = clients.find((item) => item.id === clientId);

  const sortedSessions = useMemo(() => {
    if (!selectedClient) return [];
    return [...selectedClient.sessions].sort((a, b) => a.date.localeCompare(b.date));
  }, [selectedClient]);

  function selectClient(id: string) {
    setClientId(id);
    setOtherSessionId("");
  }

  function resetSelector() {
    setClientId("");
    setOtherSessionId("");
    setShowSelector(false);
  }

  return (
    <div className="mt-5 border-t border-[var(--klient-border-muted)] pt-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <Link href={`/portal/mote/${sessionId}`} className={portalPrimaryButtonSmClass}>
          Starta möte
        </Link>
        {clients.length > 0 ? (
          <button
            type="button"
            onClick={() => setShowSelector((open) => !open)}
            className={portalSecondaryButtonSmClass}
          >
            Starta annat möte
          </button>
        ) : null}
      </div>

      {showSelector ? (
        <div className="mt-4 rounded-xl border border-[var(--klient-border-muted)] bg-[var(--klient-text-block-bg)] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="sm:flex-1">
              <SectionLabel>Klient</SectionLabel>
              <select
                value={clientId}
                onChange={(event) => selectClient(event.target.value)}
                className={`mt-2 ${portalFieldClass}`}
              >
                <option value="" disabled>
                  Välj klient
                </option>
                {clients.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="sm:flex-1">
              <SectionLabel>Session</SectionLabel>
              <select
                value={otherSessionId}
                onChange={(event) => setOtherSessionId(event.target.value)}
                disabled={!selectedClient}
                className={`mt-2 ${portalFieldClass}`}
              >
                <option value="" disabled>
                  Välj session
                </option>
                {sortedSessions.map((item) => (
                  <option key={item.id} value={item.id}>
                    Session {item.number} · {item.date} kl. {item.time}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              disabled={!otherSessionId}
              onClick={() => router.push(`/portal/mote/${otherSessionId}`)}
              className={`${portalPrimaryButtonSmClass} sm:shrink-0`}
            >
              Starta
            </button>
          </div>
          <button
            type="button"
            onClick={resetSelector}
            className="mt-3 text-[0.8125rem] font-medium text-zinc-600 hover:text-zinc-900"
          >
            Avbryt
          </button>
        </div>
      ) : null}
    </div>
  );
}
