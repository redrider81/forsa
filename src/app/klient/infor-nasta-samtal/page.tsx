import Link from "next/link";
import { notFound } from "next/navigation";
import PrepForm from "@/components/klient/prep-form";
import { Card, CardTitle, Label, Muted } from "@/components/klient/klient-ui";
import { readClientSession } from "@/lib/portal/session";
import { getClientPerspective, getCoach } from "@/lib/portal/repository";
import { formatWeekdayDate } from "@/lib/portal/format";

export default async function PrepPage() {
  const session = await readClientSession();
  if (!session) return null;

  const view = await getClientPerspective(getCoach().id, session.clientId);
  if (!view) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/klient"
          className="inline-flex items-center gap-1.5 text-[0.8125rem] text-zinc-500 transition-colors hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf8f4]"
        >
          Min utveckling
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
      />
    </div>
  );
}
