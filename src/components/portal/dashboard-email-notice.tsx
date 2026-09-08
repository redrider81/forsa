import { Panel } from "@/components/portal/ui";

/**
 * Coach-only operational notice: booking email is in simulated mode.
 *
 * Rendered by the server, and only when real delivery is off, so the
 * browser never receives the configuration behind the decision — only the
 * finished markup. There is deliberately no counterpart notice for enabled
 * mode: configuration saying "enabled" is not evidence that anything
 * reached an inbox, and a reassuring badge would imply exactly that.
 */
export default function DashboardEmailNotice() {
  return (
    <Panel className="border-amber-300/70 bg-amber-50/60">
      <p className="text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-amber-800/80">
        Driftläge
      </p>
      <p className="mt-2 text-[0.9375rem] font-medium leading-relaxed text-zinc-900">
        E-postutskick är i simulerat läge.
      </p>
      <p className="mt-1.5 text-[0.875rem] leading-relaxed text-zinc-700">
        Bokningsmejl registreras som genomförda, men skickas inte till mottagare.
      </p>
    </Panel>
  );
}
