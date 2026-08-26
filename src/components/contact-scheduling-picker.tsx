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

const weekdayLabels: Record<Locale, string[]> = {
  sv: ["M", "T", "O", "T", "F", "L", "S"],
  en: ["M", "T", "W", "T", "F", "S", "S"],
};

// Calendar.tsx's default disabled-date color (zinc-300) is close to
// invisible; override to a readable-but-clearly-muted tone here instead of
// touching the shared component. Kept in the same neutral zinc family as
// the rest of this monochrome public site.
const calendarClassNameOverrides = {
  day_button: "group-data-[disabled]:text-zinc-400",
};

// Subtle CVB gold dot below dates that have real availability — restrained,
// not a filled circle, and swaps to white when the date is selected so it
// stays legible against the dark selected fill.
const AVAILABLE_DOT_CLASS =
  "*:after:pointer-events-none *:after:absolute *:after:bottom-1 *:after:start-1/2 *:after:z-10 *:after:size-[3px] *:after:-translate-x-1/2 *:after:rounded-full *:after:bg-[#B89A5A] [&[data-selected]:not(.range-middle)>*]:after:bg-white *:after:transition-colors";

type ContactSchedulingPickerProps = {
  locale: Locale;
  t: Dictionary;
  selectedDate: string;
  selectedSlotStart: string;
  selectedSlotEnd?: string;
  onSelectDate: (value: string) => void;
  onSelectSlot: (startAt: string, endAt: string) => void;
  dateError?: string;
  windowError?: string;
  dateLabelClass: string;
  errorTextClass: string;
};

export default function ContactSchedulingPicker({
  locale,
  t,
  selectedDate,
  selectedSlotStart,
  selectedSlotEnd = "",
  onSelectDate,
  onSelectSlot,
  dateError,
  windowError,
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

  const visibleMonthKey = `${visibleMonth.getFullYear()}-${String(visibleMonth.getMonth() + 1).padStart(2, "0")}`;
  const monthHasSlots = React.useMemo(
    () => [...datesWithSlots].some((date) => monthKey(date) === visibleMonthKey),
    [datesWithSlots, visibleMonthKey],
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
    <div className="space-y-8">
      <p className="text-sm leading-[1.7] text-zinc-600">{t.form.schedulingHint}</p>

      {(loadFailed || isPaused) && (
        <p className="text-sm leading-[1.7] text-zinc-600">
          {locale === "sv"
            ? "Bokning är tillfälligt pausad. Kontakta oss gärna så återkommer vi."
            : "Booking is temporarily paused. Feel free to contact us and we will get back to you."}
        </p>
      )}

      <div className="space-y-3">
        <p className={dateLabelClass}>{t.form.fields.preferredDate}</p>
        <Card className="max-w-2xl gap-0 border-zinc-300/70 bg-white/60 p-0 shadow-none">
          <CardContent className="relative p-0 md:pr-56">
            <div className="p-4 md:p-6">
              <Calendar
                mode="single"
                locale={dayPickerLocale}
                weekStartsOn={1}
                selected={selected}
                onSelect={(date) => {
                  if (date) onSelectDate(toIsoDate(date));
                }}
                month={visibleMonth}
                onMonthChange={setVisibleMonth}
                disabled={isDateDisabled}
                modifiers={{ available: (date) => datesWithSlots.has(toIsoDate(date)) }}
                modifiersClassNames={{ available: AVAILABLE_DOT_CLASS }}
                showOutsideDays={false}
                className="bg-transparent p-0 [--cell-size:2.25rem] md:[--cell-size:2.5rem]"
                classNames={calendarClassNameOverrides}
                formatters={{
                  formatWeekdayName: (date) => {
                    const index = (date.getDay() + 6) % 7;
                    return weekdayLabels[locale][index] ?? date.toLocaleDateString();
                  },
                }}
              />
            </div>
            <div className="border-t border-zinc-300/70 p-4 md:absolute md:inset-y-0 md:right-0 md:flex md:max-h-none md:w-56 md:flex-col md:border-t-0 md:border-l md:p-5">
              <p className={cn(dateLabelClass, "mb-3")}>{t.form.fields.preferredTime}</p>
              <div
                className="no-scrollbar grid max-h-72 grid-cols-2 gap-2 overflow-y-auto md:max-h-none md:grid-cols-1"
                role="listbox"
                aria-label={t.form.timeSlotAria}
              >
                {isPaused ? null : !selectedDate ? (
                  <p className="col-span-2 text-[0.8125rem] leading-relaxed text-zinc-500 md:col-span-1">
                    {locale === "sv" ? "Välj ett tillgängligt datum i kalendern." : "Choose an available date in the calendar."}
                  </p>
                ) : slotsForSelectedDate.length > 0 ? (
                  slotsForSelectedDate.map((slot) => (
                    <Button
                      key={slot.startAt}
                      type="button"
                      role="option"
                      aria-selected={selectedSlotStart === slot.startAt}
                      variant={selectedSlotStart === slot.startAt ? "default" : "outline"}
                      onClick={() => onSelectSlot(slot.startAt, slot.endAt)}
                      className={cn(
                        "h-auto min-h-10 w-full rounded-full px-3 py-2.5 text-[0.8125rem] font-medium shadow-none tabular-nums",
                        selectedSlotStart === slot.startAt
                          ? "border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800"
                          : "border-zinc-300 bg-transparent text-zinc-700 hover:border-zinc-500 hover:bg-white",
                      )}
                    >
                      {formatSlotTime(slot.startAt)}
                    </Button>
                  ))
                ) : !monthHasSlots ? (
                  <p className="col-span-2 text-[0.8125rem] leading-relaxed text-zinc-500 md:col-span-1">
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
                  <p className="col-span-2 text-[0.8125rem] text-zinc-500 md:col-span-1">
                    {locale === "sv" ? "Inga lediga tider för valt datum." : "No available times for the selected date."}
                  </p>
                )}
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
