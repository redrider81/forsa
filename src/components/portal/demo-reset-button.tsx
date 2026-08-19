"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Coachverktyg. Exponeras aldrig i klientportalen. */
export default function DemoResetButton() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "confirm" | "busy" | "done" | "error">("idle");

  async function reset() {
    setState("busy");
    try {
      const response = await fetch("/api/portal/demo/reset", { method: "POST" });
      if (!response.ok) {
        setState("error");
        return;
      }
      setState("done");
      router.refresh();
    } catch {
      setState("error");
    }
  }

  if (state === "confirm") {
    return (
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <button
          type="button"
          onClick={() => void reset()}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-700"
        >
          Ja, återställ demoläget
        </button>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-800"
        >
          Avbryt
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        disabled={state === "busy"}
        onClick={() => setState("confirm")}
        className="inline-flex min-h-11 items-center justify-center rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:border-zinc-500 hover:bg-white disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        {state === "busy" ? "Återställer…" : "Återställ demoläge"}
      </button>
      {state === "done" ? (
        <p role="status" className="mt-3 text-[0.8125rem] text-[#7d6432]">
          Demoläget är återställt till utgångsläget.
        </p>
      ) : null}
      {state === "error" ? (
        <p role="alert" className="mt-3 text-[0.8125rem] text-zinc-700">
          Det gick inte att återställa just nu. Försök igen.
        </p>
      ) : null}
    </div>
  );
}
