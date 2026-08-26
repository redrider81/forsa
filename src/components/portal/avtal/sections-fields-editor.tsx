"use client";

import type { ContractContent, ContractCustomField, ContractFieldType, ContractSection } from "@/lib/portal/types";
import { SectionLabel, portalFieldClass, portalGhostButtonClass, portalTextareaClass } from "@/components/portal/ui";

const FIELD_TYPES: Array<{ value: ContractFieldType; label: string }> = [
  { value: "text", label: "Text" },
  { value: "belopp", label: "Belopp" },
  { value: "datum", label: "Datum" },
  { value: "antal", label: "Antal" },
  { value: "procent", label: "Procent" },
  { value: "val", label: "Val" },
];

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `id-${Date.now()}-${Math.random()}`;
}

export default function SectionsFieldsEditor({
  content,
  onChange,
  disabled = false,
}: {
  content: ContractContent;
  onChange: (content: ContractContent) => void;
  disabled?: boolean;
}) {
  function updateSection(id: string, patch: Partial<ContractSection>) {
    onChange({ ...content, sections: content.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  }

  function addSection() {
    onChange({ ...content, sections: [...content.sections, { id: newId(), heading: "", body: "" }] });
  }

  function removeSection(id: string) {
    onChange({ ...content, sections: content.sections.filter((s) => s.id !== id) });
  }

  function moveSection(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= content.sections.length) return;
    const next = [...content.sections];
    [next[index], next[target]] = [next[target], next[index]];
    onChange({ ...content, sections: next });
  }

  function updateField(id: string, patch: Partial<ContractCustomField>) {
    onChange({ ...content, fields: content.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)) });
  }

  function addField() {
    onChange({
      ...content,
      fields: [...content.fields, { id: newId(), label: "", type: "text", value: "", options: [] }],
    });
  }

  function removeField(id: string) {
    onChange({ ...content, fields: content.fields.filter((f) => f.id !== id) });
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center justify-between">
          <SectionLabel>Sektioner</SectionLabel>
          {!disabled && (
            <button type="button" onClick={addSection} className={portalGhostButtonClass}>
              + Lägg till sektion
            </button>
          )}
        </div>
        <div className="mt-4 flex flex-col gap-4">
          {content.sections.map((section, index) => (
            <div key={section.id} className="rounded-xl border border-zinc-200/80 p-4">
              <div className="flex items-start gap-3">
                <input
                  type="text"
                  value={section.heading}
                  disabled={disabled}
                  placeholder="Rubrik"
                  onChange={(event) => updateSection(section.id, { heading: event.target.value })}
                  className={`${portalFieldClass} font-medium`}
                />
                {!disabled && (
                  <div className="flex shrink-0 gap-1">
                    <button type="button" onClick={() => moveSection(index, -1)} className={portalGhostButtonClass} aria-label="Flytta upp">
                      ↑
                    </button>
                    <button type="button" onClick={() => moveSection(index, 1)} className={portalGhostButtonClass} aria-label="Flytta ner">
                      ↓
                    </button>
                    <button type="button" onClick={() => removeSection(section.id)} className={portalGhostButtonClass}>
                      Ta bort
                    </button>
                  </div>
                )}
              </div>
              <textarea
                value={section.body}
                disabled={disabled}
                placeholder="Text"
                rows={4}
                onChange={(event) => updateSection(section.id, { body: event.target.value })}
                className={`mt-3 ${portalTextareaClass}`}
              />
            </div>
          ))}
          {content.sections.length === 0 && <p className="text-[0.8125rem] text-zinc-500">Inga sektioner ännu.</p>}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <SectionLabel>Anpassade fält</SectionLabel>
          {!disabled && (
            <button type="button" onClick={addField} className={portalGhostButtonClass}>
              + Lägg till fält
            </button>
          )}
        </div>
        <div className="mt-4 flex flex-col gap-3">
          {content.fields.map((field) => (
            <div key={field.id} className="rounded-xl border border-zinc-200/80 p-4">
              <div className="flex flex-wrap items-start gap-3">
                <input
                  type="text"
                  value={field.label}
                  disabled={disabled}
                  placeholder="Fältnamn"
                  onChange={(event) => updateField(field.id, { label: event.target.value })}
                  className={`${portalFieldClass} min-w-0 flex-1`}
                />
                <select
                  value={field.type}
                  disabled={disabled}
                  onChange={(event) => updateField(field.id, { type: event.target.value as ContractFieldType })}
                  className={`${portalFieldClass} w-auto shrink-0`}
                >
                  {FIELD_TYPES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {!disabled && (
                  <button type="button" onClick={() => removeField(field.id)} className={portalGhostButtonClass}>
                    Ta bort
                  </button>
                )}
              </div>
              <input
                type={field.type === "datum" ? "date" : field.type === "antal" || field.type === "procent" || field.type === "belopp" ? "number" : "text"}
                value={field.value}
                disabled={disabled}
                placeholder={field.type === "val" ? "Valt värde" : "Värde"}
                onChange={(event) => updateField(field.id, { value: event.target.value })}
                className={`mt-3 ${portalFieldClass}`}
              />
              {field.type === "val" && (
                <input
                  type="text"
                  value={field.options.join(", ")}
                  disabled={disabled}
                  placeholder="Valmöjligheter, kommaseparerat"
                  onChange={(event) =>
                    updateField(field.id, { options: event.target.value.split(",").map((v) => v.trim()).filter(Boolean) })
                  }
                  className={`mt-2 ${portalFieldClass}`}
                />
              )}
            </div>
          ))}
          {content.fields.length === 0 && <p className="text-[0.8125rem] text-zinc-500">Inga anpassade fält ännu.</p>}
        </div>
      </div>
    </div>
  );
}
