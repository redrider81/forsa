import { readCoachSession } from "@/lib/portal/session";
import { eraseSpecialCategoryContent } from "@/lib/portal/special-category-consent";

/**
 * Carolina carries out a client's erasure request after a withdrawn
 * article 9 consent. Coach-only; the database checks ownership and that an
 * open request exists, and erases exactly the restricted content.
 */
export async function POST(_request: Request, { params }: { params: Promise<{ clientId: string }> }) {
  const session = await readCoachSession();
  if (!session) {
    return Response.json({ ok: false, error: "Sessionen har gått ut. Logga in igen." }, { status: 401 });
  }

  const { clientId } = await params;
  const result = await eraseSpecialCategoryContent(clientId);
  if (!result.ok) {
    const noRequest = result.error.includes("NO_OPEN_ERASURE_REQUEST");
    return Response.json(
      { ok: false, error: noRequest ? "Det finns ingen öppen begäran om radering." : "Raderingen kunde inte genomföras." },
      { status: noRequest ? 409 : 502 },
    );
  }
  return Response.json({ ok: true });
}
