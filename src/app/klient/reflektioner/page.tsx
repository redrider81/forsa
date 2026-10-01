import { notFound } from "next/navigation";
import ReflectionComposer from "@/components/klient/reflection-composer";
import OwnReflectionControls from "@/components/klient/own-reflection";
import { Card, CardTitle, Empty, Label, OwnWords } from "@/components/klient/klient-ui";
import SensitiveDataNotice from "@/components/klient/sensitive-data-notice";
import { listSpecialCategoryConsents } from "@/lib/portal/special-category-consent";
import { consentState } from "@/lib/portal/special-category-consent-rules";
import { readClientSession } from "@/lib/portal/session";
import { buildClientPerspective, fetchPortalRepositoryData } from "@/lib/portal/repository";
import { formatDate } from "@/lib/portal/format";

export default async function ReflectionsPage() {
  const session = await readClientSession();
  if (!session) return null;

  const [data, consentHistory] = await Promise.all([
    fetchPortalRepositoryData({ viewer: "klient" }),
    listSpecialCategoryConsents(session.clientId),
  ]);
  const view = buildClientPerspective(data.coach.id, session.clientId, undefined, undefined, data);
  if (!view) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <header className="pb-1">
        <h1 className="text-[1.75rem] font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2rem]">
          Mina reflektioner
        </h1>
        <p className="mt-2.5 text-[0.875rem] leading-relaxed text-zinc-500">
          Delas med Carolina när du har ett aktivt samtycke, annars privat för dig. Egna reflektioner kan tas bort.
        </p>
      </header>

      <SensitiveDataNotice state={consentState(consentHistory)} />

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
