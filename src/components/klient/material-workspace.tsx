"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Chapter,
  Empty,
  MetaLabel,
  QuietLink,
  SectionTitle,
  ZoneTag,
  klientButtonClass,
} from "@/components/klient/klient-ui";
import MaterialRow from "@/components/klient/material-row";
import MaterialForms from "@/components/klient/material-forms";
import { partitionClientMaterials } from "@/lib/portal/material-utils";
import type { CoachingMaterial } from "@/lib/portal/types";

export type MaterialLinkContext = {
  sessions: Array<{ id: string; label: string }>;
  commitments: Array<{ id: string; label: string }>;
};

type Props = {
  clientId: string;
  materials: CoachingMaterial[];
  linkContext: MaterialLinkContext;
};

export default function MaterialWorkspace({ clientId, materials, linkContext }: Props) {
  const router = useRouter();
  const [showUpload, setShowUpload] = useState(false);
  const [showNote, setShowNote] = useState(false);

  const partitioned = useMemo(() => partitionClientMaterials(materials), [materials]);

  function refresh() {
    router.refresh();
  }

  return (
    <div className="klient-overview space-y-8 md:space-y-10">
      <header>
        <h1 className="text-[1.75rem] font-medium leading-[1.15] tracking-tight text-zinc-900 md:text-[2rem]">
          Material
        </h1>
        <p className="mt-2 max-w-prose text-[0.875rem] leading-relaxed text-zinc-500">
          Privat material syns bara för dig. Du väljer själv vad du delar med Carolina.
        </p>
      </header>

      <Chapter surface="neutral">
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              setShowUpload((v) => !v);
              setShowNote(false);
            }}
            className={`flex-1 ${klientButtonClass}`}
          >
            Ladda upp fil
          </button>
          <button
            type="button"
            onClick={() => {
              setShowNote((v) => !v);
              setShowUpload(false);
            }}
            className={`flex-1 ${klientButtonClass}`}
          >
            Ny anteckning
          </button>
        </div>

        {showUpload ? (
          <div className="mt-6 border-t border-[var(--klient-border-muted)] pt-6">
            <MaterialForms
              mode="upload"
              clientId={clientId}
              linkContext={linkContext}
              onDone={() => {
                setShowUpload(false);
                refresh();
              }}
              onCancel={() => setShowUpload(false)}
            />
          </div>
        ) : null}

        {showNote ? (
          <div className="mt-6 border-t border-[var(--klient-border-muted)] pt-6">
            <MaterialForms
              mode="note"
              clientId={clientId}
              linkContext={linkContext}
              onDone={() => {
                setShowNote(false);
                refresh();
              }}
              onCancel={() => setShowNote(false)}
            />
          </div>
        ) : null}
      </Chapter>

      <Chapter surface="primary" aria-labelledby="own-files-heading">
        <ZoneTag>Mina filer</ZoneTag>
        <SectionTitle id="own-files-heading">Uppladdat av dig</SectionTitle>
        <div className="mt-5">
          {partitioned.ownFiles.length === 0 ? (
            <Empty>
              Inga filer ännu. Lägg till ett dokument eller underlag du vill använda i coachingen.
            </Empty>
          ) : (
            <ul className="divide-y divide-[var(--klient-border-muted)]">
              {partitioned.ownFiles.map((item) => (
                <MaterialRow
                  key={item.id}
                  material={item}
                  clientId={clientId}
                  linkContext={linkContext}
                  onChanged={refresh}
                />
              ))}
            </ul>
          )}
        </div>
      </Chapter>

      <Chapter surface="reflection" aria-labelledby="own-notes-heading">
        <ZoneTag tone="muted">Mina anteckningar</ZoneTag>
        <SectionTitle id="own-notes-heading">Anteckningar</SectionTitle>
        <div className="mt-5">
          {partitioned.ownNotes.length === 0 ? (
            <Empty>Inga anteckningar ännu.</Empty>
          ) : (
            <ul className="divide-y divide-[var(--klient-border-muted)]/90">
              {partitioned.ownNotes.map((item) => (
                <MaterialRow
                  key={item.id}
                  material={item}
                  clientId={clientId}
                  linkContext={linkContext}
                  onChanged={refresh}
                />
              ))}
            </ul>
          )}
        </div>
      </Chapter>

      <Chapter surface="neutral" aria-labelledby="shared-heading">
        <ZoneTag tone="neutral">Delat med mig</ZoneTag>
        <SectionTitle id="shared-heading">Från Carolina</SectionTitle>
        <div className="mt-5">
          {partitioned.sharedByCoach.length === 0 ? (
            <Empty>Inget material delat ännu.</Empty>
          ) : (
            <ul className="divide-y divide-[var(--klient-border-muted)]">
              {partitioned.sharedByCoach.map((item) => (
                <MaterialRow
                  key={item.id}
                  material={item}
                  clientId={clientId}
                  linkContext={linkContext}
                  onChanged={refresh}
                  readOnly
                />
              ))}
            </ul>
          )}
        </div>
      </Chapter>

      <div className="rounded-xl border border-dashed border-[var(--klient-border-soft)] bg-[var(--klient-surface-neutral)]/50 px-4 py-4">
        <MetaLabel>Sekretess</MetaLabel>
        <p className="mt-2 text-[0.8125rem] leading-relaxed text-zinc-600">
          Privat material når aldrig Carolina. Delat material syns för Carolina i hennes
          klientvy.
        </p>
        <div className="mt-3">
          <QuietLink href="/klient/profil">Profil → Sekretess och delning</QuietLink>
        </div>
      </div>
    </div>
  );
}
