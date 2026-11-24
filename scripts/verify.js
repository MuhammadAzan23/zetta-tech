const puppeteer = require("puppeteer-core");
(async () => {
  const browser = await puppeteer.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto("http://127.0.0.1:3100/catalog", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 500));
  const before = await page.evaluate(() => ({ cards: document.querySelectorAll("[data-card]").length, count: document.getElementById("catalog-count")?.textContent }));
  await page.click("#catalog-filter");
  await page.type("#catalog-filter", "camera", { delay: 25 });
  await new Promise((r) => setTimeout(r, 800));
  const after = await page.evaluate(() => ({
    value: document.querySelector("#catalog-filter").value,
    cards: document.querySelectorAll("[data-card]").length,
    count: document.getElementById("catalog-count")?.textContent,
    empty: document.body.innerText.includes("No products match"),
  }));
  // brand filter via DOM click
  await page.evaluate(() => [...document.querySelectorAll("button[aria-pressed]")].find((b) => b.textContent.trim() === "Dahua")?.click());
  await new Promise((r) => setTimeout(r, 700));
  const brand = await page.evaluate(() => ({ cards: document.querySelectorAll("[data-card]").length, count: document.getElementById("catalog-count")?.textContent }));
  // load more
  await page.evaluate(() => { const i = document.getElementById("catalog-filter"); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; set.call(i, ""); i.dispatchEvent(new Event("input", { bubbles: true })); });
  await page.evaluate(() => [...document.querySelectorAll("button[aria-pressed]")].find((b) => b.textContent.trim() === "All brands")?.click());
  await new Promise((r) => setTimeout(r, 400));
  const beforeMore = await page.evaluate(() => document.querySelectorAll("[data-card]").length);
  await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Load"))?.click());
  await new Promise((r) => setTimeout(r, 800));
  const afterMore = await page.evaluate(() => ({ cards: document.querySelectorAll("[data-card]").length, skeletons: document.querySelectorAll(".animate-pulse").length }));
  console.log(JSON.stringify({ before, after, brand, beforeMore, afterMore }, null, 2));

  // header single-jump probe
  const h = await browser.newPage();
  await h.setViewport({ width: 1440, height: 900 });
  await h.goto("http://127.0.0.1:3100/", { waitUntil: "networkidle0" });
  await h.evaluate(() => window.scrollTo(0, 500));
  await new Promise((r) => setTimeout(r, 700));
  const jump = await h.evaluate(() => ({ y: window.scrollY, t: getComputedStyle(document.querySelector("header")).transform, cls: document.querySelector("header").className.includes("-translate") }));
  console.log(JSON.stringify({ jump }, null, 2));
  await browser.close();
})();
