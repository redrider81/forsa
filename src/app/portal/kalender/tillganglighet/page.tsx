import CalendarSubnav from "@/components/portal/calendar-subnav";
import AvailabilityManager from "@/components/portal/availability-manager";
import { readCoachSession } from "@/lib/portal/session";
import { todayIso } from "@/lib/portal/format";
import {
  getBookingSettings,
  getPreviewSlots,
  listAvailabilityExceptions,
  listAvailabilityRules,
} from "@/lib/portal/availability";
import { PageHeading, portalPageStackClass } from "@/components/portal/ui";

export default async function TillganglighetPage() {
  const session = await readCoachSession();
  if (!session) return null;

  const settings = await getBookingSettings(session.coachId);
  if (!settings) return null;

  const [rules, exceptions] = await Promise.all([listAvailabilityRules(), listAvailabilityExceptions()]);

  const today = new Date(`${todayIso()}T00:00:00Z`);
  const previewEnd = new Date(today);
  previewEnd.setUTCDate(previewEnd.getUTCDate() + 14);
  const previewSlots = await getPreviewSlots(
    settings.publicSlug,
    todayIso(),
    previewEnd.toISOString().slice(0, 10),
  );

  return (
    <div className={portalPageStackClass}>
      <div>
        <PageHeading title="Planerade insatser" />
        <p className="mt-3.5 text-[0.875rem] leading-relaxed text-zinc-500">
          Styr vilka tider kunder kan boka direkt på cvbcoaching.se.
        </p>
        <div className="mt-5">
          <CalendarSubnav active="tillganglighet" />
        </div>
      </div>

      <AvailabilityManager
        initialRules={rules}
        initialExceptions={exceptions}
        initialSettings={settings}
        previewSlots={previewSlots.slice(0, 12)}
      />
    </div>
  );
}
