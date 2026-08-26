"use client";

import { Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
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
    "w-full rounded-xl border border-white/70 bg-white/45 px-4 py-3.5 text-[1rem] leading-tight text-zinc-900 placeholder:text-zinc-400 backdrop-blur-sm focus:border-zinc-400 focus:bg-white/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/15";

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
          className={`mt-2 ${fieldClass}`}
        />
      </div>

      <div className="mt-5">
        <label htmlFor="login-password" className="text-[0.8125rem] font-medium text-zinc-700">
          Lösenord
        </label>
        <div className="relative mt-2">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={`${fieldClass} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-zinc-500 transition-colors hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/15"
            aria-label={showPassword ? "Dölj lösenord" : "Visa lösenord"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-4 rounded-xl border border-white/60 bg-white/40 px-4 py-3 text-[0.875rem] leading-relaxed text-zinc-700 backdrop-blur-sm">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={loading} className={`mt-7 w-full ${portalButtonClass}`}>
        {loading ? "Loggar in…" : "Logga in"}
      </button>
    </form>
  );
}
