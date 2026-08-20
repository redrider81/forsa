"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { klientButtonSmClass } from "@/components/klient/klient-ui";

/**
 * Klienten äger sitt eget material och ska kunna ta bort det hon själv skrivit.
 * Visas endast på reflektioner hon skapat i portalen.
 */
export default function OwnReflectionControls({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function remove() {
    setBusy(true);
    await fetch("/api/klient/reflektion", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setBusy(false);
    setConfirming(false);
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => void remove()}
          className={klientButtonSmClass}
        >
          {busy ? "Tar bort…" : "Ja, ta bort"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className={klientButtonSmClass}
        >
          Behåll
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className={`mt-3 ${klientButtonSmClass}`}
    >
      Ta bort
    </button>
  );
}
