import Link from "next/link";
import { readCoachSession } from "@/lib/portal/session";
import { fetchPortalRepositoryData, getCoach, listClients, listEngagements } from "@/lib/portal/repository";
import { LogoutButton } from "@/components/portal/portal-nav";
import DemoResetButton from "@/components/portal/demo-reset-button";
import ProfileEditor from "@/components/portal/profile-editor";
import { PageHeading, Panel, PanelHeading, portalOutlineButtonClass, portalPageStackClass } from "@/components/portal/ui";

export default async function ProfilePage() {
  const session = await readCoachSession();
  if (!session) return null;

  const data = await fetchPortalRepositoryData();
  const coach = getCoach(data);
  const engagements = listEngagements(session.coachId, data);
  const clients = listClients(session.coachId, undefined, data);

  return (
    <div className={portalPageStackClass}>
      <PageHeading label="Profil" title="Profil" />

      <Panel>
        <ProfileEditor
          coach={{
            name: coach.name,
            title: coach.title,
            email: coach.email,
            credential: coach.credential,
            focus: coach.focus,
          }}
          engagementsLabel={`${engagements.length} uppdrag`}
          clientsLabel={`${clients.length} pågående relationer`}
        />
      </Panel>

      <Panel>
        <PanelHeading label="Sekretess" title="Informationsnivåer" />
        <div className="mt-5 space-y-5">
          {[
            {
              level: "Coach privat",
              text: "Arbetsanteckningar. Syns endast för dig. Används i ditt eget arbetsunderlag men delas aldrig med klient eller uppdragsgivare.",
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
        <PanelHeading label="Miljö" title="Testmiljö" />
        <p className="mt-3.5 text-[0.9375rem] leading-[1.7] text-zinc-700">
          Fiktivt testmaterial. Inga verkliga klientuppgifter. Sammanställning sker server-side och arbetar endast
          med öppnad klient eller öppnat uppdrag.
        </p>
      </Panel>

      <Panel>
        <PanelHeading label="Demoläge" title="Återställning" />
        <p className="mt-3.5 text-[0.9375rem] leading-[1.7] text-zinc-700">
          Nollställer klientens tillägg: reflektioner, förberedelse och statusändringar. Seed-datan
          påverkas inte.
        </p>
        <div className="mt-5">
          <DemoResetButton />
        </div>
      </Panel>

      <div className="flex flex-col gap-3 pb-2 sm:flex-row">
        <LogoutButton className="flex-1" />
        <Link href="/" className={`flex-1 ${portalOutlineButtonClass}`}>
          cvbcoaching.se
        </Link>
      </div>
    </div>
  );
}
