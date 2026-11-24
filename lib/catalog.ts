import catalogData from "./catalog.json";
import { DROP_CATEGORY_SLUGS, FEATURED_BRAND_SLUGS, featuredBrandOf, isFocusedProduct } from "./catalog-focus";
import {
  accessControlOverride,
  CATEGORY_PRIORITY,
  canonicalCategory,
  cleanDescription,
  inferCategory,
  normaliseBrands,
  normaliseCategoryName,
  normaliseTitle,
  scrubSuppliers,
  teaser,
} from "./catalog-normalise";
import { productWaLink } from "./site";

export type CatalogCategoryRef = { id: number; name: string; slug: string };
export type CatalogProduct = {
  id: number;
  slug: string;
  name: string;
  excerpt: string;
  description: string;
  categories: CatalogCategoryRef[];
  images: string[];
  sourceUrl: string;
  modified: string;
};
export type CatalogCategory = {
  id: number;
  name: string;
  slug: string;
  parent: number;
  count: number;
};
export type CatalogBrand = {
  id: number;
  name: string;
  slug: string;
  productCount: number;
};

type CatalogData = {
  source: string;
  importedAt: string;
  categories: CatalogCategory[];
  brands: CatalogBrand[];
  products: CatalogProduct[];
};

const data = catalogData as CatalogData;

export function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function brandRank(product: CatalogProduct) {
  const slug = featuredBrandOf(product.categories)?.slug;
  const index = slug ? FEATURED_BRAND_SLUGS.indexOf(slug as (typeof FEATURED_BRAND_SLUGS)[number]) : -1;
  return index === -1 ? 99 : index;
}

export const catalogSource = data.source;
export const catalogImportedAt = data.importedAt;

export const catalogProducts = data.products
  .filter((product) => isFocusedProduct(product.categories))
  .sort((a, b) => brandRank(a) - brandRank(b) || a.name.localeCompare(b.name));

/**
 * Public display names for categories, so the menu, breadcrumbs and cards all
 * agree ("Access Control Systems" everywhere, never "Microtech").
 */
const categoryDisplayNames = new Map<number, string>(
  data.categories.map((category) => [category.id, normaliseCategoryName(category.name)]),
);

export function categoryNameFor(product: CatalogProduct, slug: string) {
  const ref = product.categories.find((item) => item.slug === slug);
  return ref ? categoryDisplayNames.get(ref.id) ?? normaliseCategoryName(ref.name) : undefined;
}

const usedCategoryIds = new Set(catalogProducts.flatMap((product) => product.categories.map((item) => item.id)));

export const catalogCategories = data.categories
  .filter((category) => usedCategoryIds.has(category.id) && !DROP_CATEGORY_SLUGS.has(category.slug))
  // "Featured products" / "Latest products" are storefront listing buckets, not product types.
  .filter((category) => !/featured products|latest products|best selling/i.test(category.name))
  .map((category) => ({
    ...category,
    name: normaliseCategoryName(category.name),
    count: catalogProducts.filter((product) => product.categories.some((item) => item.id === category.id)).length,
  }))
  .filter((category) => category.count > 0);

export const catalogBrands: CatalogBrand[] = FEATURED_BRAND_SLUGS.map((slug) => {
  const source = data.brands.find((brand) => brand.slug === slug);
  const productCount = catalogProducts.filter((product) => product.categories.some((item) => item.slug === slug)).length;
  return {
    id: source?.id ?? 0,
    name: normaliseBrands(source?.name ?? slug),
    slug,
    productCount,
  };
}).filter((brand) => brand.productCount > 0);

export function getCatalogProduct(slug: string) {
  return catalogProducts.find((product) => product.slug === slug);
}

export function getCatalogCategory(slug: string) {
  return catalogCategories.find((category) => category.slug === slug);
}

export function getCatalogBrand(slug: string) {
  return catalogBrands.find((brand) => brand.slug === slug);
}

export function productsForCategory(category: CatalogCategory) {
  return catalogProducts.filter((product) => product.categories.some((item) => item.id === category.id));
}

export function productsForBrand(brand: CatalogBrand) {
  return catalogProducts.filter((product) => product.categories.some((item) => item.slug === brand.slug));
}

export function productCategoryLabel(product: CatalogProduct) {
  const brandSlug = featuredBrandOf(product.categories)?.slug;
  const supplierSlugs = new Set(["microtech", "microlink", "cdata", "corning", "schneider", "dinstar", "ai-tek"]);
  const usable = product.categories.filter((item) => item.slug !== brandSlug && !supplierSlugs.has(item.slug));

  // Access-control families filed under Security Inspection Devices get moved.
  const override = accessControlOverride(product.name);
  if (override) return override;

  // Collect every canonical label this product qualifies for, then take the most
  // specific: a fingerprint terminal in a camera category still reads "Time Attendance".
  const labels = usable.map((item) => canonicalCategory(item.name)).filter((label): label is string => Boolean(label));
  if (labels.length) {
    const best = labels.sort((a, b) => CATEGORY_PRIORITY.indexOf(a) - CATEGORY_PRIORITY.indexOf(b))[0];
    // "Security Inspection" is the feed's catch-all. If the title says plainly what
    // the product is (a time-attendance terminal, a barrier gate), trust the title.
    if (best !== "Security Inspection") return best;
    return inferCategory(product.name) ?? best;
  }

  // Brand-only products: infer a real type from the title, else a generic label.
  return inferCategory(product.name) ?? "Security & Surveillance";
}

/** Clean display name for a product. */
export function productName(product: CatalogProduct) {
  return normaliseTitle(product.name);
}

/** Public one-paragraph description, or "" when the feed only had a fragment. */
export function productDescription(product: CatalogProduct) {
  return cleanDescription(stripHtml(product.excerpt || product.description));
}

export function productQuoteFields(product: CatalogProduct) {
  return {
    name: productName(product),
    brand: normaliseBrands(featuredBrandOf(product.categories)?.name ?? "Zetta Tech"),
    category: productCategoryLabel(product),
    details: productDescription(product).slice(0, 280),
  };
}

export const featuredProducts = catalogProducts.filter((product) => product.categories.some((item) => item.slug === "zkteco")).slice(0, 12);

/** Compact payload for the catalog filter index: only what the filter reads. */
export function catalogGridItems(products: CatalogProduct[]) {
  return products.map((product) => {
    const quote = productQuoteFields(product);
    return {
      slug: product.slug,
      name: quote.name,
      brand: quote.brand,
      category: quote.category,
      image: product.images[0],
      excerpt: teaser(stripHtml(product.excerpt), 120),
    };
  });
}

/** Serialisable card payload used by CatalogCard. */
export function catalogCardData(product: CatalogProduct) {
  const quote = productQuoteFields(product);
  return {
    slug: product.slug,
    name: quote.name,
    excerpt: teaser(stripHtml(product.excerpt), 200),
    image: product.images[0],
    brand: quote.brand,
    category: quote.category,
    waHref: productWaLink(quote),
  };
}

/** Normalised category list for menus and category pages. */
export function displayCategoryName(category: CatalogCategory) {
  return scrubSuppliers(normaliseCategoryName(category.name));
}
