"use client";

import { useRef } from "react";
import { useEnquiry, type EnquiryItem } from "./EnquiryProvider";
import { flyToCounter } from "./flyToCounter";

/**
 * Adds a product to the enquiry list. In the document flow, so it is keyboard reachable
 * and works before JS (falls back to the product link is handled by the surrounding markup).
 */
export default function AddToEnquiry({
  item,
  className = "",
  label = "Add to enquiry",
}: {
  item: EnquiryItem;
  className?: string;
  label?: string;
}) {
  const button = useRef<HTMLButtonElement>(null);
  const { add, items } = useEnquiry();
  const already = items.some((entry) => entry.slug === item.slug);

  return (
    <button
      ref={button}
      type="button"
      aria-pressed={already}
      className={`btn border px-4 py-2.5 text-sm ${
        already
          ? "border-cyan-deep bg-cyan-soft/60 text-navy-900"
          : "border-navy-900/20 text-navy-900 hover:border-cyan-deep hover:bg-ice"
      } ${className}`}
      onClick={() => {
        if (already) return;
        add(item);
        if (button.current) flyToCounter(button.current, item.image);
      }}
    >
      {already ? (
        <>
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 12.5l5 5L20 6.5" />
          </svg>
          Added
        </>
      ) : (
        label
      )}
    </button>
  );
}
