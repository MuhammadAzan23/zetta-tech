import Link from "next/link";
import type { CatalogProduct } from "@/lib/catalog";

export default function CatalogCard({ product }: { product: CatalogProduct }) {
  const category = product.categories[0];
  return (
    <article className="group flex min-w-0 flex-col border border-navy-900/15 bg-white">
      <Link href={`/catalog/${product.slug}`} className="block">
        <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-ice p-5">
          {product.images[0] ? (
            <img src={product.images[0]} alt={product.name} loading="lazy" className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <span className="label text-navy-900/40">Product image unavailable</span>
          )}
        </div>
        <div className="p-5">
          {category && <p className="label text-cyan-deep">{category.name}</p>}
          <h2 className="mt-2 font-display text-xl font-semibold leading-tight text-navy-900 group-hover:underline group-hover:decoration-cyan-brand group-hover:decoration-2 group-hover:underline-offset-4">{product.name}</h2>
          {product.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-6 text-navy-900/70" dangerouslySetInnerHTML={{ __html: product.excerpt }} />}
        </div>
      </Link>
    </article>
  );
}
