"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Panel, PanelHeading, SectionLabel, portalButtonClass, portalFieldClass } from "@/components/portal/ui";

type SessionOption = { id: string; number: number; date: string; time: string };
type ClientOption = { id: string; name: string; sessions: SessionOption[] };

export default function StartMeetingPanel({ clients }: { clients: ClientOption[] }) {
  const router = useRouter();
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const client = clients.find((item) => item.id === clientId) ?? clients[0];
  const [sessionId, setSessionId] = useState(client?.sessions[0]?.id ?? "");

  function selectClient(id: string) {
    setClientId(id);
    const next = clients.find((item) => item.id === id);
    setSessionId(next?.sessions[0]?.id ?? "");
  }

  if (clients.length === 0) return null;

  return (
    <Panel>
      <PanelHeading label="Möte" title="Starta möte" />
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="sm:flex-1">
          <SectionLabel>Klient</SectionLabel>
          <select
            value={clientId}
            onChange={(event) => selectClient(event.target.value)}
            className={`mt-2 ${portalFieldClass}`}
          >
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
            className={`mt-2 ${portalFieldClass}`}
          >
            {(client?.sessions ?? []).map((item) => (
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
