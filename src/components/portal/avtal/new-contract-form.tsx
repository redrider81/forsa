"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ContractContent } from "@/lib/portal/types";
import type { Contract, ContractTemplate } from "@/lib/portal/contracts";
import SectionsFieldsEditor from "@/components/portal/avtal/sections-fields-editor";
import { Panel, SectionLabel, portalButtonClass, portalFieldClass } from "@/components/portal/ui";

const BLANK_CONTENT: ContractContent = { sections: [], fields: [] };

type ClientOption = { id: string; name: string; engagementId: string; engagementTitle: string };

export default function NewContractForm({
  clients,
  templates,
}: {
  clients: ClientOption[];
  templates: ContractTemplate[];
}) {
  const router = useRouter();
  const [templateId, setTemplateId] = useState<string>("");
  const [clientId, setClientId] = useState<string>("");
  const [linkEngagement, setLinkEngagement] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<ContractContent>(BLANK_CONTENT);
  const [priceAmount, setPriceAmount] = useState("");
  const [currency, setCurrency] = useState("SEK");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "error">("idle");

  const selectedClient = clients.find((c) => c.id === clientId) ?? null;

  function applyTemplate(id: string) {
    setTemplateId(id);
    const template = templates.find((t) => t.id === id);
    if (template) {
      setTitle(template.title);
      setContent(template.content);
    } else {
      setTitle("");
      setContent(BLANK_CONTENT);
    }
  }

  async function createDraft() {
    if (!clientId || !title.trim()) {
      setSaveState("error");
      return;
    }
    setSaveState("saving");
    try {
      const response = await fetch("/api/portal/avtal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          engagementId: linkEngagement ? selectedClient?.engagementId ?? null : null,
          templateId: templateId || null,
          title,
          content,
          priceAmount: priceAmount.trim() === "" ? null : Number(priceAmount),
          currency,
          paymentTerms: paymentTerms.trim() === "" ? null : paymentTerms,
        }),
      });
      if (!response.ok) throw new Error("failed");
      const { contract } = (await response.json()) as { contract: Contract };
      router.push(`/portal/avtal/${contract.id}`);
    } catch {
      setSaveState("error");
    }
  }

  return (
    <Panel>
      <div className="flex flex-col gap-5">
        <label>
          <SectionLabel>Utgångspunkt</SectionLabel>
          <select value={templateId} onChange={(event) => applyTemplate(event.target.value)} className={`mt-2 ${portalFieldClass}`}>
            <option value="">Tomt avtal</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <SectionLabel>Klient</SectionLabel>
          <select value={clientId} onChange={(event) => setClientId(event.target.value)} className={`mt-2 ${portalFieldClass}`}>
            <option value="" disabled>
              Välj klient
            </option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </label>

        {selectedClient?.engagementTitle && (
          <label className="flex items-start gap-2.5 text-[0.875rem] text-zinc-700">
            <input
              type="checkbox"
              checked={linkEngagement}
              onChange={(event) => setLinkEngagement(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-zinc-300"
            />
            <span>
              Koppla till uppdraget <strong>{selectedClient.engagementTitle}</strong>
            </span>
          </label>
        )}

        <label>
          <SectionLabel>Avtalstitel</SectionLabel>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="T.ex. Coachningsavtal"
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
              placeholder="0"
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
          <label className="sm:col-span-1">
            <SectionLabel>Betalningsvillkor</SectionLabel>
            <input
              type="text"
              value={paymentTerms}
              onChange={(event) => setPaymentTerms(event.target.value)}
              placeholder="T.ex. 30 dagar netto"
              className={`mt-2 ${portalFieldClass}`}
            />
          </label>
        </div>
      </div>

      <div className="mt-6 border-t border-zinc-200/80 pt-5">
        <SectionsFieldsEditor content={content} onChange={setContent} />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-zinc-200/80 pt-5">
        <button type="button" onClick={createDraft} disabled={saveState === "saving"} className={portalButtonClass}>
          {saveState === "saving" ? "Sparar…" : "Spara som utkast"}
        </button>
        {saveState === "error" && <span className="text-[0.8125rem] text-red-600">Klient och titel krävs.</span>}
      </div>
    </Panel>
  );
}
