import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { catalogBrands } from "@/lib/catalog";
import LogoMarquee, { type LogoItem } from "./LogoMarquee";
import Reveal from "./motion/Reveal";
import RuleDraw from "./motion/RuleDraw";

/**
 * Brand trust bar.
 *
 * Logos are optional. Each brand is looked up at build time under `public/brands/`
 * (svg, png or webp, named after its slug). When a file is missing the marquee shows
 * the brand name in the site's own type instead — no invented mark, no hotlinked
 * third-party logo. Drop `public/brands/zkteco.svg` in and it is used automatically.
 */

const LOGO_DIR = path.join(process.cwd(), "public", "brands");
const EXTENSIONS = [".svg", ".png", ".webp"];

function logoFor(slug: string) {
  for (const extension of EXTENSIONS) {
    const file = path.join(LOGO_DIR, `${slug}${extension}`);
    try {
      if (fs.statSync(file).size > 0) return `/brands/${slug}${extension}`;
    } catch {
      /* try the next extension */
    }
  }
  return null;
}

export default function BrandLogos() {
  const items: LogoItem[] = catalogBrands.map((brand) => ({
    slug: brand.slug,
    name: brand.name,
    logo: logoFor(brand.slug),
  }));

  return (
    <section id="brands" aria-labelledby="brands-heading" className="border-b border-navy-900/15 bg-white py-8">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <p id="brands-heading" className="label text-cyan-ink">Brands we supply</p>
          <Link href="/brands" className="label text-navy-900/70 underline decoration-transparent underline-offset-4 transition-colors hover:decoration-navy-900/40">
            All brands
          </Link>
        </div>
        <RuleDraw className="mb-5 mt-3" />
      </div>
      <Reveal>
        <LogoMarquee items={items} />
      </Reveal>
    </section>
  );
}
