"use client";

import { useEffect, useRef } from "react";
import { useEnquiry } from "./EnquiryProvider";
import { waLink } from "@/lib/site";

/**
 * Right-hand enquiry drawer: backdrop fade, panel slides in, focus trapped,
 * Escape closes, focus returns to the trigger. Fine with reduced motion (no slide).
 */
export default function EnquiryDrawer() {
  const { items, open, setOpen, remove, clear, count } = useEnquiry();
  const panel = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreFocus.current = document.activeElement;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => closeButton.current?.focus(), 30);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !panel.current) return;
      const focusables = panel.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !panel.current.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      if (restoreFocus.current instanceof HTMLElement) restoreFocus.current.focus();
    };
  }, [open, setOpen]);

  if (!open) return null;

  const message =
    items.length === 0
      ? ""
      : `Hello Zetta Tech, I would like a quote for these products:\n\n${items
          .map((item, index) => `${index + 1}. ${item.name} — ${item.brand} / ${item.category}`)
          .join("\n")}\n\nPlease share pricing and availability.`;

  return (
    <div className="fixed inset-0 z-[70]" role="presentation">
      <button
        type="button"
        aria-label="Close enquiry list"
        tabIndex={-1}
        onClick={() => setOpen(false)}
        className="drawer-backdrop absolute inset-0 bg-navy-950/45 backdrop-blur-[2px]"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="enquiry-title"
        className="drawer-panel absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-navy-900/15 bg-paper shadow-[-16px_0_40px_rgba(5,34,76,.18)]"
      >
        <div className="flex items-start justify-between border-b border-navy-900/15 px-5 py-4">
          <div>
            <p className="label text-cyan-ink">Prepared enquiries</p>
            <h2 id="enquiry-title" className="font-display text-2xl font-semibold text-navy-900">
              Enquiry list <span className="text-navy-900/70">({count})</span>
            </h2>
          </div>
          <button ref={closeButton} type="button" onClick={() => setOpen(false)} aria-label="Close enquiry list" className="grid h-10 w-10 place-items-center rounded border border-navy-900/20 text-xl text-navy-900 hover:bg-white">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="mt-10 border border-dashed border-navy-900/25 px-5 py-10 text-center">
              <p className="font-display text-xl font-semibold text-navy-900">Nothing here yet</p>
              <p className="mt-2 text-sm text-navy-900/65">Add products from the catalog and send them all in one WhatsApp message.</p>
            </div>
          ) : (
            <ul className="grid gap-3">
              {items.map((item) => (
                <li key={item.slug} className="flex items-start gap-3 border border-navy-900/15 bg-white p-3">
                  <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden bg-ice">
                    {item.image ? (
                      <img src={item.image} alt="" className="max-h-full max-w-full object-contain" loading="lazy" decoding="async" />
                    ) : (
                      <span className="label text-navy-900/70">—</span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <a href={item.href} className="block truncate font-semibold text-navy-900 underline decoration-transparent underline-offset-4 hover:decoration-cyan-brand">
                      {item.name}
                    </a>
                    <span className="label mt-1 block text-navy-900/70">{item.brand} · {item.category}</span>
                  </span>
                  <button type="button" onClick={() => remove(item.slug)} className="label shrink-0 rounded px-2 py-1 text-navy-900/70 hover:bg-ice hover:text-navy-900" aria-label={`Remove ${item.name}`}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-navy-900/15 px-5 py-4">
          {items.length > 0 ? (
            <a href={waLink(message)} className="btn-whatsapp w-full px-5 py-3.5" target="_blank" rel="noreferrer">
              Send {count} item{count === 1 ? "" : "s"} on WhatsApp
            </a>
          ) : (
            <button type="button" disabled className="btn-whatsapp w-full px-5 py-3.5">
              Send on WhatsApp
            </button>
          )}
          {items.length > 0 ? (
            <button type="button" onClick={clear} className="label mt-3 w-full rounded py-2 text-navy-900/70 hover:text-navy-900">
              Clear list
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
