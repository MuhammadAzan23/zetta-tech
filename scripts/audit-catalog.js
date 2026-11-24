/**
 * Catalog data audit.
 *
 * Runs the exact display pipeline the site uses (lib/catalog.ts) over the
 * focus-filtered product set, then reports every item that would still look wrong
 * on a public page:
 *
 *   - missing image / title / category
 *   - a description that had to be dropped because the feed cut it mid-sentence
 *   - a description that still reads as cut off
 *   - a supplier name leaking into the name or excerpt
 *
 * Output: data-audit.csv in the project root.
 *
 * Usage: npx tsx scripts/audit-catalog.js
 */
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.join(__dirname, "..");
const load = (file) => import(pathToFileURL(path.join(root, file)).href);

function stripHtml(html) {
  return (html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  const catalog = require(path.join(root, "lib", "catalog.json"));
  const {
    catalogProducts,
    productCategoryLabel,
    productDescription,
    productName,
    productQuoteFields,
  } = await load("lib/catalog.ts");
  const { isDescriptionFragment } = await load("lib/catalog-normalise.ts");
  const { isFocusedProduct } = await load("lib/catalog-focus.ts");

  const rows = [];
  const products = catalog.products.filter((product) => isFocusedProduct(product.categories));

  for (const product of products) {
    const quote = productQuoteFields(product);
    const rawExcerpt = stripHtml(product.excerpt || product.description);
    const description = productDescription(product);
    const category = productCategoryLabel(product);

    const issues = [];
    if (!product.images || !product.images.length) issues.push("missing-image");
    if (!quote.name) issues.push("missing-title");
    if (!category) issues.push("missing-category");

    if (!rawExcerpt) issues.push("missing-description");
    else if (isDescriptionFragment(rawExcerpt)) issues.push("description-fragment");
    else if (!description) issues.push("description-empty");

    if (/microtech|microlink|digimax/i.test(quote.name)) issues.push("supplier-in-name");
    if (/microtech|microlink/i.test(rawExcerpt)) issues.push("supplier-in-excerpt");

    if (!issues.length) continue;

    rows.push({
      slug: product.slug,
      name: quote.name || product.name,
      issues: issues.join("; "),
      brand: quote.brand,
      category,
      image: product.images && product.images[0] ? product.images[0] : "",
      excerpt: (description || rawExcerpt).slice(0, 140),
      source: product.sourceUrl ?? "",
    });
  }

  const header = ["slug", "name", "issues", "brand", "category", "image", "excerpt", "source"];
  const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const csv = [header.join(","), ...rows.map((row) => header.map((key) => escape(row[key])).join(","))].join("\r\n");

  fs.writeFileSync(path.join(root, "data-audit.csv"), csv, "utf8");

  const byIssue = rows.reduce((acc, row) => {
    for (const issue of row.issues.split("; ")) acc[issue] = (acc[issue] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`Scanned ${products.length} focused products (${catalogProducts.length} rendered).`);
  console.log(`Wrote ${rows.length} flagged rows to data-audit.csv`);
  console.log(JSON.stringify(byIssue, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
