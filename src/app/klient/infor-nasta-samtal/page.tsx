import Link from "next/link";
import { notFound } from "next/navigation";
import PrepForm from "@/components/klient/prep-form";
import { Card, CardTitle, Label, Muted, klientLinkButtonClass } from "@/components/klient/klient-ui";
import { readClientSession } from "@/lib/portal/session";
import { buildClientPerspective, fetchPortalRepositoryData } from "@/lib/portal/repository";
import { formatWeekdayDate } from "@/lib/portal/format";

export default async function PrepPage() {
  const session = await readClientSession();
  if (!session) return null;

  const data = await fetchPortalRepositoryData();
  const view = buildClientPerspective(data.coach.id, session.clientId, undefined, undefined, data);
  if (!view) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/klient" className={klientLinkButtonClass}>
          Översikt
        </Link>
      </div>

      {view.upcomingSession ? (
        <Card>
          <Label>Nästa session</Label>
          <CardTitle>
            {formatWeekdayDate(view.upcomingSession.date)} kl. {view.upcomingSession.time}
          </CardTitle>
          <div className="mt-2">
            <Muted>{view.upcomingSession.location}</Muted>
          </div>
        </Card>
      ) : null}

      <PrepForm
        initial={{
          focus: view.prep?.focus ?? "",
          desiredOutcome: view.prep?.desiredOutcome ?? "",
          changed: view.prep?.changed ?? "",
          followUp: view.prep?.followUp ?? "",
        }}
        materials={view.materials}
      />
    </div>
  );
}
