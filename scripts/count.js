const puppeteer = require("puppeteer-core");
(async () => {
  const browser = await puppeteer.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("http://127.0.0.1:3100/", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1500));
  const info = await page.evaluate(() => {
    const scripts = [...document.querySelectorAll("script[src]")].map((s) => s.src.split("/").pop());
    return {
      scripts,
      revealCount: document.querySelectorAll("[data-reveal],[data-reveal-group]").length,
      svgCount: document.querySelectorAll("svg").length,
      ledCount: document.querySelectorAll("[data-led]").length,
      nodes: document.querySelectorAll("*").length,
      htmlKB: Math.round(document.documentElement.outerHTML.length / 1024),
    };
  });
  console.log(JSON.stringify({ ...info, errors }, null, 2));
  await browser.close();
})();
