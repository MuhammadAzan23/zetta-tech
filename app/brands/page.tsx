import Link from "next/link";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/motion/Reveal";
import RuleDraw from "@/components/motion/RuleDraw";
import { catalogBrands } from "@/lib/catalog";
import { brandLine } from "@/lib/site";

export const metadata = {
  title: "Brands we supply",
  description: `${brandLine.lead} Browse ZKTeco, Ubiquiti, Ruijie, MikroTik, Dahua, IMOU and Huawei eKit products.`,
  alternates: { canonical: "/brands" },
};

export default function BrandsPage() {
  const main = catalogBrands.find((brand) => brand.slug === "zkteco");
  const others = catalogBrands.filter((brand) => brand.slug !== "zkteco");

  return (
    <>
      <PageHero
        title="Brands we supply"
        intro={brandLine.lead}
        crumbs={[{ href: "/", label: "Home" }, { href: "/brands", label: "Brands" }]}
      />

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-6">
        {/* Main supplier, on its own, and the only one set at headline scale. */}
        {main ? (
          <Reveal>
            <Link
              href={`/brands/${main.slug}`}
              className="group block border border-navy-900/15 bg-white p-8 transition-colors hover:border-cyan-deep sm:p-10"
            >
              <p className="tag text-cyan-ink">Main supplier</p>
              <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-navy-900 sm:text-5xl">
                <span className="link-underline">{main.name}</span>
              </h2>
              <p className="mt-3 max-w-2xl text-navy-900/75">
                Attendance terminals, access control, turnstiles and locks. We supply, install and
                configure ZKTeco systems across Karachi.
              </p>
              <p className="eyebrow mt-5 text-navy-900/70">
                {main.productCount.toLocaleString()} models · all models listed first
              </p>
            </Link>
          </Reveal>
        ) : null}

        <div className="mt-12">
          <h2 className="font-display text-2xl font-semibold text-navy-900">We also supply</h2>
          <p className="mt-2 text-navy-900/70">{brandLine.also.replace(/^We also supply /, "")}.</p>
          <RuleDraw className="mt-4" />
          <Reveal stagger className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((brand) => (
              <Link
                key={brand.slug}
                href={`/brands/${brand.slug}`}
                className="group border border-navy-900/15 bg-white p-6 transition-colors hover:border-cyan-deep"
              >
                <p className="eyebrow text-navy-900/70">{brand.productCount.toLocaleString()} products</p>
                <h3 className="mt-1 font-display text-2xl font-semibold text-navy-900">
                  <span className="link-underline">{brand.name}</span>
                </h3>
              </Link>
            ))}
          </Reveal>
        </div>
      </section>
    </>
  );
}
