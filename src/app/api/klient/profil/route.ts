import { getClient, getCoach } from "@/lib/portal/repository";
import { readClientSession } from "@/lib/portal/session";
import { updateDemoState } from "@/lib/portal/store/demo-store";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Klienten uppdaterar namn, roll och kontaktuppgifter i sin profil.
 * Organisation och coachningsöverenskommelse ändras inte här.
 */
export async function POST(request: Request) {
  const session = await readClientSession();
  if (!session) {
    return Response.json({ ok: false, error: "Sessionen har gått ut. Logga in igen." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const { name, role, email, phone } = (body ?? {}) as Record<string, unknown>;

  if (
    typeof name !== "string" ||
    typeof role !== "string" ||
    typeof email !== "string" ||
    typeof phone !== "string"
  ) {
    return Response.json({ ok: false, error: "Ogiltig profil." }, { status: 400 });
  }

  const trimmedName = name.trim().slice(0, 80);
  const trimmedRole = role.trim().slice(0, 120);
  const trimmedEmail = email.trim().slice(0, 120).toLowerCase();
  const trimmedPhone = phone.trim().slice(0, 40);

  if (trimmedName.length < 2) {
    return Response.json({ ok: false, error: "Ange ditt namn." }, { status: 400 });
  }

  if (trimmedRole.length < 2) {
    return Response.json({ ok: false, error: "Ange din roll eller titel." }, { status: 400 });
  }

  if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
    return Response.json({ ok: false, error: "Ange en giltig e-postadress." }, { status: 400 });
  }

  const coach = getCoach();
  if (!getClient(coach.id, session.clientId)) {
    return Response.json({ ok: false, error: "Profilen kunde inte hittas." }, { status: 403 });
  }

  await updateDemoState((state) => ({
    ...state,
    profile: {
      ...state.profile,
      [session.clientId]: {
        name: trimmedName,
        role: trimmedRole,
        email: trimmedEmail,
        phone: trimmedPhone,
        updatedAt: new Date().toISOString(),
      },
    },
  }));

  return Response.json({ ok: true });
}
