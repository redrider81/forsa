"use client";

import * as React from "react";
import { enGB, sv } from "react-day-picker/locale";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { TIME_WINDOWS, type TimeWindow } from "@/lib/contact/intake-types";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

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

function isDateDisabled(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const candidate = new Date(date);
  candidate.setHours(0, 0, 0, 0);
  const weekday = candidate.getDay();
  return candidate < today || weekday === 0 || weekday === 6;
}

const weekdayLabels: Record<Locale, string[]> = {
  sv: ["M", "T", "O", "T", "F", "L", "S"],
  en: ["M", "T", "W", "T", "F", "S", "S"],
};

type ContactSchedulingPickerProps = {
  locale: Locale;
  t: Dictionary;
  selectedDate: string;
  selectedWindow: TimeWindow | "";
  onSelectDate: (value: string) => void;
  onSelectWindow: (value: TimeWindow) => void;
  dateError?: string;
  windowError?: string;
  dateLabelClass: string;
  errorTextClass: string;
};

export default function ContactSchedulingPicker({
  locale,
  t,
  selectedDate,
  selectedWindow,
  onSelectDate,
  onSelectWindow,
  dateError,
  windowError,
  dateLabelClass,
  errorTextClass,
}: ContactSchedulingPickerProps) {
  const selected = parseIsoDate(selectedDate);
  const dayPickerLocale = locale === "sv" ? sv : enGB;

  return (
    <div className="space-y-8">
      <p className="text-sm leading-[1.7] text-zinc-600">{t.form.schedulingHint}</p>

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
                defaultMonth={selected ?? new Date()}
                disabled={isDateDisabled}
                showOutsideDays={false}
                className="bg-transparent p-0 [--cell-size:2.25rem] md:[--cell-size:2.5rem]"
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
                {TIME_WINDOWS.map((window) => (
                  <Button
                    key={window}
                    type="button"
                    role="option"
                    aria-selected={selectedWindow === window}
                    variant={selectedWindow === window ? "default" : "outline"}
                    onClick={() => onSelectWindow(window)}
                    className={cn(
                      "h-auto min-h-10 w-full rounded-full px-3 py-2.5 text-[0.8125rem] font-medium shadow-none tabular-nums",
                      selectedWindow === window
                        ? "border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800"
                        : "border-zinc-300 bg-transparent text-zinc-700 hover:border-zinc-500 hover:bg-white",
                    )}
                  >
                    {t.form.timeWindows[window]}
                  </Button>
                ))}
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

      <input type="hidden" name="onskadTidsfonster" value={selectedWindow} />
      {windowError ? (
        <p className={errorTextClass} role="alert">
          {windowError}
        </p>
      ) : null}
    </div>
  );
}
