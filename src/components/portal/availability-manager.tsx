"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AvailabilityException, AvailabilityRule, BookingSettings, PublicSlot } from "@/lib/portal/availability";
import { FIXED_PUBLIC_BLOCKS } from "@/lib/portal/types";
import { Panel, PanelHeading, SectionLabel, portalButtonSmClass, portalFieldClass, portalGhostButtonClass } from "@/components/portal/ui";

const WEEKDAY_LABELS: Record<number, string> = {
  1: "Måndag",
  2: "Tisdag",
  3: "Onsdag",
  4: "Torsdag",
  5: "Fredag",
  6: "Lördag",
  7: "Söndag",
};

const WEEKDAYS = [1, 2, 3, 4, 5] as const;
const WEEKEND_DAYS = [6, 7] as const;

const DURATIONS = [30, 45, 60, 90];
const BUFFERS = [0, 15, 30, 45, 60];
const NOTICE_OPTIONS = [
  { value: 2, label: "2 timmar" },
  { value: 6, label: "6 timmar" },
  { value: 12, label: "12 timmar" },
  { value: 24, label: "24 timmar" },
  { value: 48, label: "48 timmar" },
];
const HORIZON_OPTIONS = [
  { value: 14, label: "14 dagar" },
  { value: 30, label: "30 dagar" },
  { value: 60, label: "60 dagar" },
  { value: 90, label: "90 dagar" },
];

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

function formatSlot(iso: string): string {
  return iso.slice(11, 16);
}

export default function AvailabilityManager({
  initialRules,
  initialExceptions,
  initialSettings,
  previewSlots,
}: {
  initialRules: AvailabilityRule[];
  initialExceptions: AvailabilityException[];
  initialSettings: BookingSettings;
  previewSlots: PublicSlot[];
}) {
  const router = useRouter();
  const [rules, setRules] = useState(initialRules);
  const [exceptions, setExceptions] = useState(initialExceptions);
  const [settings, setSettings] = useState(initialSettings);

  // ---------------------------------------------------------- veckoschema

  const [busyBlock, setBusyBlock] = useState<string | null>(null);

  async function addBlock(weekday: number, startTime: string, endTime: string) {
    const response = await fetch("/api/portal/tillganglighet/regler", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekday, startTime, endTime }),
    });
    if (response.ok) {
      const { rule } = (await response.json()) as { rule: AvailabilityRule };
      setRules((prev) => [...prev, rule].sort((a, b) => a.weekday - b.weekday || a.startTime.localeCompare(b.startTime)));
      router.refresh();
    }
  }

  async function removeRule(ruleId: string) {
    await fetch(`/api/portal/tillganglighet/regler/${ruleId}`, { method: "DELETE" });
    setRules((prev) => prev.filter((r) => r.id !== ruleId));
    router.refresh();
  }

  async function toggleBlock(weekday: number, startTime: string, endTime: string) {
    const key = `${weekday}-${startTime}`;
    setBusyBlock(key);
    try {
      const existingRule = rules.find((r) => r.weekday === weekday && r.startTime === startTime && r.endTime === endTime);
      if (existingRule) {
        await removeRule(existingRule.id);
      } else {
        await addBlock(weekday, startTime, endTime);
      }
    } finally {
      setBusyBlock(null);
    }
  }

  // ---------------------------------------------------------- bokningsregler

  const [settingsSaved, setSettingsSaved] = useState(false);

  async function patchSettings(patch: Partial<BookingSettings>) {
    setSettingsSaved(false);
    const body: Record<string, unknown> = {};
    if (patch.meetingDurationMinutes !== undefined) body.meetingDurationMinutes = patch.meetingDurationMinutes;
    if (patch.bufferMinutes !== undefined) body.bufferMinutes = patch.bufferMinutes;
    if (patch.minimumNoticeHours !== undefined) body.minimumNoticeHours = patch.minimumNoticeHours;
    if (patch.bookingHorizonDays !== undefined) body.bookingHorizonDays = patch.bookingHorizonDays;
    if (patch.publicBookingEnabled !== undefined) body.publicBookingEnabled = patch.publicBookingEnabled;

    const response = await fetch("/api/portal/tillganglighet/installningar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (response.ok) {
      const { settings: updated } = (await response.json()) as { settings: BookingSettings };
      setSettings(updated);
      setSettingsSaved(true);
      router.refresh();
    }
  }

  // ---------------------------------------------------------- undantag

  const [addingException, setAddingException] = useState(false);
  const [exceptionDate, setExceptionDate] = useState("");
  const [exceptionType, setExceptionType] = useState<"unavailable" | "custom">("unavailable");
  const [selectedExceptionBlocks, setSelectedExceptionBlocks] = useState<Set<string>>(new Set());
  const [exceptionError, setExceptionError] = useState<string | null>(null);

  const exceptionDateIsWeekend = exceptionDate
    ? [0, 6].includes(new Date(`${exceptionDate}T12:00:00Z`).getUTCDay())
    : false;

  const exceptionsByDate = exceptions.reduce<Record<string, AvailabilityException[]>>((acc, exception) => {
    (acc[exception.date] ??= []).push(exception);
    return acc;
  }, {});

  function toggleExceptionBlock(startTime: string) {
    setSelectedExceptionBlocks((prev) => {
      const next = new Set(prev);
      if (next.has(startTime)) next.delete(startTime);
      else next.add(startTime);
      return next;
    });
  }

  async function saveException() {
    setExceptionError(null);
    if (!exceptionDate) {
      setExceptionError("Välj ett datum.");
      return;
    }
    if (exceptionDateIsWeekend && exceptionType === "custom") {
      setExceptionError("Helger kan inte göras bokningsbara.");
      return;
    }
    if (exceptionType === "custom" && selectedExceptionBlocks.size === 0) {
      setExceptionError("Välj minst ett bokningsblock.");
      return;
    }

    const body: Record<string, unknown> =
      exceptionType === "unavailable"
        ? { date: exceptionDate, type: "unavailable" }
        : {
            date: exceptionDate,
            type: "custom",
            intervals: FIXED_PUBLIC_BLOCKS.filter((block) => selectedExceptionBlocks.has(block.startTime)),
          };

    const response = await fetch("/api/portal/tillganglighet/undantag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setExceptionError(payload.error ?? "Kunde inte spara undantaget.");
      return;
    }
    const { exceptions: created } = (await response.json()) as { exceptions: AvailabilityException[] };
    setExceptions((prev) => [...prev, ...created].sort((a, b) => a.date.localeCompare(b.date)));
    setAddingException(false);
    setExceptionDate("");
    setExceptionType("unavailable");
    setSelectedExceptionBlocks(new Set());
    router.refresh();
  }

  async function removeExceptionDate(date: string) {
    const ids = exceptionsByDate[date]?.map((e) => e.id) ?? [];
    await Promise.all(ids.map((id) => fetch(`/api/portal/tillganglighet/undantag/${id}`, { method: "DELETE" })));
    setExceptions((prev) => prev.filter((e) => e.date !== date));
    router.refresh();
  }

  const previewByDate = previewSlots.reduce<Record<string, PublicSlot[]>>((acc, slot) => {
    (acc[slot.date] ??= []).push(slot);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      {/* 1. VECKOSCHEMA */}
      <Panel>
        <PanelHeading label="Tillgänglighet" title="Veckoschema" />
        <p className="mt-2 text-[0.8125rem] text-zinc-500">
          Bokning från hemsidan sker endast måndag–fredag, i fyra fasta block. 12:00–13:00 är alltid lunch.
        </p>
        <div className="mt-5 flex flex-col gap-5">
          {WEEKDAYS.map((weekday) => (
            <div key={weekday} className="border-b border-zinc-200/70 pb-5 last:border-0 last:pb-0">
              <p className="text-[0.9375rem] font-medium text-zinc-900">{WEEKDAY_LABELS[weekday]}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {FIXED_PUBLIC_BLOCKS.map((block) => {
                  const isOn = rules.some(
                    (r) => r.weekday === weekday && r.startTime === block.startTime && r.endTime === block.endTime,
                  );
                  const key = `${weekday}-${block.startTime}`;
                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={busyBlock === key}
                      onClick={() => toggleBlock(weekday, block.startTime, block.endTime)}
                      className={`${portalGhostButtonClass} ${isOn ? "border-zinc-900 text-zinc-900" : ""}`}
                    >
                      {block.startTime}–{block.endTime}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {WEEKEND_DAYS.map((weekday) => (
            <div key={weekday} className="flex items-center justify-between border-b border-zinc-200/70 pb-5 last:border-0 last:pb-0">
              <p className="text-[0.9375rem] font-medium text-zinc-900">{WEEKDAY_LABELS[weekday]}</p>
              <p className="text-[0.8125rem] text-zinc-500">Ej bokningsbar</p>
            </div>
          ))}
        </div>
      </Panel>

      {/* 2. BOKNINGSREGLER */}
      <Panel>
        <PanelHeading label="Tillgänglighet" title="Bokningsregler" />
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <label>
            <SectionLabel>Möteslängd</SectionLabel>
            <select
              value={settings.meetingDurationMinutes}
              onChange={(e) => patchSettings({ meetingDurationMinutes: Number(e.target.value) })}
              className={`mt-2 ${portalFieldClass}`}
            >
              {DURATIONS.map((d) => (
                <option key={d} value={d}>
                  {d} minuter
                </option>
              ))}
            </select>
          </label>
          <label>
            <SectionLabel>Buffert mellan möten</SectionLabel>
            <select
              value={settings.bufferMinutes}
              onChange={(e) => patchSettings({ bufferMinutes: Number(e.target.value) })}
              className={`mt-2 ${portalFieldClass}`}
            >
              {BUFFERS.map((b) => (
                <option key={b} value={b}>
                  {b} minuter
                </option>
              ))}
            </select>
          </label>
          <label>
            <SectionLabel>Minsta framförhållning</SectionLabel>
            <select
              value={settings.minimumNoticeHours}
              onChange={(e) => patchSettings({ minimumNoticeHours: Number(e.target.value) })}
              className={`mt-2 ${portalFieldClass}`}
            >
              {NOTICE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <SectionLabel>Bokningshorisont</SectionLabel>
            <select
              value={settings.bookingHorizonDays}
              onChange={(e) => patchSettings({ bookingHorizonDays: Number(e.target.value) })}
              className={`mt-2 ${portalFieldClass}`}
            >
              {HORIZON_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-zinc-200/80 pt-5">
          <div>
            <p className="text-[0.9375rem] font-medium text-zinc-900">Bokning från hemsidan</p>
            <p className="mt-1 text-[0.8125rem] text-zinc-500">
              {settings.publicBookingEnabled ? "Aktiv — cvbcoaching.se visar dina lediga tider." : "Pausad — inga tider visas publikt."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => patchSettings({ publicBookingEnabled: !settings.publicBookingEnabled })}
            className={`${portalGhostButtonClass} ${settings.publicBookingEnabled ? "border-zinc-900 text-zinc-900" : ""}`}
          >
            {settings.publicBookingEnabled ? "Aktiv" : "Pausad"}
          </button>
        </div>
        {settingsSaved && <p className="mt-3 text-[0.8125rem] text-emerald-700">Sparat</p>}
      </Panel>

      {/* 3. UNDANTAG */}
      <Panel>
        <PanelHeading label="Tillgänglighet" title="Undantag" />
        <div className="mt-5 flex flex-col gap-4">
          {Object.keys(exceptionsByDate).length === 0 && !addingException && (
            <p className="text-[0.875rem] text-zinc-500">Inga undantag registrerade.</p>
          )}
          {Object.entries(exceptionsByDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, items]) => (
              <div key={date} className="flex items-start justify-between gap-3 border-b border-zinc-200/70 pb-3 last:border-0">
                <div>
                  <p className="text-[0.9375rem] font-medium text-zinc-900">{formatDate(date)}</p>
                  {items[0].type === "unavailable" ? (
                    <p className="mt-0.5 text-[0.8125rem] text-zinc-500">Ej tillgänglig</p>
                  ) : (
                    <p className="mt-0.5 text-[0.8125rem] text-zinc-500">
                      {items.map((i) => `${i.startTime}–${i.endTime}`).join(", ")}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeExceptionDate(date)}
                  className="text-[0.8125rem] text-zinc-500 hover:text-zinc-900"
                >
                  Ta bort
                </button>
              </div>
            ))}

          {!addingException ? (
            <button type="button" onClick={() => setAddingException(true)} className={`w-fit ${portalGhostButtonClass}`}>
              + Lägg till undantag
            </button>
          ) : (
            <div className="rounded-xl border border-zinc-200/80 p-4">
              <label>
                <SectionLabel>Datum</SectionLabel>
                <input
                  type="date"
                  value={exceptionDate}
                  onChange={(e) => setExceptionDate(e.target.value)}
                  className={`mt-2 ${portalFieldClass}`}
                />
              </label>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setExceptionType("unavailable")}
                  className={`${portalGhostButtonClass} ${exceptionType === "unavailable" ? "border-zinc-900 text-zinc-900" : ""}`}
                >
                  Ej tillgänglig
                </button>
                {!exceptionDateIsWeekend && (
                  <button
                    type="button"
                    onClick={() => setExceptionType("custom")}
                    className={`${portalGhostButtonClass} ${exceptionType === "custom" ? "border-zinc-900 text-zinc-900" : ""}`}
                  >
                    Anpassad tillgänglighet
                  </button>
                )}
              </div>
              {exceptionDateIsWeekend && (
                <p className="mt-2 text-[0.75rem] text-zinc-500">Helger kan endast markeras som ej tillgängliga.</p>
              )}

              {exceptionType === "custom" && !exceptionDateIsWeekend && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {FIXED_PUBLIC_BLOCKS.map((block) => {
                    const isSelected = selectedExceptionBlocks.has(block.startTime);
                    return (
                      <button
                        key={block.startTime}
                        type="button"
                        onClick={() => toggleExceptionBlock(block.startTime)}
                        className={`${portalGhostButtonClass} ${isSelected ? "border-zinc-900 text-zinc-900" : ""}`}
                      >
                        {block.startTime}–{block.endTime}
                      </button>
                    );
                  })}
                </div>
              )}

              {exceptionError && <p className="mt-3 text-[0.8125rem] text-red-600">{exceptionError}</p>}

              <div className="mt-4 flex gap-3">
                <button type="button" onClick={() => setAddingException(false)} className={portalGhostButtonClass}>
                  Avbryt
                </button>
                <button type="button" onClick={saveException} className={portalButtonSmClass}>
                  Spara undantag
                </button>
              </div>
            </div>
          )}
        </div>
      </Panel>

      {/* 4. FÖRHANDSVISNING */}
      <Panel>
        <PanelHeading label="Tillgänglighet" title="Så här ser kunder dina lediga tider" />
        <div className="mt-5">
          {!settings.publicBookingEnabled && (
            <p className="mb-4 text-[0.8125rem] text-zinc-500">
              Bokning från hemsidan är pausad. Förhandsvisningen visar exakt vad kunder ser — alltså inga tider — tills du aktiverar den ovan.
            </p>
          )}
          {Object.keys(previewByDate).length === 0 ? (
            <p className="text-[0.875rem] text-zinc-500">Inga lediga tider att visa just nu.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {Object.entries(previewByDate).map(([date, slots]) => (
                <div key={date} className="flex flex-wrap items-center gap-3 border-b border-zinc-200/60 pb-3 last:border-0">
                  <span className="w-24 shrink-0 text-[0.875rem] font-medium text-zinc-900">{formatDate(date)}</span>
                  <div className="flex flex-wrap gap-2">
                    {slots.map((slot) => (
                      <span
                        key={slot.startAt}
                        className="rounded-full border border-zinc-300 px-3 py-1 text-[0.8125rem] text-zinc-700"
                      >
                        {formatSlot(slot.startAt)}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
