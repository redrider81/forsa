"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { portalButtonClass } from "@/components/portal/ui";
import {
  PASSWORD_MIN_LENGTH,
  parseActivationFragment,
  passwordProblem,
  type ActivationType,
} from "@/lib/portal/activation";

type ActivationLink = { tokenHash: string; type: ActivationType };

const COPY = {
  activate: {
    button: "Aktivera och logga in",
    busy: "Aktiverar…",
    invalid:
      "Länken är ofullständig eller har redan öppnats. Öppna länken i inbjudan igen, eller begär en ny via ”Glömt lösenord?”.",
  },
  reset: {
    button: "Spara lösenord och logga in",
    busy: "Sparar…",
    invalid: "Länken är ofullständig eller har redan öppnats. Begär en ny länk via ”Glömt lösenord?”.",
  },
} as const;

export default function ActivationForm({ mode = "activate" }: { mode?: "activate" | "reset" }) {
  const copy = COPY[mode];
  const router = useRouter();
  const [link, setLink] = useState<ActivationLink | null | undefined>(undefined);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Read the one-time token from the fragment and remove it from the
    // address bar and history straight away.
    const parsed = parseActivationFragment(window.location.hash);
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the fragment only exists in the browser, after mount
    setLink(parsed);
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!link) return;
    const problem = passwordProblem(password);
    if (problem) {
      setError(problem);
      return;
    }
    if (password !== confirm) {
      setError("Lösenorden matchar inte.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/portal/auth/aktivera", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenHash: link.tokenHash, type: link.type, password }),
      });
      const data = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setError(data.error ?? "Lösenordet kunde inte sparas. Försök igen.");
        setLoading(false);
        return;
      }
      router.replace("/klient");
      router.refresh();
    } catch {
      setError("Det gick inte att nå tjänsten just nu. Kontrollera uppkopplingen och försök igen.");
      setLoading(false);
    }
  }

  if (link === undefined) {
    return <p className="text-[0.9375rem] text-zinc-600">Förbereder aktiveringen…</p>;
  }

  if (link === null) {
    return (
      <div>
        <p role="alert" className="text-[0.9375rem] leading-relaxed text-zinc-700">
          {copy.invalid}
        </p>
        <Link href="/klient-aterstall" className={`mt-6 w-full ${portalButtonClass}`}>
          Begär en ny länk
        </Link>
      </div>
    );
  }

  const fieldClass =
    "w-full rounded-xl border border-white/70 bg-white/45 px-4 py-3.5 text-[1rem] leading-tight text-zinc-900 placeholder:text-zinc-400 backdrop-blur-sm focus:border-zinc-400 focus:bg-white/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/15";

  return (
    <form onSubmit={submit} noValidate>
      <div>
        <label htmlFor="activation-password" className="text-[0.8125rem] font-medium text-zinc-700">
          Nytt lösenord
        </label>
        <div className="relative mt-2">
          <input
            id="activation-password"
            type={showPassword ? "text" : "password"}
            name="new-password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-describedby="activation-password-hint"
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
        <p id="activation-password-hint" className="mt-2 text-[0.8125rem] text-zinc-500">
          Minst {PASSWORD_MIN_LENGTH} tecken.
        </p>
      </div>

      <div className="mt-5">
        <label htmlFor="activation-confirm" className="text-[0.8125rem] font-medium text-zinc-700">
          Upprepa lösenordet
        </label>
        <input
          id="activation-confirm"
          type={showPassword ? "text" : "password"}
          name="confirm-password"
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          className={`mt-2 ${fieldClass}`}
        />
      </div>

      {error ? (
        <p role="alert" className="mt-4 rounded-xl border border-white/60 bg-white/40 px-4 py-3 text-[0.875rem] leading-relaxed text-zinc-700 backdrop-blur-sm">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={loading} className={`mt-7 w-full ${portalButtonClass}`}>
        {loading ? copy.busy : copy.button}
      </button>
    </form>
  );
}
