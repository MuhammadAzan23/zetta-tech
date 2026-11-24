"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export type EnquiryItem = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  image?: string;
  href: string;
};

type EnquiryContextValue = {
  items: EnquiryItem[];
  count: number;
  add: (item: EnquiryItem) => void;
  remove: (slug: string) => void;
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
    setItems((current) => (current.some((entry) => entry.slug === item.slug) ? current : [...current, item]));
  }, []);

  const remove = useCallback((slug: string) => {
    setItems((current) => current.filter((entry) => entry.slug !== slug));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({ items, count: items.length, add, remove, clear, open, setOpen }),
    [items, add, remove, clear, open]
  );

  return <EnquiryContext.Provider value={value}>{children}</EnquiryContext.Provider>;
}
