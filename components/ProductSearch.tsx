"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { productWaLink } from "@/lib/site";

type SearchItem = { slug: string; name: string; brand: string; category: string; details: string };

/**
 * Product search. The index is fetched from /search-index.json the first time the
 * field is focused or typed in, so it never blocks the initial page.
 */
export default function ProductSearch() {
  const listId = useId();
  const wrap = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<SearchItem[] | null>(null);
  const loading = useRef(false);

  function ensureIndex() {
    if (items || loading.current) return;
    loading.current = true;
    fetch("/search-index.json")
      .then((response) => response.json())
      .then((data: SearchItem[]) => setItems(data))
      .catch(() => setItems([]));
  }

  const hits = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term || !items) return [];
    return items
      .filter((item) => `${item.name} ${item.brand} ${item.category} ${item.details}`.toLowerCase().includes(term))
      .slice(0, 6);
  }, [query, items]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!wrap.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const expanded = open && query.trim().length > 0;

  return (
    <div ref={wrap} className="relative min-w-0">
      <svg className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-900/70" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="2" />
      </svg>
      <label className="sr-only" htmlFor="product-search">Search products</label>
      <input
        id="product-search"
        type="search"
        value={query}
        placeholder="Search products"
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={listId}
        onFocus={() => {
          setOpen(true);
          ensureIndex();
        }}
        className="h-11 w-full min-w-0 rounded border border-navy-900/15 bg-white py-2 pl-9 pr-3 text-sm text-navy-900 placeholder:text-navy-900/70"
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          ensureIndex();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
      />
      {expanded ? (
        <div id={listId} role="listbox" className="absolute left-0 right-0 top-[calc(100%+4px)] z-[60] max-h-80 overflow-auto border border-navy-900/15 bg-white shadow-[8px_8px_0_0_#CFF1FF]">
          {!items ? (
            <div className="px-3.5 py-3 text-sm text-navy-900/70" role="option">Loading products…</div>
          ) : hits.length ? (
            hits.map((item) => (
              <a key={item.slug} role="option" href={productWaLink(item)} className="block border-b border-navy-900/10 px-3.5 py-2.5 text-navy-900 hover:bg-ice focus:bg-ice">
                <strong className="block text-sm font-semibold">{item.name}</strong>
                <small className="text-xs text-navy-900/70">{item.brand} · {item.category}</small>
              </a>
            ))
          ) : (
            <div className="px-3.5 py-2.5 text-sm text-navy-900/70" role="option">No products match “{query.trim()}”</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
