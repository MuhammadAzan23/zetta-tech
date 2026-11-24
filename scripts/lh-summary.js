const fs = require("fs");
const { join } = require("path");
const dir = join(__dirname, "..", ".ohmyagent", "motion-audit");
for (const file of fs.readdirSync(dir).filter((f) => f.startsWith("lh-") && f.endsWith(".json"))) {
  const r = JSON.parse(fs.readFileSync(join(dir, file), "utf8"));
  const c = r.categories;
  const failed = Object.values(r.audits)
    .filter((a) => a.score !== null && a.score < 1 && a.scoreDisplayMode === "binary")
    .map((a) => a.id);
  console.log(JSON.stringify({
    file,
    perf: Math.round(c.performance.score * 100),
    a11y: Math.round(c.accessibility.score * 100),
    bp: Math.round(c["best-practices"].score * 100),
    seo: Math.round(c.seo.score * 100),
    lcp: r.audits["largest-contentful-paint"]?.displayValue,
    cls: r.audits["cumulative-layout-shift"]?.displayValue,
    tbt: r.audits["total-blocking-time"]?.displayValue,
    fcp: r.audits["first-contentful-paint"]?.displayValue,
    failed: failed.slice(0, 12),
  }, null, 2));
}
