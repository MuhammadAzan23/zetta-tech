const { writeFileSync } = require("fs");
const { join } = require("path");
const catalog = require("../lib/catalog.json");

const FEATURED_BRAND_SLUGS = ["zkteco", "ubiquiti", "ruijie-networks", "mikrotik", "dahua", "imou", "huawei-ekit"];
const DROP_CATEGORY_SLUGS = new Set([
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

function isFocusedProduct(categories) {
  const slugs = categories.map((item) => item.slug);
  const hasBrand = FEATURED_BRAND_SLUGS.some((slug) => slugs.includes(slug));
  const dropped = slugs.some((slug) => DROP_CATEGORY_SLUGS.has(slug) && slug !== "microtech");
  return hasBrand && !dropped;
}

function featuredBrandOf(categories) {
  return FEATURED_BRAND_SLUGS.map((slug) => categories.find((item) => item.slug === slug)).find(Boolean) ?? null;
}

function stripHtml(html) {
  return String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const products = catalog.products.filter((product) => isFocusedProduct(product.categories));
const index = products.map((product) => {
  const brand = featuredBrandOf(product.categories);
  const category =
    product.categories.find((item) => item.slug !== brand?.slug && item.slug !== "microtech")?.name ??
    product.categories[0]?.name ??
    "Security";
  return {
    slug: product.slug,
    name: product.name,
    brand: brand?.name ?? "Zetta Tech",
    category,
    details: stripHtml(product.excerpt || product.description).slice(0, 160),
  };
});

writeFileSync(join(__dirname, "..", "lib", "search-index.json"), JSON.stringify(index));
writeFileSync(join(__dirname, "..", "public", "search-index.json"), JSON.stringify(index));
console.log(`search-index.json ${index.length} items`);
