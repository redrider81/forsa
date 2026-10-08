"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export type LogoutDestination = "/coach-login" | "/klient-login";

/**
 * Avslutar sessionen server-side i `/api/portal/auth/logout`. Navigerar bara
 * när servern uttryckligen bekräftar utloggningen (`200` och `{ ok: true }`);
 * ett felsvar eller nätverksfel ger `false` och användaren står kvar.
 */
export async function runLogout(
  redirectTo: LogoutDestination,
  navigate: (to: LogoutDestination) => void,
  request: typeof fetch = fetch,
): Promise<boolean> {
  try {
    const response = await request("/api/portal/auth/logout", { method: "POST" });
    const body: unknown = await response.json().catch(() => null);
    const confirmed =
      response.ok && typeof body === "object" && body !== null && (body as { ok?: unknown }).ok === true;
    if (!confirmed) return false;
  } catch {
    return false;
  }
  navigate(redirectTo);
  return true;
}

export function logoutLabel(working: boolean, failed: boolean): string {
  if (working) return "Loggar ut…";
  if (failed) return "Utloggningen misslyckades – försök igen";
  return "Logga ut";
}

/**
 * Gemensam utloggning för coach- och klientportalen. Misslyckas anropet står
 * användaren kvar och kan försöka igen — ingen skenbar utloggning.
 */
export function useLogout(redirectTo: LogoutDestination) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function logout() {
    setBusy(true);
    setFailed(false);
    const ok = await runLogout(redirectTo, (to) =>
      startTransition(() => {
        router.replace(to);
        router.refresh();
      }),
    );
    if (!ok) {
      setBusy(false);
      setFailed(true);
    }
  }

  const working = busy || pending;
  return { logout, working, failed, label: logoutLabel(working, failed) };
}
