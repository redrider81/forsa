"use client";

import Link from "next/link";
import { useState } from "react";
import { portalButtonClass, portalOutlineButtonClass } from "@/components/portal/ui";

/** "Glömt lösenord?" — asks for the address and always shows the same answer. */
export default function PasswordResetRequestForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/portal/auth/aterstall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json()) as { ok: boolean; error?: string; message?: string };
      if (!response.ok || !data.ok) {
        setError(data.error ?? "Det gick inte att skicka begäran. Försök igen.");
      } else {
        setDone(data.message ?? "Kontrollera din inkorg.");
      }
    } catch {
      setError("Det gick inte att nå tjänsten just nu. Kontrollera uppkopplingen och försök igen.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div>
        <p role="status" className="text-[0.9375rem] leading-relaxed text-zinc-700">
          {done}
        </p>
        <Link href="/klient-login" className={`mt-6 w-full ${portalOutlineButtonClass}`}>
          Till inloggningen
        </Link>
      </div>
    );
  }

  const fieldClass =
    "w-full rounded-xl border border-white/70 bg-white/45 px-4 py-3.5 text-[1rem] leading-tight text-zinc-900 placeholder:text-zinc-400 backdrop-blur-sm focus:border-zinc-400 focus:bg-white/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/15";

  return (
    <form onSubmit={submit} noValidate>
      <label htmlFor="reset-email" className="text-[0.8125rem] font-medium text-zinc-700">
        E-post
      </label>
      <input
        id="reset-email"
        type="email"
        name="email"
        autoComplete="username"
        inputMode="email"
        autoCapitalize="none"
        spellCheck={false}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className={`mt-2 ${fieldClass}`}
      />

      {error ? (
        <p role="alert" className="mt-4 rounded-xl border border-white/60 bg-white/40 px-4 py-3 text-[0.875rem] leading-relaxed text-zinc-700 backdrop-blur-sm">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={loading} className={`mt-7 w-full ${portalButtonClass}`}>
        {loading ? "Skickar…" : "Skicka länk"}
      </button>
    </form>
  );
}
