"use client";

import Link from "next/link";
import { useId, useState, useEffect, type CSSProperties, type ReactNode } from "react";
import type { CoachingSession, Commitment } from "@/lib/portal/types";
import { formatShortDate } from "@/lib/portal/format";
import { chartBarCycle, chartSemantic, portalColors } from "@/lib/portal/portal-colors";
import {
  getClientMomentumTone,
  portalSoftBadgeClass,
  portalTagTone,
} from "@/lib/portal/status-tones";
import { Avatar, Panel, PortalSectionHeader } from "@/components/portal/ui";

type ClientRef = { id: string; name: string };

const BAR_CYCLE = [...chartBarCycle];

const PALETTE = {
  canvas: "#F3F1ED",
  lightSurface: "#FAFCFB",
  lightSurfaceSecondary: "#F3F8F5",
  secondarySurface: "#E8F0EC",
  darkSurface: "#2A3531",
  darkSurface2: "#323D39",
  text: portalColors.text,
  mutedText: portalColors.mutedText,
  subtleText: "#95A8A0",
  border: portalColors.slateBorder,
  gridLine: "#E2EBE6",
  gold: portalColors.amber,
  goldBright: "#D2B56C",
  goldSoft: portalColors.amberSoft,
  emerald: portalColors.teal,
  emeraldSoft: portalColors.tealSoft,
  emeraldLight: "#D4EDE6",
  pinkLight: portalColors.coral,
  pinkDeep: portalColors.teal,
  pinkMedium: portalColors.lavender,
  pinkSoft: portalColors.mint,
  pinkPale: "#F0F7F4",
  momentumStabil: chartSemantic.completed,
  momentumAktiv: chartSemantic.active,
  momentumPlanera: chartSemantic.planning,
  momentumFollowUp: chartSemantic.followUp,
  statusActive: chartSemantic.active,
  statusBooked: chartSemantic.booked,
  statusPlanning: chartSemantic.planning,
  statusPending: chartSemantic.pending,
  progressTrack: portalColors.track,
  amber: portalColors.amberDark,
  amberSoft: portalColors.amberSoft,
  red: portalColors.coralDark,
  stone: "#95A8A0",
  graphite: "#4F5E58",
  supportLine: "#B7C9C0",
  badgeBg: portalColors.badgeBg,
  badgeText: portalColors.badgeText,
};

const CHART = {
  teal: portalColors.teal,
  pink: portalColors.coral,
  lime: portalColors.mint,
  orange: portalColors.amber,
  purple: portalColors.lavender,
  slate: portalColors.slate,
  track: portalColors.track,
  trackLine: portalColors.trackLine,
};

const LIGHT_CARD_SHADOW = "0 1px 2px rgba(38,36,33,0.05), 0 6px 16px rgba(38,36,33,0.07)";
const DARK_CARD_SHADOW = "0 2px 4px rgba(20,20,20,0.12), 0 8px 18px rgba(20,20,20,0.14)";

function bentoCardClass(index: number, layout: string) {
  const delay = Math.min(index, 8);
  return `${layout} rounded-xl p-5 portal-dash-card portal-dash-card--delay-${delay}`;
}

function AnimatedNumber({
  value,
  className,
  style,
}: {
  value: number;
  className?: string;
  style?: CSSProperties;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const duration = 1050;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 4;
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <span className={className} style={style}>
      {display}
    </span>
  );
}

function adjustColor(hex: string, amount: number): string {
  const normalized = hex.replace("#", "");
  const num = parseInt(normalized, 16);
  if (Number.isNaN(num)) return hex;
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function getBarColor(index: number): string {
  return BAR_CYCLE[index % BAR_CYCLE.length];
}

function pillBarTrackStyle(): CSSProperties {
  return {
    background: CHART.track,
    boxShadow: `inset 0 0 0 1px ${CHART.trackLine}`,
  };
}

function pillBarFill(color: string): CSSProperties {
  return { backgroundColor: color };
}

function volumeTrackStyle(): CSSProperties {
  return {
    ...pillBarTrackStyle(),
    boxShadow: `inset 0 0 0 1px ${CHART.trackLine}`,
  };
}

function volumeProgressFillStyle(color: string, active = true): CSSProperties {
  return {
    ...pillBarFill(color),
    opacity: active ? 1 : 0.82,
  };
}

type VolumeBarRow = {
  key: string;
  label: string;
  value: number;
  max: number;
  color: string;
  detail: string;
  countLabel?: (value: number) => string;
};

function VolumeBarList({ rows }: { rows: VolumeBarRow[] }) {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  return (
    <div className="mt-4 space-y-2">
      {rows.map((row, index) => {
        const pct = Math.round((row.value / Math.max(row.max, 1)) * 100);
        const isActive = activeKey === row.key;
        const isDimmed = activeKey !== null && !isActive;
        const countText = row.countLabel
          ? row.countLabel(row.value)
          : row.value === 1
            ? "1 st"
            : `${row.value} st`;

        return (
          <div key={row.key} className="relative">
            {isActive ? (
              <div
                className="pointer-events-none absolute bottom-full left-0 z-10 mb-2 w-max max-w-[12rem] rounded-xl px-2.5 py-2"
                style={{
                  background: PALETTE.darkSurface,
                  color: PALETTE.lightSurface,
                  boxShadow: DARK_CARD_SHADOW,
                }}
              >
                <div className="text-[0.6875rem] font-semibold">{row.label}</div>
                <div className="mt-0.5 text-[0.625rem] leading-snug" style={{ color: PALETTE.stone }}>
                  {countText} · {pct}%
                </div>
                <div className="mt-1 text-[0.5625rem] leading-snug" style={{ color: PALETTE.stone }}>
                  {row.detail}
                </div>
              </div>
            ) : null}
            <button
              type="button"
              className="w-full rounded-lg border-0 bg-transparent px-0 py-1 text-left transition-opacity duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6BB5A8] focus-visible:ring-offset-2"
              style={{ opacity: isDimmed ? 0.5 : 1 }}
              aria-label={`${row.label}, ${countText}, ${pct}%`}
              onMouseEnter={() => setActiveKey(row.key)}
              onMouseLeave={() => setActiveKey(null)}
              onFocus={() => setActiveKey(row.key)}
              onBlur={() => setActiveKey(null)}
            >
              <div className="mb-1 flex items-center justify-between text-[0.75rem]">
                <span style={{ color: PALETTE.mutedText }}>{row.label}</span>
                <span className="font-semibold tabular-nums" style={{ color: PALETTE.text }}>
                  {row.value}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full" style={volumeTrackStyle()}>
                <div
                  className="portal-dash-progress-fill h-full rounded-full transition-[filter,opacity] duration-300 ease-out"
                  style={{
                    width: `${Math.min(pct, 100)}%`,
                    animationDelay: `${index * 100 + 260}ms`,
                    ...volumeProgressFillStyle(row.color, isActive || activeKey === null),
                    filter: isActive ? "brightness(1.08)" : "none",
                  }}
                />
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}

function formatWeekSessionCount(count: number): string {
  if (count === 0) return "Inga sessioner";
  if (count === 1) return "1 genomförd session";
  return `${count} genomförda sessioner`;
}

function lightCardStyle(): CSSProperties {
  return {
    background: "rgba(255, 255, 255, 0.78)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.55)",
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
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.5625rem] font-semibold uppercase tracking-[0.14em]"
      style={{
        background: PALETTE.badgeBg,
        color: PALETTE.badgeText,
      }}
    >
      {children}
    </span>
  );
}

type DonutSegment = {
  key: string;
  label: string;
  count: number;
  color: string;
};

function PillBarColumn({
  value,
  max,
  color,
  isHovered,
  isDimmed,
  heightPx,
  usePercentHeight = true,
  ariaLabel,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  tooltip,
  animationIndex = 0,
}: {
  value: number;
  max: number;
  color: string;
  isHovered: boolean;
  isDimmed: boolean;
  heightPx?: number;
  usePercentHeight?: boolean;
  ariaLabel: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onFocus: () => void;
  onBlur: () => void;
  tooltip?: ReactNode;
  animationIndex?: number;
}) {
  const heightPct = max > 0 ? Math.max((value / max) * 100, value > 0 ? 10 : 4) : 4;
  const barHeight = usePercentHeight ? `${heightPct}%` : `${heightPx ?? 4}px`;

  return (
    <div className="relative flex h-full flex-1 flex-col items-center justify-end">
      {tooltip}
      <button
        type="button"
        aria-label={ariaLabel}
        className="relative flex w-full flex-col items-center justify-end rounded-sm border-0 bg-transparent p-0 transition-opacity duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6BB5A8] focus-visible:ring-offset-2"
        style={{ height: "100%", opacity: isDimmed ? 0.45 : 1 }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        <div className="absolute inset-x-0 bottom-0 top-0 rounded-t-[3px]" style={pillBarTrackStyle()} />
        <div
          className="portal-dash-bar-fill relative z-[1] w-[72%] rounded-t-[3px] transition-[filter,opacity] duration-300 ease-out"
          style={{
            height: barHeight,
            animationDelay: `${animationIndex * 70 + 120}ms`,
            ...pillBarFill(color),
            filter: isHovered && value > 0 ? "brightness(1.08)" : "none",
          }}
        />
        {value > 0 ? (
          <span
            className="absolute left-1/2 z-[2] -translate-x-1/2"
            style={{
              bottom: usePercentHeight ? `calc(${heightPct}% - 4px)` : `calc(${heightPx ?? 4}px - 4px)`,
              width: 7,
              height: 7,
              background: "#ffffff",
              boxShadow: "0 1px 2px rgba(42,53,49,0.14)",
            }}
          />
        ) : null}
      </button>
    </div>
  );
}

function DonutLegendChart({
  segments,
  centerValue,
  centerLabel,
}: {
  segments: DonutSegment[];
  centerValue: string | number;
  centerLabel: string;
}) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const total = segments.reduce((sum, segment) => sum + segment.count, 0);
  const ringRadius = 36;
  const strokeWidth = 10;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const activeSegment = activeKey ? segments.find((segment) => segment.key === activeKey) : null;
  const displayValue =
    activeSegment && total > 0 ? `${Math.round((activeSegment.count / total) * 100)}%` : centerValue;
  const displayLabel = activeSegment ? activeSegment.label : centerLabel;

  let dashOffset = 0;
  const segmentArcs = segments.map((segment) => {
    const length = total > 0 ? (segment.count / total) * ringCircumference : 0;
    const arc = { segment, length, offset: dashOffset };
    dashOffset += length;
    return arc;
  });

  return (
    <div className="portal-dash-donut mt-4">
      <div className="flex justify-center">
        <svg
          viewBox="0 0 100 100"
          className="h-[7.5rem] w-[7.5rem] shrink-0"
          aria-hidden="true"
        >
          <circle
            cx="50"
            cy="50"
            r={ringRadius}
            fill="none"
            stroke={CHART.track}
            strokeWidth={strokeWidth}
          />
          {segmentArcs.map(({ segment, length, offset }) => {
            const isActive = activeKey === segment.key;
            const isDimmed = activeKey !== null && !isActive;
            return (
              <circle
                key={segment.key}
                cx="50"
                cy="50"
                r={ringRadius}
                fill="none"
                stroke={segment.color}
                strokeWidth={isActive ? strokeWidth + 1.5 : strokeWidth}
                strokeLinecap="round"
                strokeDasharray={`${Math.max(length, 0)} ${ringCircumference}`}
                strokeDashoffset={-offset}
                opacity={isDimmed ? 0.28 : segment.count > 0 ? 1 : 0}
                transform="rotate(-90 50 50)"
                style={{ transition: "opacity 150ms ease, stroke-width 150ms ease" }}
              />
            );
          })}
          {segmentArcs.map(({ segment, length, offset }) => {
            if (segment.count === 0 || total === 0 || length < ringCircumference * 0.08) return null;
            const midAngle = ((offset + length / 2) / ringCircumference) * 360 - 90;
            const rad = (midAngle * Math.PI) / 180;
            const badgeX = 50 + Math.cos(rad) * ringRadius;
            const badgeY = 50 + Math.sin(rad) * ringRadius;
            const pct = Math.round((segment.count / total) * 100);
            return (
              <g key={`badge-${segment.key}`}>
                <circle cx={badgeX} cy={badgeY} r="5.8" fill="#ffffff" />
                <text
                  x={badgeX}
                  y={badgeY + 1.6}
                  textAnchor="middle"
                  style={{ fontSize: "3.1px", fontWeight: 600, fill: PALETTE.text }}
                >
                  {pct}%
                </text>
              </g>
            );
          })}
          <text
            x="50"
            y="47"
            textAnchor="middle"
            style={{ fontSize: "17px", fontWeight: 600, fill: PALETTE.text }}
          >
            {displayValue}
          </text>
          <text x="50" y="60" textAnchor="middle" style={{ fontSize: "6.5px", fill: PALETTE.mutedText }}>
            {displayLabel}
          </text>
        </svg>
      </div>

      <div className="mt-4 space-y-2">
        {segments.map((segment, segmentIndex) => {
          const pct = total > 0 ? Math.round((segment.count / total) * 100) : 0;
          const isActive = activeKey === segment.key;
          return (
            <button
              key={segment.key}
              type="button"
              className="w-full rounded-lg border-0 px-3 py-2.5 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6BB5A8] focus-visible:ring-offset-2"
              style={{
                background: isActive ? "rgba(107, 181, 168, 0.14)" : "transparent",
              }}
              onMouseEnter={() => setActiveKey(segment.key)}
              onMouseLeave={() => setActiveKey(null)}
              onFocus={() => setActiveKey(segment.key)}
              onBlur={() => setActiveKey(null)}
            >
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      ...pillBarFill(segment.color),
                      opacity: isActive ? 1 : 0.85,
                    }}
                  />
                  <span className="truncate text-[0.8125rem] font-medium" style={{ color: PALETTE.text }}>
                    {segment.label}
                  </span>
                </span>
                <span className="shrink-0 text-[0.8125rem] font-semibold tabular-nums" style={{ color: PALETTE.text }}>
                  {segment.count}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full" style={volumeTrackStyle()}>
                <div
                  className="portal-dash-progress-fill h-full rounded-full transition-[filter,opacity] duration-300 ease-out"
                  style={{
                    width: `${pct}%`,
                    animationDelay: `${segmentIndex * 100 + 200}ms`,
                    ...volumeProgressFillStyle(segment.color, isActive),
                  }}
                />
              </div>
              <p className="mt-1 text-right text-[0.6875rem] tabular-nums" style={{ color: PALETTE.subtleText }}>
                {pct}%
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DevelopmentTimelineChart({
  pastWeeks,
  futureWeeks,
  maxCount,
}: {
  pastWeeks: Array<{ key: string; week: number; count: number }>;
  futureWeeks: Array<{ key: string; week: number; count: number }>;
  maxCount: number;
}) {
  const timelineId = useId().replace(/:/g, "");
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const lineWeeks = [...pastWeeks, ...futureWeeks];
  const chartW = 100;
  const chartH = 54;
  const padT = 6;
  const padB = 13;
  const padX = 3;
  const plotH = chartH - padT - padB;
  const stepX = (chartW - padX * 2) / (lineWeeks.length - 1);

  type TimelinePoint = {
    key: string;
    week: number;
    count: number;
    x: number;
    y: number;
    kind: "past" | "future";
  };

  const pastPoints: TimelinePoint[] = pastWeeks.map((week, idx) => ({
    ...week,
    kind: "past",
    x: padX + idx * stepX,
    y: padT + plotH - (week.count / maxCount) * plotH,
  }));

  const futurePoints: TimelinePoint[] = futureWeeks.map((week, idx) => ({
    ...week,
    kind: "future",
    x: padX + (pastWeeks.length - 1 + idx + 1) * stepX,
    y: padT + plotH - (week.count / maxCount) * plotH,
  }));

  const allPoints = [...pastPoints, ...futurePoints];
  const baseY = padT + plotH;
  const pastLinePath = pastPoints.map((point) => `${point.x},${point.y}`).join(" ");
  const bridge = pastPoints[pastPoints.length - 1];
  const plannedPath = bridge
    ? `${bridge.x},${bridge.y} ${futurePoints.map((point) => `${point.x},${point.y}`).join(" ")}`
    : "";
  const areaPath =
    pastPoints.length > 0
      ? `M ${pastPoints[0].x} ${baseY} ${pastPoints.map((point) => `L ${point.x} ${point.y}`).join(" ")} L ${pastPoints[pastPoints.length - 1].x} ${baseY} Z`
      : "";

  const labelWeeks = [
    pastWeeks[0],
    pastWeeks[Math.floor(pastWeeks.length / 2)],
    pastWeeks[pastWeeks.length - 1],
    futureWeeks[futureWeeks.length - 1],
  ].filter(Boolean);

  return (
    <div className="portal-dash-timeline mt-4">
      <div className="relative h-36">
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id={`${timelineId}-area`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART.teal} stopOpacity="0.22" />
              <stop offset="100%" stopColor={CHART.teal} stopOpacity="0" />
            </linearGradient>
            <linearGradient id={`${timelineId}-line`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={CHART.teal} />
              <stop offset="100%" stopColor={adjustColor(CHART.teal, -18)} />
            </linearGradient>
            <linearGradient id={`${timelineId}-planned`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={CHART.purple} />
              <stop offset="100%" stopColor={adjustColor(CHART.purple, -18)} />
            </linearGradient>
          </defs>
          {[0.33, 0.66].map((ratio) => (
            <line
              key={ratio}
              x1={padX}
              y1={padT + plotH * (1 - ratio)}
              x2={chartW - padX}
              y2={padT + plotH * (1 - ratio)}
              stroke={CHART.trackLine}
              strokeWidth="0.35"
              strokeDasharray="2 2"
            />
          ))}
          {areaPath ? <path d={areaPath} fill={`url(#${timelineId}-area)`} /> : null}
          {pastLinePath ? (
            <polyline
              points={pastLinePath}
              fill="none"
              stroke={`url(#${timelineId}-line)`}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
          {plannedPath ? (
            <polyline
              points={plannedPath}
              fill="none"
              stroke={`url(#${timelineId}-planned)`}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="3.5 2.5"
            />
          ) : null}
          {allPoints.map((point) => {
            const active = hoveredKey === point.key;
            const dimmed = hoveredKey !== null && !active;
            return (
              <rect
                key={point.key}
                x={point.x - (active ? 1.4 : 1)}
                y={point.y - (active ? 1.4 : 1)}
                width={active ? 2.8 : 2}
                height={active ? 2.8 : 2}
                fill="#ffffff"
                stroke={point.kind === "past" ? CHART.teal : CHART.purple}
                strokeWidth={active ? 0.5 : 0.35}
                opacity={dimmed ? 0.35 : 1}
              />
            );
          })}
          {labelWeeks.map((week) => {
            const point = allPoints.find((item) => item.key === week.key);
            if (!point) return null;
            return (
              <text
                key={`label-${week.key}`}
                x={point.x}
                y={chartH - 3}
                textAnchor="middle"
                style={{ fontSize: "3.4px", fill: PALETTE.subtleText }}
              >
                v{week.week}
              </text>
            );
          })}
        </svg>

        {allPoints.map((point) => {
            const active = hoveredKey === point.key;
            return (
              <div
                key={`hit-${point.key}`}
                className="absolute"
                style={{
                  left: `${(point.x / chartW) * 100}%`,
                  top: `${(point.y / chartH) * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {active ? (
                  <div
                    className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max max-w-[9rem] -translate-x-1/2 rounded-lg px-2.5 py-2 text-center shadow-md"
                    style={{
                      background: PALETTE.darkSurface,
                      color: PALETTE.lightSurface,
                      boxShadow: DARK_CARD_SHADOW,
                    }}
                  >
                    <div className="text-[0.6875rem] font-semibold">Vecka {point.week}</div>
                    <div className="mt-0.5 text-[0.625rem] leading-snug" style={{ color: PALETTE.stone }}>
                      {formatWeekSessionCount(point.count)}
                    </div>
                    <div className="mt-0.5 text-[0.5625rem] uppercase tracking-wide" style={{ color: PALETTE.stone }}>
                      {point.kind === "past" ? "Historik" : "Planerat"}
                    </div>
                  </div>
                ) : null}
                <button
                  type="button"
                  aria-label={`Vecka ${point.week}, ${formatWeekSessionCount(point.count)}`}
                  className="h-7 w-7 rounded-full border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6BB5A8] focus-visible:ring-offset-2"
                  onMouseEnter={() => setHoveredKey(point.key)}
                  onMouseLeave={() => setHoveredKey(null)}
                  onFocus={() => setHoveredKey(point.key)}
                  onBlur={() => setHoveredKey(null)}
                />
              </div>
            );
          })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 text-[0.6875rem] font-medium" style={{ color: CHART.teal }}>
          <span className="inline-block h-0.5 w-3 rounded-full" style={{ background: CHART.teal }} />
          Historik
        </span>
        <span className="inline-flex items-center gap-1.5 text-[0.6875rem] font-medium" style={{ color: CHART.purple }}>
          <span
            className="inline-block h-0.5 w-3 rounded-full border-t border-dashed"
            style={{ borderColor: CHART.purple }}
          />
          Planerat
        </span>
      </div>
    </div>
  );
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
  const [hoveredWeekKey, setHoveredWeekKey] = useState<string | null>(null);
  const [hoveredMomentumWeekKey, setHoveredMomentumWeekKey] = useState<string | null>(null);
  const [hoveredDayKey, setHoveredDayKey] = useState<string | null>(null);
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
  const momentumWeeks = pastWeeks.slice(-8).map((week) => ({
    ...week,
    count: allSessions.filter((session) => {
      if (session.status !== "genomford" && session.status !== "kommande") return false;
      const { week: sessionWeek, year: sessionYear } = getWeekYear(new Date(session.date));
      return `${sessionYear}-w${sessionWeek}` === week.key;
    }).length,
  }));
  const maxMomentumWeek = Math.max(...momentumWeeks.map((w) => w.count), 1);
  const momentumChartHeight = 72;
  const getMomentumBarHeight = (count: number) => {
    if (count <= 0) return 4;
    return Math.max(Math.round((count / maxMomentumWeek) * momentumChartHeight), 12);
  };
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

  // Coachingfördelning: completed vs upcoming session distribution
  const sessionDistribution = {
    genomford: allSessions.filter((s) => s.status === "genomford").length,
    kommande: allSessions.filter((s) => s.status === "kommande").length,
  };
  const sessionDistributionTotal = sessionDistribution.genomford + sessionDistribution.kommande;

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

  const lineWeeks = [...pastWeeks, ...futureWeeks];
  const lineMax = Math.max(...lineWeeks.map((w) => w.count), 2);

  return (
    <div className="min-w-0">
      <div className="grid grid-cols-12" style={{ gap: "16px" }}>
        {/* A. COACHING MOMENTUM */}
        <div
          className={bentoCardClass(0, "col-span-12 md:col-span-6 lg:col-span-3 min-h-[220px] flex flex-col justify-between")}
          style={lightCardStyle()}
        >
          <div>
            <CardLabel>Coachingöversikt</CardLabel>
            <AnimatedNumber
              value={completedSessions.length}
              className="mt-3 block font-serif text-[2.25rem] leading-none font-medium"
              style={{ color: PALETTE.text }}
            />
            <div className="mt-1.5 text-[0.8125rem]" style={{ color: PALETTE.mutedText }}>
              genomförda sessioner
            </div>
          </div>

          <div
            className="relative mt-4 flex items-end gap-1.5"
            style={{ height: momentumChartHeight + 4 }}
          >
            {momentumWeeks.map((week, index) => {
              const isHovered = hoveredMomentumWeekKey === week.key;
              const isDimmed = hoveredMomentumWeekKey !== null && !isHovered;
              const barHeightPx = getMomentumBarHeight(week.count);
              const barColor = getBarColor(index);
              return (
                <PillBarColumn
                  key={week.key}
                  value={week.count}
                  max={maxMomentumWeek}
                  color={barColor}
                  isHovered={isHovered}
                  isDimmed={isDimmed}
                  heightPx={barHeightPx}
                  usePercentHeight={false}
                  animationIndex={index}
                  ariaLabel={`Vecka ${week.week}, ${formatWeekSessionCount(week.count)}`}
                  onMouseEnter={() => setHoveredMomentumWeekKey(week.key)}
                  onMouseLeave={() => setHoveredMomentumWeekKey(null)}
                  onFocus={() => setHoveredMomentumWeekKey(week.key)}
                  onBlur={() => setHoveredMomentumWeekKey(null)}
                  tooltip={
                    isHovered ? (
                      <div
                        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max max-w-[9rem] -translate-x-1/2 rounded-xl px-2.5 py-2 text-center"
                        style={{
                          background: PALETTE.darkSurface,
                          color: PALETTE.lightSurface,
                          boxShadow: DARK_CARD_SHADOW,
                        }}
                      >
                        <div className="text-[0.6875rem] font-semibold">Vecka {week.week}</div>
                        <div className="mt-0.5 text-[0.625rem] leading-snug" style={{ color: PALETTE.stone }}>
                          {formatWeekSessionCount(week.count)}
                        </div>
                      </div>
                    ) : null
                  }
                />
              );
            })}
          </div>

          <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: `1px solid ${PALETTE.gridLine}` }}>
            <div>
              <div className="text-[1.125rem] font-semibold" style={{ color: PALETTE.emerald }}>
                {completedLast30}
              </div>
              <div className="text-[0.6875rem]" style={{ color: PALETTE.mutedText }}>senaste 30 dagar</div>
            </div>
            <div className="text-right">
              <div className="text-[1.125rem] font-semibold" style={{ color: PALETTE.text }}>
                {totalActiveClients}
              </div>
              <div className="text-[0.6875rem]" style={{ color: PALETTE.mutedText }}>aktiva klienter</div>
            </div>
          </div>
        </div>

        {/* B. COACHINGAKTIVITET — main bar chart */}
        <div
          className={bentoCardClass(1, "col-span-12 md:col-span-6 lg:col-span-6 min-h-[220px]")}
          style={lightCardStyle()}
        >
          <div className="flex items-baseline justify-between mb-5">
            <div>
              <CardLabel>Coachingaktivitet</CardLabel>
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

          <div className="relative h-32">
            <div className="relative flex h-full items-end gap-1.5">
              {pastWeeks.map((week, index) => {
                const isHovered = hoveredWeekKey === week.key;
                const isDimmed = hoveredWeekKey !== null && !isHovered;
                const barColor = getBarColor(index);
                return (
                  <PillBarColumn
                    key={week.key}
                    value={week.count}
                    max={maxPastWeek}
                    color={barColor}
                    isHovered={isHovered}
                    isDimmed={isDimmed}
                    animationIndex={index}
                    ariaLabel={`Vecka ${week.week}, ${formatWeekSessionCount(week.count)}`}
                    onMouseEnter={() => setHoveredWeekKey(week.key)}
                    onMouseLeave={() => setHoveredWeekKey(null)}
                    onFocus={() => setHoveredWeekKey(week.key)}
                    onBlur={() => setHoveredWeekKey(null)}
                    tooltip={
                      isHovered ? (
                        <div
                          className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max max-w-[9rem] -translate-x-1/2 rounded-xl px-2.5 py-2 text-center"
                          style={{
                            background: PALETTE.darkSurface,
                            color: PALETTE.lightSurface,
                            boxShadow: DARK_CARD_SHADOW,
                          }}
                        >
                          <div className="text-[0.6875rem] font-semibold">Vecka {week.week}</div>
                          <div className="mt-0.5 text-[0.625rem] leading-snug" style={{ color: PALETTE.stone }}>
                            {formatWeekSessionCount(week.count)}
                          </div>
                        </div>
                      ) : null
                    }
                  />
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

        {/* C. KLIENTKONTINUITET */}
        <div
          className={bentoCardClass(2, "col-span-12 md:col-span-6 lg:col-span-3 min-h-[220px] flex flex-col")}
          style={lightCardStyle()}
        >
          <CardLabel>Klientkontinuitet</CardLabel>
          {totalActiveClients > 0 ? (
            <DonutLegendChart
              centerValue={`${nextSessionPct}%`}
              centerLabel="bokade"
              segments={[
                {
                  key: "bokade",
                  label: "Bokade",
                  count: clientsWithNextSession,
                  color: chartSemantic.booked,
                },
                {
                  key: "planera",
                  label: "Behöver planeras",
                  count: clientsNeedingPlanning,
                  color: chartSemantic.pending,
                },
              ]}
            />
          ) : (
            <p className="mt-6 text-[0.8125rem]" style={{ color: PALETTE.mutedText }}>Inga aktiva klienter.</p>
          )}
        </div>

        {/* D. KLIENTMOMENTUM */}
        <div
          className={bentoCardClass(3, "col-span-12 md:col-span-6 lg:col-span-3 min-h-[190px]")}
          style={lightCardStyle()}
        >
          <CardLabel>Klientstatus</CardLabel>
          <VolumeBarList
            rows={[
              {
                key: "stabil",
                label: "STABIL",
                value: clientStatusCounts.STABIL,
                max: clientMomentumTotal,
                color: PALETTE.momentumStabil,
                detail: "Inga öppna åtaganden, stabil kontinuitet.",
                countLabel: (value) => (value === 1 ? "1 klient" : `${value} klienter`),
              },
              {
                key: "aktiv",
                label: "AKTIV",
                value: clientStatusCounts.AKTIV,
                max: clientMomentumTotal,
                color: PALETTE.momentumAktiv,
                detail: "Aktiv senaste 30 dagarna med bokad session.",
                countLabel: (value) => (value === 1 ? "1 klient" : `${value} klienter`),
              },
              {
                key: "planera",
                label: "PLANERA",
                value: clientStatusCounts.PLANERA,
                max: clientMomentumTotal,
                color: PALETTE.momentumPlanera,
                detail: "Aktiv nyligen men saknar kommande session.",
                countLabel: (value) => (value === 1 ? "1 klient" : `${value} klienter`),
              },
              {
                key: "folj-upp",
                label: "FÖLJ UPP",
                value: clientStatusCounts["FÖLJ UPP"],
                max: clientMomentumTotal,
                color: PALETTE.momentumFollowUp,
                detail: "Har öppna åtaganden att följa upp.",
                countLabel: (value) => (value === 1 ? "1 klient" : `${value} klienter`),
              },
            ]}
          />
        </div>

        {/* E. ÅTAGANDEPROGRESSION — donut + details */}
        <div
          className={bentoCardClass(4, "col-span-12 md:col-span-6 lg:col-span-6 min-h-[190px]")}
          style={lightCardStyle()}
        >
          <CardLabel>Åtagandeutveckling</CardLabel>
          {totalCommitments > 0 ? (
            <DonutLegendChart
              centerValue={totalCommitments}
              centerLabel="Totalt"
              segments={[
                {
                  key: "genomfort",
                  label: "Genomförda",
                  count: commitmentStatus.genomfort,
                  color: chartSemantic.completed,
                },
                {
                  key: "pagar",
                  label: "Pågående",
                  count: commitmentStatus.pagar,
                  color: chartSemantic.ongoing,
                },
                {
                  key: "oppet",
                  label: "Öppna",
                  count: commitmentStatus.oppet,
                  color: chartSemantic.open,
                },
              ]}
            />
          ) : (
            <p className="mt-6 text-[0.8125rem]" style={{ color: PALETTE.mutedText }}>Inga åtaganden registrerade.</p>
          )}
        </div>

        {/* F. COACHINGFÖRDELNING */}
        <div
          className={bentoCardClass(5, "col-span-12 md:col-span-6 lg:col-span-3 min-h-[190px] flex flex-col")}
          style={lightCardStyle()}
        >
          <CardLabel>Sessionsfördelning</CardLabel>
          {sessionDistributionTotal > 0 ? (
            <DonutLegendChart
              centerValue={sessionDistributionTotal}
              centerLabel="Totalt"
              segments={[
                {
                  key: "genomford",
                  label: "Genomförda",
                  count: sessionDistribution.genomford,
                  color: chartSemantic.completed,
                },
                {
                  key: "kommande",
                  label: "Kommande",
                  count: sessionDistribution.kommande,
                  color: chartSemantic.upcoming,
                },
              ]}
            />
          ) : (
            <p className="mt-6 text-[0.8125rem]" style={{ color: PALETTE.mutedText }}>Ingen sessionsdata.</p>
          )}
        </div>

        {/* G. UTVECKLING ÖVER TID */}
        <div
          className={bentoCardClass(6, "col-span-12 md:col-span-6 lg:col-span-6 min-h-[180px]")}
          style={lightCardStyle()}
        >
          <CardLabel>Aktivitetsutveckling</CardLabel>
          <p className="mt-1 text-[0.8125rem]" style={{ color: PALETTE.mutedText }}>
            Genomförda och planerade sessioner
          </p>
          <DevelopmentTimelineChart pastWeeks={pastWeeks} futureWeeks={futureWeeks} maxCount={lineMax} />
        </div>

        {/* H. NÄSTA 7 DAGAR */}
        <div
          className={bentoCardClass(7, "col-span-12 md:col-span-6 lg:col-span-3 min-h-[180px] flex flex-col")}
          style={lightCardStyle()}
        >
          <CardLabel>Nästa 7 dagar</CardLabel>
          <AnimatedNumber
            value={next7DaysTotal}
            className="mt-2 block font-serif text-[1.75rem] leading-none font-medium"
            style={{ color: PALETTE.text }}
          />
          <div className="text-[0.6875rem]" style={{ color: PALETTE.mutedText }}>sessioner</div>
          <div className="flex-1 flex items-end gap-1.5 mt-4 h-14">
            {next7Days.map((day, index) => {
              const maxDay = Math.max(...next7Days.map((d) => d.count), 1);
              const barColor = getBarColor(index);
              const isHovered = hoveredDayKey === day.isoDate;
              const isDimmed = hoveredDayKey !== null && !isHovered;
              return (
                <div key={day.isoDate} className="flex h-full flex-1 flex-col items-center gap-1">
                  <div className="relative h-10 w-full">
                    <PillBarColumn
                      value={day.count}
                      max={maxDay}
                      color={barColor}
                      isHovered={isHovered}
                      isDimmed={isDimmed}
                      animationIndex={index}
                      ariaLabel={`${day.label}, ${day.count} sessioner`}
                      onMouseEnter={() => setHoveredDayKey(day.isoDate)}
                      onMouseLeave={() => setHoveredDayKey(null)}
                      onFocus={() => setHoveredDayKey(day.isoDate)}
                      onBlur={() => setHoveredDayKey(null)}
                      tooltip={
                        isHovered ? (
                          <div
                            className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max max-w-[9rem] -translate-x-1/2 rounded-xl px-2.5 py-2 text-center"
                            style={{
                              background: PALETTE.darkSurface,
                              color: PALETTE.lightSurface,
                              boxShadow: DARK_CARD_SHADOW,
                            }}
                          >
                            <div className="text-[0.6875rem] font-semibold">{day.label}</div>
                            <div className="mt-0.5 text-[0.625rem] leading-snug" style={{ color: PALETTE.stone }}>
                              {day.count === 1 ? "1 session" : `${day.count} sessioner`}
                            </div>
                          </div>
                        ) : null
                      }
                    />
                  </div>
                  <span className="text-[0.5625rem]" style={{ color: PALETTE.mutedText }}>{day.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* I. VERKSAMHETSLÄGE */}
        <div
          className={bentoCardClass(8, "col-span-12 md:col-span-6 lg:col-span-3 min-h-[180px]")}
          style={lightCardStyle()}
        >
          <CardLabel>Verksamhetsläge</CardLabel>
          <VolumeBarList
            rows={[
              {
                key: "aktiva",
                label: "Aktiva klienter",
                value: totalActiveClients,
                max: Math.max(totalActiveClients, 1),
                color: PALETTE.statusActive,
                detail: "Totalt antal aktiva klienter i portföljen.",
                countLabel: (value) => (value === 1 ? "1 klient" : `${value} klienter`),
              },
              {
                key: "bokade",
                label: "Bokade",
                value: clientsWithNextSession,
                max: Math.max(totalActiveClients, 1),
                color: PALETTE.statusBooked,
                detail: "Klienter med kommande session inbokad.",
                countLabel: (value) => (value === 1 ? "1 klient" : `${value} klienter`),
              },
              {
                key: "planera",
                label: "Behöver planeras",
                value: clientsNeedingPlanning,
                max: Math.max(totalActiveClients, 1),
                color: PALETTE.statusPlanning,
                detail: "Klienter utan bokad fortsättning.",
                countLabel: (value) => (value === 1 ? "1 klient" : `${value} klienter`),
              },
              {
                key: "vantar",
                label: "Väntar på svar",
                value: pendingBookingsCount,
                max: Math.max(pendingBookingsCount, totalActiveClients, 1),
                color: PALETTE.statusPending,
                detail: "Obesvarade bokningsförfrågningar.",
                countLabel: (value) => (value === 1 ? "1 förfrågan" : `${value} förfrågningar`),
              },
            ]}
          />
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

    const recentActivity = clientSessions.some(
      (s) => new Date(s.date) >= last30DaysStart && new Date(s.date) <= new Date(today)
    );
    const hasNextSession = !!nextSession;
    const hasOverdueCommitment = clientCommitments.some((c) => c.status === "oppet");

    let status = "STABIL";
    if (hasOverdueCommitment) status = "FÖLJ UPP";
    else if (!hasNextSession && recentActivity) status = "PLANERA";
    else if (recentActivity && hasNextSession) status = "AKTIV";

    const daysSinceLatest = latestSession
      ? Math.floor((new Date(today).getTime() - new Date(latestSession.date).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      id: client.id,
      name: client.name,
      initials: client.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join(""),
      daysSinceLatest,
      nextDate: nextSession?.date ?? null,
      commitmentText: totalCommitments > 0 ? `${openCommitments} / ${totalCommitments}` : "—",
      status,
      attention: status === "FÖLJ UPP" ? 0 : status === "PLANERA" ? 1 : 2,
    };
  });

  const sortedClients = clientData.sort((a, b) => a.attention - b.attention).slice(0, 5);

  if (sortedClients.length === 0) return null;

  return (
    <Panel>
      <PortalSectionHeader
        label="Översikt"
        title="Klientöversikt"
        context={`${sortedClients.length} prioriterade klienter`}
      />

      <div className="mt-5 hidden gap-3 px-3 pb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-zinc-400 md:grid md:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,0.75fr))_auto]">
        <div>Klient</div>
        <div>Senaste</div>
        <div>Nästa</div>
        <div>Åtaganden</div>
        <div className="text-right">Status</div>
      </div>

      <div className="mt-1 divide-y divide-[var(--klient-border-muted)]">
        {sortedClients.map((client) => (
          <Link
            key={client.id}
            href={`/cvb-base/klienter/${client.id}`}
            className="group -mx-3 block rounded-xl px-3 py-3.5 transition-colors duration-150 hover:bg-[var(--klient-text-block-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 md:grid md:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,0.75fr))_auto] md:items-center md:gap-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Avatar initials={client.initials} size="sm" />
              <span className="truncate text-[0.9375rem] font-semibold text-zinc-900 group-hover:text-zinc-950">
                {client.name}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-3 text-[0.8125rem] tabular-nums text-zinc-600 md:mt-0 md:contents">
              <span>
                <span className="mb-0.5 block text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-zinc-400 md:hidden">
                  Senaste
                </span>
                {client.daysSinceLatest !== null ? `${client.daysSinceLatest} dagar` : "—"}
              </span>
              <span>
                <span className="mb-0.5 block text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-zinc-400 md:hidden">
                  Nästa
                </span>
                {client.nextDate ? formatShortDate(client.nextDate) : "—"}
              </span>
              <span>
                <span className="mb-0.5 block text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-zinc-400 md:hidden">
                  Åtaganden
                </span>
                {client.commitmentText}
              </span>
            </div>

            <div className="mt-3 flex md:mt-0 md:justify-end">
              <span
                className={`${portalSoftBadgeClass} ${portalTagTone[getClientMomentumTone(client.status)]}`}
              >
                {client.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Panel>
  );
}
