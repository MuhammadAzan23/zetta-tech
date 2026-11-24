"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Subtle page enter on client-side navigation: an 8px rise and fade.
 * Pure CSS class toggle, so the transition costs no animation library.
 * The very first paint is untouched, so the landing page keeps its LCP.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (first.current) {
      first.current = false;
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.classList.remove("page-enter");
    // Force a style flush so the animation restarts on every navigation.
    void el.offsetWidth;
    el.classList.add("page-enter");
  }, [pathname]);

  return <div ref={ref}>{children}</div>;
}
