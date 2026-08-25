"use client";

import type { CoachingSession, Commitment } from "@/lib/portal/types";
import { Panel, PortalSectionHeader } from "@/components/portal/ui";

function getWeekYear(date: Date): { week: number; year: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const year = d.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { week, year };
}

function getDateEightWeeksAgo(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 56);
  return d;
}

export default function DashboardAnalytics({
  allSessions,
  allCommitments,
  today,
}: {
  allSessions: CoachingSession[];
  allCommitments: Commitment[];
  today: string;
}) {
  // Coaching Activity - 8 weeks
  const eightWeeksAgo = getDateEightWeeksAgo();
  const completedSessions = allSessions.filter(
    (s) => s.status === "genomford" && new Date(s.date) >= eightWeeksAgo && new Date(s.date) <= new Date(today)
  );

  const weekCounts: Record<string, number> = {};
  completedSessions.forEach((session) => {
    const { week, year } = getWeekYear(new Date(session.date));
    const key = `${year}-w${week}`;
    weekCounts[key] = (weekCounts[key] || 0) + 1;
  });

  const weeks = [];
  for (let i = 0; i < 8; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    const { week, year } = getWeekYear(d);
    weeks.unshift({ week, year, key: `${year}-w${week}`, count: weekCounts[`${year}-w${week}`] || 0 });
  }

  const recent4 = weeks.slice(-4).reduce((sum, w) => sum + w.count, 0);
  const previous4 = weeks.slice(0, 4).reduce((sum, w) => sum + w.count, 0);
  const trendPercent = previous4 === 0 ? null : Math.round(((recent4 - previous4) / previous4) * 100);

  const last30Days = allSessions.filter(
    (s) => s.status === "genomford" && new Date(s.date) > new Date(today.split("-").slice(0, -1).join("-") + "-" + String(Number(today.split("-")[2]) - 30).padStart(2, "0"))
  ).length;

  // Commitment Status
  const commitmentStatus = {
    genomfort: allCommitments.filter((c) => c.status === "genomfort").length,
    pagar: allCommitments.filter((c) => c.status === "pagar").length,
    oppet: allCommitments.filter((c) => c.status === "oppet").length,
  };
  const totalCommitments = commitmentStatus.genomfort + commitmentStatus.pagar + commitmentStatus.oppet;

  // Client Activity
  const last30DaysStart = new Date();
  last30DaysStart.setDate(last30DaysStart.getDate() - 30);

  const activeClientsLast30 = new Set(
    allSessions
      .filter((s) => new Date(s.date) >= last30DaysStart && new Date(s.date) <= new Date(today))
      .map((s) => s.clientId)
  ).size;

  const clientsWithFutureSessions = new Set(
    allSessions.filter((s) => s.status === "kommande" && new Date(s.date) > new Date(today)).map((s) => s.clientId)
  ).size;

  const clientsWithoutFuture = activeClientsLast30 - clientsWithFutureSessions;

  const maxSessionsInWeek = Math.max(...weeks.map((w) => w.count), 5);

  return (
    <>
      <Panel>
        <PortalSectionHeader label="Analys" title="Coachingaktivitet" context="Senaste 8 veckorna" />
        <div className="mt-6">
          <div className="flex items-end gap-1 h-40">
            {weeks.map((week) => (
              <div key={week.key} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center" style={{ height: `${Math.max((week.count / maxSessionsInWeek) * 120, 4)}px` }}>
                  <div className="w-full bg-zinc-700 rounded-sm" style={{ height: "100%" }} />
                </div>
                <span className="text-[0.75rem] text-zinc-500 font-medium">v. {week.week}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-200/80">
            <div className="text-[0.9375rem] text-zinc-900">
              <span className="font-medium">{last30Days}</span>
              <span className="text-zinc-600"> genomförda senaste 30 dagarna</span>
            </div>

            {trendPercent !== null && (
              <div className="mt-2 text-[0.9375rem]">
                {trendPercent > 0 ? (
                  <span className="text-green-600 font-medium">
                    ↑ +{trendPercent}% mot föregående 4 veckor
                  </span>
                ) : trendPercent < 0 ? (
                  <span className="text-red-600 font-medium">
                    ↓ {trendPercent}% mot föregående 4 veckor
                  </span>
                ) : (
                  <span className="text-zinc-600 font-medium">→ Oförändrat mot föregående 4 veckor</span>
                )}
              </div>
            )}
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel>
          <PortalSectionHeader label="Status" title="Åtagandestatus" />
          <div className="mt-6 space-y-3">
            {totalCommitments > 0 ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="text-[0.9375rem] font-medium text-zinc-900">Genomförda</span>
                  <span className="text-[0.9375rem] font-medium text-green-600">{commitmentStatus.genomfort}</span>
                  <span className="text-[0.8125rem] text-zinc-500">
                    {Math.round((commitmentStatus.genomfort / totalCommitments) * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[0.9375rem] font-medium text-zinc-900">Pågående</span>
                  <span className="text-[0.9375rem] font-medium text-amber-600">{commitmentStatus.pagar}</span>
                  <span className="text-[0.8125rem] text-zinc-500">
                    {Math.round((commitmentStatus.pagar / totalCommitments) * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[0.9375rem] font-medium text-zinc-900">Öppna</span>
                  <span className="text-[0.9375rem] font-medium text-zinc-600">{commitmentStatus.oppet}</span>
                  <span className="text-[0.8125rem] text-zinc-500">
                    {Math.round((commitmentStatus.oppet / totalCommitments) * 100)}%
                  </span>
                </div>
              </>
            ) : (
              <p className="text-[0.9375rem] text-zinc-600">Inga åtaganden registrerade.</p>
            )}
          </div>
        </Panel>

        <Panel>
          <PortalSectionHeader label="Klienter" title="Klientaktivitet" />
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-[0.9375rem] font-medium text-zinc-900">Aktiva senaste 30 dagar</span>
              <span className="text-[0.9375rem] font-medium text-green-600">{activeClientsLast30}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[0.9375rem] font-medium text-zinc-900">Nästa session bokad</span>
              <span className="text-[0.9375rem] font-medium text-zinc-700">{clientsWithFutureSessions}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[0.9375rem] font-medium text-zinc-900">Utan kommande session</span>
              <span className="text-[0.9375rem] font-medium text-amber-600">{clientsWithoutFuture}</span>
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}
