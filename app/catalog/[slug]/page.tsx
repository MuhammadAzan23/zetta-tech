import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import ProductGallery from "@/components/ProductGallery";
import Reveal from "@/components/motion/Reveal";
import {
  catalogProducts,
  getCatalogProduct,
  productCategoryLabel,
  productDescription,
  productDisplayName,
  productName,
  productQuoteFields,
  stripHtml,
} from "@/lib/catalog";
import { absoluteUrl, productWaLink, site } from "@/lib/site";

type Props = { params: { slug: string } };
export const dynamicParams = false;
export function generateStaticParams() {
  return catalogProducts.map((product) => ({ slug: product.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const product = getCatalogProduct(params.slug);
  if (!product) return {};
  const name = productName(product);
  const description =
    productDescription(product).slice(0, 155) || `Ask Zetta Tech about ${name} in Karachi.`;
  return {
    title: name,
    description,
    alternates: { canonical: `/catalog/${product.slug}` },
    openGraph: { title: name, description, url: `/catalog/${product.slug}`, type: "website" },
  };
}

/**
 * Specification rows come only from the feed. The description is split on <br>/list
 * breaks, and each line that reads "Label: value" becomes a row; anything else is
 * left in the prose block rather than invented.
 */
function specRows(product: NonNullable<ReturnType<typeof getCatalogProduct>>) {
  const raw = product.description || product.excerpt || "";
  const lines = raw
    .replace(/<\/(p|li|div|tr)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .split("\n")
    .map((line) => stripHtml(line).replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 2 && line.length < 120);

  const rows: { label: string; value: string }[] = [];
  const seen = new Set<string>();
  for (const line of lines) {
    const match = line.match(/^([A-Za-z][A-Za-z0-9 /&().-]{1,34}):\s*(.+)$/);
    if (!match) continue;
    const label = match[1].trim();
    const value = match[2].trim();
    if (!value || seen.has(label.toLowerCase())) continue;
    seen.add(label.toLowerCase());
    rows.push({ label, value });
  }
  return rows.slice(0, 10);
}

export default function CatalogProductPage({ params }: Props) {
  const product = getCatalogProduct(params.slug);
  if (!product) notFound();
  const quote = productQuoteFields(product);
  // Visible heading: the brand is already the tag directly above it, so the title
  // does not repeat it. The full name is still used for metadata and JSON-LD, where
  // the brand in the title helps search.
  const name = productDisplayName(product);
  const fullName = productName(product);
  const description = productDescription(product);
  const category = productCategoryLabel(product);
  const specs = specRows(product);

  // Related: products sharing this product's main feed category, never this page.
  const primaryCategory = product.categories[0];
  const related = primaryCategory
    ? catalogProducts
        .filter(
          (item) =>
            item.slug !== product.slug &&
            item.categories.some((category) => category.id === primaryCategory.id),
        )
        .slice(0, 4)
    : [];

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: fullName,
    description: description.slice(0, 500) || undefined,
    sku: product.slug,
    brand: { "@type": "Brand", name: quote.brand },
    category,
    image: product.images.slice(0, 3).map((image) => absoluteUrl(image)),
    url: absoluteUrl(`/catalog/${product.slug}`),
    // No price: the feed carries none and we do not invent one.
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      url: absoluteUrl(`/catalog/${product.slug}`),
      seller: { "@type": "Organization", name: site.name },
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Catalog", item: absoluteUrl("/catalog") },
      { "@type": "ListItem", position: 3, name: fullName, item: absoluteUrl(`/catalog/${product.slug}`) },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <PageHero
        title={name}
        intro={`${quote.brand} ${category.toLowerCase()} available from Zetta Tech in Karachi.`}
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/catalog", label: "Catalog" },
          { href: `/catalog/${product.slug}`, label: name },
        ]}
      />
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <Reveal>
          <ProductGallery
            images={product.images}
            name={name}
            enquiry={{ slug: product.slug, name, brand: quote.brand, category: quote.category, href: `/catalog/${product.slug}` }}
          />
        </Reveal>
        <Reveal delay={0.05}>
          <p className="eyebrow text-cyan-ink">
            <span>{quote.brand}</span>
            <span aria-hidden="true"> · </span>
            <span>{category}</span>
          </p>
          <h2 className="h-display mt-3 text-3xl text-navy-900 sm:text-4xl">{name}</h2>
          {description ? (
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-navy-900/75">{description}</p>
          ) : (
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-navy-900/75">
              Message us for the full specification, current price and installation options for this model.
            </p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={productWaLink({ ...quote, quantity: 1 })} className="btn-whatsapp">Quote on WhatsApp</a>
            <Link href="/catalog" className="btn-outline px-6 py-3.5">Back to catalog</Link>
          </div>
          <p className="eyebrow mt-8 text-navy-900/70">Source: supplier catalog, reviewed for publication</p>
        </Reveal>
      </section>

      <section className="border-t border-navy-900/15 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6">
          <Reveal>
            <p className="eyebrow text-cyan-ink">Specification</p>
            <h2 className="h-display mt-3 text-3xl text-navy-900">Technical details</h2>
            <dl className="mt-8 grid max-w-4xl border-t border-navy-900/15 sm:grid-cols-2 sm:gap-x-10">
              {[
                { label: "Brand", value: quote.brand },
                { label: "Category", value: category },
                ...specs,
              ].map((row) => (
                <div key={row.label} className="flex justify-between gap-6 border-b border-navy-900/15 py-3.5">
                  <dt className="text-sm font-medium text-navy-900/70">{row.label}</dt>
                  <dd className="text-right text-sm font-semibold text-navy-900">{row.value}</dd>
                </div>
              ))}
            </dl>
            <p className="eyebrow mt-6 text-navy-900/70">
              {specs.length
                ? "Datasheet rows above come from the supplier catalogue. Confirm the exact revision with us before ordering."
                : "This model's datasheet lists no labelled specification rows, so ask us for the PDF before ordering."}
            </p>
          </Reveal>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="border-t border-navy-900/15">
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6">
            <Reveal>
              <p className="eyebrow text-cyan-ink">Same category</p>
              <h2 className="h-display mt-3 text-3xl text-navy-900">Related products</h2>
            </Reveal>
            <Reveal stagger className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/catalog/${item.slug}`}
                  className="group border border-navy-900/15 bg-white p-4 transition-colors hover:border-navy-900/30"
                >
                  <span className="catalog-card-media relative block">
                    {item.images[0] ? (
                      <Image
                        src={item.images[0]}
                        alt={productName(item)}
                        fill
                        sizes="(min-width: 1024px) 18rem, (min-width: 640px) 40vw, 88vw"
                        className="object-contain"
                      />
                    ) : (
                      <span className="eyebrow text-navy-900/70">No image</span>
                    )}
                  </span>
                  <span className="mt-2 block font-display text-base font-semibold leading-snug text-navy-900">
                    {productName(item)}
                  </span>
                  <span className="eyebrow mt-2 block text-navy-900/70">{productCategoryLabel(item)}</span>
                </Link>
              ))}
            </Reveal>
          </div>
        </section>
      ) : null}
    </>
  );
}
