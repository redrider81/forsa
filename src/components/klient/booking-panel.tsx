"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { BookingRequest } from "@/lib/portal/booking";
import { formatDate } from "@/lib/portal/format";
import { Card, CardTitle, Empty, Label, Muted, klientButtonClass, klientButtonSmClass } from "@/components/klient/klient-ui";

const fieldClass =
  "mt-2 w-full rounded-xl border border-[#e6e0d3] bg-[var(--klient-text-block-bg)] px-4 py-3 text-[0.9375rem] leading-tight text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/15";

export default function ClientBookingPanel({ bookings }: { bookings: BookingRequest[] }) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
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
      const response = await fetch("/api/klient/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time, durationMinutes, location, message }),
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
    await fetch("/api/klient/booking", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, action }),
    });
    setActingId(null);
    router.refresh();
  }

  async function cancel(bookingId: string) {
    setActingId(bookingId);
    await fetch("/api/klient/booking", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    });
    setActingId(null);
    router.refresh();
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <Label>Möten</Label>
          <CardTitle>Boka möte</CardTitle>
        </div>
        <button type="button" onClick={() => setOpen((value) => !value)} className={klientButtonSmClass}>
          {open ? "Avbryt" : "Boka möte"}
        </button>
      </div>

      <div className="mt-5">
        {bookings.length === 0 ? (
          <Empty>Inga väntande bokningsförfrågningar.</Empty>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="rounded-xl bg-[var(--klient-text-block-bg)] p-4">
                <p className="text-[0.9375rem] font-medium text-zinc-900">
                  {formatDate(booking.date)} kl. {booking.time} · {booking.durationMinutes} min
                </p>
                {booking.location ? <Muted>{booking.location}</Muted> : null}
                {booking.message ? (
                  <p className="mt-1.5 text-[0.875rem] leading-relaxed text-zinc-600">”{booking.message}”</p>
                ) : null}
                <div className="mt-3">
                  {booking.requestedByRole === "coach" ? (
                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        disabled={actingId === booking.id}
                        onClick={() => respond(booking.id, "accept")}
                        className={klientButtonSmClass}
                      >
                        Acceptera
                      </button>
                      <button
                        type="button"
                        disabled={actingId === booking.id}
                        onClick={() => respond(booking.id, "decline")}
                        className="text-[0.8125rem] font-medium text-zinc-500 underline-offset-4 hover:underline"
                      >
                        Avböj
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-[0.8125rem] text-zinc-500">Väntar på coach</span>
                      <button
                        type="button"
                        disabled={actingId === booking.id}
                        onClick={() => cancel(booking.id)}
                        className="text-[0.8125rem] font-medium text-zinc-500 underline-offset-4 hover:underline"
                      >
                        Avboka
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {open ? (
        <form onSubmit={propose} noValidate className="mt-5 space-y-4 border-t border-[#ece7dc] pt-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <Label>Datum</Label>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className={fieldClass}
                required
              />
            </label>
            <label>
              <Label>Tid</Label>
              <input
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                className={fieldClass}
                required
              />
            </label>
            <label>
              <Label>Längd (minuter)</Label>
              <input
                type="number"
                min={15}
                step={15}
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(Number(event.target.value))}
                className={fieldClass}
              />
            </label>
            <label>
              <Label>Plats/form</Label>
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className={fieldClass}
                placeholder="t.ex. Video"
              />
            </label>
          </div>
          <label>
            <Label>Meddelande (valfritt)</Label>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={2}
              className={fieldClass}
            />
          </label>

          {error ? (
            <p role="alert" className="rounded-xl bg-[var(--klient-text-block-bg)] px-4 py-3 text-[0.875rem] leading-relaxed text-zinc-700">
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={busy} className={klientButtonClass}>
            {busy ? "Skickar…" : "Skicka förfrågan"}
          </button>
        </form>
      ) : null}
    </Card>
  );
}
