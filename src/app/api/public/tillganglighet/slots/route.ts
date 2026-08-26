import { createSupabaseServerClient } from "@/lib/supabase/server";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Public, unauthenticated: returns only bookable date/start/end timestamps
 * for the given coach slug. No internal calendar data ever reaches this
 * response — the database function is the only thing that reads it.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug") ?? "";
  const start = url.searchParams.get("start") ?? "";
  const end = url.searchParams.get("end") ?? "";

  if (!slug || !DATE_RE.test(start) || !DATE_RE.test(end)) {
    return Response.json({ ok: false, error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_public_booking_slots", {
    p_slug: slug,
    p_start_date: start,
    p_end_date: end,
  });

  if (error) {
    return Response.json({ ok: false, error: "Kunde inte hämta lediga tider." }, { status: 502 });
  }

  const slots = (data ?? []).map((row) => ({ date: row.date, startAt: row.start_at, endAt: row.end_at }));
  return Response.json({ ok: true, slots });
}
