"use client";

import { useEffect } from "react";
import { useEnquiry, type EnquiryItem } from "./EnquiryProvider";
import { flyToCounter } from "./flyToCounter";

/**
 * One delegated listener for every "Add to enquiry" button on the page.
 * Keeps catalog cards server-rendered while the drawer state stays in sync.
 */
export default function EnquiryBinder() {
  const { add, items } = useEnquiry();
  const slugs = new Set(items.map((item) => item.slug));

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const button = (event.target as HTMLElement | null)?.closest?.<HTMLButtonElement>("[data-add-to-enquiry]");
      if (!button) return;
      const dataset = button.dataset;
      if (!dataset.slug || button.getAttribute("aria-pressed") === "true") return;
      const item: EnquiryItem = {
        slug: dataset.slug,
        name: dataset.label ?? "",
        brand: dataset.brand ?? "",
        category: dataset.category ?? "",
        image: dataset.image || undefined,
        href: dataset.href ?? "/catalog",
      };
      add(item);
      flyToCounter(button, item.image);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [add]);

  // Reflect "already added" state across every card without coupling cards to React.
  useEffect(() => {
    document.querySelectorAll<HTMLButtonElement>("[data-add-to-enquiry]").forEach((button) => {
      const added = slugs.has(button.dataset.slug ?? "");
      button.setAttribute("aria-pressed", String(added));
      button.classList.toggle("is-added", added);
      const label = button.querySelector("[data-enquiry-add-label]");
      if (label) label.textContent = added ? "Added" : "Add to enquiry";
    });
  }, [items, slugs]);

  return null;
}
