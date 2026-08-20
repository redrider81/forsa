import { notFound } from "next/navigation";
import { KlientLogoutButton } from "@/components/klient/klient-nav";
import ProfileEditor from "@/components/klient/profile-editor";
import { Body, Card, CardTitle, Label, Muted } from "@/components/klient/klient-ui";
import { readClientSession } from "@/lib/portal/session";
import { getClientPerspective, getCoach } from "@/lib/portal/repository";
import { formatDate } from "@/lib/portal/format";

export default async function ClientProfilePage() {
  const session = await readClientSession();
  if (!session) return null;

  const coach = getCoach();
  const view = await getClientPerspective(coach.id, session.clientId);
  if (!view) notFound();

  const { client } = view;

  return (
    <div className="space-y-6">
      <ProfileEditor
        initial={{
          name: client.name,
          role: client.role,
          email: client.email,
          phone: client.phone,
          organisation: view.organisation.name,
        }}
      />

      <Card>
        <Label>Min coach</Label>
        <CardTitle>{coach.name}</CardTitle>
        <div className="mt-2">
          <Muted>
            {coach.title} · {coach.credential}
          </Muted>
        </div>
      </Card>

      <Card>
        <Label>Överenskommelse</Label>
        <CardTitle>Coachningsöverenskommelse</CardTitle>
        <dl className="mt-5 divide-y divide-[#ece7dc]">
          {[
            { term: "Ingången", value: formatDate(client.agreement.agreedAt) },
            { term: "Syfte", value: client.agreement.purpose },
            { term: "Omfattning", value: client.agreement.scope },
            { term: "Form", value: client.agreement.cadence },
            { term: "Klientens ansvar", value: client.agreement.clientResponsibility },
          ].map((item) => (
            <div key={item.term} className="py-4 first:pt-0 last:pb-0">
              <dt className="text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-400">
                {item.term}
              </dt>
              <dd className="mt-1.5 text-[0.9375rem] leading-[1.7] text-zinc-700">{item.value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card>
        <Label>Sekretess</Label>
        <CardTitle>Sekretess och delning</CardTitle>
        <div className="mt-5 space-y-4">
          <Body>{client.agreement.confidentiality}</Body>
          <Body>{client.agreement.sponsorSharing}</Body>
          <dl className="divide-y divide-[#ece7dc] rounded-xl bg-[var(--klient-text-block-bg)] px-4">
            {[
              {
                term: "Privat för mig",
                value:
                  "Material och anteckningar du markerar som privata syns bara för dig. De når aldrig Carolina.",
              },
              {
                term: "Delat med Carolina",
                value:
                  "Material du uttryckligen delar syns i Carolinas klientvy och kan användas i ert coachingarbete.",
              },
              {
                term: "Material från Carolina",
                value:
                  "Material Carolina delar till dig visas under Material → Delat med mig.",
              },
            ].map((item) => (
              <div key={item.term} className="py-4 first:pt-4 last:pb-4">
                <dt className="text-[0.75rem] font-medium uppercase tracking-[0.1em] text-zinc-400">
                  {item.term}
                </dt>
                <dd className="mt-1.5 text-[0.875rem] leading-[1.65] text-zinc-600">{item.value}</dd>
              </div>
            ))}
          </dl>
          <div className="rounded-xl bg-[var(--klient-text-block-bg)] p-4">
            <Muted>
              Reflektioner, förberedelser och noteringar delas endast med Carolina. Hennes egna
              arbetsanteckningar visas inte här.
            </Muted>
          </div>
        </div>
      </Card>

      <Card>
        <Label>Material</Label>
        <CardTitle>Dokument och material</CardTitle>
        <div className="mt-5 divide-y divide-[#ece7dc]">
          {view.documents.map((document) => (
            <div key={document.id} className="py-4 first:pt-0 last:pb-0">
              <p className="text-[0.9375rem] font-medium leading-snug text-zinc-900">
                {document.title}
              </p>
              <p className="mt-1 text-[0.8125rem] leading-relaxed text-zinc-500">
                {document.description}
              </p>
              <p className="mt-1.5 text-[0.75rem] text-zinc-400">
                {document.kind} · {formatDate(document.date)}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <div className="pb-2">
        <KlientLogoutButton />
      </div>
    </div>
  );
}
