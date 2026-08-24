import { notFound } from "next/navigation";
import ReflectionComposer from "@/components/klient/reflection-composer";
import OwnReflectionControls from "@/components/klient/own-reflection";
import { Card, CardTitle, Empty, Label, OwnWords } from "@/components/klient/klient-ui";
import { readClientSession } from "@/lib/portal/session";
import { buildClientPerspective, fetchPortalRepositoryData } from "@/lib/portal/repository";
import { formatDate } from "@/lib/portal/format";

export default async function ReflectionsPage() {
  const session = await readClientSession();
  if (!session) return null;

  const data = await fetchPortalRepositoryData();
  const view = buildClientPerspective(data.coach.id, session.clientId, undefined, undefined, data);
  if (!view) notFound();

  return (
    <div className="space-y-6">
      <header className="pb-1">
        <h1 className="text-[1.75rem] font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2rem]">
          Mina reflektioner
        </h1>
        <p className="mt-2.5 text-[0.875rem] leading-relaxed text-zinc-500">
          Delas endast med Carolina. Egna reflektioner kan tas bort.
        </p>
      </header>

      <ReflectionComposer />

      <Card>
        <Label>Tidigare</Label>
        <CardTitle>
          {view.reflections.length === 1
            ? "1 reflektion"
            : `${view.reflections.length} reflektioner`}
        </CardTitle>
        <div className="mt-6 space-y-7">
          {view.reflections.length === 0 ? (
            <Empty>Ingen reflektion registrerad.</Empty>
          ) : (
            view.reflections.map((reflection) => (
              <article key={reflection.id}>
                <p className="text-[0.75rem] uppercase tracking-[0.1em] text-zinc-400">
                  {formatDate(reflection.date)} · {reflection.prompt}
                </p>
                <div className="mt-3">
                  <OwnWords>{reflection.text}</OwnWords>
                </div>
                {reflection.id.startsWith("refl-egen-") ? (
                  <OwnReflectionControls id={reflection.id} />
                ) : null}
              </article>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
