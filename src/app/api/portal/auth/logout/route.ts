import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  // Ett fel betyder att utloggningen inte kunde bekräftas hos Supabase (den
  // lokala sessionen kan ändå redan vara rensad). Svara därför med fel, inte
  // ett skenbart ok; ett nytt försök utan session lyckas och leder vidare.
  const { error } = await supabase.auth.signOut();
  if (error) {
    return Response.json({ ok: false, error: "Utloggningen misslyckades." }, { status: 502 });
  }
  return Response.json({ ok: true });
}
