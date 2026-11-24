const puppeteer = require("puppeteer-core");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://127.0.0.1:3100";

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--hide-scrollbars"] });
  const report = { overflow: [], shift: [], noJs: [] };

  // Horizontal overflow across widths.
  for (const width of [360, 390, 768, 1280, 1440]) {
    for (const path of ["/", "/catalog", "/about", "/contact", "/brands", "/products/access-control", "/locations/karachi", "/definitely-missing"]) {
      const page = await browser.newPage();
      await page.setViewport({ width, height: 900 });
      await page.goto(BASE + path, { waitUntil: "load", timeout: 90000 });
      await new Promise((r) => setTimeout(r, 400));
      const m = await page.evaluate(() => ({
        sw: document.documentElement.scrollWidth,
        cw: document.documentElement.clientWidth,
      }));
      if (m.sw - m.cw > 1) report.overflow.push({ width, path, diff: m.sw - m.cw });
      await page.close();
    }
  }

  // Layout shift caused by scrolling through deferred sections.
  for (const path of ["/", "/catalog"]) {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844 });
    await page.evaluateOnNewDocument(() => {
      window.__cls = 0;
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto(BASE + path, { waitUntil: "load", timeout: 90000 });
    await new Promise((r) => setTimeout(r, 600));
    // Step down the page the way a reader would.
    for (let i = 0; i < 14; i++) {
      await page.evaluate(() => window.scrollBy(0, Math.round(window.innerHeight * 0.8)));
      await new Promise((r) => setTimeout(r, 260));
    }
    const cls = await page.evaluate(() => window.__cls);
    report.shift.push({ path, cls: +cls.toFixed(4) });
    await page.close();
  }

  // No-JS visibility on every route.
  for (const path of ["/", "/catalog", "/about", "/contact", "/brands", "/locations/karachi", "/products/access-control"]) {
    const page = await browser.newPage();
    await page.setJavaScriptEnabled(false);
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(BASE + path, { waitUntil: "load", timeout: 90000 });
    const info = await page.evaluate(() => ({
      hiddenReveals: [...document.querySelectorAll("[data-reveal],[data-reveal-group]>*")].filter((el) => getComputedStyle(el).opacity === "0").length,
      hiddenLines: [...document.querySelectorAll(".line-mask>span")].filter((el) => getComputedStyle(el).opacity === "0").length,
      chars: document.body.innerText.trim().length,
    }));
    report.noJs.push({ path, ...info });
    await page.close();
  }

  console.log(JSON.stringify(report, null, 2));
  await browser.close();
})();
