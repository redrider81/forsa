import Link from "next/link";
import { readSession } from "@/lib/portal/session";
import { getCoach, listClients, listEngagements } from "@/lib/portal/repository";
import { LogoutButton } from "@/components/portal/portal-nav";
import { Avatar, DefinitionList, PageHeading, Panel, PanelHeading } from "@/components/portal/ui";

export default async function ProfilePage() {
  const session = await readSession();
  if (!session) return null;

  const coach = getCoach();
  const engagements = listEngagements(session.coachId);
  const clients = listClients(session.coachId);

  return (
    <div className="space-y-7">
      <PageHeading label="Profil" title="Din profil" />

      <Panel>
        <div className="flex items-start gap-4">
          <Avatar initials={coach.initials} size="lg" />
          <div className="min-w-0">
            <h2 className="text-[1.25rem] font-medium leading-tight tracking-tight text-zinc-900">
              {coach.name}
            </h2>
            <p className="mt-1.5 text-[0.9375rem] leading-snug text-zinc-600">{coach.title}</p>
            <p className="mt-1 text-[0.8125rem] leading-snug text-zinc-500">{coach.email}</p>
          </div>
        </div>

        <div className="mt-6 border-t border-zinc-200/80 pt-5">
          <DefinitionList
            items={[
              { term: "Certifiering", value: coach.credential },
              { term: "Arbetsområde", value: coach.focus },
              { term: "Aktiva uppdrag", value: `${engagements.length} uppdrag` },
              { term: "Klienter och deltagare", value: `${clients.length} pågående relationer` },
            ]}
          />
        </div>
      </Panel>

      <Panel>
        <PanelHeading label="Sekretess" title="Så hanteras information" />
        <div className="mt-5 space-y-5">
          {[
            {
              level: "Coach privat",
              text: "Dina arbetsanteckningar. Syns endast för dig och ingår aldrig i AI-underlag, rapporter eller klientvy.",
            },
            {
              level: "Coach och klient",
              text: "Utvecklingsmål, sessionsöverenskommelser, klientens reflektioner, insikter, åtaganden och godkända sammanfattningar.",
            },
            {
              level: "Organisation",
              text: "Deltagande, genomförda och kommande sessioner, programstatus och milstolpar. Aldrig individuellt samtalsinnehåll.",
            },
          ].map((item) => (
            <div key={item.level} className="border-b border-zinc-200/70 pb-5 last:border-0 last:pb-0">
              <p className="text-[0.75rem] font-medium uppercase tracking-[0.14em] text-[#92753a]">
                {item.level}
              </p>
              <p className="mt-2 text-[0.9375rem] leading-[1.7] text-zinc-700">{item.text}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelHeading label="Om den här versionen" title="Testmiljö" />
        <p className="mt-3.5 text-[0.9375rem] leading-[1.7] text-zinc-700">
          Allt innehåll i portalen är fiktivt testmaterial. Inga verkliga klientuppgifter förekommer.
          AI-funktionerna körs server-side och arbetar endast med den klient eller det uppdrag du har
          öppnat.
        </p>
      </Panel>

      <div className="flex flex-col gap-3 pb-2 sm:flex-row">
        <LogoutButton className="flex-1" />
        <Link
          href="/"
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f6f4]"
        >
          Till cvbcoaching.se
        </Link>
      </div>
    </div>
  );
}
