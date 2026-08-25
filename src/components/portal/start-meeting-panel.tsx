"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { Panel, PanelHeading, SectionLabel, portalButtonClass, portalFieldClass } from "@/components/portal/ui";

type SessionOption = { id: string; number: number; date: string; time: string };
type ClientOption = { id: string; name: string; sessions: SessionOption[] };

export default function StartMeetingPanel({ clients }: { clients: ClientOption[] }) {
  const router = useRouter();
  const [clientId, setClientId] = useState("");
  const selectedClient = clients.find((item) => item.id === clientId);
  const [sessionId, setSessionId] = useState("");

  const sortedSessions = useMemo(() => {
    if (!selectedClient) return [];
    // Sessions are already filtered to "kommande" by the parent.
    // Sort by date, with today's date first, then upcoming dates.
    return [...selectedClient.sessions].sort((a, b) => a.date.localeCompare(b.date));
  }, [selectedClient]);

  function selectClient(id: string) {
    setClientId(id);
    setSessionId("");
  }

  if (clients.length === 0) return null;

  return (
    <Panel>
      <PanelHeading label="Möte" title="Starta annat möte" />
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="sm:flex-1">
          <SectionLabel>Klient</SectionLabel>
          <select
            value={clientId}
            onChange={(event) => selectClient(event.target.value)}
            className={`mt-2 ${portalFieldClass}`}
          >
            <option value="">Välj klient</option>
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
            value={sessionId}
            onChange={(event) => setSessionId(event.target.value)}
            disabled={!selectedClient}
            className={`mt-2 ${portalFieldClass}`}
          >
            <option value="">Välj session</option>
            {sortedSessions.map((item) => (
              <option key={item.id} value={item.id}>
                Session {item.number} · {item.date} kl. {item.time}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={!sessionId}
          onClick={() => router.push(`/portal/mote/${sessionId}`)}
          className={`${portalButtonClass} sm:shrink-0`}
        >
          Starta möte
        </button>
      </div>
    </Panel>
  );
}
