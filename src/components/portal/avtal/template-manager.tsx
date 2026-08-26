"use client";

import { useState } from "react";
import type { ContractContent } from "@/lib/portal/types";
import type { ContractTemplate } from "@/lib/portal/contracts";
import SectionsFieldsEditor from "@/components/portal/avtal/sections-fields-editor";
import {
  Divider,
  EmptyState,
  Panel,
  PanelHeading,
  SectionLabel,
  portalButtonClass,
  portalFieldClass,
  portalGhostButtonClass,
} from "@/components/portal/ui";

const BLANK_CONTENT: ContractContent = { sections: [], fields: [] };

export default function TemplateManager({ initialTemplates }: { initialTemplates: ContractTemplate[] }) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<ContractContent>(BLANK_CONTENT);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const selected = templates.find((t) => t.id === selectedId) ?? null;

  function startNew() {
    setSelectedId(null);
    setName("");
    setTitle("");
    setContent(BLANK_CONTENT);
    setSaveState("idle");
  }

  function selectTemplate(template: ContractTemplate) {
    setSelectedId(template.id);
    setName(template.name);
    setTitle(template.title);
    setContent(template.content);
    setSaveState("idle");
  }

  async function save() {
    if (!name.trim() || !title.trim()) {
      setSaveState("error");
      return;
    }
    setSaveState("saving");
    try {
      if (selected) {
        const response = await fetch(`/api/portal/avtal/mallar/${selected.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, title, content }),
        });
        if (!response.ok) throw new Error("failed");
        const { template } = (await response.json()) as { template: ContractTemplate };
        setTemplates((prev) => prev.map((t) => (t.id === template.id ? template : t)));
      } else {
        const response = await fetch("/api/portal/avtal/mallar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, title, content }),
        });
        if (!response.ok) throw new Error("failed");
        const { template } = (await response.json()) as { template: ContractTemplate };
        setTemplates((prev) => [template, ...prev]);
        setSelectedId(template.id);
      }
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  async function remove(templateId: string) {
    const response = await fetch(`/api/portal/avtal/mallar/${templateId}`, { method: "DELETE" });
    if (response.ok) {
      setTemplates((prev) => prev.filter((t) => t.id !== templateId));
      if (selectedId === templateId) startNew();
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,18rem)_1fr]">
      <Panel>
        <div className="flex items-center justify-between">
          <PanelHeading title="Mallar" />
        </div>
        <div className="mt-4">
          <button type="button" onClick={startNew} className={`w-full ${portalGhostButtonClass}`}>
            + Ny mall
          </button>
        </div>
        <div className="mt-4">
          {templates.length === 0 ? (
            <EmptyState>Inga mallar ännu.</EmptyState>
          ) : (
            templates.map((template, index) => (
              <div key={template.id}>
                {index > 0 ? <Divider /> : null}
                <button
                  type="button"
                  onClick={() => selectTemplate(template)}
                  className={`-mx-3 w-[calc(100%+1.5rem)] rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[var(--klient-text-block-bg)] ${
                    selectedId === template.id ? "bg-[var(--klient-text-block-bg)]" : ""
                  }`}
                >
                  <span className="block truncate text-[0.9375rem] font-medium text-zinc-900">{template.name}</span>
                  <span className="mt-0.5 block truncate text-[0.8125rem] text-zinc-500">{template.title}</span>
                </button>
              </div>
            ))
          )}
        </div>
      </Panel>

      <Panel>
        <PanelHeading title={selected ? "Redigera mall" : "Ny mall"} />
        <div className="mt-4 flex flex-col gap-4">
          <label>
            <SectionLabel>Mallnamn</SectionLabel>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="T.ex. Standardavtal executive coaching"
              className={`mt-2 ${portalFieldClass}`}
            />
          </label>
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
        </div>

        <div className="mt-6 border-t border-zinc-200/80 pt-5">
          <SectionsFieldsEditor content={content} onChange={setContent} />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-zinc-200/80 pt-5">
          <button type="button" onClick={save} disabled={saveState === "saving"} className={portalButtonClass}>
            {saveState === "saving" ? "Sparar…" : "Spara mall"}
          </button>
          {selected && (
            <button type="button" onClick={() => remove(selected.id)} className={portalGhostButtonClass}>
              Ta bort mall
            </button>
          )}
          {saveState === "saved" && <span className="text-[0.8125rem] text-emerald-700">Sparat</span>}
          {saveState === "error" && <span className="text-[0.8125rem] text-red-600">Fel vid sparning</span>}
        </div>
      </Panel>
    </div>
  );
}
