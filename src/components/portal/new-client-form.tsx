"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Panel,
  PanelHeading,
  SectionLabel,
  portalButtonClass,
  portalFieldClass,
  portalOutlineButtonClass,
  portalSegmentActiveClass,
  portalSegmentClass,
  portalSegmentInactiveClass,
  portalTextareaClass,
} from "@/components/portal/ui";

type OrganisationOption = { id: string; name: string };

const ENGAGEMENT_KINDS = [
  { value: "individuell", label: "Individuell coaching" },
  { value: "ledarutveckling", label: "Ledarutvecklingsuppdrag" },
  { value: "program", label: "Ledarskapsprogram" },
];

const ENGAGEMENT_STATUSES = [
  { value: "planering", label: "Planering" },
  { value: "pagaende", label: "Pågående" },
  { value: "avslutat", label: "Avslutat" },
];

export default function NewClientForm({ organisations }: { organisations: OrganisationOption[] }) {
  const router = useRouter();

  const [clientType, setClientType] = useState<"privat" | "foretag">("privat");
  const [organisationMode, setOrganisationMode] = useState<"existing" | "new">(
    organisations.length > 0 ? "existing" : "new",
  );
  const [organisationId, setOrganisationId] = useState(organisations[0]?.id ?? "");
  const [orgName, setOrgName] = useState("");
  const [orgSizeLabel, setOrgSizeLabel] = useState("");
  const [orgIndustry, setOrgIndustry] = useState("");
  const [orgLocation, setOrgLocation] = useState("");
  const [orgSponsorName, setOrgSponsorName] = useState("");
  const [orgSponsorRole, setOrgSponsorRole] = useState("");

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [headline, setHeadline] = useState("");
  const [startDate, setStartDate] = useState("");
  const [recurringThemes, setRecurringThemes] = useState("");

  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("individuell");
  const [purpose, setPurpose] = useState("");
  const [scopeNote, setScopeNote] = useState("");
  const [periodLabel, setPeriodLabel] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("pagaende");

  const [agreedAt, setAgreedAt] = useState("");
  const [agreementPurpose, setAgreementPurpose] = useState("");
  const [scope, setScope] = useState("");
  const [cadence, setCadence] = useState("");
  const [confidentiality, setConfidentiality] = useState("");
  const [sponsorSharing, setSponsorSharing] = useState("");
  const [ethics, setEthics] = useState("");
  const [clientResponsibility, setClientResponsibility] = useState("");

  const [goalHeadline, setGoalHeadline] = useState("");
  const [clientWording, setClientWording] = useState("");
  const [baseline, setBaseline] = useState("");
  const [successCriteria, setSuccessCriteria] = useState("");
  const [horizon, setHorizon] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const payload: Record<string, unknown> = {
      clientType,
      client: {
        name,
        role,
        email,
        phone,
        headline,
        startedAt: startDate,
        recurringThemes: recurringThemes
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      },
      engagement: {
        title,
        kind,
        purpose,
        scopeNote,
        periodLabel,
        startDate,
        endDate,
        status,
      },
      agreement: {
        agreedAt: agreedAt || startDate,
        purpose: agreementPurpose,
        scope,
        cadence,
        confidentiality,
        sponsorSharing,
        ethics,
        clientResponsibility,
      },
      goal: {
        headline: goalHeadline,
        clientWording,
        baseline,
        successCriteria,
        horizon,
      },
    };

    if (clientType === "foretag") {
      payload.organisation =
        organisationMode === "existing"
          ? { mode: "existing", id: organisationId }
          : {
              mode: "new",
              name: orgName,
              sizeLabel: orgSizeLabel,
              industry: orgIndustry,
              location: orgLocation,
              sponsorName: orgSponsorName,
              sponsorRole: orgSponsorRole,
            };
    }

    try {
      const response = await fetch("/api/portal/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { ok: boolean; error?: string; clientId?: string };
      if (!response.ok || !data.ok || !data.clientId) {
        setError(data.error ?? "Klienten kunde inte skapas.");
        setBusy(false);
        return;
      }
      router.push(`/cvb-base/klienter/${data.clientId}`);
      router.refresh();
    } catch {
      setError("Det gick inte att nå tjänsten just nu. Försök igen.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <Panel>
        <PanelHeading label="Klienttyp" title="Privat eller företagsklient" />
        <div className="mt-4 flex gap-2.5">
          <button
            type="button"
            onClick={() => setClientType("privat")}
            className={`${portalSegmentClass} ${clientType === "privat" ? portalSegmentActiveClass : portalSegmentInactiveClass}`}
          >
            Privat klient
          </button>
          <button
            type="button"
            onClick={() => setClientType("foretag")}
            className={`${portalSegmentClass} ${clientType === "foretag" ? portalSegmentActiveClass : portalSegmentInactiveClass}`}
          >
            Företagsklient
          </button>
        </div>

        {clientType === "foretag" ? (
          <div className="mt-5 border-t border-[var(--klient-border-muted)] pt-5">
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setOrganisationMode("existing")}
                disabled={organisations.length === 0}
                className={`${portalSegmentClass} ${organisationMode === "existing" ? portalSegmentActiveClass : portalSegmentInactiveClass}`}
              >
                Välj organisation
              </button>
              <button
                type="button"
                onClick={() => setOrganisationMode("new")}
                className={`${portalSegmentClass} ${organisationMode === "new" ? portalSegmentActiveClass : portalSegmentInactiveClass}`}
              >
                Ny organisation
              </button>
            </div>

            {organisationMode === "existing" ? (
              <div className="mt-4">
                <SectionLabel>Organisation</SectionLabel>
                <select
                  value={organisationId}
                  onChange={(event) => setOrganisationId(event.target.value)}
                  className={`mt-2 ${portalFieldClass}`}
                >
                  {organisations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <SectionLabel>Organisationens namn</SectionLabel>
                  <input
                    value={orgName}
                    onChange={(event) => setOrgName(event.target.value)}
                    className={`mt-2 ${portalFieldClass}`}
                    required
                  />
                </label>
                <label>
                  <SectionLabel>Storlek</SectionLabel>
                  <input
                    value={orgSizeLabel}
                    onChange={(event) => setOrgSizeLabel(event.target.value)}
                    className={`mt-2 ${portalFieldClass}`}
                    placeholder="t.ex. 120 anställda"
                  />
                </label>
                <label>
                  <SectionLabel>Bransch</SectionLabel>
                  <input
                    value={orgIndustry}
                    onChange={(event) => setOrgIndustry(event.target.value)}
                    className={`mt-2 ${portalFieldClass}`}
                  />
                </label>
                <label>
                  <SectionLabel>Ort</SectionLabel>
                  <input
                    value={orgLocation}
                    onChange={(event) => setOrgLocation(event.target.value)}
                    className={`mt-2 ${portalFieldClass}`}
                  />
                </label>
                <label>
                  <SectionLabel>Uppdragsgivare, namn</SectionLabel>
                  <input
                    value={orgSponsorName}
                    onChange={(event) => setOrgSponsorName(event.target.value)}
                    className={`mt-2 ${portalFieldClass}`}
                  />
                </label>
                <label>
                  <SectionLabel>Uppdragsgivare, roll</SectionLabel>
                  <input
                    value={orgSponsorRole}
                    onChange={(event) => setOrgSponsorRole(event.target.value)}
                    className={`mt-2 ${portalFieldClass}`}
                  />
                </label>
              </div>
            )}
          </div>
        ) : null}
      </Panel>

      <Panel>
        <PanelHeading label="Klient" title="Klientuppgifter" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label>
            <SectionLabel>Namn</SectionLabel>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={`mt-2 ${portalFieldClass}`}
              required
            />
          </label>
          <label>
            <SectionLabel>Roll / titel</SectionLabel>
            <input
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className={`mt-2 ${portalFieldClass}`}
              required
            />
          </label>
          <label>
            <SectionLabel>E-post</SectionLabel>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={`mt-2 ${portalFieldClass}`}
              required
            />
          </label>
          <label>
            <SectionLabel>Telefon</SectionLabel>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className={`mt-2 ${portalFieldClass}`}
            />
          </label>
          <label>
            <SectionLabel>Startdatum</SectionLabel>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className={`mt-2 ${portalFieldClass}`}
              required
            />
          </label>
          <label>
            <SectionLabel>Återkommande teman</SectionLabel>
            <input
              value={recurringThemes}
              onChange={(event) => setRecurringThemes(event.target.value)}
              className={`mt-2 ${portalFieldClass}`}
              placeholder="Kommaseparerat, t.ex. Beslutsfattande, Delegering"
            />
          </label>
          <label className="sm:col-span-2">
            <SectionLabel>Kort presentation</SectionLabel>
            <input
              value={headline}
              onChange={(event) => setHeadline(event.target.value)}
              className={`mt-2 ${portalFieldClass}`}
            />
          </label>
        </div>
      </Panel>

      <Panel>
        <PanelHeading label="Uppdrag" title="Uppdragsuppgifter" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <SectionLabel>Titel</SectionLabel>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={`mt-2 ${portalFieldClass}`}
              required
            />
          </label>
          <label>
            <SectionLabel>Typ</SectionLabel>
            <select
              value={kind}
              onChange={(event) => setKind(event.target.value)}
              className={`mt-2 ${portalFieldClass}`}
            >
              {ENGAGEMENT_KINDS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <SectionLabel>Status</SectionLabel>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className={`mt-2 ${portalFieldClass}`}
            >
              {ENGAGEMENT_STATUSES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <SectionLabel>Periodbeskrivning</SectionLabel>
            <input
              value={periodLabel}
              onChange={(event) => setPeriodLabel(event.target.value)}
              className={`mt-2 ${portalFieldClass}`}
              placeholder="t.ex. Mars – december 2026"
            />
          </label>
          <label>
            <SectionLabel>Slutdatum</SectionLabel>
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className={`mt-2 ${portalFieldClass}`}
              required
            />
          </label>
          <label className="sm:col-span-2">
            <SectionLabel>Syfte</SectionLabel>
            <textarea
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
              rows={3}
              className={`mt-2 ${portalTextareaClass}`}
            />
          </label>
          <label className="sm:col-span-2">
            <SectionLabel>Omfattning</SectionLabel>
            <textarea
              value={scopeNote}
              onChange={(event) => setScopeNote(event.target.value)}
              rows={3}
              className={`mt-2 ${portalTextareaClass}`}
            />
          </label>
        </div>
      </Panel>

      <Panel>
        <PanelHeading label="Överenskommelse" title="Coachningsöverenskommelse" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label>
            <SectionLabel>Ingången</SectionLabel>
            <input
              type="date"
              value={agreedAt}
              onChange={(event) => setAgreedAt(event.target.value)}
              className={`mt-2 ${portalFieldClass}`}
              placeholder="Standard: startdatum"
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
          <label className="sm:col-span-2">
            <SectionLabel>Syfte</SectionLabel>
            <textarea
              value={agreementPurpose}
              onChange={(event) => setAgreementPurpose(event.target.value)}
              rows={2}
              className={`mt-2 ${portalTextareaClass}`}
            />
          </label>
          <label className="sm:col-span-2">
            <SectionLabel>Omfattning</SectionLabel>
            <textarea
              value={scope}
              onChange={(event) => setScope(event.target.value)}
              rows={2}
              className={`mt-2 ${portalTextareaClass}`}
            />
          </label>
          <label className="sm:col-span-2">
            <SectionLabel>Sekretess</SectionLabel>
            <textarea
              value={confidentiality}
              onChange={(event) => setConfidentiality(event.target.value)}
              rows={2}
              className={`mt-2 ${portalTextareaClass}`}
            />
          </label>
          <label className="sm:col-span-2">
            <SectionLabel>Delning med uppdragsgivare</SectionLabel>
            <textarea
              value={sponsorSharing}
              onChange={(event) => setSponsorSharing(event.target.value)}
              rows={2}
              className={`mt-2 ${portalTextareaClass}`}
            />
          </label>
          <label className="sm:col-span-2">
            <SectionLabel>Etisk ram</SectionLabel>
            <textarea
              value={ethics}
              onChange={(event) => setEthics(event.target.value)}
              rows={2}
              className={`mt-2 ${portalTextareaClass}`}
            />
          </label>
          <label className="sm:col-span-2">
            <SectionLabel>Klientens ansvar</SectionLabel>
            <textarea
              value={clientResponsibility}
              onChange={(event) => setClientResponsibility(event.target.value)}
              rows={2}
              className={`mt-2 ${portalTextareaClass}`}
            />
          </label>
        </div>
      </Panel>

      <Panel>
        <PanelHeading label="Utvecklingsmål" title="Utvecklingsmål" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <SectionLabel>Rubrik</SectionLabel>
            <input
              value={goalHeadline}
              onChange={(event) => setGoalHeadline(event.target.value)}
              className={`mt-2 ${portalFieldClass}`}
            />
          </label>
          <label className="sm:col-span-2">
            <SectionLabel>Klientens egna ord</SectionLabel>
            <textarea
              value={clientWording}
              onChange={(event) => setClientWording(event.target.value)}
              rows={2}
              className={`mt-2 ${portalTextareaClass}`}
            />
          </label>
          <label className="sm:col-span-2">
            <SectionLabel>Utgångsläge</SectionLabel>
            <textarea
              value={baseline}
              onChange={(event) => setBaseline(event.target.value)}
              rows={2}
              className={`mt-2 ${portalTextareaClass}`}
            />
          </label>
          <label>
            <SectionLabel>Framgångskriterier</SectionLabel>
            <input
              value={successCriteria}
              onChange={(event) => setSuccessCriteria(event.target.value)}
              className={`mt-2 ${portalFieldClass}`}
              placeholder="Kommaseparerat"
            />
          </label>
          <label>
            <SectionLabel>Tidshorisont</SectionLabel>
            <input
              value={horizon}
              onChange={(event) => setHorizon(event.target.value)}
              className={`mt-2 ${portalFieldClass}`}
            />
          </label>
        </div>
      </Panel>

      {error ? (
        <p role="alert" className="rounded-xl bg-[var(--klient-text-block-bg)] px-4 py-3 text-[0.875rem] leading-relaxed text-zinc-700">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2.5 sm:flex-row">
        <button type="submit" disabled={busy} className={portalButtonClass}>
          {busy ? "Skapar…" : "Skapa klient"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/cvb-base/klienter")}
          className={portalOutlineButtonClass}
        >
          Avbryt
        </button>
      </div>
    </form>
  );
}
