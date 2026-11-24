import Link from "next/link";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/motion/Reveal";
import { catalogBrands } from "@/lib/catalog";

export const metadata = { title: "Brands", description: "ZKTeco, Ubiquiti, Ruijie, MikroTik, Dahua, Imou and Huawei eKit products supplied by Zetta Tech.", alternates: { canonical: "/brands" } };

export default function BrandsPage() {
  return (
    <>
      <PageHero title="Brands we supply" intro="ZKTeco is our main supplier. The rest are networking and CCTV brands we install on Karachi sites." crumbs={[{ href: "/", label: "Home" }, { href: "/brands", label: "Brands" }]} />
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6">
        <Reveal stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {catalogBrands.map((brand) => (
            <Link key={brand.slug} href={`/brands/${brand.slug}`} className="group border border-navy-900/15 bg-white p-6 transition-colors hover:border-cyan-deep">
              <p className="label text-cyan-ink">{brand.slug === "zkteco" ? "Main supplier · " : ""}{brand.productCount} products</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-navy-900">
                <span className="link-underline">{brand.name}</span>
              </h2>
            </Link>
          ))}
        </Reveal>
      </section>
    </>
  );
}
