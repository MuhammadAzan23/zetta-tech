const puppeteer = require("puppeteer-core");
(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
  });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (err) => errors.push(String(err)));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle0" });
  await page.focus("#product-search");
  await page.evaluate(() => {
    const input = document.getElementById("product-search");
    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await page.type("#product-search", "zzzznope", { delay: 20 });
  await new Promise((r) => setTimeout(r, 400));
  const empty = await page.evaluate(() => {
    const input = document.getElementById("product-search");
    const list = document.getElementById(input.getAttribute("aria-controls"));
    return {
      value: input.value,
      expanded: input.getAttribute("aria-expanded"),
      listText: list?.textContent ?? null,
      listCount: document.querySelectorAll('[role=listbox]').length,
    };
  });
  await page.click("#product-search", { clickCount: 3 });
  await page.keyboard.press("Backspace");
  await page.type("#product-search", "fingerprint", { delay: 20 });
  await new Promise((r) => setTimeout(r, 400));
  const hits = await page.evaluate(() => {
    const options = [...document.querySelectorAll('[role=option]')].map((n) => n.textContent.trim().slice(0, 90));
    return { count: options.length, first: options[0], href: document.querySelector('[role=option]')?.getAttribute("href") };
  });
  const catalog = await page.goto("http://127.0.0.1:3000/catalog", { waitUntil: "domcontentloaded" });
  const missing = await page.goto("http://127.0.0.1:3000/catalog/this-slug-does-not-exist", { waitUntil: "domcontentloaded" });
  console.log(JSON.stringify({ empty, hits, catalog: catalog.status(), missing: missing.status(), errors }, null, 2));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
