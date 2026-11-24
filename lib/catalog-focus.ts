export const FEATURED_BRAND_SLUGS = [
  "zkteco",
  "ubiquiti",
  "ruijie-networks",
  "mikrotik",
  "dahua",
  "imou",
  "huawei-ekit",
] as const;

export const DROP_CATEGORY_SLUGS = new Set([
  "computer-accessories",
  "printer-scanners",
  "digital-signage-video-walls",
  "touch-screen-signage",
  "video-conferencing-solution",
  "ideahub-series",
  "voip-landing-phone-system",
  "ip-phones",
  "analog-gateway",
  "digital-gateway",
  "ip-pbx",
  "ip-phone-pbx",
  "dinstar",
  "linksys",
  "linksys-business-switches",
  "linksyswifi-routers",
  "cdata",
  "corning",
  "schneider",
  "latest-products-home",
  "best-selling-products-home",
  "hdmi-cable",
  "dgmax",
  "microtech",
]);

export type CategoryRef = { slug: string; name?: string };

export function isFocusedProduct(categories: CategoryRef[]) {
  const slugs = categories.map((item) => item.slug);
  const hasBrand = FEATURED_BRAND_SLUGS.some((slug) => slugs.includes(slug));
  const dropped = slugs.some((slug) => DROP_CATEGORY_SLUGS.has(slug) && slug !== "microtech");
  return hasBrand && !dropped;
}

export function featuredBrandOf(categories: CategoryRef[]) {
  return FEATURED_BRAND_SLUGS.map((slug) => categories.find((item) => item.slug === slug)).find(Boolean) ?? null;
}
