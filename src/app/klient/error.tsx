"use client";

import { useEffect } from "react";
import { Card, CardTitle, KlientButton, Muted } from "@/components/klient/klient-ui";

/**
 * Error boundary for the client portal. A failed database read now throws
 * instead of rendering an empty page; this says so. Server errors arrive
 * here without their message (Next.js strips it in production).
 */
export default function KlientError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[CVB Coaching] Sidan kunde inte visas", error.digest ?? "");
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Card>
        <CardTitle>Uppgifterna kunde inte hämtas</CardTitle>
        <div className="mt-2">
          <Muted>Ett tekniskt fel hindrade sidan från att visas. Inget har ändrats. Försök igen om en stund.</Muted>
        </div>
        <KlientButton onClick={() => unstable_retry()} className="mt-5">
          Försök igen
        </KlientButton>
      </Card>
    </div>
  );
}
