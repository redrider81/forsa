"use client";

import * as React from "react";
import { enGB, sv } from "react-day-picker/locale";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { PUBLIC_BOOKING_SLUG } from "@/lib/contact/intake-types";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

type PublicSlot = { date: string; startAt: string; endAt: string };

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseIsoDate(iso: string): Date | undefined {
  if (!iso) return undefined;
  const parsed = new Date(`${iso}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

function formatSlotTime(iso: string): string {
  return new Intl.DateTimeFormat("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Stockholm",
  }).format(new Date(iso));
}

function formatSlotInterval(startAt: string, endAt: string): string {
  return `${formatSlotTime(startAt)}–${formatSlotTime(endAt)}`;
}

function formatSelectedDateLabel(iso: string, locale: Locale): string {
  const formatted = new Intl.DateTimeFormat(locale === "sv" ? "sv-SE" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Stockholm",
  }).format(new Date(iso));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

const weekdayLabels: Record<Locale, string[]> = {
  sv: ["M", "T", "O", "T", "F", "L", "S"],
  en: ["M", "T", "W", "T", "F", "S", "S"],
};

// Calendar.tsx's default disabled-date color (zinc-300) is close to
// invisible; override to a readable-but-clearly-muted tone here instead of
// touching the shared component. Kept in the same neutral zinc family as
// the rest of this monochrome public site.
const calendarClassNameOverrides = {
  months: "relative flex flex-col gap-6 sm:flex-col md:flex-col",
  month: "w-full max-w-full",
  day_button: "group-data-[disabled]:text-zinc-500",
  month_caption: "mb-4",
  caption_label: "text-[0.9375rem] font-medium tracking-tight text-zinc-900",
  weekday: "text-[0.6875rem] font-medium tracking-[0.12em] text-zinc-400",
  button_previous: "size-10 rounded-full hover:bg-zinc-100",
  button_next: "size-10 rounded-full hover:bg-zinc-100",
};

// Light CVB green for dates with real availability — dot when idle,
// soft fill when the date is selected (replaces the default black pill).
const AVAILABLE_DAY_CLASS = cn(
  "*:after:pointer-events-none *:after:absolute *:after:bottom-1 *:after:start-1/2 *:after:z-10 *:after:size-[3px] *:after:-translate-x-1/2 *:after:rounded-full *:after:bg-[#6BB5A8] *:after:transition-colors",
  "[&[data-selected]:not(.range-middle)>button]:!bg-[#DFF0EC] [&[data-selected]:not(.range-middle)>button]:!text-[#3F7569] [&[data-selected]:not(.range-middle)>button]:hover:!bg-[#D0EDE6]",
  "[&[data-selected]:not(.range-middle)>*]:after:bg-[#3F7569]",
);

const SELECTED_SLOT_CLASS =
  "border-[#6BB5A8] bg-[#DFF0EC] text-[#3F7569] shadow-[inset_0_0_0_1px_rgba(107,181,168,0.35)] ring-2 ring-[#6BB5A8]/25 hover:bg-[#D0EDE6]";

const compactLabelClass = "block text-[0.75rem] font-medium tracking-[0.02em] text-zinc-700";

const compactFieldClass =
  "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-[0.875rem] leading-snug text-zinc-900 placeholder:text-zinc-400 transition-colors duration-150 focus:border-[#6BB5A8] focus:outline-none focus:ring-2 focus:ring-[#6BB5A8]/20";

const compactTextareaClass =
  "min-h-[5.5rem] w-full resize-y rounded-xl border border-zinc-200 bg-zinc-900/[0.02] px-3 py-2.5 text-[0.875rem] leading-relaxed text-zinc-900 placeholder:text-zinc-400 transition-colors duration-150 focus:border-[#6BB5A8] focus:outline-none focus:ring-2 focus:ring-[#6BB5A8]/20";

type ContactSchedulingPickerProps = {
  locale: Locale;
  t: Dictionary;
  selectedDate: string;
  selectedSlotStart: string;
  selectedSlotEnd?: string;
  organisation: string;
  namn: string;
  telefon: string;
  epost: string;
  situation: string;
  onOrganisationChange: (value: string) => void;
  onNamnChange: (value: string) => void;
  onTelefonChange: (value: string) => void;
  onEpostChange: (value: string) => void;
  onSituationChange: (value: string) => void;
  onSelectDate: (value: string) => void;
  onSelectSlot: (startAt: string, endAt: string) => void;
  organisationError?: string;
  namnError?: string;
  telefonError?: string;
  epostError?: string;
  situationError?: string;
  dateError?: string;
  windowError?: string;
  isSubmitting?: boolean;
  dateLabelClass: string;
  errorTextClass: string;
};

export default function ContactSchedulingPicker({
  locale,
  t,
  selectedDate,
  selectedSlotStart,
  selectedSlotEnd = "",
  organisation,
  namn,
  telefon,
  epost,
  situation,
  onOrganisationChange,
  onNamnChange,
  onTelefonChange,
  onEpostChange,
  onSituationChange,
  onSelectDate,
  onSelectSlot,
  organisationError,
  namnError,
  telefonError,
  epostError,
  situationError,
  dateError,
  windowError,
  isSubmitting = false,
  dateLabelClass,
  errorTextClass,
}: ContactSchedulingPickerProps) {
  const selected = parseIsoDate(selectedDate);
  const dayPickerLocale = locale === "sv" ? sv : enGB;

  const [slots, setSlots] = React.useState<PublicSlot[] | null>(null);
  const [bookingEnabled, setBookingEnabled] = React.useState(true);
  const [loadFailed, setLoadFailed] = React.useState(false);
  const [visibleMonth, setVisibleMonth] = React.useState<Date>(selected ?? new Date());

  React.useEffect(() => {
    const today = new Date();
    const start = toIsoDate(today);
    const horizon = new Date(today);
    horizon.setDate(horizon.getDate() + 90);
    const end = toIsoDate(horizon);

    let cancelled = false;
    fetch(`/api/public/tillganglighet/slots?slug=${PUBLIC_BOOKING_SLUG}&start=${start}&end=${end}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("failed"))))
      .then((payload: { ok: boolean; bookingEnabled: boolean; slots: PublicSlot[] }) => {
        if (cancelled) return;
        setBookingEnabled(payload.bookingEnabled ?? true);
        setSlots(payload.slots ?? []);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const datesWithSlots = React.useMemo(() => {
    const set = new Set<string>();
    (slots ?? []).forEach((slot) => set.add(slot.date));
    return set;
  }, [slots]);

  // Auto-select the first available date once slots have loaded, so the
  // picker is useful without an extra click. This synchronizes local state
  // with data that only exists after an async fetch resolves, which is a
  // legitimate effect use case (React docs: "fetching data").
  React.useEffect(() => {
    if (!slots || slots.length === 0) return;
    if (selectedDate && datesWithSlots.has(selectedDate)) return;
    const firstDate = [...datesWithSlots].sort()[0];
    if (firstDate) {
      onSelectDate(firstDate);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing calendar view to freshly-fetched async data, not derived render state
      setVisibleMonth(parseIsoDate(firstDate) ?? visibleMonth);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots]);

  const slotsForSelectedDate = React.useMemo(
    () => (slots ?? []).filter((slot) => slot.date === selectedDate),
    [slots, selectedDate],
  );

  const visibleMonthKeys = React.useMemo(() => {
    const keys: string[] = [];
    for (let offset = 0; offset < 3; offset += 1) {
      const monthDate = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1);
      keys.push(`${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`);
    }
    return keys;
  }, [visibleMonth]);

  const monthHasSlots = React.useMemo(
    () => [...datesWithSlots].some((date) => visibleMonthKeys.includes(monthKey(date))),
    [datesWithSlots, visibleMonthKeys],
  );

  function isDateDisabled(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const candidate = new Date(date);
    candidate.setHours(0, 0, 0, 0);
    if (candidate < today) return true;
    if (!slots) return false;
    return !datesWithSlots.has(toIsoDate(candidate));
  }

  const isPaused = slots !== null && !bookingEnabled;

  return (
    <div className="space-y-10">
      <p className="max-w-prose text-[0.9375rem] leading-[1.75] text-zinc-600">{t.form.schedulingHint}</p>

      {(loadFailed || isPaused) && (
        <p className="text-[0.9375rem] leading-[1.75] text-zinc-600">
          {locale === "sv"
            ? "Bokning är tillfälligt pausad. Kontakta oss gärna så återkommer vi."
            : "Booking is temporarily paused. Feel free to contact us and we will get back to you."}
        </p>
      )}

      <div className="space-y-4">
        <p className={dateLabelClass}>{t.form.fields.preferredDate}</p>
        <Card className="w-full max-w-5xl gap-0 rounded-2xl border-zinc-200/90 bg-white p-0 shadow-sm shadow-zinc-900/[0.04]">
          <CardContent className="p-0 md:grid md:grid-cols-[auto_minmax(26rem,1fr)] md:items-start">
            <div className="w-fit max-w-full shrink-0 self-start p-5 sm:p-7 md:p-8">
              <Calendar
                mode="single"
                locale={dayPickerLocale}
                weekStartsOn={1}
                numberOfMonths={3}
                pagedNavigation={false}
                reverseMonths={false}
                selected={selected}
                onSelect={(date) => {
                  if (date) onSelectDate(toIsoDate(date));
                }}
                month={visibleMonth}
                onMonthChange={setVisibleMonth}
                disabled={isDateDisabled}
                modifiers={{ available: (date) => datesWithSlots.has(toIsoDate(date)) }}
                modifiersClassNames={{ available: AVAILABLE_DAY_CLASS }}
                showOutsideDays={false}
                className="bg-transparent p-0 [--cell-size:2.5rem] sm:[--cell-size:2.625rem] md:[--cell-size:2.875rem]"
                classNames={calendarClassNameOverrides}
                formatters={{
                  formatWeekdayName: (date) => {
                    const index = (date.getDay() + 6) % 7;
                    return weekdayLabels[locale][index] ?? date.toLocaleDateString();
                  },
                }}
              />
            </div>
            <div className="flex flex-col border-t border-zinc-200/90 p-5 sm:p-7 md:sticky md:top-8 md:self-start md:border-t-0 md:border-l md:px-8 md:py-8">
              <p className={cn(dateLabelClass, "mb-5")}>{t.form.fields.preferredTime}</p>
              <div
                className="no-scrollbar grid max-h-72 grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2 md:max-h-none md:grid-cols-1"
                role="listbox"
                aria-label={t.form.timeSlotAria}
              >
                {isPaused ? null : !selectedDate ? (
                  <p className="col-span-1 text-[0.875rem] leading-relaxed text-zinc-500 sm:col-span-2 md:col-span-1">
                    {locale === "sv" ? "Välj ett tillgängligt datum i kalendern." : "Choose an available date in the calendar."}
                  </p>
                ) : slotsForSelectedDate.length > 0 ? (
                  slotsForSelectedDate.map((slot) => (
                    <Button
                      key={slot.startAt}
                      type="button"
                      role="option"
                      aria-selected={selectedSlotStart === slot.startAt}
                      variant="outline"
                      onClick={() => onSelectSlot(slot.startAt, slot.endAt)}
                      className={cn(
                        "h-auto min-h-11 w-full rounded-full px-4 py-3 text-[0.875rem] font-medium shadow-none tabular-nums transition-colors duration-150",
                        selectedSlotStart === slot.startAt
                          ? SELECTED_SLOT_CLASS
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50",
                      )}
                    >
                      {formatSlotInterval(slot.startAt, slot.endAt)}
                    </Button>
                  ))
                ) : !monthHasSlots ? (
                  <p className="col-span-1 text-[0.875rem] leading-relaxed text-zinc-500 sm:col-span-2 md:col-span-1">
                    {locale === "sv" ? (
                      <>
                        Inga lediga tider denna månad.
                        <br />
                        Bläddra gärna framåt i kalendern.
                      </>
                    ) : (
                      <>
                        No available times this month.
                        <br />
                        Feel free to browse forward.
                      </>
                    )}
                  </p>
                ) : (
                  <p className="col-span-1 text-[0.875rem] leading-relaxed text-zinc-500 sm:col-span-2 md:col-span-1">
                    {locale === "sv" ? "Inga lediga tider för valt datum." : "No available times for the selected date."}
                  </p>
                )}
              </div>

              <div className="mt-8 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-5">
                <p className="text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-zinc-500">
                  {locale === "sv" ? "Vald tid" : "Selected time"}
                </p>
                <p
                  className={cn(
                    "mt-3 text-base leading-snug",
                    selectedSlotStart && selectedSlotEnd
                      ? "font-medium text-zinc-900"
                      : "text-zinc-500",
                  )}
                >
                  {selectedSlotStart && selectedSlotEnd
                    ? `${formatSelectedDateLabel(selectedSlotStart, locale)} · ${formatSlotInterval(selectedSlotStart, selectedSlotEnd)}`
                    : locale === "sv"
                      ? "Välj en tid ovan"
                      : "Choose a time above"}
                </p>

                <div className="mt-6 space-y-3.5">
                  <div className="space-y-1.5">
                    <label htmlFor="picker-organisation" className={compactLabelClass}>
                      {locale === "sv" ? "Företag" : "Company"}
                    </label>
                    <input
                      id="picker-organisation"
                      name="organisation"
                      type="text"
                      autoComplete="organization"
                      value={organisation}
                      onChange={(event) => onOrganisationChange(event.target.value)}
                      className={cn(compactFieldClass, organisationError && "border-zinc-600")}
                    />
                    {organisationError ? (
                      <p className={errorTextClass} role="alert">
                        {organisationError}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="picker-namn" className={compactLabelClass}>
                      {t.form.fields.name}
                    </label>
                    <input
                      id="picker-namn"
                      name="namn"
                      type="text"
                      autoComplete="name"
                      value={namn}
                      onChange={(event) => onNamnChange(event.target.value)}
                      className={cn(compactFieldClass, namnError && "border-zinc-600")}
                    />
                    {namnError ? (
                      <p className={errorTextClass} role="alert">
                        {namnError}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="picker-telefon" className={compactLabelClass}>
                      {t.form.fields.phone}
                    </label>
                    <input
                      id="picker-telefon"
                      name="telefon"
                      type="tel"
                      autoComplete="tel"
                      value={telefon}
                      onChange={(event) => onTelefonChange(event.target.value)}
                      className={cn(compactFieldClass, telefonError && "border-zinc-600")}
                    />
                    {telefonError ? (
                      <p className={errorTextClass} role="alert">
                        {telefonError}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="picker-epost" className={compactLabelClass}>
                      {t.form.fields.email}
                    </label>
                    <input
                      id="picker-epost"
                      name="epost"
                      type="email"
                      autoComplete="email"
                      value={epost}
                      onChange={(event) => onEpostChange(event.target.value)}
                      className={cn(compactFieldClass, epostError && "border-zinc-600")}
                    />
                    {epostError ? (
                      <p className={errorTextClass} role="alert">
                        {epostError}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="picker-situation" className={compactLabelClass}>
                      {t.form.fields.situation}
                    </label>
                    <textarea
                      id="picker-situation"
                      name="situation"
                      value={situation}
                      onChange={(event) => onSituationChange(event.target.value)}
                      className={cn(compactTextareaClass, situationError && "border-zinc-600")}
                    />
                    {situationError ? (
                      <p className={errorTextClass} role="alert">
                        {situationError}
                      </p>
                    ) : null}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!selectedSlotStart || !selectedSlotEnd || isSubmitting}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#3F7569] px-7 py-3.5 text-sm font-medium leading-snug tracking-wide text-white transition duration-150 hover:bg-[#35685D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3F7569] focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting
                    ? t.form.submit.submitting
                    : locale === "sv"
                      ? "Boka tid"
                      : "Book time"}
                </button>
                <p className="mt-4 text-center text-[0.8125rem] leading-relaxed text-zinc-500">
                  {t.form.confidentialityNote}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <input type="hidden" name="onskatDatum" value={selectedDate} />
        {dateError ? (
          <p className={errorTextClass} role="alert">
            {dateError}
          </p>
        ) : null}
      </div>

      <input type="hidden" name="onskadTid" value={selectedSlotStart} />
      <input type="hidden" name="onskadTidSlut" value={selectedSlotEnd} />
      {windowError ? (
        <p className={errorTextClass} role="alert">
          {windowError}
        </p>
      ) : null}
    </div>
  );
}
