"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type SlideTabsPosition = {
  left: number;
  width: number;
  opacity: number;
};

export function syncSlideTabsCursor(
  el: HTMLElement | null,
  setPosition: (position: SlideTabsPosition) => void,
) {
  if (!el) return;
  setPosition({
    left: el.offsetLeft,
    width: el.offsetWidth,
    opacity: 1,
  });
}

type SlideTabsVariant = "overlay" | "solid";

/** Samma glasyta som hero SlideTabs (Logga in / språk ska matcha). */
export const navHeroPillSurfaceClass =
  "border-0 bg-white/20 shadow-none backdrop-blur-[10px]";

const listVariantClass: Record<SlideTabsVariant, string> = {
  overlay:
    "relative isolate overflow-hidden rounded-full border-0 bg-transparent p-1 shadow-none before:pointer-events-none before:absolute before:inset-0 before:z-0 before:rounded-full before:bg-white/20 before:backdrop-blur-[10px] before:content-['']",
  solid:
    "rounded-full border-0 bg-white p-1 shadow-[0_1px_2px_rgba(24,24,27,0.04)]",
};

const slideTabCursorClass: Record<SlideTabsVariant, string> = {
  overlay:
    "bg-[var(--brand-gold-nav-overlay)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.26)]",
  solid:
    "bg-[var(--brand-gold)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)]",
};

type SlideTabsProps = {
  variant?: SlideTabsVariant;
  className?: string;
  /** Re-run cursor snap when route/active state changes (e.g. pathname). */
  activeKey?: unknown;
  children: (api: {
    listRef: RefObject<HTMLUListElement | null>;
    setPosition: (position: SlideTabsPosition) => void;
  }) => ReactNode;
};

export function SlideTabs({
  variant = "solid",
  className,
  activeKey,
  children,
}: SlideTabsProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const [position, setPosition] = useState<SlideTabsPosition>({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const reduceMotion = useReducedMotion();

  const restToActive = useCallback(() => {
    const listEl = listRef.current;
    if (!listEl) return;
    const active = listEl.querySelector<HTMLElement>('[data-nav-active="true"]');
    if (active) {
      syncSlideTabsCursor(active, setPosition);
      return;
    }
    setPosition((prev) => ({ ...prev, opacity: 0 }));
  }, []);

  useEffect(() => {
    restToActive();
  }, [activeKey, restToActive]);

  useEffect(() => {
    const listEl = listRef.current;
    if (!listEl) return;

    const observer = new ResizeObserver(() => {
      restToActive();
    });
    observer.observe(listEl);
    return () => observer.disconnect();
  }, [restToActive]);

  return (
    <ul
      ref={listRef}
      className={cn(
        "relative flex w-fit items-center gap-0.5 md:gap-1",
        listVariantClass[variant],
        className,
      )}
      onMouseLeave={restToActive}
    >
      {children({ listRef, setPosition })}
      <SlideTabsCursor
        position={position}
        variant={variant}
        instant={reduceMotion}
      />
    </ul>
  );
}

type SlideTabsCursorProps = {
  position: SlideTabsPosition;
  variant: SlideTabsVariant;
  instant?: boolean | null;
};

function SlideTabsCursor({ position, variant, instant }: SlideTabsCursorProps) {
  return (
    <motion.li
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-y-1 z-[1] rounded-full",
        slideTabCursorClass[variant],
      )}
      initial={false}
      animate={{
        left: position.left,
        width: position.width,
        opacity: position.opacity,
      }}
      transition={
        instant
          ? { duration: 0 }
          : { type: "spring", stiffness: 380, damping: 32, mass: 0.8 }
      }
    />
  );
}

/** Shared label styling for items sitting on the sliding pill cursor. */
export function slideTabTriggerClass(
  isActive: boolean,
  overlay: boolean,
  /** Guld-cursor under fliken (t.ex. öppen coaching-megameny på hero). */
  onGoldPill = false,
) {
  const ringOffset = overlay
    ? "focus-visible:ring-offset-2 focus-visible:ring-offset-white/40"
    : "focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-100";
  return cn(
    "relative z-[2] inline-flex cursor-pointer items-center rounded-full px-3.5 py-2 text-sm font-medium leading-snug md:px-4 md:py-2 md:text-[0.9375rem]",
    overlay
      ? "text-white/92 hover:text-white"
      : "text-zinc-900",
    ringOffset,
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900",
  );
}
