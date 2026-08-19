"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
          className="inline-flex min-h-11 items-center rounded-full border border-zinc-300 px-4 py-2 text-[0.8125rem] font-medium text-zinc-700 transition-colors hover:border-zinc-500 hover:bg-white disabled:opacity-60"
        >
          {busy ? "Tar bort…" : "Ja, ta bort"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-[0.8125rem] text-zinc-500 transition-colors hover:text-zinc-800"
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
      className="mt-3 text-[0.8125rem] text-zinc-400 underline underline-offset-4 transition-colors hover:text-zinc-700"
    >
      Ta bort
    </button>
  );
}
