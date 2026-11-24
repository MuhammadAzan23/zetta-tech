import { createElement, type ReactNode } from "react";

type RevealProps = {
  as?: "div" | "section" | "ul" | "ol" | "li" | "p" | "span" | "article" | "header" | "figure" | "dl";
  children: ReactNode;
  className?: string;
  /** Animate direct children with a short stagger instead of the wrapper itself. */
  stagger?: boolean;
  /** Hero treatment: never hidden before JS/CSS runs. Motion is transform-only. */
  eager?: boolean;
  /** Kept for API compatibility; the CSS reveal uses a fixed distance. */
  y?: number;
  /** Kept for API compatibility; stagger delays come from the CSS group rules. */
  delay?: number;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

/**
 * Reveal on first scroll into view.
 *
 * This is a server component: it only marks the markup. A single client driver
 * (RevealObserver) adds `is-in`, and CSS owns the fade/rise, so the page ships no
 * animation library for its reveals. Without JS everything stays visible, and
 * prefers-reduced-motion shows the final state immediately.
 */
export default function Reveal({ as = "div", children, className, stagger = false, eager = false, ...rest }: RevealProps) {
  return createElement(
    as,
    {
      ...rest,
      className,
      ...(eager ? {} : stagger ? { "data-reveal-group": "" } : { "data-reveal": "" }),
    },
    children
  );
}
