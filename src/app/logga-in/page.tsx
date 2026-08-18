import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import LoginForm from "@/components/portal/login-form";
import { readSession } from "@/lib/portal/session";
import { demoHint } from "@/lib/portal/users";

export const metadata: Metadata = {
  title: "Logga in | CVB Coaching",
  description: "Logga in i CVB Coaching Portal.",
};

export default async function LoginPage() {
  if (await readSession()) {
    redirect("/portal");
  }

  const demo = demoHint();

  return (
    <main id="main-content" className="flex min-h-[100svh] flex-col bg-[#f6f6f4] text-zinc-900">
      <div className="flex flex-1 items-center justify-center px-5 py-12 md:py-20">
        <div className="w-full max-w-[26rem]">
          <Link
            href="/"
            className="inline-block text-[0.8125rem] font-semibold tracking-[0.24em] text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f6f4]"
          >
            CVB COACHING
          </Link>

          <h1 className="mt-9 text-[1.9rem] font-medium leading-[1.15] tracking-tight text-zinc-900">
            Logga in i portalen
          </h1>
          <p className="mt-3.5 text-[0.9375rem] leading-[1.7] text-zinc-600">
            Här samlas dina uppdrag, klienter och sessioner. Allt innehåll i den här versionen är
            fiktivt testmaterial.
          </p>

          <div className="mt-8 rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-[0_1px_2px_rgba(24,24,27,0.04)] md:p-7">
            <LoginForm demo={demo} />
          </div>

          {demo ? (
            <p className="mt-5 text-[0.8125rem] leading-relaxed text-zinc-500">
              Demoinloggning är förifylld. Tryck bara på <span className="text-zinc-700">Logga in</span>.
            </p>
          ) : null}

          <p className="mt-8 text-[0.8125rem] text-zinc-400">
            <Link href="/" className="transition-colors hover:text-zinc-700">
              ← Tillbaka till cvbcoaching.se
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
