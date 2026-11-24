const fs = require("fs");
const { join } = require("path");
const r = JSON.parse(fs.readFileSync(join(__dirname, "..", ".ohmyagent", "motion-audit", "lh-home-mobile.json"), "utf8"));
const audits = r.audits;
const keys = ["mainthread-work-breakdown", "bootup-time", "long-tasks", "network-requests", "third-party-summary", "unused-javascript", "render-blocking-resources", "legacy-javascript", "dom-size", "font-display"];
for (const k of keys) {
  const a = audits[k];
  if (!a) continue;
  console.log("##", k, "::", a.displayValue ?? "");
  if (a.details?.items?.length) {
    console.log(a.details.items.slice(0, 8).map((i) => Object.fromEntries(Object.entries(i).slice(0, 6).map(([kk, v]) => [kk, typeof v === "object" ? JSON.stringify(v).slice(0, 90) : v]))));
  }
}
console.log("## color-contrast");
console.log(JSON.stringify(audits["color-contrast"]?.details?.items?.slice(0, 10), null, 2).slice(0, 2500));
console.log("## LCP element");
console.log(JSON.stringify(audits["largest-contentful-paint-element"]?.details?.items?.[0], null, 2).slice(0, 1500));
