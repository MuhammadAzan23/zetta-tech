import Link from "next/link";
import CatalogCard from "./CatalogCard";
import { catalogCardData, featuredProducts } from "@/lib/catalog";
import Reveal from "./motion/Reveal";

export default function FeaturedCatalog() {
  return (
    <section id="catalog" className="defer-paint mx-auto max-w-7xl px-5 py-16 sm:px-6">
      <Reveal>
        <p className="label text-cyan-ink">Focused catalog</p>
        <h2 className="h-display mt-3 max-w-3xl text-4xl text-navy-900 sm:text-5xl">Products that belong on a Karachi security site</h2>
        <p className="mt-4 max-w-xl text-navy-900/75">ZKTeco first. Networking and CCTV we actually install. Printer cartridges, VoIP gateways and consumer leftovers are out of the list.</p>
      </Reveal>
      <Reveal stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {featuredProducts.map((product) => <CatalogCard key={product.id} product={catalogCardData(product)} />)}
      </Reveal>
      <p className="mt-8">
        <Link href="/catalog" className="link-underline font-semibold text-navy-900 decoration-cyan-brand decoration-2 underline-offset-4">Browse the full catalog</Link>
      </p>
    </section>
  );
}
