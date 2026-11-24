const puppeteer = require("puppeteer-core");
(async () => {
  const browser = await puppeteer.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: "new" });
  const page = await browser.newPage();
  page.on("pageerror", (e) => console.log("PAGEERROR", String(e)));
  page.on("console", (m) => { if (m.type() === "error") console.log("CONSOLE", m.text()); });
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto("http://127.0.0.1:3100/catalog", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 400));
  const before = await page.evaluate(() => ({ cards: document.querySelectorAll("[data-card]").length, count: document.getElementById("catalog-count")?.textContent }));
  await page.type("#catalog-filter", "camera", { delay: 30 });
  await new Promise((r) => setTimeout(r, 900));
  const after = await page.evaluate(() => ({
    value: document.querySelector("#catalog-filter")?.value,
    cards: document.querySelectorAll("[data-card]").length,
    count: document.getElementById("catalog-count")?.textContent,
    emptyText: document.body.innerText.includes("No products match"),
    firstNames: [...document.querySelectorAll("[data-card] h2")].slice(0, 3).map((h) => h.textContent),
  }));
  // brand click
  await page.evaluate(() => [...document.querySelectorAll("button[aria-pressed]")].find((b) => b.textContent.trim() === "Dahua")?.click());
  await new Promise((r) => setTimeout(r, 700));
  const brand = await page.evaluate(() => ({ cards: document.querySelectorAll("[data-card]").length, count: document.getElementById("catalog-count")?.textContent }));
  console.log(JSON.stringify({ before, after, brand }, null, 2));
  await browser.close();
})();
