import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { brands, categories, cities } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/about",
    "/contact",
    ...categories.map((c) => `/products/${c.slug}`),
    ...brands.map((b) => `/brands/${b.slug}`),
    ...cities.map((c) => `/locations/${c.slug}`),
  ];
  return paths.map((p) => ({ url: `${site.url}${p}`, lastModified: new Date() }));
}
