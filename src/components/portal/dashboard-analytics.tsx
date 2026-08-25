"use client";

import type { CSSProperties, ReactNode } from "react";
import type { CoachingSession, Commitment } from "@/lib/portal/types";

type ClientRef = { id: string; name: string };

const PALETTE = {
  canvas: "#F1F0EC",
  boardCanvas: "#DEDCD6",
  lightSurface: "#FCFBF8",
  secondarySurface: "#E7E4DD",
  darkSurface: "#222521",
  darkSurface2: "#2D312C",
  text: "#272621",
  mutedText: "#77736B",
  border: "#DDD8CF",
  gold: "#B89A5A",
  goldBright: "#D0B574",
  goldSoft: "#E8DEC7",
  emerald: "#356B59",
  emeraldSoft: "#AFC6BC",
  amber: "#A96F38",
  amberSoft: "#DEC4A5",
  red: "#94554F",
  stone: "#AAA39A",
  graphite: "#4C4A45",
};

const LIGHT_CARD_SHADOW = "0 1px 2px rgba(39,38,33,0.06), 0 8px 20px rgba(39,38,33,0.08)";
const DARK_CARD_SHADOW = "0 2px 4px rgba(20,20,18,0.12), 0 10px 24px rgba(20,20,18,0.16)";

function lightCardStyle(): CSSProperties {
  return {
    background: PALETTE.lightSurface,
    border: `1px solid ${PALETTE.border}`,
    boxShadow: LIGHT_CARD_SHADOW,
  };
}

function darkCardStyle(bg: string): CSSProperties {
  return {
    background: bg,
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: DARK_CARD_SHADOW,
  };
}

function getWeekYear(date: Date): { week: number; year: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const year = d.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { week, year };
}

function CardLabel({ children }: { children: ReactNode }) {
  return <div className="text-[0.6875rem] font-semibold uppercase tracking-widest">{children}</div>;
}

export function AnalyticsBento({
  allSessions,
  allCommitments,
  allClients,
  totalActiveClients,
  clientsWithNextSession,
  clientsNeedingPlanning,
  pendingBookingsCount,
  today,
}: {
  allSessions: CoachingSession[];
  allCommitments: Commitment[];
  allClients: ClientRef[];
  totalActiveClients: number;
  clientsWithNextSession: number;
  clientsNeedingPlanning: number;
  pendingBookingsCount: number;
  today: string;
}) {
  const todayDate = new Date(today);

  const last30DaysStart = new Date(todayDate);
  last30DaysStart.setDate(last30DaysStart.getDate() - 30);

  const twelveWeeksAgo = new Date(todayDate);
  twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

  const completedSessions = allSessions.filter((s) => s.status === "genomford");
  const completedLast30 = completedSessions.filter(
    (s) => new Date(s.date) >= last30DaysStart && new Date(s.date) <= todayDate
  ).length;

  const weekCounts: Record<string, number> = {};
  completedSessions
    .filter((s) => new Date(s.date) >= twelveWeeksAgo && new Date(s.date) <= todayDate)
    .forEach((session) => {
      const { week, year } = getWeekYear(new Date(session.date));
      const key = `${year}-w${week}`;
      weekCounts[key] = (weekCounts[key] || 0) + 1;
    });

  const pastWeeks: { key: string; week: number; count: number }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(todayDate);
    d.setDate(d.getDate() - i * 7);
    const { week, year } = getWeekYear(d);
    pastWeeks.unshift({ key: `${year}-w${week}`, week, count: weekCounts[`${year}-w${week}`] || 0 });
  }

  const futureWeekCounts: Record<string, number> = {};
  allSessions
    .filter((s) => s.status === "kommande" && new Date(s.date) > todayDate)
    .forEach((session) => {
      const { week, year } = getWeekYear(new Date(session.date));
      const key = `${year}-w${week}`;
      futureWeekCounts[key] = (futureWeekCounts[key] || 0) + 1;
    });

  const futureWeeks: { key: string; week: number; count: number }[] = [];
  for (let i = 1; i <= 4; i++) {
    const d = new Date(todayDate);
    d.setDate(d.getDate() + i * 7);
    const { week, year } = getWeekYear(d);
    futureWeeks.push({ key: `${year}-w${week}`, week, count: futureWeekCounts[`${year}-w${week}`] || 0 });
  }

  const recent4 = pastWeeks.slice(-4).reduce((sum, w) => sum + w.count, 0);
  const previous4 = pastWeeks.slice(-8, -4).reduce((sum, w) => sum + w.count, 0);
  const trendPercent = previous4 === 0 ? null : Math.round(((recent4 - previous4) / previous4) * 100);

  const maxPastWeek = Math.max(...pastWeeks.map((w) => w.count), 2);
  const nextSessionPct = totalActiveClients > 0 ? Math.round((clientsWithNextSession / totalActiveClients) * 100) : 0;

  // Klientmomentum: classify each active client
  const clientStatusCounts = { STABIL: 0, AKTIV: 0, PLANERA: 0, "FÖLJ UPP": 0 };
  allClients.forEach((client) => {
    const clientSessions = allSessions.filter((s) => s.clientId === client.id);
    const clientCommitments = allCommitments.filter((c) => c.clientId === client.id);
    const hasNextSession = clientSessions.some((s) => s.status === "kommande" && new Date(s.date) > todayDate);
    const recentActivity = clientSessions.some(
      (s) => new Date(s.date) >= last30DaysStart && new Date(s.date) <= todayDate
    );
    const hasOpenCommitment = clientCommitments.some((c) => c.status === "oppet");

    let status: keyof typeof clientStatusCounts = "STABIL";
    if (hasOpenCommitment) status = "FÖLJ UPP";
    else if (!hasNextSession && recentActivity) status = "PLANERA";
    else if (recentActivity && hasNextSession) status = "AKTIV";
    clientStatusCounts[status] += 1;
  });
  const clientMomentumTotal = Math.max(allClients.length, 1);

  // Åtagandeprogression
  const commitmentStatus = {
    genomfort: allCommitments.filter((c) => c.status === "genomfort").length,
    pagar: allCommitments.filter((c) => c.status === "pagar").length,
    oppet: allCommitments.filter((c) => c.status === "oppet").length,
  };
  const totalCommitments = commitmentStatus.genomfort + commitmentStatus.pagar + commitmentStatus.oppet;
  const commitmentCompletedPct = totalCommitments > 0 ? Math.round((commitmentStatus.genomfort / totalCommitments) * 100) : 0;

  // Coachingfördelning: completed vs upcoming session distribution
  const sessionDistribution = {
    genomford: allSessions.filter((s) => s.status === "genomford").length,
    kommande: allSessions.filter((s) => s.status === "kommande").length,
  };
  const sessionDistributionTotal = sessionDistribution.genomford + sessionDistribution.kommande;
  const sessionDistributionPct =
    sessionDistributionTotal > 0 ? Math.round((sessionDistribution.genomford / sessionDistributionTotal) * 100) : 0;

  // Nästa 7 dagar
  const next7Days: { label: string; count: number; isoDate: string }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(todayDate);
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const count = allSessions.filter((s) => s.status === "kommande" && s.date === iso).length;
    next7Days.push({ label: d.toLocaleDateString("sv-SE", { weekday: "short" }).slice(0, 2), count, isoDate: iso });
  }
  const next7DaysTotal = next7Days.reduce((sum, d) => sum + d.count, 0);

  // Line chart geometry (G)
  const lineWeeks = [...pastWeeks, ...futureWeeks];
  const lineMax = Math.max(...lineWeeks.map((w) => w.count), 2);
  const chartW = 100;
  const chartH = 40;
  const stepX = chartW / (lineWeeks.length - 1);
  const pastPoints = pastWeeks.map((w, idx) => {
    const x = idx * stepX;
    const y = chartH - (w.count / lineMax) * chartH;
    return `${x},${y}`;
  });
  const futurePoints = futureWeeks.map((w, idx) => {
    const x = (pastWeeks.length - 1 + (idx + 1)) * stepX;
    const y = chartH - (w.count / lineMax) * chartH;
    return `${x},${y}`;
  });
  const bridgePoint = pastPoints[pastPoints.length - 1];

  return (
    <div
      className="min-w-0"
      style={{ background: PALETTE.boardCanvas, padding: "20px", borderRadius: "20px" }}
    >
      <div className="grid grid-cols-12" style={{ gap: "14px" }}>
        {/* A. COACHING MOMENTUM — dark hero */}
        <div
          className="col-span-12 md:col-span-6 lg:col-span-3 min-h-[230px] rounded-2xl p-5 flex flex-col justify-between"
          style={darkCardStyle(PALETTE.darkSurface)}
        >
          <div>
            <CardLabel>
              <span style={{ color: PALETTE.stone }}>Coaching Momentum</span>
            </CardLabel>
            <div className="mt-3 font-serif text-[2.25rem] leading-none font-medium" style={{ color: PALETTE.lightSurface }}>
              {completedSessions.length}
            </div>
            <div className="mt-1.5 text-[0.8125rem]" style={{ color: PALETTE.stone }}>
              genomförda totalt
            </div>
          </div>

          <div className="mt-4 flex items-end gap-1 h-9">
            {pastWeeks.map((week, idx) => {
              const isRecent = idx >= pastWeeks.length - 4;
              return (
                <div
                  key={week.key}
                  className="flex-1 rounded-sm"
                  style={{
                    height: `${Math.max((week.count / maxPastWeek) * 100, 6)}%`,
                    background: isRecent ? PALETTE.goldBright : PALETTE.stone,
                    opacity: isRecent ? 1 : 0.55,
                  }}
                />
              );
            })}
          </div>

          <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div>
              <div className="text-[1.125rem] font-semibold" style={{ color: PALETTE.goldBright }}>
                {completedLast30}
              </div>
              <div className="text-[0.6875rem]" style={{ color: PALETTE.stone }}>senaste 30 dagar</div>
            </div>
            <div className="text-right">
              <div className="text-[1.125rem] font-semibold" style={{ color: PALETTE.lightSurface }}>
                {totalActiveClients}
              </div>
              <div className="text-[0.6875rem]" style={{ color: PALETTE.stone }}>aktiva klienter</div>
            </div>
          </div>
        </div>

        {/* B. COACHINGAKTIVITET — main bar chart */}
        <div
          className="col-span-12 md:col-span-6 lg:col-span-6 min-h-[230px] rounded-2xl p-5"
          style={lightCardStyle()}
        >
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <h3 className="font-serif text-[1.0625rem] font-medium" style={{ color: PALETTE.text }}>
                Coachingaktivitet
              </h3>
              <p className="mt-0.5 text-[0.8125rem]" style={{ color: PALETTE.mutedText }}>Senaste 12 veckorna</p>
            </div>
            {trendPercent !== null && (
              <div className="text-[0.8125rem]" style={{ color: PALETTE.mutedText }}>
                {trendPercent > 0
                  ? `↑ +${trendPercent}%`
                  : trendPercent < 0
                    ? `${Math.abs(trendPercent)}% färre`
                    : "Oförändrat"}
              </div>
            )}
          </div>

          <div className="relative h-28">
            <div className="absolute inset-x-0 top-0 h-px" style={{ background: PALETTE.border }} />
            <div className="absolute inset-x-0 top-1/2 h-px" style={{ background: PALETTE.border }} />
            <div className="absolute inset-x-0 bottom-0 h-px" style={{ background: PALETTE.border }} />
            <div className="relative flex items-end gap-1 h-full">
              {pastWeeks.map((week, idx) => {
                const isRecent = idx >= pastWeeks.length - 4;
                const isLatest = idx === pastWeeks.length - 1 && week.count > 0;
                return (
                  <div key={week.key} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div
                      className="w-full rounded-sm"
                      style={{
                        height: `${Math.max((week.count / maxPastWeek) * 100, 3)}%`,
                        background: isLatest ? PALETTE.goldBright : isRecent ? PALETTE.gold : PALETTE.graphite,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-2 flex gap-1">
            {pastWeeks.map((week) => (
              <span key={week.key} className="flex-1 text-center text-[0.625rem]" style={{ color: PALETTE.mutedText }}>
                v{week.week}
              </span>
            ))}
          </div>
        </div>

        {/* C. KLIENTKONTINUITET — radial */}
        <div
          className="col-span-12 md:col-span-6 lg:col-span-3 min-h-[230px] rounded-2xl p-5 flex flex-col"
          style={lightCardStyle()}
        >
          <CardLabel>
            <span style={{ color: PALETTE.mutedText }}>Klientkontinuitet</span>
          </CardLabel>
          <div className="flex-1 flex items-center justify-center my-2">
            <svg viewBox="0 0 100 100" className="w-28 h-28">
              <circle cx="50" cy="50" r="42" fill="none" stroke={PALETTE.secondarySurface} strokeWidth="10" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={PALETTE.emerald}
                strokeWidth="10"
                strokeDasharray={`${(nextSessionPct / 100) * 264} 264`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
              <text x="50" y="47" textAnchor="middle" className="font-serif" style={{ fontSize: "20px", fontWeight: 500 }} fill={PALETTE.text}>
                {nextSessionPct}%
              </text>
              <text x="50" y="62" textAnchor="middle" style={{ fontSize: "7px" }} fill={PALETTE.mutedText}>
                bokade
              </text>
            </svg>
          </div>
          <div className="flex items-center justify-between text-[0.8125rem]">
            <span style={{ color: PALETTE.emerald }} className="font-semibold">
              {clientsWithNextSession} / {totalActiveClients} bokade
            </span>
          </div>
          <div className="text-[0.8125rem] mt-1" style={{ color: PALETTE.amber }}>
            {clientsNeedingPlanning} behöver planeras
          </div>
        </div>

        {/* D. KLIENTMOMENTUM */}
        <div
          className="col-span-12 md:col-span-6 lg:col-span-3 min-h-[190px] rounded-2xl p-5"
          style={lightCardStyle()}
        >
          <CardLabel>
            <span style={{ color: PALETTE.mutedText }}>Klientmomentum</span>
          </CardLabel>
          <div className="mt-4 space-y-2.5">
            {(
              [
                ["STABIL", PALETTE.emerald],
                ["AKTIV", PALETTE.gold],
                ["PLANERA", PALETTE.amber],
                ["FÖLJ UPP", PALETTE.amber],
              ] as const
            ).map(([label, color]) => {
              const count = clientStatusCounts[label];
              const pct = Math.round((count / clientMomentumTotal) * 100);
              return (
                <div key={label}>
                  <div className="flex items-center justify-between text-[0.75rem] mb-1">
                    <span style={{ color: PALETTE.mutedText }}>{label}</span>
                    <span style={{ color: PALETTE.text }} className="font-semibold">{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: PALETTE.secondarySurface }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* E. ÅTAGANDEPROGRESSION — donut + details */}
        <div
          className="col-span-12 md:col-span-6 lg:col-span-6 min-h-[190px] rounded-2xl p-5"
          style={lightCardStyle()}
        >
          <CardLabel>
            <span style={{ color: PALETTE.mutedText }}>Åtagandeprogression</span>
          </CardLabel>
          {totalCommitments > 0 ? (
            <div className="mt-4 flex items-center gap-6">
              <svg viewBox="0 0 100 100" className="w-24 h-24 shrink-0">
                <circle cx="50" cy="50" r="42" fill="none" stroke={PALETTE.secondarySurface} strokeWidth="12" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke={PALETTE.amber}
                  strokeWidth="12"
                  strokeDasharray={`${((commitmentStatus.pagar + commitmentStatus.genomfort) / totalCommitments) * 264} 264`}
                  transform="rotate(-90 50 50)"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke={PALETTE.emerald}
                  strokeWidth="12"
                  strokeDasharray={`${(commitmentStatus.genomfort / totalCommitments) * 264} 264`}
                  transform="rotate(-90 50 50)"
                />
                <text x="50" y="47" textAnchor="middle" className="font-serif" style={{ fontSize: "18px", fontWeight: 500 }} fill={PALETTE.text}>
                  {commitmentCompletedPct}%
                </text>
                <text x="50" y="61" textAnchor="middle" style={{ fontSize: "6.5px" }} fill={PALETTE.mutedText}>
                  GENOMFÖRDA
                </text>
              </svg>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between text-[0.8125rem]">
                  <span style={{ color: PALETTE.mutedText }}>Genomförda</span>
                  <span style={{ color: PALETTE.emerald }} className="font-semibold">{commitmentStatus.genomfort}</span>
                  <span style={{ color: PALETTE.mutedText }}>{Math.round((commitmentStatus.genomfort / totalCommitments) * 100)}%</span>
                </div>
                <div className="flex items-center justify-between text-[0.8125rem]">
                  <span style={{ color: PALETTE.mutedText }}>Pågående</span>
                  <span style={{ color: PALETTE.amber }} className="font-semibold">{commitmentStatus.pagar}</span>
                  <span style={{ color: PALETTE.mutedText }}>{Math.round((commitmentStatus.pagar / totalCommitments) * 100)}%</span>
                </div>
                <div className="flex items-center justify-between text-[0.8125rem]">
                  <span style={{ color: PALETTE.mutedText }}>Öppna</span>
                  <span style={{ color: PALETTE.text }} className="font-semibold">{commitmentStatus.oppet}</span>
                  <span style={{ color: PALETTE.mutedText }}>{Math.round((commitmentStatus.oppet / totalCommitments) * 100)}%</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-6 text-[0.8125rem]" style={{ color: PALETTE.mutedText }}>Inga åtaganden registrerade.</p>
          )}
        </div>

        {/* F. COACHINGFÖRDELNING */}
        <div
          className="col-span-12 md:col-span-6 lg:col-span-3 min-h-[190px] rounded-2xl p-5 flex flex-col"
          style={lightCardStyle()}
        >
          <CardLabel>
            <span style={{ color: PALETTE.mutedText }}>Coachingfördelning</span>
          </CardLabel>
          {sessionDistributionTotal > 0 ? (
            <>
              <div className="flex-1 flex items-center justify-center my-1">
                <svg viewBox="0 0 100 100" className="w-20 h-20">
                  <circle cx="50" cy="50" r="42" fill="none" stroke={PALETTE.goldSoft} strokeWidth="10" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke={PALETTE.gold}
                    strokeWidth="10"
                    strokeDasharray={`${(sessionDistributionPct / 100) * 264} 264`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                  <text x="50" y="55" textAnchor="middle" className="font-serif" style={{ fontSize: "17px", fontWeight: 500 }} fill={PALETTE.text}>
                    {sessionDistributionPct}%
                  </text>
                </svg>
              </div>
              <div className="text-[0.75rem] space-y-1">
                <div className="flex items-center justify-between">
                  <span style={{ color: PALETTE.mutedText }}>Genomförda</span>
                  <span style={{ color: PALETTE.gold }} className="font-semibold">{sessionDistribution.genomford}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: PALETTE.mutedText }}>Kommande</span>
                  <span style={{ color: PALETTE.text }} className="font-semibold">{sessionDistribution.kommande}</span>
                </div>
              </div>
            </>
          ) : (
            <p className="mt-6 text-[0.8125rem]" style={{ color: PALETTE.mutedText }}>Ingen sessionsdata.</p>
          )}
        </div>

        {/* G. UTVECKLING ÖVER TID — dark line chart */}
        <div
          className="col-span-12 md:col-span-6 lg:col-span-6 min-h-[180px] rounded-2xl p-5"
          style={darkCardStyle(PALETTE.darkSurface)}
        >
          <CardLabel>
            <span style={{ color: PALETTE.stone }}>Utveckling över tid</span>
          </CardLabel>
          <p className="mt-0.5 text-[0.75rem]" style={{ color: PALETTE.stone }}>Genomförda och planerade sessioner</p>
          <div className="mt-3 relative h-24">
            <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full">
              <line x1="0" y1="10" x2="100" y2="10" stroke="#444841" strokeWidth="0.3" />
              <line x1="0" y1="20" x2="100" y2="20" stroke="#444841" strokeWidth="0.3" />
              <line x1="0" y1="30" x2="100" y2="30" stroke="#444841" strokeWidth="0.3" />
              <polyline points={pastPoints.join(" ")} fill="none" stroke={PALETTE.goldBright} strokeWidth="1" />
              <polyline
                points={`${bridgePoint} ${futurePoints.join(" ")}`}
                fill="none"
                stroke={PALETTE.stone}
                strokeWidth="1"
                strokeDasharray="2,1.5"
              />
              {pastWeeks.map((w, idx) => {
                const x = idx * stepX;
                const y = chartH - (w.count / lineMax) * chartH;
                return <circle key={w.key} cx={x} cy={y} r="0.9" fill={PALETTE.goldBright} />;
              })}
              {futureWeeks.map((w, idx) => {
                const x = (pastWeeks.length - 1 + (idx + 1)) * stepX;
                const y = chartH - (w.count / lineMax) * chartH;
                return <circle key={w.key} cx={x} cy={y} r="0.9" fill="none" stroke={PALETTE.stone} strokeWidth="0.5" />;
              })}
            </svg>
          </div>
          <div className="mt-2 flex items-center gap-4 text-[0.6875rem]" style={{ color: PALETTE.stone }}>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-0.5" style={{ background: PALETTE.goldBright }} /> Historik
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-0.5" style={{ background: PALETTE.stone }} /> Planerat
            </span>
          </div>
        </div>

        {/* H. NÄSTA 7 DAGAR — dark */}
        <div
          className="col-span-12 md:col-span-6 lg:col-span-3 min-h-[180px] rounded-2xl p-5 flex flex-col"
          style={darkCardStyle(PALETTE.darkSurface2)}
        >
          <CardLabel>
            <span style={{ color: PALETTE.stone }}>Nästa 7 dagar</span>
          </CardLabel>
          <div className="mt-2 font-serif text-[1.75rem] leading-none font-medium" style={{ color: PALETTE.lightSurface }}>
            {next7DaysTotal}
          </div>
          <div className="text-[0.6875rem]" style={{ color: PALETTE.stone }}>sessioner</div>
          <div className="flex-1 flex items-end gap-1.5 mt-4 h-12">
            {next7Days.map((day) => {
              const maxDay = Math.max(...next7Days.map((d) => d.count), 1);
              const isToday = day.isoDate === today;
              return (
                <div key={day.isoDate} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end justify-center h-8">
                    <div
                      className="w-full rounded-sm"
                      style={{
                        height: `${Math.max((day.count / maxDay) * 100, day.count > 0 ? 20 : 4)}%`,
                        background: isToday ? PALETTE.goldBright : day.count > 0 ? PALETTE.gold : "rgba(255,255,255,0.12)",
                      }}
                    />
                  </div>
                  <span className="text-[0.5625rem]" style={{ color: PALETTE.stone }}>{day.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* I. VERKSAMHETSLÄGE */}
        <div
          className="col-span-12 md:col-span-6 lg:col-span-3 min-h-[180px] rounded-2xl p-5"
          style={lightCardStyle()}
        >
          <CardLabel>
            <span style={{ color: PALETTE.mutedText }}>Verksamhetsläge</span>
          </CardLabel>
          <div className="mt-4 space-y-2.5">
            {[
              { label: "Aktiva klienter", value: totalActiveClients, max: Math.max(totalActiveClients, 1), color: PALETTE.gold },
              { label: "Bokade", value: clientsWithNextSession, max: Math.max(totalActiveClients, 1), color: PALETTE.emerald },
              { label: "Behöver planeras", value: clientsNeedingPlanning, max: Math.max(totalActiveClients, 1), color: PALETTE.amber },
              { label: "Väntar på svar", value: pendingBookingsCount, max: Math.max(pendingBookingsCount, totalActiveClients, 1), color: PALETTE.amber },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex items-center justify-between text-[0.75rem] mb-1">
                  <span style={{ color: PALETTE.mutedText }}>{row.label}</span>
                  <span style={{ color: PALETTE.text }} className="font-semibold">{row.value}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: PALETTE.secondarySurface }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.min((row.value / row.max) * 100, 100)}%`, background: row.color }}
                  />
                </div>
              </div>
            ))}
          </div>
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
    const clientSessions = allSessions
      .filter((s) => s.clientId === client.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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

    const statusColor =
      status === "AKTIV" ? PALETTE.gold : status === "STABIL" ? PALETTE.emerald : PALETTE.amber;

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
    <div className="rounded-2xl border border-[var(--klient-border-soft)] bg-white p-5 md:p-7 min-w-0 overflow-hidden">
      <h3 className="font-serif text-[1.0625rem] font-medium text-zinc-900 mb-6">Klientöversikt</h3>

      <div className="hidden md:grid md:grid-cols-5 gap-4 mb-4 text-[0.75rem] font-semibold uppercase tracking-widest text-zinc-400">
        <div>Klient</div>
        <div>Senaste</div>
        <div>Nästa</div>
        <div>Åtaganden</div>
        <div>Status</div>
      </div>

      <div className="space-y-0">
        {sortedClients.map((client, idx) => (
          <div
            key={client.id}
            className={`flex gap-3 py-3 pl-3 border-l-2 ${idx < sortedClients.length - 1 ? "border-b border-zinc-200/60" : ""}`}
            style={{ borderLeftColor: client.statusColor }}
          >
            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="font-medium text-zinc-900">{client.name}</div>
                <div className="text-[0.8125rem] text-zinc-500">
                  {client.latestDate
                    ? `${Math.floor((new Date(today).getTime() - new Date(client.latestDate).getTime()) / (1000 * 60 * 60 * 24))} dagar`
                    : "—"}
                </div>
                <div className="text-[0.8125rem] text-zinc-500">{client.nextDate || "—"}</div>
                <div className="text-[0.8125rem] text-zinc-600">{client.commitmentText}</div>
              </div>
            </div>
            <div className="text-[0.8125rem] font-medium whitespace-nowrap" style={{ color: client.statusColor }}>
              {client.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
