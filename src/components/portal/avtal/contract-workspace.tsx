"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ContractContent } from "@/lib/portal/types";
import type { Contract, ContractSignature } from "@/lib/portal/contracts";
import { contractStatusLabel, contractStatusTagTone } from "@/lib/portal/status-tones";
import SectionsFieldsEditor from "@/components/portal/avtal/sections-fields-editor";
import { Panel, PanelHeading, SectionLabel, Tag, portalButtonClass, portalFieldClass, portalGhostButtonClass } from "@/components/portal/ui";

function formatDateTime(iso: string): string {
  const [datePart, timePart] = iso.split("T");
  const [year, month, day] = datePart.split("-");
  const time = timePart ? timePart.slice(0, 5) : "";
  return `${day}/${month}/${year} kl. ${time} UTC`;
}

function formatAmount(amount: number | null, currency: string): string {
  if (amount === null) return "—";
  return `${amount.toLocaleString("sv-SE")} ${currency}`;
}

export default function ContractWorkspace({
  initialContract,
  initialSignatures,
  viewerRole,
}: {
  initialContract: Contract;
  initialSignatures: ContractSignature[];
  viewerRole: "coach" | "klient";
}) {
  const router = useRouter();
  const [contract, setContract] = useState(initialContract);
  const [signatures, setSignatures] = useState(initialSignatures);

  const [title, setTitle] = useState(contract.title);
  const [content, setContent] = useState<ContractContent>(contract.content);
  const [priceAmount, setPriceAmount] = useState(contract.priceAmount === null ? "" : String(contract.priceAmount));
  const [currency, setCurrency] = useState(contract.currency);
  const [paymentTerms, setPaymentTerms] = useState(contract.paymentTerms ?? "");

  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [sendState, setSendState] = useState<"idle" | "sending" | "error">("idle");
  const [signState, setSignState] = useState<"idle" | "signing" | "error">("idle");
  const [consent, setConsent] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  const clientSignature = signatures.find((s) => s.signerRole === "klient");
  const coachSignature = signatures.find((s) => s.signerRole === "coach");

  const isDraft = contract.status === "utkast";
  const isEditableByViewer = isDraft && viewerRole === "coach";

  async function saveDraft() {
    setSaveState("saving");
    try {
      const response = await fetch(`/api/portal/avtal/${contract.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          priceAmount: priceAmount.trim() === "" ? null : Number(priceAmount),
          currency,
          paymentTerms: paymentTerms.trim() === "" ? null : paymentTerms,
        }),
      });
      if (!response.ok) throw new Error("failed");
      const { contract: updated } = (await response.json()) as { contract: Contract };
      setContract(updated);
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  async function sendForSignature() {
    setSendState("sending");
    try {
      const response = await fetch(`/api/portal/avtal/${contract.id}/skicka`, { method: "POST" });
      if (!response.ok) throw new Error("failed");
      const { contract: updated } = (await response.json()) as { contract: Contract | null };
      if (updated) setContract(updated);
      router.refresh();
      setPreviewing(false);
    } catch {
      setSendState("error");
    }
  }

  async function sign() {
    setSignState("signing");
    try {
      const response = await fetch(`/api/portal/avtal/${contract.id}/signera`, { method: "POST" });
      if (!response.ok) throw new Error("failed");
      const { contract: updated, signatures: updatedSignatures } = (await response.json()) as {
        contract: Contract | null;
        signatures: ContractSignature[];
      };
      if (updated) setContract(updated);
      if (updatedSignatures) setSignatures(updatedSignatures);
      router.refresh();
    } catch {
      setSignState("error");
    }
  }

  const showEditor = isEditableByViewer && !previewing;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PanelHeading label={contract.clientName ?? undefined} title={contract.title} />
        <Tag tone={contractStatusTagTone[contract.status]}>{contractStatusLabel[contract.status]}</Tag>
      </div>

      {showEditor ? (
        <Panel>
          <div className="flex flex-col gap-4">
            <label>
              <SectionLabel>Avtalstitel</SectionLabel>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className={`mt-2 ${portalFieldClass}`}
              />
            </label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label>
                <SectionLabel>Pris</SectionLabel>
                <input
                  type="number"
                  value={priceAmount}
                  onChange={(event) => setPriceAmount(event.target.value)}
                  className={`mt-2 ${portalFieldClass}`}
                />
              </label>
              <label>
                <SectionLabel>Valuta</SectionLabel>
                <input
                  type="text"
                  value={currency}
                  onChange={(event) => setCurrency(event.target.value)}
                  className={`mt-2 ${portalFieldClass}`}
                />
              </label>
              <label>
                <SectionLabel>Betalningsvillkor</SectionLabel>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(event) => setPaymentTerms(event.target.value)}
                  className={`mt-2 ${portalFieldClass}`}
                />
              </label>
            </div>
          </div>

          <div className="mt-6 border-t border-zinc-200/80 pt-5">
            <SectionsFieldsEditor content={content} onChange={setContent} />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-zinc-200/80 pt-5">
            <button type="button" onClick={saveDraft} disabled={saveState === "saving"} className={portalGhostButtonClass}>
              {saveState === "saving" ? "Sparar…" : "Spara utkast"}
            </button>
            <button type="button" onClick={() => setPreviewing(true)} className={portalButtonClass}>
              Granska och skicka
            </button>
            {saveState === "saved" && <span className="text-[0.8125rem] text-emerald-700">Sparat</span>}
            {saveState === "error" && <span className="text-[0.8125rem] text-red-600">Fel vid sparning</span>}
          </div>
        </Panel>
      ) : (
        <>
          <Panel>
            <div className="grid grid-cols-1 gap-4 text-[0.8125rem] text-zinc-600 sm:grid-cols-3">
              <div>
                <SectionLabel>Pris</SectionLabel>
                <p className="mt-1.5 text-[0.9375rem] text-zinc-900">{formatAmount(contract.priceAmount, contract.currency)}</p>
              </div>
              <div>
                <SectionLabel>Betalningsvillkor</SectionLabel>
                <p className="mt-1.5 text-[0.9375rem] text-zinc-900">{contract.paymentTerms ?? "—"}</p>
              </div>
              <div>
                <SectionLabel>Klient</SectionLabel>
                <p className="mt-1.5 text-[0.9375rem] text-zinc-900">{contract.clientName ?? "—"}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-6 border-t border-zinc-200/80 pt-5">
              {contract.content.sections.map((section) => (
                <div key={section.id}>
                  <h3 className="text-[0.9375rem] font-semibold text-zinc-900">{section.heading}</h3>
                  <p className="mt-1.5 whitespace-pre-wrap text-[0.9375rem] leading-[1.7] text-zinc-700">{section.body}</p>
                </div>
              ))}
            </div>

            {contract.content.fields.length > 0 && (
              <div className="mt-6 border-t border-zinc-200/80 pt-5">
                <SectionLabel>Fält</SectionLabel>
                <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {contract.content.fields.map((field) => (
                    <div key={field.id} className="flex items-baseline justify-between gap-3 border-b border-zinc-100 pb-2">
                      <dt className="text-[0.8125rem] text-zinc-500">{field.label}</dt>
                      <dd className="text-[0.875rem] font-medium text-zinc-900">{field.value || "—"}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </Panel>

          {previewing && isDraft && viewerRole === "coach" && (
            <Panel>
              <p className="text-[0.9375rem] text-zinc-700">
                Detta är en förhandsgranskning. Innehållet låses när avtalet skickas för signering.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => setPreviewing(false)} className={portalGhostButtonClass}>
                  Tillbaka till redigering
                </button>
                <button type="button" onClick={sendForSignature} disabled={sendState === "sending"} className={portalButtonClass}>
                  {sendState === "sending" ? "Skickar…" : "Skicka för signering"}
                </button>
                {sendState === "error" && <span className="text-[0.8125rem] text-red-600">Kunde inte skicka avtalet.</span>}
              </div>
            </Panel>
          )}

          {!previewing && contract.status === "skickat" && viewerRole === "coach" && (
            <Panel>
              <p className="text-[0.9375rem] text-zinc-700">Väntar på kundens signering.</p>
            </Panel>
          )}

          {!previewing && contract.status === "skickat" && viewerRole === "klient" && (
            <Panel>
              <label className="flex items-start gap-2.5 text-[0.9375rem] text-zinc-800">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-zinc-300"
                />
                <span>Jag har läst och godkänner avtalet.</span>
              </label>
              <div className="mt-5 flex items-center gap-3">
                <button
                  type="button"
                  onClick={sign}
                  disabled={!consent || signState === "signing"}
                  className={portalButtonClass}
                >
                  {signState === "signing" ? "Signerar…" : "Signera avtal"}
                </button>
                {signState === "error" && <span className="text-[0.8125rem] text-red-600">Kunde inte signera avtalet.</span>}
              </div>
            </Panel>
          )}

          {!previewing && contract.status === "kund_signerad" && (
            <Panel>
              {clientSignature && (
                <p className="text-[0.9375rem] text-zinc-700">
                  Signerad av kund: <strong>{clientSignature.signerName}</strong>
                  <br />
                  <span className="text-[0.8125rem] text-zinc-500">{formatDateTime(clientSignature.signedAt)}</span>
                </p>
              )}
              {viewerRole === "coach" && (
                <div className="mt-5 flex items-center gap-3">
                  <button type="button" onClick={sign} disabled={signState === "signing"} className={portalButtonClass}>
                    {signState === "signing" ? "Signerar…" : "Signera avtal"}
                  </button>
                  {signState === "error" && <span className="text-[0.8125rem] text-red-600">Kunde inte signera avtalet.</span>}
                </div>
              )}
              {viewerRole === "klient" && <p className="mt-3 text-[0.8125rem] text-zinc-500">Väntar på Carolinas signering.</p>}
            </Panel>
          )}

          {!previewing && contract.status === "signerat" && (
            <Panel>
              <p className="text-[0.9375rem] font-medium text-zinc-900">SIGNERAT</p>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {clientSignature && (
                  <div>
                    <SectionLabel>Signerad av kund</SectionLabel>
                    <p className="mt-1.5 text-[0.9375rem] text-zinc-900">{clientSignature.signerName}</p>
                    <p className="text-[0.8125rem] text-zinc-500">{formatDateTime(clientSignature.signedAt)}</p>
                  </div>
                )}
                {coachSignature && (
                  <div>
                    <SectionLabel>Signerad av Carolina</SectionLabel>
                    <p className="mt-1.5 text-[0.9375rem] text-zinc-900">{coachSignature.signerName}</p>
                    <p className="text-[0.8125rem] text-zinc-500">{formatDateTime(coachSignature.signedAt)}</p>
                  </div>
                )}
              </div>
              <p className="mt-5 text-[0.8125rem] text-zinc-500">
                Signerat via CVB Base med autentiserat konto. Dokumentet är permanent låst.
              </p>
            </Panel>
          )}
        </>
      )}
    </div>
  );
}
