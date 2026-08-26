"use client";

import { useLayoutEffect } from "react";
import { resetRouteScroll } from "@/lib/motion";

export default function ContactPageScrollReset() {
  useLayoutEffect(() => {
    resetRouteScroll();

    const frame = requestAnimationFrame(() => {
      resetRouteScroll();
    });
    const timeout = window.setTimeout(resetRouteScroll, 0);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, []);

  return null;
}
