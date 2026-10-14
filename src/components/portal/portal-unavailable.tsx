import { LogoMark } from "@/components/brand/logo";
import "@/components/klient/klient-tokens.css";

/**
 * Shown by the CVB Base layouts when the signed-in profile cannot be read.
 * A database fault must not look like a signed-out session (which would
 * redirect to the login form), and the layout's own errors are outside the
 * segment's error.tsx. No technical detail reaches the page.
 */
export default function PortalUnavailable({ portal }: { portal: "coach" | "klient" }) {
  const wrapper = portal === "coach" ? { "data-portal": "" } : { "data-klient-portal": "" };
  return (
    <main
      id="main-content"
      {...wrapper}
      className="portal-login-bg flex min-h-[100svh] flex-col text-zinc-900"
    >
      <div className="flex flex-1 items-center justify-center px-5 py-12 md:py-20">
        <div className="w-full max-w-[26rem]">
          <LogoMark className="h-16 w-auto" priority />
          <h1 className="mt-9 text-[1.5rem] font-medium leading-[1.25] tracking-tight text-zinc-900">
            CVB Base är inte tillgängligt just nu
          </h1>
          <p className="mt-3.5 text-[0.9375rem] leading-[1.7] text-zinc-600">
            Uppgifterna kunde inte hämtas. Inget har ändrats. Ladda om sidan om en stund.
          </p>
        </div>
      </div>
    </main>
  );
}
