"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { categories } from "@/lib/data";

/**
 * 404 search: a small, local suggestions box over the site's five systems.
 * The page works as plain links without JS.
 */
export default function NotFoundSearch() {
  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();
  const hits = useMemo(() => {
    if (!term) return [];
    return categories
      .filter((category) => `${category.name} ${category.short}`.toLowerCase().includes(term))
      .slice(0, 4);
  }, [term]);

  return (
    <div className="relative max-w-md">
      <label htmlFor="notfound-search" className="label block text-navy-900/70">Search the site</label>
      <input
        id="notfound-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Access control, CCTV, racks…"
        aria-describedby="notfound-search-status"
        className="mt-2 h-12 w-full rounded border border-navy-900/20 bg-white px-4 text-navy-900 placeholder:text-navy-900/70 focus:border-cyan-deep"
      />
      <p id="notfound-search-status" aria-live="polite" className="sr-only">
        {term ? `${hits.length} suggestion${hits.length === 1 ? "" : "s"}` : ""}
      </p>
      {term ? (
        hits.length ? (
          <ul className="mt-2 border border-navy-900/15 bg-white">
            {hits.map((category) => (
              <li key={category.slug} className="border-b border-navy-900/10 last:border-b-0">
                <Link href={`/products/${category.slug}`} className="block px-4 py-3 text-sm font-medium text-navy-900 hover:bg-ice">
                  {category.name}
                  <span className="block text-xs font-normal text-navy-900/70">{category.short}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 border border-navy-900/15 bg-white px-4 py-3 text-sm text-navy-900/65">
            No systems match “{query.trim()}”. Try the catalog or contact us with the model name.
          </p>
        )
      ) : null}
    </div>
  );
}
