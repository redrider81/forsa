"use client";

import { useEffect } from "react";
import { Panel, PortalSectionHeader, portalButtonClass } from "@/components/portal/ui";

/**
 * Error boundary for CVB Base pages. A failed database read now throws
 * instead of rendering an empty page; this says so. Server errors arrive
 * here without their message (Next.js strips it in production).
 */
export default function PortalError({
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
    <Panel>
      <PortalSectionHeader title="Uppgifterna kunde inte hämtas" />
      <p className="mt-3 text-[0.9375rem] leading-[1.7] text-zinc-600">
        Ett tekniskt fel hindrade sidan från att visas. Inget har ändrats. Försök igen om en stund.
      </p>
      <button type="button" onClick={() => unstable_retry()} className={`mt-5 ${portalButtonClass}`}>
        Försök igen
      </button>
    </Panel>
  );
}
