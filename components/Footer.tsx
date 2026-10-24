import Link from "next/link";
import { site, waLink } from "@/lib/site";
import { brands, categories, cities } from "@/lib/data";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm text-white/65">{site.tagline}. We supply, install and configure.</p>
          <address className="mt-6 text-sm not-italic leading-relaxed text-white/80">
            <span className="label block text-cyan-brand">Head office</span>
            {site.address.full}
          </address>
          <p className="mt-3 text-sm">
            <a className="underline decoration-cyan-brand/60 underline-offset-4 hover:text-cyan-brand" href={waLink()}>WhatsApp</a>
            <span className="mx-2 text-white/40">/</span>
            <a className="underline decoration-cyan-brand/60 underline-offset-4 hover:text-cyan-brand" href={`mailto:${site.email}`}>{site.email}</a>
          </p>
        </div>
        <FooterList title="Products" items={categories.map((c) => ({ href: `/products/${c.slug}`, label: c.name }))} />
        <FooterList title="Brands" items={brands.map((b) => ({ href: `/brands/${b.slug}`, label: b.name }))} />
        <FooterList title="Cities" items={cities.map((c) => ({ href: `/locations/${c.slug}`, label: c.name }))} />
      </div>
      <div className="label border-t border-white/10 px-5 py-5 text-center text-white/50">
        © {new Date().getFullYear()} {site.name} · Brand names belong to their respective owners
      </div>
    </footer>
  );
}

function FooterList({ title, items }: { title: string; items: { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="label text-cyan-brand">{title}</h2>
      <ul className="mt-4 grid gap-2.5 text-sm text-white/80">
        {items.map((i) => (
          <li key={i.href}><Link className="hover:text-white hover:underline" href={i.href}>{i.label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
