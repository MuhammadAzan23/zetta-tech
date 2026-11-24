"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * One tiny client driver for every scroll reveal on the page.
 *
 * Elements mark themselves with data-reveal (single) or data-reveal-group (children
 * stagger), and CSS owns the animation. This keeps the reveal system dependency-free:
 * no animation library, no per-element React state, one observer for the whole site.
 *
 * Reduced motion is handled by CSS, which shows the final state immediately.
 */
export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const singles = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal], [data-rule], .rack"));
    const groups = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal-group]"));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      singles.forEach((el) => el.classList.add("is-in"));
      groups.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const inView = (el: Element) => {
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
    };

    // Anything already on screen reveals at once, without waiting for a scroll event.
    singles.forEach((el) => {
      if (inView(el)) el.classList.add("is-in");
    });
    groups.forEach((el) => {
      if (inView(el)) el.classList.add("is-in");
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 }
    );

    singles.forEach((el) => {
      if (!el.classList.contains("is-in")) observer.observe(el);
    });
    groups.forEach((el) => {
      if (!el.classList.contains("is-in")) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
