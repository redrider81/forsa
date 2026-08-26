import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AvailabilityRule = {
  id: string;
  weekday: number; // 1 = Monday .. 7 = Sunday
  startTime: string; // "HH:MM"
  endTime: string;
};

export type AvailabilityExceptionType = "unavailable" | "custom";

export type AvailabilityException = {
  id: string;
  date: string; // ISO date
  type: AvailabilityExceptionType;
  startTime: string | null;
  endTime: string | null;
};

export type BookingSettings = {
  meetingDurationMinutes: number;
  bufferMinutes: number;
  minimumNoticeHours: number;
  bookingHorizonDays: number;
  timezone: string;
  publicBookingEnabled: boolean;
  publicSlug: string;
};

export type PublicBookingRequest = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  requestedStartAt: string;
  requestedEndAt: string;
  status: "pending" | "accepted" | "declined" | "cancelled";
  createdAt: string;
  respondedAt: string | null;
};

export type PublicSlot = { date: string; startAt: string; endAt: string };

function toTime(value: string): string {
  return value.slice(0, 5);
}

export async function listAvailabilityRules(): Promise<AvailabilityRule[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("coach_availability_rules")
    .select("*")
    .order("weekday", { ascending: true })
    .order("start_time", { ascending: true });
  return (data ?? []).map((row) => ({
    id: row.id,
    weekday: row.weekday,
    startTime: toTime(row.start_time),
    endTime: toTime(row.end_time),
  }));
}

export async function addAvailabilityRule(input: {
  coachId: string;
  weekday: number;
  startTime: string;
  endTime: string;
}): Promise<AvailabilityRule | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("coach_availability_rules")
    .insert({ coach_id: input.coachId, weekday: input.weekday, start_time: input.startTime, end_time: input.endTime })
    .select("*")
    .single();
  if (error || !data) return null;
  return { id: data.id, weekday: data.weekday, startTime: toTime(data.start_time), endTime: toTime(data.end_time) };
}

export async function deleteAvailabilityRule(ruleId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("coach_availability_rules").delete().eq("id", ruleId);
  return !error;
}

function toExceptionType(value: string): AvailabilityExceptionType {
  if (value === "unavailable" || value === "custom") return value;
  throw new Error(`Unexpected availability exception type: ${value}`);
}

export async function listAvailabilityExceptions(): Promise<AvailabilityException[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("coach_availability_exceptions").select("*").order("date", { ascending: true });
  return (data ?? []).map((row) => ({
    id: row.id,
    date: row.date,
    type: toExceptionType(row.type),
    startTime: row.start_time ? toTime(row.start_time) : null,
    endTime: row.end_time ? toTime(row.end_time) : null,
  }));
}

export async function addAvailabilityException(input: {
  coachId: string;
  date: string;
  type: AvailabilityExceptionType;
  startTime?: string | null;
  endTime?: string | null;
}): Promise<AvailabilityException | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("coach_availability_exceptions")
    .insert({
      coach_id: input.coachId,
      date: input.date,
      type: input.type,
      start_time: input.type === "custom" ? input.startTime : null,
      end_time: input.type === "custom" ? input.endTime : null,
    })
    .select("*")
    .single();
  if (error || !data) return null;
  return {
    id: data.id,
    date: data.date,
    type: toExceptionType(data.type),
    startTime: data.start_time ? toTime(data.start_time) : null,
    endTime: data.end_time ? toTime(data.end_time) : null,
  };
}

export async function deleteAvailabilityException(exceptionId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("coach_availability_exceptions").delete().eq("id", exceptionId);
  return !error;
}

export async function getBookingSettings(coachId: string): Promise<BookingSettings | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("coach_booking_settings").select("*").eq("coach_id", coachId).maybeSingle();
  if (error || !data) return null;
  return {
    meetingDurationMinutes: data.meeting_duration_minutes,
    bufferMinutes: data.buffer_minutes,
    minimumNoticeHours: data.minimum_notice_hours,
    bookingHorizonDays: data.booking_horizon_days,
    timezone: data.timezone,
    publicBookingEnabled: data.public_booking_enabled,
    publicSlug: data.public_slug,
  };
}

export async function updateBookingSettings(
  coachId: string,
  input: Partial<{
    meetingDurationMinutes: number;
    bufferMinutes: number;
    minimumNoticeHours: number;
    bookingHorizonDays: number;
    publicBookingEnabled: boolean;
  }>,
): Promise<BookingSettings | null> {
  const supabase = await createSupabaseServerClient();
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.meetingDurationMinutes !== undefined) patch.meeting_duration_minutes = input.meetingDurationMinutes;
  if (input.bufferMinutes !== undefined) patch.buffer_minutes = input.bufferMinutes;
  if (input.minimumNoticeHours !== undefined) patch.minimum_notice_hours = input.minimumNoticeHours;
  if (input.bookingHorizonDays !== undefined) patch.booking_horizon_days = input.bookingHorizonDays;
  if (input.publicBookingEnabled !== undefined) patch.public_booking_enabled = input.publicBookingEnabled;

  const { data, error } = await supabase
    .from("coach_booking_settings")
    .update(patch)
    .eq("coach_id", coachId)
    .select("*")
    .single();
  if (error || !data) return null;
  return {
    meetingDurationMinutes: data.meeting_duration_minutes,
    bufferMinutes: data.buffer_minutes,
    minimumNoticeHours: data.minimum_notice_hours,
    bookingHorizonDays: data.booking_horizon_days,
    timezone: data.timezone,
    publicBookingEnabled: data.public_booking_enabled,
    publicSlug: data.public_slug,
  };
}

export async function listPendingPublicBookingRequests(): Promise<PublicBookingRequest[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("public_booking_requests")
    .select("*")
    .eq("status", "pending")
    .order("requested_start_at", { ascending: true });
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    requestedStartAt: row.requested_start_at,
    requestedEndAt: row.requested_end_at,
    status: row.status as PublicBookingRequest["status"],
    createdAt: row.created_at,
    respondedAt: row.responded_at,
  }));
}

export async function respondToPublicBookingRequest(
  requestId: string,
  action: "accept" | "decline",
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("respond_public_booking_request", { p_request_id: requestId, p_action: action });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function getPreviewSlots(slug: string, startDate: string, endDate: string): Promise<PublicSlot[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.rpc("get_public_booking_slots", {
    p_slug: slug,
    p_start_date: startDate,
    p_end_date: endDate,
  });
  return (data ?? []).map((row) => ({ date: row.date, startAt: row.start_at, endAt: row.end_at }));
}
