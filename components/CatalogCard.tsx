import Link from "next/link";
import ProductImage from "./ProductImage";

export type CardData = {
  slug: string;
  name: string;
  excerpt: string;
  image?: string;
  brand: string;
  category: string;
  waHref: string;
};

/**
 * Server-rendered catalog card. The enquiry button is inert markup; a single
 * client-side binder (EnquiryBinder) delegates clicks, so 680 cards cost no hydration.
 *
 * Layout: fixed 4:3 image tile, two-line title, three-line description, then the
 * actions pinned to the bottom so a row of cards lines up like a table.
 */
export default function CatalogCard({ product }: { product: CardData }) {
  return (
    <article
      data-card
      data-name={product.name.toLowerCase()}
      data-brand={product.brand.toLowerCase()}
      data-category={product.category.toLowerCase()}
      className="catalog-card group min-w-0 border border-navy-900/15 bg-white transition-colors duration-300 focus-within:border-navy-900/30 hover:border-navy-900/30"
    >
      <a href={product.waHref} aria-label={`Quote ${product.name} on WhatsApp`} className="block overflow-hidden">
        <span className="catalog-card-media">
          <ProductImage
            src={product.image}
            imgClassName="transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </span>
      </a>
      <div className="catalog-card-body p-5">
        <p className="label catalog-card-meta text-cyan-ink">
          <span>{product.brand}</span>
          <span aria-hidden="true"> · </span>
          <span>{product.category}</span>
        </p>
        <h2 className="catalog-card-title mt-2 font-display text-lg font-semibold leading-snug text-navy-900">
          <Link href={`/catalog/${product.slug}`} className="hover:text-navy-800">{product.name}</Link>
        </h2>
        {product.excerpt ? (
          <p className="catalog-card-excerpt mt-2 text-sm leading-6 text-navy-900/70">{product.excerpt}</p>
        ) : null}
        <div className="catalog-card-actions">
          <div className="flex gap-2">
            <a href={product.waHref} className="btn-whatsapp min-w-0 flex-1 whitespace-nowrap px-2.5 py-2.5 text-[0.82rem]">Quote on WhatsApp</a>
            <Link href={`/catalog/${product.slug}`} className="btn shrink-0 border border-navy-900/20 px-3.5 py-2.5 text-sm font-medium text-navy-900 hover:border-cyan-deep">
              Details
            </Link>
          </div>
          <button
            type="button"
            data-add-to-enquiry
            data-slug={product.slug}
            data-label={product.name}
            data-brand={product.brand}
            data-category={product.category}
            data-image={product.image ?? ""}
            data-href={`/catalog/${product.slug}`}
            aria-pressed="false"
            className="enquiry-add btn mt-2 w-full border border-navy-900/20 px-3 py-2.5 text-sm text-navy-900 hover:border-cyan-deep hover:bg-ice"
          >
            <span data-enquiry-add-label>Add to enquiry</span>
          </button>
        </div>
      </div>
    </article>
  );
}
