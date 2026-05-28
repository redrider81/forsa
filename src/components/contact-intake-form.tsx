"use client";

import { type FormEvent, type ReactNode, useState } from "react";

const selectChevron = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2352525b' stroke-width='1.25' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`;

const GENERAL_ERROR =
  "Fyll i de obligatoriska fälten innan du skickar förfrågan.";
const EMAIL_ERROR = "Ange en giltig e-postadress.";
const FIELD_REQUIRED = "Detta fält är obligatoriskt.";
const SELECT_REQUIRED = "Välj ett alternativ.";
const SUCCESS_MESSAGE =
  "Tack. Din förfrågan har tagits emot. Forsa återkommer när läget har bedömts.";

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
    fragan: String(data.get("fragan") ?? "").trim(),
    lage: String(data.get("lage") ?? "").trim(),
    situation: String(data.get("situation") ?? "").trim(),
    tydligare: String(data.get("tydligare") ?? "").trim(),
    tidpunkt: String(data.get("tidpunkt") ?? "").trim(),
  };
}

function validateForm(data: FormData): Partial<Record<FieldName, string>> {
  const errors: Partial<Record<FieldName, string>> = {};

  for (const name of REQUIRED_FIELDS) {
    if (name === "epost") continue;
    const value = String(data.get(name) ?? "").trim();
    if (!value) {
      errors[name] =
        name === "fragan" || name === "lage" || name === "tidpunkt"
          ? SELECT_REQUIRED
          : FIELD_REQUIRED;
    }
  }

  const epost = String(data.get("epost") ?? "").trim();
  if (!epost) {
    errors.epost = FIELD_REQUIRED;
  } else if (!isValidEmail(epost)) {
    errors.epost = EMAIL_ERROR;
  }

  return errors;
}

function validationSummary(
  errors: Partial<Record<FieldName, string>>,
): string {
  const keys = Object.keys(errors) as FieldName[];
  if (keys.length === 1 && errors.epost === EMAIL_ERROR) {
    return EMAIL_ERROR;
  }
  return GENERAL_ERROR;
}

/**
 * TODO: Replace with real submission (e.g. POST /api/contact) when backend exists.
 * Must not claim external delivery until email/CRM integration is wired.
 */
async function submitContactIntake(_payload: ContactIntakePayload): Promise<void> {
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
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  optional?: boolean;
  error?: string;
  children: ReactNode;
}) {
  const errorId = `${htmlFor}-error`;

  return (
    <div className="space-y-2.5">
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
        {optional ? (
          <span className="ml-1 font-normal text-zinc-500">(valfritt)</span>
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
    const errors = validateForm(data);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setSummaryError(validationSummary(errors));
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
        "Förfrågan kunde inte skickas just nu. Försök igen om en stund.",
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
          {SUCCESS_MESSAGE}
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
      aria-label="Kontaktformulär"
    >
      <FormSection title="Kontaktuppgifter">
        <div className="grid gap-7 md:grid-cols-2 md:gap-x-10">
          <FieldGroup label="Namn" htmlFor="namn" error={err("namn")}>
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
            label="Organisation"
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
          <FieldGroup label="Roll" htmlFor="roll" error={err("roll")}>
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
          <FieldGroup label="E-post" htmlFor="epost" error={err("epost")}>
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

        <div className="md:max-w-[calc(50%-1.25rem)]">
          <FieldGroup label="Telefon" htmlFor="telefon" optional>
            <input
              id="telefon"
              name="telefon"
              type="tel"
              autoComplete="tel"
              className={withFieldState(fieldClassBase, false)}
            />
          </FieldGroup>
        </div>
      </FormSection>

      <FormSection title="Situation">
        <div className="grid gap-7 md:grid-cols-2 md:gap-x-10">
          <FieldGroup
            label="Vad gäller frågan?"
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
                Välj typ av stöd
              </option>
              <option value="Ledningsgruppscoaching">Ledningsgruppscoaching</option>
              <option value="Executive coaching">Executive coaching</option>
              <option value="Team coaching">Team coaching</option>
              <option value="Coachande ledarskap">Coachande ledarskap</option>
              <option value="Osäker / vill diskutera rätt stöd">
                Osäker / vill diskutera rätt stöd
              </option>
            </select>
          </FieldGroup>
          <FieldGroup
            label="Vilket läge står ni i?"
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
                Välj läge
              </option>
              <option value="Strategiskt vägval">Strategiskt vägval</option>
              <option value="Oklara prioriteringar">Oklara prioriteringar</option>
              <option value="Friktion i ledningen">Friktion i ledningen</option>
              <option value="Tillväxt eller omställning">Tillväxt eller omställning</option>
              <option value="Tryck från ägare eller styrelse">
                Tryck från ägare eller styrelse
              </option>
              <option value="Annat">Annat</option>
            </select>
          </FieldGroup>
        </div>

        <FieldGroup
          label="Beskriv kort situationen"
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
          label="Vad behöver bli tydligare?"
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

      <FormSection title="Nästa steg">
        <div className="md:max-w-md">
          <FieldGroup
            label="När vill ni komma vidare?"
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
                Välj tidshorisont
              </option>
              <option value="Så snart som möjligt">Så snart som möjligt</option>
              <option value="Inom 1–3 månader">Inom 1–3 månader</option>
              <option value="Längre fram">Längre fram</option>
            </select>
          </FieldGroup>
        </div>
      </FormSection>

      <div className="border-t border-zinc-300/45 pt-10">
        <div className="max-w-md space-y-5">
          <p className="text-sm leading-[1.7] text-zinc-600">
            All kontakt hanteras konfidentiellt. Första samtalet används för att
            förstå läget och avgöra om Forsa är rätt stöd.
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
            {submitState === "submitting" ? "Skickar…" : "Skicka förfrågan"}
          </button>
        </div>
      </div>
    </form>
  );
}
