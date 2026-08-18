"use client";

import { type FormEvent, type ReactNode, useState } from "react";
import { localeFromPathname } from "@/lib/i18n/config";
import { getDictionaryForOptionalLocale } from "@/lib/i18n";
import { usePathname } from "next/navigation";

const selectChevron = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2352525b' stroke-width='1.25' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`;

const REQUIRED_FIELDS = [
  "namn",
  "organisation",
  "roll",
  "epost",
  "fragan",
  "lage",
  "situation",
  "tydligare",
  "tidpunkt",
] as const;

type FieldName = (typeof REQUIRED_FIELDS)[number];

export type ContactIntakePayload = {
  namn: string;
  organisation: string;
  roll: string;
  epost: string;
  telefon: string;
  ort: string;
  fragan: string;
  lage: string;
  situation: string;
  tydligare: string;
  tidpunkt: string;
};

const fieldFocus =
  "transition-[border-color,box-shadow] duration-200 focus:border-zinc-900 focus-visible:outline-none focus-visible:shadow-[0_1px_0_0_#18181b]";

const fieldClassBase = `w-full border-0 border-b bg-transparent px-0 py-4 text-[1.0625rem] leading-snug text-zinc-900 placeholder:text-zinc-400/90 ${fieldFocus}`;

const selectClassBase = `w-full cursor-pointer appearance-none border-0 border-b bg-transparent bg-[length:0.7rem] bg-[position:right_0.15rem_center] bg-no-repeat px-0 py-4 pr-7 text-[1.0625rem] leading-snug text-zinc-900 ${fieldFocus}`;

const textareaClassBase = `min-h-[6.25rem] w-full resize-y border bg-zinc-900/[0.012] px-4 py-3.5 text-[1.0625rem] leading-relaxed text-zinc-900 placeholder:text-zinc-400/90 ${fieldFocus} focus:shadow-none focus-visible:border-zinc-900 focus-visible:ring-1 focus-visible:ring-zinc-900/10`;

const labelClass =
  "block text-[0.8125rem] font-medium tracking-[0.03em] text-zinc-800";

const sectionLabelClass =
  "mb-7 block text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-zinc-500";

const errorTextClass = "text-sm leading-relaxed text-zinc-600";

function withFieldState(base: string, hasError: boolean, isTextarea = false) {
  const border = hasError
    ? isTextarea
      ? "border-zinc-600"
      : "border-zinc-600"
    : isTextarea
      ? "border-zinc-400/65"
      : "border-zinc-400/80";
  return `${base} ${border}`;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function buildPayload(data: FormData): ContactIntakePayload {
  return {
    namn: String(data.get("namn") ?? "").trim(),
    organisation: String(data.get("organisation") ?? "").trim(),
    roll: String(data.get("roll") ?? "").trim(),
    epost: String(data.get("epost") ?? "").trim(),
    telefon: String(data.get("telefon") ?? "").trim(),
    ort: String(data.get("ort") ?? "").trim(),
    fragan: String(data.get("fragan") ?? "").trim(),
    lage: String(data.get("lage") ?? "").trim(),
    situation: String(data.get("situation") ?? "").trim(),
    tydligare: String(data.get("tydligare") ?? "").trim(),
    tidpunkt: String(data.get("tidpunkt") ?? "").trim(),
  };
}

function validateForm(
  data: FormData,
  messages: { emailError: string; fieldRequired: string; selectRequired: string }
): Partial<Record<FieldName, string>> {
  const errors: Partial<Record<FieldName, string>> = {};

  for (const name of REQUIRED_FIELDS) {
    if (name === "epost") continue;
    const value = String(data.get(name) ?? "").trim();
    if (!value) {
      errors[name] =
        name === "fragan" || name === "lage" || name === "tidpunkt"
          ? messages.selectRequired
          : messages.fieldRequired;
    }
  }

  const epost = String(data.get("epost") ?? "").trim();
  if (!epost) {
    errors.epost = messages.fieldRequired;
  } else if (!isValidEmail(epost)) {
    errors.epost = messages.emailError;
  }

  return errors;
}

function validationSummary(
  errors: Partial<Record<FieldName, string>>,
  messages: { emailError: string; generalError: string }
): string {
  const keys = Object.keys(errors) as FieldName[];
  if (keys.length === 1 && errors.epost === messages.emailError) {
    return messages.emailError;
  }
  return messages.generalError;
}

/**
 * TODO: Replace with real submission (e.g. POST /api/contact) when backend exists.
 * Must not claim external delivery until email/CRM integration is wired.
 */
async function submitContactIntake(_payload: ContactIntakePayload): Promise<void> {
  void _payload;
  // Temporary: acknowledge locally only — no mailto, no outbound email yet.
  await Promise.resolve();
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className={sectionLabelClass}>{title}</legend>
      <div className="space-y-7">{children}</div>
    </fieldset>
  );
}

function FieldGroup({
  label,
  htmlFor,
  optional,
  optionalLabel,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  optional?: boolean;
  optionalLabel?: string;
  error?: string;
  children: ReactNode;
}) {
  const errorId = `${htmlFor}-error`;

  return (
    <div className="space-y-2.5">
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
        {optional ? (
          <span className="ml-1 font-normal text-zinc-500">({optionalLabel ?? "valfritt"})</span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p id={errorId} className={errorTextClass} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const selectStyle = { backgroundImage: selectChevron };

export default function ContactIntakeForm() {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname);
  const t = getDictionaryForOptionalLocale(locale);
  const questionOptions =
    locale === "sv"
      ? [
          { value: "Executive coaching", label: "Executive coaching" },
          { value: "Ledningsgruppscoaching", label: "Ledningsgruppscoaching" },
          { value: "Individuell coaching", label: "Individuell coaching" },
          { value: "Teamcoaching", label: "Teamcoaching" },
          { value: "Coachande ledarskap", label: "Coachande ledarskap" },
          {
            value: "Osäker / vill diskutera rätt stöd",
            label: "Osäker / vill diskutera rätt stöd",
          },
        ]
      : [
          { value: "Executive Coaching", label: "Executive Coaching" },
          { value: "Leadership Team Coaching", label: "Leadership Team Coaching" },
          { value: "Individual Coaching", label: "Individual Coaching" },
          { value: "Team Coaching", label: "Team Coaching" },
          { value: "Coaching Leadership", label: "Coaching Leadership" },
          {
            value: "Unsure / want to discuss the right support",
            label: "Unsure / want to discuss the right support",
          },
        ];
  const phaseOptions =
    locale === "sv"
      ? [
          { value: "Strategiskt vägval", label: "Strategiskt vägval" },
          { value: "Oklara prioriteringar", label: "Oklara prioriteringar" },
          { value: "Friktion i ledningen", label: "Friktion i ledningen" },
          { value: "Tillväxt eller omställning", label: "Tillväxt eller omställning" },
          { value: "Tryck från ägare eller styrelse", label: "Tryck från ägare eller styrelse" },
          { value: "Annat", label: "Annat" },
        ]
      : [
          { value: "Strategic crossroads", label: "Strategic crossroads" },
          { value: "Unclear priorities", label: "Unclear priorities" },
          { value: "Leadership team friction", label: "Leadership team friction" },
          { value: "Growth or transition", label: "Growth or transition" },
          { value: "Pressure from owners or board", label: "Pressure from owners or board" },
          { value: "Other", label: "Other" },
        ];
  const timingOptions =
    locale === "sv"
      ? [
          { value: "Så snart som möjligt", label: "Så snart som möjligt" },
          { value: "Inom 1–3 månader", label: "Inom 1–3 månader" },
          { value: "Längre fram", label: "Längre fram" },
        ]
      : [
          { value: "As soon as possible", label: "As soon as possible" },
          { value: "Within 1–3 months", label: "Within 1–3 months" },
          { value: "Later on", label: "Later on" },
        ];
  const [submitState, setSubmitState] = useState<
    "idle" | "submitting" | "success"
  >("idle");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<FieldName, string>>
  >({});
  const [summaryError, setSummaryError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitState === "success" || submitState === "submitting") return;

    const data = new FormData(event.currentTarget);
    const errors = validateForm(data, {
      emailError: t.form.emailError,
      fieldRequired: t.form.fieldRequired,
      selectRequired: t.form.selectRequired,
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setSummaryError(
        validationSummary(errors, {
          emailError: t.form.emailError,
          generalError: t.form.generalError,
        })
      );
      return;
    }

    setFieldErrors({});
    setSummaryError("");
    setSubmitState("submitting");

    try {
      await submitContactIntake(buildPayload(data));
      setSubmitState("success");
    } catch {
      setSummaryError(
        t.form.submitError,
      );
      setSubmitState("idle");
    }
  }

  if (submitState === "success") {
    return (
      <div
        className="max-w-md border border-zinc-300/55 bg-zinc-900/[0.02] px-6 py-8"
        role="status"
        aria-live="polite"
      >
        <p className="text-[1.0625rem] leading-[1.7] text-zinc-800">
          {t.form.successMessage}
        </p>
      </div>
    );
  }

  const err = (name: FieldName) => fieldErrors[name];

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-14"
      noValidate
      aria-label={t.form.ariaLabel}
    >
      <FormSection title={t.form.sections.contact}>
        <div className="grid gap-7 md:grid-cols-2 md:gap-x-10">
          <FieldGroup label={t.form.fields.name} htmlFor="namn" error={err("namn")}>
            <input
              id="namn"
              name="namn"
              type="text"
              autoComplete="name"
              aria-invalid={Boolean(err("namn"))}
              aria-describedby={err("namn") ? "namn-error" : undefined}
              className={withFieldState(fieldClassBase, Boolean(err("namn")))}
            />
          </FieldGroup>
          <FieldGroup
            label={t.form.fields.organization}
            htmlFor="organisation"
            error={err("organisation")}
          >
            <input
              id="organisation"
              name="organisation"
              type="text"
              autoComplete="organization"
              aria-invalid={Boolean(err("organisation"))}
              aria-describedby={
                err("organisation") ? "organisation-error" : undefined
              }
              className={withFieldState(
                fieldClassBase,
                Boolean(err("organisation")),
              )}
            />
          </FieldGroup>
        </div>

        <div className="grid gap-7 md:grid-cols-2 md:gap-x-10">
          <FieldGroup label={t.form.fields.role} htmlFor="roll" error={err("roll")}>
            <input
              id="roll"
              name="roll"
              type="text"
              autoComplete="organization-title"
              aria-invalid={Boolean(err("roll"))}
              aria-describedby={err("roll") ? "roll-error" : undefined}
              className={withFieldState(fieldClassBase, Boolean(err("roll")))}
            />
          </FieldGroup>
          <FieldGroup label={t.form.fields.email} htmlFor="epost" error={err("epost")}>
            <input
              id="epost"
              name="epost"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(err("epost"))}
              aria-describedby={err("epost") ? "epost-error" : undefined}
              className={withFieldState(fieldClassBase, Boolean(err("epost")))}
            />
          </FieldGroup>
        </div>

        <div className="grid gap-7 md:grid-cols-2 md:gap-x-10">
          <FieldGroup label={t.form.fields.phone} htmlFor="telefon" optional optionalLabel={t.form.optional}>
            <input
              id="telefon"
              name="telefon"
              type="tel"
              autoComplete="tel"
              className={withFieldState(fieldClassBase, false)}
            />
          </FieldGroup>
          <FieldGroup label={t.form.fields.city} htmlFor="ort" optional optionalLabel={t.form.optional}>
            <input
              id="ort"
              name="ort"
              type="text"
              autoComplete="address-level2"
              className={withFieldState(fieldClassBase, false)}
            />
          </FieldGroup>
        </div>
      </FormSection>

      <FormSection title={t.form.sections.situation}>
        <div className="grid gap-7 md:grid-cols-2 md:gap-x-10">
          <FieldGroup
            label={t.form.fields.question}
            htmlFor="fragan"
            error={err("fragan")}
          >
            <select
              id="fragan"
              name="fragan"
              defaultValue=""
              aria-invalid={Boolean(err("fragan"))}
              aria-describedby={err("fragan") ? "fragan-error" : undefined}
              className={withFieldState(selectClassBase, Boolean(err("fragan")))}
              style={selectStyle}
            >
              <option value="" disabled className="text-zinc-500">
                {locale === "sv" ? "Välj typ av stöd" : "Select type of support"}
              </option>
              {questionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FieldGroup>
          <FieldGroup
            label={t.form.fields.phase}
            htmlFor="lage"
            error={err("lage")}
          >
            <select
              id="lage"
              name="lage"
              defaultValue=""
              aria-invalid={Boolean(err("lage"))}
              aria-describedby={err("lage") ? "lage-error" : undefined}
              className={withFieldState(selectClassBase, Boolean(err("lage")))}
              style={selectStyle}
            >
              <option value="" disabled className="text-zinc-500">
                {locale === "sv" ? "Välj läge" : "Select situation"}
              </option>
              {phaseOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FieldGroup>
        </div>

        <FieldGroup
          label={t.form.fields.situation}
          htmlFor="situation"
          error={err("situation")}
        >
          <textarea
            id="situation"
            name="situation"
            aria-invalid={Boolean(err("situation"))}
            aria-describedby={err("situation") ? "situation-error" : undefined}
            className={withFieldState(
              textareaClassBase,
              Boolean(err("situation")),
              true,
            )}
          />
        </FieldGroup>

        <FieldGroup
          label={t.form.fields.clarity}
          htmlFor="tydligare"
          error={err("tydligare")}
        >
          <textarea
            id="tydligare"
            name="tydligare"
            aria-invalid={Boolean(err("tydligare"))}
            aria-describedby={err("tydligare") ? "tydligare-error" : undefined}
            className={withFieldState(
              textareaClassBase,
              Boolean(err("tydligare")),
              true,
            )}
          />
        </FieldGroup>
      </FormSection>

      <FormSection title={t.form.sections.nextStep}>
        <div className="md:max-w-md">
          <FieldGroup
            label={t.form.fields.timing}
            htmlFor="tidpunkt"
            error={err("tidpunkt")}
          >
            <select
              id="tidpunkt"
              name="tidpunkt"
              defaultValue=""
              aria-invalid={Boolean(err("tidpunkt"))}
              aria-describedby={err("tidpunkt") ? "tidpunkt-error" : undefined}
              className={withFieldState(
                selectClassBase,
                Boolean(err("tidpunkt")),
              )}
              style={selectStyle}
            >
              <option value="" disabled className="text-zinc-500">
                {locale === "sv" ? "Välj tidshorisont" : "Select timeframe"}
              </option>
              {timingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FieldGroup>
        </div>
      </FormSection>

      <div className="border-t border-zinc-300/45 pt-10">
        <div className="max-w-md space-y-5">
          <p className="text-sm leading-[1.7] text-zinc-600">
            {locale === "sv"
              ? "All kontakt hanteras konfidentiellt. Första samtalet används för att förstå läget och avgöra om CVB Coaching är rätt stöd."
              : "All contact is handled confidentially. The first conversation is used to understand your situation and determine whether CVB Coaching is the right support."}
          </p>

          {summaryError ? (
            <p className={errorTextClass} role="alert" aria-live="polite">
              {summaryError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitState === "submitting"}
            className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-7 py-3.5 text-sm font-medium tracking-wide text-zinc-50 transition duration-150 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f6f4] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitState === "submitting" ? t.form.submit.submitting : t.form.submit.idle}
          </button>
        </div>
      </div>
    </form>
  );
}
