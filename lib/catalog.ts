import catalogData from "./catalog.json";

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

export const catalogSource = data.source;
export const catalogImportedAt = data.importedAt;
export const catalogCategories = data.categories;
export const catalogBrands = data.brands;
export const catalogProducts = data.products;

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
  return catalogProducts.filter((product) => product.categories.some((item) => item.id === brand.id));
}
