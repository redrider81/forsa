"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { portalButtonClass, portalButtonSmClass } from "@/components/portal/ui";

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
        <button type="button" onClick={() => void reset()} className={portalButtonClass}>
          Ja, återställ demoläget
        </button>
        <button
          type="button"
          onClick={() => setState("idle")}
          className={`${portalButtonSmClass} text-zinc-500 hover:text-zinc-800`}
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
        className={portalButtonSmClass}
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
