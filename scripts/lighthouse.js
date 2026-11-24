const puppeteer = require("puppeteer-core");
const { execSync } = require("child_process");
const { join } = require("path");

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const base = process.env.BASE || "http://127.0.0.1:3100";
const out = join(__dirname, "..", ".ohmyagent", "motion-audit");

const runs = [
  { name: "home-mobile", path: "/", mobile: true },
  { name: "home-desktop", path: "/", mobile: false },
  { name: "catalog-mobile", path: "/catalog", mobile: true },
  { name: "contact-mobile", path: "/contact", mobile: true },
];

(async () => {
  const results = [];
  for (const run of runs) {
    const formFactor = run.mobile ? "mobile" : "desktop";
    const cmd = `npx --yes lighthouse ${base}${run.path} --chrome-path="${chrome}" --only-categories=performance,accessibility,best-practices,seo --form-factor=${formFactor} --throttling-method=simulate --output=json --output-path="${join(out, `lh-${run.name}.json`)}" --quiet --chrome-flags="--headless=new --no-sandbox"`;
    try {
      execSync(cmd, { stdio: "inherit", timeout: 240000 });
      const report = require(join(out, `lh-${run.name}.json`));
      results.push({
        name: run.name,
        performance: Math.round(report.categories.performance.score * 100),
        accessibility: Math.round(report.categories.accessibility.score * 100),
        bestPractices: Math.round(report.categories["best-practices"].score * 100),
        seo: Math.round(report.categories.seo.score * 100),
        lcp: report.audits["largest-contentful-paint"].displayValue,
        cls: report.audits["cumulative-layout-shift"].displayValue,
        tbt: report.audits["total-blocking-time"].displayValue,
      });
    } catch (error) {
      results.push({ name: run.name, error: String(error.message).slice(0, 200) });
    }
  }
  console.log(JSON.stringify(results, null, 2));
})();
