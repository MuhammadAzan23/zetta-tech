"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { site, waLink } from "@/lib/site";
import Logo from "./Logo";
import ProductSearch from "./ProductSearch";
import { useEnquiry } from "./enquiry/EnquiryProvider";

const links = [
  { href: "/catalog", label: "Products" },
  { href: "/brands", label: "Brands" },
  { href: "/#products", label: "Systems" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count, setOpen: setDrawerOpen } = useEnquiry();
  const header = useRef<HTMLElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Hide on scroll down, return on scroll up; add hairline shadow after a little scroll.
  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 8);
      const goingDown = y > last && y > 160;
      setHidden(goingDown && !open);
      last = y;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [open]);

  // Close the menu on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  /**
   * Publish the header's real height as --header-offset so the catalog filter bar
   * can sit exactly beneath it. 0 when the header is tucked away, measured height
   * when it is showing. A ResizeObserver keeps the value right when the utility
   * strip or mobile search row changes height.
   */
  useEffect(() => {
    const el = header.current;
    if (!el) return;
    const root = document.documentElement;
    const publish = () => {
      root.style.setProperty("--header-offset", hidden ? "0px" : `${el.getBoundingClientRect().height}px`);
    };
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--header-offset");
    };
  }, [hidden]);

  // Focus trap + Escape for the mobile menu.
  useEffect(() => {
    if (!open) return;
    const panel = menu.current;
    if (!panel) return;
    const first = panel.querySelector<HTMLElement>("a, button");
    first?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const focusables = panel!.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])');
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
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header
      ref={header}
      className={`header-shell sticky top-0 z-50 border-b border-navy-900/15 transition-[transform,box-shadow] duration-300 ease-out ${
        hidden ? "-translate-y-full" : "translate-y-0"
      } ${scrolled ? "header-scrolled bg-paper/95 backdrop-blur" : "bg-paper"}`}
    >
      {/* Contact strip. Shown at every width: on phones only the WhatsApp number
          fits, on wider screens the email joins it and the location moves in. */}
      <div className="border-b border-navy-900/10">
        <div className="label mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-1.5 text-navy-900/70 sm:px-6">
          <span className="hidden sm:inline">Official ZKTeco dealer · Saddar, Karachi</span>
          <span className="flex min-w-0 items-center gap-3">
            <a href={waLink()} className="whitespace-nowrap hover:text-navy-900">WhatsApp {site.phone}</a>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <a href={`mailto:${site.email}`} className="hidden truncate hover:text-navy-900 sm:inline">{site.email}</a>
          </span>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-5 py-3 sm:px-6">
        <nav
          aria-label="Main"
          className="grid items-center gap-x-2 gap-y-2 [grid-template-areas:'brand_quote_menu'_'search_search_search'] grid-cols-[minmax(0,1fr)_auto_auto] max-sm:[grid-template-areas:'menu_brand'] max-sm:grid-cols-[44px_minmax(0,1fr)_auto] lg:[grid-template-areas:'brand_links_search_quote'] lg:grid-cols-[auto_minmax(0,1fr)_minmax(180px,240px)_auto] lg:gap-4"
        >
          <button
            ref={toggle}
            type="button"
            className="grid h-11 w-11 place-items-center rounded bg-navy-900 text-lg text-white [grid-area:menu] lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen(!open)}
          >
            <span aria-hidden="true" className={`menu-icon ${open ? "is-open" : ""}`}>
              <span /><span /><span />
            </span>
          </button>
          <Link href="/" aria-label={`${site.name} home`} className="min-w-0 [grid-area:brand]">
            <Logo />
          </Link>
          <ul className="hidden items-center gap-5 text-[0.95rem] [grid-area:links] lg:flex">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="border-b border-transparent pb-0.5 text-navy-900/80 transition-colors hover:border-cyan-deep hover:text-navy-900">{link.label}</Link>
              </li>
            ))}
          </ul>
          <div className="min-w-0 [grid-area:search] max-sm:hidden">
            <ProductSearch />
          </div>
          <div className="flex items-center gap-2 [grid-area:quote] max-sm:justify-self-end">
            <button
              type="button"
              data-enquiry-anchor
              onClick={() => setDrawerOpen(true)}
              className="relative grid h-11 w-11 place-items-center rounded border border-navy-900/20 bg-white text-navy-900 transition-colors hover:border-cyan-deep"
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
            <a href={waLink()} className="hidden rounded bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-800 sm:inline-flex">Request a quote</a>
          </div>
        </nav>

        <div className="mt-2 sm:hidden">
          <ProductSearch />
        </div>

        {open ? (
          <div
            ref={menu}
            id="mobile-menu"
            className="mobile-menu mt-3 overflow-hidden rounded border border-navy-900/15 bg-paper shadow-[0_16px_36px_rgba(5,34,76,.14)] lg:hidden"
          >
            <ul>
              {links.map((link) => (
                <li key={link.href} className="border-b border-navy-900/10">
                  <Link href={link.href} onClick={() => setOpen(false)} className="block px-5 py-3.5 font-medium text-navy-900">{link.label}</Link>
                </li>
              ))}
            </ul>
            <div className="space-y-2 px-5 py-4">
              <a href={waLink()} className="btn-whatsapp w-full px-4 py-2.5 text-sm">
                WhatsApp {site.phone}
              </a>
              <a href={`mailto:${site.email}`} className="btn-outline w-full text-sm">
                {site.email}
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
