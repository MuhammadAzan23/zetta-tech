"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export type EnquiryItem = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  image?: string;
  href: string;
  /** How many of this item the visitor wants quoted. Always >= 1. */
  quantity?: number;
};

type EnquiryContextValue = {
  items: EnquiryItem[];
  count: number;
  add: (item: EnquiryItem) => void;
  remove: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  clear: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const EnquiryContext = createContext<EnquiryContextValue | null>(null);
const STORAGE_KEY = "zetta-enquiry";

export function useEnquiry() {
  const ctx = useContext(EnquiryContext);
  if (!ctx) throw new Error("useEnquiry must be used inside EnquiryProvider");
  return ctx;
}

export const ENQUIRY_FLY_EVENT = "enquiry:fly";

export function EnquiryProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<EnquiryItem[]>([]);
  const [open, setOpen] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as EnquiryItem[]);
    } catch {
      /* ignore */
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const add = useCallback((item: EnquiryItem) => {
    setItems((current) =>
      current.some((entry) => entry.slug === item.slug)
        ? current
        : [...current, { ...item, quantity: Math.max(1, item.quantity ?? 1) }]
    );
  }, []);

  const remove = useCallback((slug: string) => {
    setItems((current) => current.filter((entry) => entry.slug !== slug));
  }, []);

  /** Clamp to 1–99 so a message can never carry an absurd or zero quantity. */
  const setQuantity = useCallback((slug: string, quantity: number) => {
    const safe = Math.min(99, Math.max(1, Math.floor(Number.isFinite(quantity) ? quantity : 1)));
    setItems((current) => current.map((entry) => (entry.slug === slug ? { ...entry, quantity: safe } : entry)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({ items, count: items.length, add, remove, setQuantity, clear, open, setOpen }),
    [items, add, remove, setQuantity, clear, open]
  );

  return <EnquiryContext.Provider value={value}>{children}</EnquiryContext.Provider>;
}
