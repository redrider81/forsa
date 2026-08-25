"use client";

import type { CoachingSession, Commitment } from "@/lib/portal/types";

function getWeekYear(date: Date): { week: number; year: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const year = d.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { week, year };
}

export function ExecutiveKPIStrip({
  completedCount,
  commitmentCompletedPct,
  clientsWithNextSession,
  totalActiveClients,
  pendingBookingsCount,
}: {
  completedCount: number;
  commitmentCompletedPct: number;
  clientsWithNextSession: number;
  totalActiveClients: number;
  pendingBookingsCount: number;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-200 rounded-lg overflow-hidden">
      <div className="bg-white px-4 py-5 min-w-0">
        <div className="text-[0.6875rem] font-semibold uppercase tracking-widest text-zinc-500">Genomförda</div>
        <div className="mt-2 text-[1.75rem] font-bold text-zinc-900">{completedCount}</div>
        <div className="mt-1 text-[0.8125rem] text-zinc-600">senaste 30 dagar</div>
      </div>
      <div className="bg-white px-4 py-5 min-w-0">
        <div className="text-[0.6875rem] font-semibold uppercase tracking-widest text-zinc-500">Åtaganden</div>
        <div className="mt-2 text-[1.75rem] font-bold text-green-600">{commitmentCompletedPct}%</div>
        <div className="mt-1 text-[0.8125rem] text-zinc-600">genomförda</div>
      </div>
      <div className="bg-white px-4 py-5 min-w-0">
        <div className="text-[0.6875rem] font-semibold uppercase tracking-widest text-zinc-500">Nästa session</div>
        <div className="mt-2 text-[1.75rem] font-bold text-zinc-900">
          {clientsWithNextSession}/{totalActiveClients}
        </div>
        <div className="mt-1 text-[0.8125rem] text-zinc-600">bokad</div>
      </div>
      <div className="bg-white px-4 py-5 min-w-0">
        <div className="text-[0.6875rem] font-semibold uppercase tracking-widest text-zinc-500">Väntar</div>
        <div className="mt-2 text-[1.75rem] font-bold text-zinc-900">{pendingBookingsCount}</div>
        <div className="mt-1 text-[0.8125rem] text-zinc-600">på svar</div>
      </div>
    </div>
  );
}

export function PrimaryAnalyticsZone({
  allSessions,
  allCommitments,
  activeClientsLast30,
  clientsWithFutureSessions,
  today,
}: {
  allSessions: CoachingSession[];
  allCommitments: Commitment[];
  activeClientsLast30: number;
  clientsWithFutureSessions: number;
  today: string;
}) {
  const twelveWeeksAgo = new Date();
  twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

  const completedSessions = allSessions.filter(
    (s) => s.status === "genomford" && new Date(s.date) >= twelveWeeksAgo && new Date(s.date) <= new Date(today)
  );

  const weekCounts: Record<string, number> = {};
  completedSessions.forEach((session) => {
    const { week, year } = getWeekYear(new Date(session.date));
    const key = `${year}-w${week}`;
    weekCounts[key] = (weekCounts[key] || 0) + 1;
  });

  const weeks = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    const { week, year } = getWeekYear(d);
    weeks.unshift({ week, year, key: `${year}-w${week}`, count: weekCounts[`${year}-w${week}`] || 0 });
  }

  const recent4 = weeks.slice(-4).reduce((sum, w) => sum + w.count, 0);
  const previous4 = weeks.slice(0, 4).reduce((sum, w) => sum + w.count, 0);
  const trendPercent = previous4 === 0 ? null : Math.round(((recent4 - previous4) / previous4) * 100);

  const commitmentStatus = {
    genomfort: allCommitments.filter((c) => c.status === "genomfort").length,
    pagar: allCommitments.filter((c) => c.status === "pagar").length,
    oppet: allCommitments.filter((c) => c.status === "oppet").length,
  };

  const maxSessionsInWeek = Math.max(...weeks.map((w) => w.count), 5);
  const clientsWithoutFuture = activeClientsLast30 - clientsWithFutureSessions;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      <div className="lg:col-span-2 border border-zinc-200/80 rounded-lg p-6 bg-white">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Coachingaktivitet</h3>
            <p className="mt-1 text-[0.8125rem] text-zinc-500">Senaste 12 veckorna</p>
          </div>
        </div>

        {weeks.some((w) => w.count > 0) ? (
          <>
            <div className="flex items-end gap-1 h-32 mb-6">
              {weeks.map((week) => (
                <div key={week.key} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full flex items-end justify-center" style={{ height: `${Math.max((week.count / maxSessionsInWeek) * 100, 4)}px` }}>
                    <div className="w-full bg-zinc-700 rounded-sm" style={{ height: "100%" }} />
                  </div>
                  <span className="text-[0.7rem] text-zinc-400 font-medium">v. {week.week}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-200/80 pt-4">
              {trendPercent !== null && (
                <div className="text-[0.9375rem] font-medium mb-2">
                  {trendPercent > 0 ? (
                    <span className="text-green-600">
                      ↑ +{trendPercent}% mot föregående period
                    </span>
                  ) : trendPercent < 0 ? (
                    <span className="text-red-600">
                      ↓ {trendPercent}% mot föregående period
                    </span>
                  ) : (
                    <span className="text-zinc-600">
                      → Oförändrat mot föregående period
                    </span>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="text-[0.9375rem] text-zinc-500 py-8 text-center">Ingen genomförd coachingaktivitet registrerad under perioden.</p>
        )}
      </div>

      <div className="border border-zinc-200/80 rounded-lg p-6 bg-white">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 mb-6">Coachingstatus</h3>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[0.9375rem] font-medium text-zinc-700">Nästa session bokad</span>
              <span className="text-[0.9375rem] font-bold text-zinc-900">{clientsWithFutureSessions}/{activeClientsLast30}</span>
            </div>
            <div className="h-1.5 bg-zinc-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600"
                style={{ width: `${activeClientsLast30 > 0 ? (clientsWithFutureSessions / activeClientsLast30) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-200/80 space-y-2">
            <div className="flex items-center justify-between text-[0.8625rem]">
              <span className="text-zinc-600">Aktiva klienter</span>
              <span className="font-semibold text-green-600">{activeClientsLast30}</span>
            </div>
            <div className="flex items-center justify-between text-[0.8625rem]">
              <span className="text-zinc-600">Behöver planeras</span>
              <span className="font-semibold text-amber-600">{clientsWithoutFuture}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ManagementAnalyticsZone({ allCommitments }: { allCommitments: Commitment[] }) {
  const commitmentStatus = {
    genomfort: allCommitments.filter((c) => c.status === "genomfort").length,
    pagar: allCommitments.filter((c) => c.status === "pagar").length,
    oppet: allCommitments.filter((c) => c.status === "oppet").length,
  };
  const totalCommitments = commitmentStatus.genomfort + commitmentStatus.pagar + commitmentStatus.oppet;

  if (totalCommitments === 0) return null;

  return (
    <div className="border border-zinc-200/80 rounded-lg p-6 bg-white">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 mb-6">Åtagandestatus</h3>

      <div className="mb-5">
        <div className="flex h-2 gap-px bg-zinc-200 rounded-full overflow-hidden">
          <div className="bg-green-600" style={{ width: `${(commitmentStatus.genomfort / totalCommitments) * 100}%` }} />
          <div className="bg-amber-600" style={{ width: `${(commitmentStatus.pagar / totalCommitments) * 100}%` }} />
          <div className="bg-zinc-300" style={{ width: `${(commitmentStatus.oppet / totalCommitments) * 100}%` }} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-[0.8625rem]">
          <span className="text-zinc-600">Genomförda</span>
          <span className="font-semibold text-green-600">{commitmentStatus.genomfort}</span>
          <span className="text-zinc-400">{Math.round((commitmentStatus.genomfort / totalCommitments) * 100)}%</span>
        </div>
        <div className="flex items-center justify-between text-[0.8625rem]">
          <span className="text-zinc-600">Pågående</span>
          <span className="font-semibold text-amber-600">{commitmentStatus.pagar}</span>
          <span className="text-zinc-400">{Math.round((commitmentStatus.pagar / totalCommitments) * 100)}%</span>
        </div>
        <div className="flex items-center justify-between text-[0.8625rem]">
          <span className="text-zinc-600">Öppna</span>
          <span className="font-semibold text-zinc-700">{commitmentStatus.oppet}</span>
          <span className="text-zinc-400">{Math.round((commitmentStatus.oppet / totalCommitments) * 100)}%</span>
        </div>
      </div>
    </div>
  );
}

export function ClientOverview({
  allClients,
  allSessions,
  allCommitments,
  today,
}: {
  allClients: Array<{ id: string; name: string }>;
  allSessions: CoachingSession[];
  allCommitments: Commitment[];
  today: string;
}) {
  const last30DaysStart = new Date();
  last30DaysStart.setDate(last30DaysStart.getDate() - 30);

  const clientData = allClients.map((client) => {
    const clientSessions = allSessions.filter((s) => s.clientId === client.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const clientCommitments = allCommitments.filter((c) => c.clientId === client.id);

    const latestSession = clientSessions.find((s) => new Date(s.date) <= new Date(today));
    const nextSession = clientSessions.find((s) => s.status === "kommande" && new Date(s.date) > new Date(today));
    const openCommitments = clientCommitments.filter((c) => c.status === "oppet").length;
    const totalCommitments = clientCommitments.length;

    const recentActivity = clientSessions.some((s) => new Date(s.date) >= last30DaysStart && new Date(s.date) <= new Date(today));
    const hasNextSession = !!nextSession;
    const hasOverdueCommitment = clientCommitments.some((c) => c.status === "oppet");

    let status = "STABIL";
    if (hasOverdueCommitment) status = "FÖLJ UPP";
    else if (!hasNextSession && recentActivity) status = "PLANERA";
    else if (recentActivity && hasNextSession) status = "AKTIV";

    const statusColor = status === "AKTIV" || status === "STABIL" ? "text-green-600" : "text-amber-600";

    return {
      id: client.id,
      name: client.name,
      latestDate: latestSession?.date ?? null,
      nextDate: nextSession?.date ?? null,
      commitmentText: totalCommitments > 0 ? `${openCommitments} / ${totalCommitments}` : "—",
      status,
      statusColor,
      attention: status === "FÖLJ UPP" ? 0 : status === "PLANERA" ? 1 : 2,
    };
  });

  const sortedClients = clientData.sort((a, b) => a.attention - b.attention).slice(0, 5);

  if (sortedClients.length === 0) return null;

  return (
    <div className="border border-zinc-200/80 rounded-lg p-6 bg-white">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 mb-6">Klientöversikt</h3>

      <div className="hidden md:grid md:grid-cols-5 gap-4 mb-4 text-[0.75rem] font-semibold uppercase tracking-widest text-zinc-400">
        <div>Klient</div>
        <div>Senaste</div>
        <div>Nästa</div>
        <div>Åtaganden</div>
        <div>Status</div>
      </div>

      <div className="space-y-1">
        {sortedClients.map((client, idx) => (
          <div key={client.id} className={`grid grid-cols-1 md:grid-cols-5 gap-4 py-3 ${idx < sortedClients.length - 1 ? "border-b border-zinc-200/60" : ""}`}>
            <div className="font-medium text-zinc-900">{client.name}</div>
            <div className="text-[0.8125rem] text-zinc-500">
              {client.latestDate ? `${Math.floor((new Date(today).getTime() - new Date(client.latestDate).getTime()) / (1000 * 60 * 60 * 24))} dagar` : "—"}
            </div>
            <div className="text-[0.8125rem] text-zinc-500">{client.nextDate || "—"}</div>
            <div className="text-[0.8125rem] text-zinc-600">{client.commitmentText}</div>
            <div className={`text-[0.8125rem] font-medium ${client.statusColor}`}>{client.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
