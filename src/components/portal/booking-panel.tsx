"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { BookingRequest } from "@/lib/portal/booking";
import { formatDate } from "@/lib/portal/format";
import {
  Divider,
  EmptyState,
  Panel,
  PanelHeading,
  SectionLabel,
  Tag,
  portalButtonSmClass,
  portalFieldClass,
  portalGhostButtonClass,
  portalOutlineButtonClass,
  portalQuietLinkClass,
  portalTextareaClass,
} from "@/components/portal/ui";

type ClientOption = { id: string; name: string };

export default function BookingPanel({
  clients,
  bookings,
}: {
  clients: ClientOption[];
  bookings: BookingRequest[];
}) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  async function propose(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/portal/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, date, time, durationMinutes, location, message }),
      });
      const data = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setError(data.error ?? "Förfrågan kunde inte skapas.");
        setBusy(false);
        return;
      }
      setDate("");
      setTime("");
      setLocation("");
      setMessage("");
      setBusy(false);
      setOpen(false);
      router.refresh();
    } catch {
      setError("Det gick inte att nå tjänsten just nu. Försök igen.");
      setBusy(false);
    }
  }

  async function respond(bookingId: string, action: "accept" | "decline") {
    setActingId(bookingId);
    await fetch("/api/portal/booking", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, action }),
    });
    setActingId(null);
    router.refresh();
  }

  async function cancel(bookingId: string) {
    setActingId(bookingId);
    await fetch("/api/portal/booking", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    });
    setActingId(null);
    router.refresh();
  }

  return (
    <Panel>
      <PanelHeading
        label="Möten"
        title="Bokningsförfrågningar"
        action={
          <button type="button" onClick={() => setOpen((value) => !value)} className={portalQuietLinkClass}>
            {open ? "Avbryt" : "+ Boka möte"}
          </button>
        }
      />

      <div className="mt-4">
        {bookings.length === 0 ? (
          <EmptyState>Inga väntande bokningsförfrågningar.</EmptyState>
        ) : (
          bookings.map((booking, index) => (
            <div key={booking.id}>
              {index > 0 ? <Divider /> : null}
              <div className="-mx-3 flex items-start justify-between gap-5 px-3 py-3.5">
                <div>
                  <p className="text-[0.9375rem] font-medium leading-snug text-zinc-900">
                    {booking.clientName ?? "Klient"}
                  </p>
                  <p className="mt-1 text-[0.8125rem] leading-relaxed text-zinc-500">
                    {formatDate(booking.date)} kl. {booking.time} · {booking.durationMinutes} min
                    {booking.location ? ` · ${booking.location}` : ""}
                  </p>
                  {booking.message ? (
                    <p className="mt-1 text-[0.8125rem] leading-relaxed text-zinc-500">”{booking.message}”</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  {booking.requestedByRole === "klient" ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={actingId === booking.id}
                        onClick={() => respond(booking.id, "accept")}
                        className={portalButtonSmClass}
                      >
                        Acceptera
                      </button>
                      <button
                        type="button"
                        disabled={actingId === booking.id}
                        onClick={() => respond(booking.id, "decline")}
                        className={portalGhostButtonClass}
                      >
                        Avböj
                      </button>
                    </div>
                  ) : (
                    <>
                      <Tag>Väntar på klient</Tag>
                      <button
                        type="button"
                        disabled={actingId === booking.id}
                        onClick={() => cancel(booking.id)}
                        className={portalGhostButtonClass}
                      >
                        Avboka
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {open ? (
        <form onSubmit={propose} noValidate className="mt-5 space-y-4 border-t border-[var(--klient-border-muted)] pt-5">
          <label>
            <SectionLabel>Klient</SectionLabel>
            <select
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
              className={`mt-2 ${portalFieldClass}`}
            >
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <SectionLabel>Datum</SectionLabel>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className={`mt-2 ${portalFieldClass}`}
                required
              />
            </label>
            <label>
              <SectionLabel>Tid</SectionLabel>
              <input
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                className={`mt-2 ${portalFieldClass}`}
                required
              />
            </label>
            <label>
              <SectionLabel>Längd (minuter)</SectionLabel>
              <input
                type="number"
                min={15}
                step={15}
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(Number(event.target.value))}
                className={`mt-2 ${portalFieldClass}`}
              />
            </label>
            <label>
              <SectionLabel>Plats/form</SectionLabel>
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className={`mt-2 ${portalFieldClass}`}
                placeholder="t.ex. Video, Kontoret"
              />
            </label>
          </div>
          <label>
            <SectionLabel>Meddelande (valfritt)</SectionLabel>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={2}
              className={`mt-2 ${portalTextareaClass}`}
            />
          </label>

          {error ? (
            <p role="alert" className="rounded-xl bg-[var(--klient-text-block-bg)] px-4 py-3 text-[0.875rem] leading-relaxed text-zinc-700">
              {error}
            </p>
          ) : null}

          <div className="flex gap-2.5">
            <button type="submit" disabled={busy} className={portalOutlineButtonClass}>
              {busy ? "Skickar…" : "Skicka förfrågan"}
            </button>
          </div>
        </form>
      ) : null}
    </Panel>
  );
}
