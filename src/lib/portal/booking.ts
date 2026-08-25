import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type BookingRole = "coach" | "klient";
export type BookingStatus = "pending" | "accepted" | "declined" | "cancelled";

export type BookingRequest = {
  id: string;
  clientId: string;
  clientName?: string;
  requestedByRole: BookingRole;
  date: string;
  time: string;
  durationMinutes: number;
  location: string;
  message: string | null;
  status: BookingStatus;
  sessionId: string | null;
  createdAt: string;
  respondedAt: string | null;
};

function toBooking(row: Record<string, unknown>): BookingRequest {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    clientName: (row.clients as { name?: string } | null)?.name,
    requestedByRole: row.requested_by_role as BookingRole,
    date: row.date as string,
    time: row.time as string,
    durationMinutes: row.duration_minutes as number,
    location: row.location as string,
    message: (row.message as string | null) ?? null,
    status: row.status as BookingStatus,
    sessionId: (row.session_id as string | null) ?? null,
    createdAt: row.created_at as string,
    respondedAt: (row.responded_at as string | null) ?? null,
  };
}

/** Väntande bokningsförfrågningar för Carolinas samtliga klienter. RLS begränsar till hennes egna. */
export async function listPendingCoachBookings(): Promise<BookingRequest[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("session_booking_requests")
    .select("*, clients(name)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  return (data ?? []).map(toBooking);
}

/** Väntande bokningsförfrågningar för en specifik klient. RLS begränsar klienten till sina egna. */
export async function listPendingClientBookings(clientId: string): Promise<BookingRequest[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("session_booking_requests")
    .select("*")
    .eq("client_id", clientId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  return (data ?? []).map(toBooking);
}
