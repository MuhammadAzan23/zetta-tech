import Link from "next/link";
import { brandLine, site, waLink } from "@/lib/site";
import { categories } from "@/lib/data";
import { catalogBrands } from "@/lib/catalog";
import Logo from "./Logo";
import Reveal from "./motion/Reveal";

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-white">
      <Reveal stagger className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm text-white/70">{brandLine.lead}</p>
          <address className="mt-6 text-sm not-italic leading-relaxed text-white/80">
            <span className="eyebrow block text-cyan-brand">Head office</span>
            {site.address.full}
          </address>
          <p className="mt-3 text-sm">
            <a className="link-underline decoration-cyan-brand/60 hover:text-cyan-brand" href={waLink()}>{site.phone}</a>
            <span className="mx-2 text-white/55">/</span>
            <a className="link-underline decoration-cyan-brand/60 hover:text-cyan-brand" href={`mailto:${site.email}`}>{site.email}</a>
          </p>
        </div>
        <FooterList title="Products" items={categories.map((category) => ({ href: `/products/${category.slug}`, label: category.name }))} />
        <FooterList title="Brands" items={catalogBrands.map((brand) => ({ href: `/brands/${brand.slug}`, label: brand.name }))} />
        <FooterList title="Location" items={[{ href: "/locations/karachi", label: "Karachi office" }, { href: "/contact", label: "Contact" }]} />
      </Reveal>
      <div className="eyebrow border-t border-white/10 px-5 py-5 text-center text-white/70">
        © {new Date().getFullYear()} {site.name} · Brand names belong to their respective owners
      </div>
    </footer>
  );
}

function FooterList({ title, items }: { title: string; items: { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="eyebrow text-cyan-brand">{title}</h2>
      <ul className="mt-4 grid gap-2.5 text-sm text-white/80">
        {items.map((item) => (
          <li key={item.href}>
            <Link className="link-underline hover:text-white" href={item.href}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
