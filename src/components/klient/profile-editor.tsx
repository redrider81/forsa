"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  Card,
  CardTitle,
  Label,
  klientButtonClass,
  klientButtonSmClass,
} from "@/components/klient/klient-ui";

type ProfileValues = {
  name: string;
  role: string;
  email: string;
  phone: string;
  organisation: string;
};

const fieldClass =
  "mt-1 block w-full rounded-xl border border-[#e6e0d3] bg-[var(--klient-text-block-bg)] px-4 py-3 text-[0.9375rem] leading-[1.5] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/15";

const labelClass = "text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-zinc-400";

function ProfileField({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="py-3.5 first:pt-0 last:pb-0">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function ProfileEditor({ initial }: { initial: ProfileValues }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function cancel() {
    setValues(initial);
    setError(null);
    setEditing(false);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/klient/profil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          role: values.role,
          email: values.email,
          phone: values.phone,
        }),
      });
      const data = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setError(data.error ?? "Det gick inte att spara profilen.");
        return;
      }
      setEditing(false);
      router.refresh();
    } catch {
      setError("Det gick inte att nå tjänsten just nu. Försök igen.");
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <Card>
        <Label>Profil</Label>
        <CardTitle>{initial.name}</CardTitle>
        <p className="mt-2 text-[0.875rem] leading-relaxed text-zinc-500">
          {initial.role} · {initial.organisation}
        </p>

        <dl className="mt-5 divide-y divide-[#ece7dc]">
          {initial.email ? (
            <div className="py-3.5 first:pt-0">
              <dt className={labelClass}>E-post</dt>
              <dd className="mt-1 text-[0.9375rem] text-zinc-700">
                <a href={`mailto:${initial.email}`} className="underline-offset-2 hover:underline">
                  {initial.email}
                </a>
              </dd>
            </div>
          ) : null}
          {initial.phone ? (
            <div className="py-3.5">
              <dt className={labelClass}>Telefon</dt>
              <dd className="mt-1 text-[0.9375rem] text-zinc-700">
                <a href={`tel:${initial.phone.replace(/\s+/g, "")}`} className="underline-offset-2 hover:underline">
                  {initial.phone}
                </a>
              </dd>
            </div>
          ) : null}
        </dl>

        <button
          type="button"
          onClick={() => {
            setValues(initial);
            setError(null);
            setEditing(true);
          }}
          className={`mt-5 ${klientButtonSmClass}`}
        >
          Redigera profil
        </button>
      </Card>
    );
  }

  return (
    <Card>
      <Label>Profil</Label>
      <CardTitle>Redigera uppgifter</CardTitle>

      <div className="mt-5 divide-y divide-[#ece7dc]">
        <ProfileField id="profile-name" label="Namn">
          <input
            id="profile-name"
            type="text"
            value={values.name}
            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
            autoComplete="name"
            className={fieldClass}
          />
        </ProfileField>

        <ProfileField id="profile-role" label="Roll">
          <input
            id="profile-role"
            type="text"
            value={values.role}
            onChange={(event) => setValues((current) => ({ ...current, role: event.target.value }))}
            autoComplete="organization-title"
            className={fieldClass}
          />
        </ProfileField>

        <ProfileField id="profile-email" label="E-post">
          <input
            id="profile-email"
            type="email"
            value={values.email}
            onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
            autoComplete="email"
            className={fieldClass}
          />
        </ProfileField>

        <ProfileField id="profile-phone" label="Telefon">
          <input
            id="profile-phone"
            type="tel"
            value={values.phone}
            onChange={(event) => setValues((current) => ({ ...current, phone: event.target.value }))}
            autoComplete="tel"
            placeholder="Valfritt"
            className={fieldClass}
          />
        </ProfileField>

        <div className="py-3.5">
          <p className={labelClass}>Organisation</p>
          <p className="mt-1 text-[0.9375rem] leading-relaxed text-zinc-700">{initial.organisation}</p>
          <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-zinc-500">
            Organisationen kan inte ändras här. Kontakta Carolina om något behöver uppdateras.
          </p>
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-4 text-[0.8125rem] text-zinc-700">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3 border-t border-[#ece7dc] pt-5">
        <button type="button" disabled={saving} onClick={() => void save()} className={klientButtonClass}>
          {saving ? "Sparar…" : "Spara profil"}
        </button>
        <button type="button" disabled={saving} onClick={cancel} className={klientButtonSmClass}>
          Avbryt
        </button>
      </div>
    </Card>
  );
}
