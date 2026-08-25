"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { portalButtonClass } from "@/components/portal/ui";

export default function LoginForm({
  demo,
  role,
  redirectTo,
}: {
  demo: { email: string } | null;
  role: "coach" | "klient";
  redirectTo: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(demo?.email ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/portal/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const data = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setError(data.error ?? "Inloggningen misslyckades. Försök igen.");
        setLoading(false);
        return;
      }
      router.replace(redirectTo);
      router.refresh();
    } catch {
      setError("Det gick inte att nå tjänsten just nu. Kontrollera uppkopplingen och försök igen.");
      setLoading(false);
    }
  }

  const fieldClass =
    "mt-2 w-full rounded-xl border border-[#e6e0d3] bg-[var(--klient-text-block-bg)] px-4 py-3.5 text-[1rem] leading-tight text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/15";

  return (
    <form onSubmit={submit} noValidate>
      <div>
        <label htmlFor="login-email" className="text-[0.8125rem] font-medium text-zinc-700">
          E-post
        </label>
        <input
          id="login-email"
          type="email"
          name="email"
          autoComplete="username"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={fieldClass}
        />
      </div>

      <div className="mt-5">
        <label htmlFor="login-password" className="text-[0.8125rem] font-medium text-zinc-700">
          Lösenord
        </label>
        <input
          id="login-password"
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={fieldClass}
        />
      </div>

      {error ? (
        <p role="alert" className="mt-4 rounded-xl bg-[var(--klient-text-block-bg)] px-4 py-3 text-[0.875rem] leading-relaxed text-zinc-700">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={loading} className={`mt-7 w-full ${portalButtonClass}`}>
        {loading ? "Loggar in…" : "Logga in"}
      </button>
    </form>
  );
}
