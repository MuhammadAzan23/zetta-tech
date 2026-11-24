"use client";

import { useEnquiry } from "./enquiry/EnquiryProvider";
import { WhatsApp } from "./Icons";
import { waLink } from "@/lib/site";

/**
 * Floating actions on small screens: enquiry list + WhatsApp.
 * Each runs one gentle attention pulse four seconds after load, then stays still.
 */
export default function WhatsAppFab() {
  const { count, setOpen } = useEnquiry();
  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 sm:hidden">
      <button
        type="button"
        data-enquiry-anchor
        onClick={() => setOpen(true)}
        className="attention-pulse relative grid h-12 w-12 place-items-center rounded bg-navy-900 text-white shadow-lg"
        aria-label={`Open enquiry list, ${count} item${count === 1 ? "" : "s"}`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 6h15l-1.6 9.5H7.6z" /><path d="M6 6L5 3H2" /><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" />
        </svg>
        {count > 0 ? (
          <span data-enquiry-count className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-cyan-brand px-1 font-mono text-[0.65rem] font-semibold text-navy-950">
            {count}
          </span>
        ) : null}
      </button>
      <a
        href={waLink()}
        aria-label="Chat with Zetta Tech on WhatsApp"
        className="attention-pulse grid h-12 w-12 place-items-center rounded bg-[#25D366] text-navy-950 shadow-lg"
      >
        <WhatsApp className="h-6 w-6" />
      </a>
    </div>
  );
}
