import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { catalogBrands } from "@/lib/catalog";
import { brandLine } from "@/lib/site";
import Reveal from "./motion/Reveal";

/**
 * Brand trust bar.
 *
 * ZKTeco is shown first and larger, because that is the position the business
 * actually holds: main supplier. Everything else sits under "We also supply", in
 * plain type, so the hierarchy says the same thing the copy does.
 *
 * Logos are optional. Each brand is looked up at build time under `public/brands/`
 * (svg, png or webp, named after its slug). When a file is missing the brand name is
 * set in the site's own type instead — no invented mark, no hotlinked third-party
 * logo. Drop `public/brands/zkteco.svg` in and it is used automatically.
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

/** No logo file? The name is the mark. No placeholder art is invented. */
function BrandMark({ slug, name, className }: { slug: string; name: string; className: string }) {
  const logo = logoFor(slug);
  return (
    <Link href={`/brands/${slug}`} className="group inline-flex items-baseline gap-3">
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element -- build-time file lookup, unknown dimensions
        <img src={logo} alt={name} className="h-8 w-auto max-w-[10rem] object-contain" loading="lazy" decoding="async" />
      ) : (
        <span className={`${className} text-navy-900 transition-colors group-hover:text-cyan-ink`}>{name}</span>
      )}
    </Link>
  );
}

export default function BrandLogos() {
  const main = catalogBrands.find((brand) => brand.slug === "zkteco");
  const others = catalogBrands.filter((brand) => brand.slug !== "zkteco");

  return (
    <section id="brands" aria-labelledby="brands-heading" className="border-b border-navy-900/15 bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 id="brands-heading" className="eyebrow text-cyan-ink">Brands we supply</h2>
          <Link href="/brands" className="eyebrow text-navy-900/70 underline decoration-transparent underline-offset-4 transition-colors hover:decoration-navy-900/40">
            All brands
          </Link>
        </div>

        {/* Main supplier first, and set larger than the rest. */}
        <Reveal className="mt-5 grid gap-4 border-y border-navy-900/15 py-6 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-8">
          <div>
            <p className="tag text-cyan-ink">Main supplier</p>
            {main ? (
              <BrandMark slug={main.slug} name={main.name} className="mt-1.5 block font-display text-4xl font-semibold tracking-tight sm:text-5xl" />
            ) : null}
          </div>
          <p className="text-navy-900/75">
            Our main line: attendance terminals, access control, turnstiles and security
            hardware, supplied, installed and configured in Karachi.
          </p>
        </Reveal>

        {/* Everything else, deliberately quieter than ZKTeco. */}
        <div className="mt-6">
          <p className="eyebrow text-navy-900/70">{brandLine.also}</p>
          <ul className="mt-3 flex flex-wrap items-center gap-x-7 gap-y-3">
            {others.map((brand) => (
              <li key={brand.slug}>
                <BrandMark slug={brand.slug} name={brand.name} className="font-display text-xl font-semibold tracking-tight" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
