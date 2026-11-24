const puppeteer = require("puppeteer-core");

(async () => {
  const browser = await puppeteer.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto("http://127.0.0.1:3100/products/cctv-nvrs", { waitUntil: "load", timeout: 90000 });
  await new Promise((r) => setTimeout(r, 900));
  const fig = await page.evaluate(() => {
    const f = document.querySelector(".thermal-showcase");
    if (!f) return null;
    const frame = f.querySelector(".thermal-showcase-frame");
    const svg = f.querySelector("svg");
    return {
      exists: true,
      caption: f.querySelector(".thermal-showcase-label")?.textContent?.trim(),
      hasImage: !!f.querySelector("img"),
      hasSvg: !!svg,
      ratio: frame ? (frame.getBoundingClientRect().width / frame.getBoundingClientRect().height).toFixed(2) : null,
      border: frame ? getComputedStyle(frame).borderTopWidth : null,
      hasLegend: !!f.querySelector(".thermal-showcase-scale-track"),
      ariaHiddenSvg: svg ? svg.getAttribute("role") : null,
    };
  });
  console.log(JSON.stringify(fig, null, 2));
  await page.evaluate(() => document.querySelector(".thermal-showcase")?.scrollIntoView({ block: "center" }));
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: ".ohmyagent/thermal-showcase.png" });
  await browser.close();
})();
