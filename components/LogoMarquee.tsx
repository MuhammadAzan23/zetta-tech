"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type LogoItem = {
  slug: string;
  name: string;
  /** Public path to a real logo file, or null when we have none. */
  logo: string | null;
  note?: string;
};

/**
 * Seamless brand marquee.
 *
 * The track holds four identical copies of the row (see `[0, 1, 2, 3]` below) and
 * slides by exactly one copy's width, so the loop has no jump and no gap at any
 * viewport: each copy carries the spacing on its trailing edge instead of the track
 * using `gap`.
 *
 * Pausing:
 *   - hover and keyboard focus pause it (CSS), so a visitor can read or tab through;
 *   - an IntersectionObserver stops it when the band leaves the viewport, so nothing
 *     animates off-screen;
 *   - under `prefers-reduced-motion` the CSS turns the marquee into a plain wrapped
 *     row and hides the duplicate copies.
 */
export default function LogoMarquee({ items, duration = 38 }: { items: LogoItem[]; duration?: number }) {
  const section = useRef<HTMLDivElement>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => setRunning(entries[0]?.isIntersecting ?? false), {
      rootMargin: "120px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const row = (copy: number) => (
    <ul className="logo-set" aria-hidden={copy > 0 ? "true" : undefined}>
      {items.map((item) => (
        <li key={`${copy}-${item.slug}`} className="logo-item">
          <Link
            href={`/brands/${item.slug}`}
            tabIndex={copy > 0 ? -1 : undefined}
            className="logo-link"
            aria-label={item.note ? `${item.name}, ${item.note}` : item.name}
          >
            {item.logo ? (
              <Image
                src={item.logo}
                alt=""
                width={140}
                height={36}
                className="logo-mark"
                sizes="140px"
              />
            ) : (
              // No logo file: the name is the mark. No placeholder art is invented.
              <span className="logo-wordmark">{item.name}</span>
            )}
            {item.note ? <span className="logo-note">{item.note}</span> : null}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <div ref={section} className="logo-marquee">
      <div className="logo-marquee-track" data-running={running} style={{ animationDuration: `${duration}s` }}>
        {/* Four copies and a travel of one set width: the track is always wider than
            the viewport plus one set, so the loop never opens a gap. */}
        {[0, 1, 2, 3].map(row)}
      </div>
    </div>
  );
}
