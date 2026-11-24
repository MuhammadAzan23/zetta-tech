"use client";

import { useState } from "react";

/**
 * Map loads only on request, so the contact page stays light and private.
 * The placeholder keeps the exact layout height (no shift).
 */
export default function LazyMap({ src, title }: { src: string; title: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative min-h-80 w-full border border-navy-900/20 bg-ice md:h-full">
      {loaded ? (
        <iframe title={title} src={src} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-full min-h-80 w-full" />
      ) : (
        <div className="flex h-full min-h-80 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
          <svg viewBox="0 0 24 24" className="h-8 w-8 text-cyan-ink" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.6" />
          </svg>
          <p className="font-display text-lg font-semibold text-navy-900">Map loads on request</p>
          <p className="max-w-xs text-sm text-navy-900/65">For privacy and speed, the Google map is not loaded until you ask for it.</p>
          <button type="button" onClick={() => setLoaded(true)} className="btn-primary px-5 py-2.5 text-sm">Load map</button>
        </div>
      )}
    </div>
  );
}
