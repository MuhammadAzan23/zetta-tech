import type { ReactNode } from "react";

/**
 * A hairline rule that draws from left to right once it scrolls into view.
 * Render it in place of a border-top; it carries the border colour itself.
 * The draw is a CSS transition triggered by RevealObserver, so no JS library is needed.
 */
export default function RuleDraw({ className = "" }: { className?: string; delay?: number; children?: ReactNode }) {
  return <div data-rule aria-hidden="true" className={`h-px origin-left bg-navy-900/20 ${className}`} />;
}
