"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CoachingAgreement } from "@/lib/portal/types";
import {
  Panel,
  PanelHeading,
  SectionLabel,
  portalButtonClass,
  portalFieldClass,
  portalTextareaClass,
} from "@/components/portal/ui";

export default function AgreementEditor({
  clientId,
  agreement,
}: {
  clientId: string;
  agreement: CoachingAgreement;
}) {
  const router = useRouter();

  const [agreedAt, setAgreedAt] = useState(agreement.agreedAt);
  const [purpose, setPurpose] = useState(agreement.purpose);
  const [scope, setScope] = useState(agreement.scope);
  const [cadence, setCadence] = useState(agreement.cadence);
  const [confidentiality, setConfidentiality] = useState(agreement.confidentiality);
  const [sponsorSharing, setSponsorSharing] = useState(agreement.sponsorSharing);
  const [ethics, setEthics] = useState(agreement.ethics);
  const [clientResponsibility, setClientResponsibility] = useState(agreement.clientResponsibility);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const response = await fetch("/api/portal/agreement", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          agreedAt,
          purpose,
          scope,
          cadence,
          confidentiality,
          sponsorSharing,
          ethics,
          clientResponsibility,
        }),
      });
      const data = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setError(data.error ?? "Överenskommelsen kunde inte sparas.");
        setBusy(false);
        return;
      }
      setBusy(false);
      setSaved(true);
      router.refresh();
    } catch {
      setError("Det gick inte att nå tjänsten just nu. Försök igen.");
      setBusy(false);
    }
  }

  return (
    <Panel>
      <PanelHeading label="Överenskommelse" title="Coachningsöverenskommelse" />
      <form onSubmit={submit} noValidate className="mt-5 space-y-4">
        <label>
          <SectionLabel>Ingången</SectionLabel>
          <input
            type="date"
            value={agreedAt}
            onChange={(event) => setAgreedAt(event.target.value)}
            className={`mt-2 ${portalFieldClass}`}
          />
        </label>
        <label>
          <SectionLabel>Syfte</SectionLabel>
          <textarea
            value={purpose}
            onChange={(event) => setPurpose(event.target.value)}
            rows={3}
            className={`mt-2 ${portalTextareaClass}`}
          />
        </label>
        <label>
          <SectionLabel>Omfattning</SectionLabel>
          <textarea
            value={scope}
            onChange={(event) => setScope(event.target.value)}
            rows={3}
            className={`mt-2 ${portalTextareaClass}`}
          />
        </label>
        <label>
          <SectionLabel>Form</SectionLabel>
          <input
            value={cadence}
            onChange={(event) => setCadence(event.target.value)}
            className={`mt-2 ${portalFieldClass}`}
          />
        </label>
        <label>
          <SectionLabel>Sekretess</SectionLabel>
          <textarea
            value={confidentiality}
            onChange={(event) => setConfidentiality(event.target.value)}
            rows={2}
            className={`mt-2 ${portalTextareaClass}`}
          />
        </label>
        <label>
          <SectionLabel>Delning med uppdragsgivare</SectionLabel>
          <textarea
            value={sponsorSharing}
            onChange={(event) => setSponsorSharing(event.target.value)}
            rows={2}
            className={`mt-2 ${portalTextareaClass}`}
          />
        </label>
        <label>
          <SectionLabel>Etisk ram</SectionLabel>
          <textarea
            value={ethics}
            onChange={(event) => setEthics(event.target.value)}
            rows={2}
            className={`mt-2 ${portalTextareaClass}`}
          />
        </label>
        <label>
          <SectionLabel>Klientens ansvar</SectionLabel>
          <textarea
            value={clientResponsibility}
            onChange={(event) => setClientResponsibility(event.target.value)}
            rows={2}
            className={`mt-2 ${portalTextareaClass}`}
          />
        </label>

        {error ? (
          <p role="alert" className="rounded-xl bg-[var(--klient-text-block-bg)] px-4 py-3 text-[0.875rem] leading-relaxed text-zinc-700">
            {error}
          </p>
        ) : null}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={busy} className={portalButtonClass}>
            {busy ? "Sparar…" : "Spara överenskommelse"}
          </button>
          {saved ? <span className="text-[0.8125rem] text-zinc-500">Sparat.</span> : null}
        </div>
      </form>
    </Panel>
  );
}
