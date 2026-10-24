"use client";
import Link from "next/link";
import { useState } from "react";
import { site, waLink } from "@/lib/site";
import Logo from "./Logo";

const links = [
  { href: "/products/cctv-nvrs", label: "Products" },
  { href: "/brands/zkteco", label: "Brands" },
  { href: "/#how-we-work", label: "How we work" },
  { href: "/locations/karachi", label: "Locations" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-navy-900/15 bg-paper/95 backdrop-blur">
      <div className="hidden border-b border-navy-900/10 md:block">
        <div className="label mx-auto flex max-w-7xl justify-between px-6 py-1.5 text-navy-900/70">
          <span>Official dealer · Saddar, Karachi</span>
          <span>
            <a href={waLink()} className="hover:text-navy-900">WhatsApp</a> · <a href={`mailto:${site.email}`} className="hover:text-navy-900">{site.email}</a>
          </span>
        </div>
      </div>
      <nav aria-label="Main" className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-6">
        <Link href="/" aria-label={`${site.name} home`}><Logo /></Link>
        <ul className="hidden items-center gap-8 text-[0.95rem] lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="border-b border-transparent pb-0.5 text-navy-900/80 transition-colors hover:border-cyan-deep hover:text-navy-900">{l.label}</Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <a href={waLink()} className="rounded bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-800">Request a quote</a>
          <button type="button" className="rounded border border-navy-900/25 px-3 py-2.5 text-sm font-medium lg:hidden" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)}>
            {open ? "Close" : "Menu"}
          </button>
        </div>
        {open && (
          <ul id="mobile-menu" className="absolute left-0 right-0 top-full border-b border-navy-900/15 bg-paper px-5 pb-4 lg:hidden">
            {links.map((l) => (
              <li key={l.href} className="border-t border-navy-900/10">
                <Link href={l.href} onClick={() => setOpen(false)} className="block py-3.5 font-medium text-navy-900">{l.label}</Link>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </header>
  );
}
