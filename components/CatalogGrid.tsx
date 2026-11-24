"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import CatalogCard from "./CatalogCard";
import { productWaLink } from "@/lib/site";

export type GridItem = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  image?: string;
  excerpt: string;
};

const PAGE = 24;

/**
 * Catalog filter over a compact server index.
 *
 * The first cards are server-rendered for SEO/no-JS; filtering and "load more"
 * happen on the client. The FLIP reflow is loaded on demand the first time the
 * visitor filters, so GSAP stays out of the initial page load.
 *
 * On phones the sticky bar is replaced by a single "Filters" button that opens a
 * bottom sheet, so the two rows never eat the small viewport.
 */
export default function CatalogGrid({
  items,
  brands,
  initial,
  initialCount = 12,
}: {
  items: GridItem[];
  brands: string[];
  initial: React.ReactNode;
  initialCount?: number;
}) {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("all");
  const [extra, setExtra] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const deferred = useDeferredValue(query);
  const firstPaint = useRef(true);
  const sheet = useRef<HTMLDivElement>(null);
  const sheetTrigger = useRef<HTMLButtonElement>(null);
  const restored = useRef(false);

  /**
   * Filter state lives in the URL (`?q=…&brand=…`) so a filtered view can be
   * shared, bookmarked and survives a reload. It is read from `window.location`
   * on mount rather than from `useSearchParams`, which would opt this page out of
   * static generation in the App Router. Writes use `replaceState`, so the history
   * stays clean and typing never pushes a new entry.
   */
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") ?? "";
    const b = params.get("brand") ?? "";
    if (q) setQuery(q);
    const match = brands.find((name) => name.toLowerCase() === b.toLowerCase());
    if (match) setBrand(match);
  }, [brands]);

  useEffect(() => {
    if (!restored.current) return;
    const next = new URLSearchParams();
    if (query.trim()) next.set("q", query.trim());
    if (brand !== "all") next.set("brand", brand);
    const search = next.toString();
    const target = `${window.location.pathname}${search ? `?${search}` : ""}`;
    if (`${window.location.pathname}${window.location.search}` !== target) {
      window.history.replaceState(window.history.state, "", target);
    }
  }, [query, brand]);

  const matches = useMemo(() => {
    const term = deferred.trim().toLowerCase();
    const brandKey = brand.toLowerCase();
    return items.filter((item) => {
      if (brandKey !== "all" && item.brand.toLowerCase() !== brandKey) return false;
      if (!term) return true;
      return `${item.name} ${item.brand} ${item.category} ${item.excerpt}`.toLowerCase().includes(term);
    });
  }, [items, deferred, brand]);

  const untouched = !deferred && brand === "all";
  const visible = untouched ? initialCount + extra : PAGE + extra;
  const shown = matches.slice(0, visible);
  const useServerCards = untouched && extra === 0;
  const activeFilters = (query.trim() ? 1 : 0) + (brand !== "all" ? 1 : 0);

  useEffect(() => {
    setExtra(0);
  }, [deferred, brand]);

  // Lock the page while the bottom sheet is open, and restore focus on close.
  useEffect(() => {
    if (!sheetOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = sheet.current;
    panel?.querySelector<HTMLElement>("input, button")?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSheetOpen(false);
        sheetTrigger.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const focusables = panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      const head = focusables[0];
      const tail = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === head) {
        event.preventDefault();
        tail.focus();
      } else if (!event.shiftKey && document.activeElement === tail) {
        event.preventDefault();
        head.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [sheetOpen]);

  // Animate a reflow only when the rendered set changes, never on first paint.
  useEffect(() => {
    if (firstPaint.current) {
      firstPaint.current = false;
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cards = document.querySelectorAll<HTMLElement>("#catalog-grid [data-card]");
    cards.forEach((card, index) => {
      card.style.animation = "none";
      void card.offsetWidth;
      card.style.animation = `reveal-rise .4s cubic-bezier(.22,.7,.3,1) ${Math.min(index * 0.012, 0.3)}s both`;
    });
  }, [extra, deferred, brand]);

  async function loadMore() {
    if (loading) return;
    setLoading(true);

    // FLIP is worth its weight only on an actual reflow, so it is fetched here.
    const grid = document.getElementById("catalog-grid");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let flip: typeof import("gsap/Flip").Flip | null = null;
    let state: ReturnType<typeof import("gsap/Flip").Flip.getState> | null = null;
    if (grid && !reduce) {
      try {
        const [{ default: gsap }, { Flip }] = await Promise.all([import("gsap"), import("gsap/Flip")]);
        gsap.registerPlugin(Flip);
        flip = Flip;
        state = Flip.getState(Array.from(grid.querySelectorAll<HTMLElement>("[data-card]")));
      } catch {
        /* if the chunk fails to load, just swap the cards */
      }
    }

    window.setTimeout(() => {
      setExtra((current) => current + PAGE);
      setLoading(false);
      if (flip && state) {
        requestAnimationFrame(() => {
          flip!.from(state, { duration: 0.5, ease: "power2.out", absolute: true });
        });
      }
    }, 200);
  }

  function clearFilters() {
    setQuery("");
    setBrand("all");
  }

  const searchField = (id: string, describedBy: string) => (
    <div className="relative min-w-0">
      <label className="sr-only" htmlFor={id}>Filter products</label>
      <svg viewBox="0 0 24 24" aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-900/70" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="7" /><path d="m20 20-3.6-3.6" />
      </svg>
      <input
        id={id}
        type="search"
        value={query}
        placeholder="Filter by name, brand or category"
        aria-describedby={describedBy}
        onChange={(event) => setQuery(event.target.value)}
        className="h-11 w-full rounded border border-navy-900/15 bg-white pl-9 pr-3.5 text-sm text-navy-900 placeholder:text-navy-900/70 focus:border-cyan-deep"
      />
    </div>
  );

  const brandChips = (scope: string) => (
    <div className="filter-chips" role="group" aria-label="Filter by brand">
      <div className="filter-chips-track">
        <button
          type="button"
          onClick={() => setBrand("all")}
          aria-pressed={brand === "all"}
          className={`label shrink-0 scroll-ml-2 rounded border px-3 py-2 transition-colors ${brand === "all" ? "border-navy-900 bg-navy-900 text-white" : "border-navy-900/20 text-navy-900 hover:border-cyan-deep"}`}
        >
          All brands
        </button>
        {brands.map((name) => (
          <button
            key={`${scope}-${name}`}
            type="button"
            onClick={() => setBrand(name === brand ? "all" : name)}
            aria-pressed={brand === name}
            className={`label shrink-0 scroll-ml-2 rounded border px-3 py-2 transition-colors ${brand === name ? "border-navy-900 bg-navy-900 text-white" : "border-navy-900/20 text-navy-900 hover:border-cyan-deep"}`}
          >
            {name.replace(" Networks", "")}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      {/* Desktop / tablet: sticky bar that sits exactly under the site header. */}
      <div className="filter-bar -mx-5 mb-8 hidden border-b border-navy-900/15 bg-paper px-5 py-3 md:block sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="w-full max-w-sm">{searchField("catalog-filter", "catalog-count")}</div>
          <p id="catalog-count" aria-live="polite" className="label ml-auto shrink-0 whitespace-nowrap text-navy-900/70">
            {matches.length.toLocaleString()} match{matches.length === 1 ? "" : "es"}
          </p>
        </div>
        <div className="mt-3">{brandChips("desktop")}</div>
      </div>

      {/* Phones: one button, one bottom sheet. */}
      <div className="mb-6 flex items-center gap-3 md:hidden">
        <button
          ref={sheetTrigger}
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-expanded={sheetOpen}
          aria-controls="catalog-filters"
          className="btn inline-flex items-center gap-2 border border-navy-900/25 bg-white px-4 py-2.5 text-sm font-medium text-navy-900"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 6h18M6 12h12M10 18h4" />
          </svg>
          Filters
          {activeFilters ? <span className="grid h-5 min-w-5 place-items-center rounded-full bg-navy-900 px-1 font-mono text-[0.65rem] font-semibold text-white">{activeFilters}</span> : null}
        </button>
        <p aria-live="polite" className="label ml-auto whitespace-nowrap text-navy-900/70">
          <span id="catalog-count-mobile">{matches.length.toLocaleString()} match{matches.length === 1 ? "" : "es"}</span>
        </p>
      </div>

      {sheetOpen ? (
        <div className="fixed inset-0 z-[60] md:hidden" role="presentation">
          <button type="button" aria-label="Close filters" onClick={() => setSheetOpen(false)} className="sheet-backdrop absolute inset-0 w-full bg-navy-950/50" tabIndex={-1} />
          <div
            ref={sheet}
            id="catalog-filters"
            role="dialog"
            aria-modal="true"
            aria-label="Filter products"
            className="sheet-panel absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto border-t border-navy-900/20 bg-paper px-5 pb-6 pt-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display text-lg font-semibold text-navy-900">Filter products</p>
              <button type="button" onClick={() => setSheetOpen(false)} className="grid h-9 w-9 place-items-center rounded border border-navy-900/20 bg-white text-navy-900" aria-label="Close filters">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
              </button>
            </div>
            {searchField("catalog-filter-mobile", "catalog-count-mobile")}
            <p className="label mt-5 text-cyan-ink">Brand</p>
            <div className="mt-2">{brandChips("mobile")}</div>
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="btn-primary flex-1 px-4 py-3 text-sm"
              >
                Show {matches.length.toLocaleString()} result{matches.length === 1 ? "" : "s"}
              </button>
              {activeFilters ? (
                <button type="button" onClick={clearFilters} className="btn border border-navy-900/25 px-4 py-3 text-sm text-navy-900">
                  Clear
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {matches.length === 0 ? (
        <div className="border border-dashed border-navy-900/25 bg-white/60 px-6 py-16 text-center">
          <p className="font-display text-2xl font-semibold text-navy-900">No products match that filter</p>
          <p className="mx-auto mt-2 max-w-md text-navy-900/70">Try a shorter term, or clear the brand filter. We can also source a specific model on request.</p>
          <button type="button" onClick={clearFilters} className="btn-primary mt-6 px-5 py-2.5 text-sm">
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <div id="catalog-grid" className="defer-paint grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {useServerCards
              ? initial
              : shown.map((item) => (
                  <CatalogCard
                    key={item.slug}
                    product={{
                      slug: item.slug,
                      name: item.name,
                      brand: item.brand,
                      category: item.category,
                      image: item.image,
                      excerpt: item.excerpt,
                      waHref: productWaLink({ name: item.name, brand: item.brand, category: item.category, details: item.excerpt }),
                    }}
                  />
                ))}
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div key={`skeleton-${index}`} aria-hidden="true" className="animate-pulse border border-navy-900/10 bg-white">
                    <div className="aspect-[4/3] bg-ice" />
                    <div className="space-y-3 p-5">
                      <div className="h-2.5 w-1/3 rounded bg-navy-900/10" />
                      <div className="h-4 w-4/5 rounded bg-navy-900/10" />
                      <div className="h-3 w-full rounded bg-navy-900/10" />
                    </div>
                  </div>
                ))
              : null}
          </div>
          {visible < matches.length ? (
            <div className="mt-10 text-center">
              <button type="button" onClick={loadMore} className="btn-outline px-6 py-3" aria-describedby="catalog-count">
                Load {Math.min(PAGE, matches.length - visible)} more
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
