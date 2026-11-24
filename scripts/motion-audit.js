const puppeteer = require("puppeteer-core");
const { join } = require("path");
const fs = require("fs");

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const base = process.env.BASE || "http://127.0.0.1:3100";
const out = join(__dirname, "..", ".ohmyagent", "motion-audit");
if (!fs.existsSync(out)) fs.mkdirSync(out, { recursive: true });

const widths = [
  { name: "mob-360", width: 360, height: 780 },
  { name: "mob-390", width: 390, height: 844 },
  { name: "tab-768", width: 768, height: 1024 },
  { name: "desk-1280", width: 1280, height: 900 },
  { name: "desk-1440", width: 1440, height: 900 },
];

const pages = ["/", "/catalog", "/about", "/contact", "/brands", "/brands/zkteco", "/products/access-control", "/locations/karachi", "/catalog/category/access-control-system", "/definitely-missing"];

(async () => {
  const browser = await puppeteer.launch({ executablePath: chrome, headless: "new", args: ["--hide-scrollbars"] });
  const report = { overflow: [], errors: [], noJs: [], reduced: [], consoleErrors: [] };

  for (const frame of widths) {
    for (const path of pages) {
      const page = await browser.newPage();
      page.on("pageerror", (err) => report.errors.push(`${path}: ${err}`));
      page.on("console", (msg) => { if (msg.type() === "error") report.consoleErrors.push(`${path}: ${msg.text()}`); });
      await page.setViewport({ width: frame.width, height: frame.height });
      const status = await page.goto(base + path, { waitUntil: "networkidle0", timeout: 60000 });
      await new Promise((r) => setTimeout(r, 500));
      const measure = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        hiddenReveals: [...document.querySelectorAll("[data-reveal]")].filter((el) => getComputedStyle(el).opacity === "0").length,
      }));
      const overflow = measure.scrollWidth - measure.clientWidth;
      if (overflow > 1) report.overflow.push({ path, frame: frame.name, overflow, status: status.status(), ...measure });
      await page.close();
    }
  }

  // No-JS: content must be visible.
  for (const path of ["/", "/catalog", "/about", "/contact"]) {
    const page = await browser.newPage();
    await page.setJavaScriptEnabled(false);
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(base + path, { waitUntil: "networkidle0", timeout: 60000 });
    const info = await page.evaluate(() => ({
      h1: document.querySelector("h1")?.textContent?.trim().slice(0, 60),
      h1Opacity: document.querySelector("h1") ? getComputedStyle(document.querySelector("h1")).opacity : null,
      hidden: [...document.querySelectorAll("[data-reveal],[data-reveal-group]>*")].filter((el) => getComputedStyle(el).opacity === "0").length,
      textLength: document.body.innerText.trim().length,
      detailsText: [...document.querySelectorAll("details p")].map((p) => p.textContent.length).reduce((a, b) => a + b, 0),
    }));
    report.noJs.push({ path, ...info });
    await page.close();
  }

  // Reduced motion on home.
  const rm = await browser.newPage();
  await rm.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await rm.setViewport({ width: 1440, height: 900 });
  await rm.goto(base + "/", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 600));
  const reduced = await rm.evaluate(() => ({
    hidden: [...document.querySelectorAll("[data-reveal],[data-reveal-group]>*")].filter((el) => getComputedStyle(el).opacity === "0").length,
    transforms: [...document.querySelectorAll(".line-mask > span, [data-hero-fade]")].map((el) => getComputedStyle(el).transform).filter((t) => t !== "none").length,
    faqOpen: (() => { const d = document.querySelector("details"); d.open = true; const p = d.querySelector("p"); return p ? getComputedStyle(p.parentElement.parentElement).gridTemplateRows : null; })(),
  }));
  report.reduced.push(reduced);
  await rm.screenshot({ path: join(out, "home-reduced.png"), fullPage: false });
  await rm.close();

  // Screenshots + interaction checks on home at 1440.
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(base + "/", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: join(out, "home-1440-hero.png") });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: join(out, "home-1440-bottom.png") });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 400));

  const header = await page.evaluate(async () => {
    const el = document.querySelector("header");
    window.scrollTo(0, 400);
    await new Promise((r) => setTimeout(r, 400));
    const down = getComputedStyle(el).transform;
    const shadow = getComputedStyle(el).boxShadow;
    window.scrollTo(0, 200);
    await new Promise((r) => setTimeout(r, 400));
    const up = getComputedStyle(el).transform;
    return { down, shadow, up };
  });
  report.header = header;

  // Enquiry: add from a featured card, open drawer, check focus + count.
  await page.evaluate(() => window.scrollTo(0, 900));
  await new Promise((r) => setTimeout(r, 300));
  await page.evaluate(() => {
    const btn = document.querySelector("[data-card] button[aria-pressed]");
    btn?.scrollIntoView({ block: "center" });
    btn?.click();
  });
  await new Promise((r) => setTimeout(r, 900));
  const counterText = await page.evaluate(() => document.querySelector("[data-enquiry-count]")?.textContent ?? null);
  await page.evaluate(() => document.querySelector("[data-enquiry-anchor]")?.click());
  await new Promise((r) => setTimeout(r, 500));
  const drawer = await page.evaluate(() => ({
    dialog: !!document.querySelector('[role=dialog]'),
    active: document.activeElement?.getAttribute("aria-label") || document.activeElement?.textContent?.trim().slice(0, 30),
    items: document.querySelectorAll('[role=dialog] li').length,
    bodyOverflow: document.body.style.overflow,
  }));
  await page.keyboard.press("Escape");
  await new Promise((r) => setTimeout(r, 300));
  const afterEsc = await page.evaluate(() => !!document.querySelector('[role=dialog]'));
  report.enquiry = { counterText, ...drawer, closedOnEsc: !afterEsc };
  await page.screenshot({ path: join(out, "home-1440-drawer-open.png") });

  // Catalog filter with FLIP; empty state.
  await page.goto(base + "/catalog", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 500));
  await page.type("#catalog-filter", "zzzznope", { delay: 15 });
  await new Promise((r) => setTimeout(r, 600));
  const emptyState = await page.evaluate(() => ({
    cards: document.querySelectorAll("[data-card]").length,
    text: document.body.innerText.includes("No products match"),
  }));
  await page.screenshot({ path: join(out, "catalog-empty.png") });
  await page.click("#catalog-filter", { clickCount: 3 });
  await page.keyboard.press("Backspace");
  await page.type("#catalog-filter", "camera", { delay: 15 });
  await new Promise((r) => setTimeout(r, 800));
  const filtered = await page.evaluate(() => ({ cards: document.querySelectorAll("[data-card]").length }));
  report.catalog = { emptyState, filtered };
  await page.screenshot({ path: join(out, "catalog-filtered.png"), fullPage: false });

  // Mobile menu focus trap at 390.
  const mob = await browser.newPage();
  await mob.setViewport({ width: 390, height: 844 });
  await mob.goto(base + "/", { waitUntil: "networkidle0" });
  await mob.click('button[aria-controls="mobile-menu"]');
  await new Promise((r) => setTimeout(r, 500));
  const menu = await mob.evaluate(() => ({
    open: !!document.querySelector("#mobile-menu"),
    active: document.activeElement?.textContent?.trim().slice(0, 24),
    expanded: document.querySelector('button[aria-controls="mobile-menu"]')?.getAttribute("aria-expanded"),
  }));
  await mob.screenshot({ path: join(out, "mob-390-menu.png") });
  await mob.keyboard.press("Escape");
  await new Promise((r) => setTimeout(r, 300));
  const menuClosed = await mob.evaluate(() => !document.querySelector("#mobile-menu"));
  report.menu = { ...menu, closedOnEsc: menuClosed };

  // Contact form validation.
  await mob.goto(base + "/contact", { waitUntil: "networkidle0" });
  await mob.evaluate(() => document.querySelector("form button[type=submit]").click());
  await new Promise((r) => setTimeout(r, 300));
  const form = await mob.evaluate(() => ({
    invalid: [...document.querySelectorAll("[aria-invalid=true]")].length,
    live: document.querySelector("[aria-live]")?.textContent?.trim(),
    focusedId: document.activeElement?.id,
  }));
  report.form = form;
  await mob.screenshot({ path: join(out, "mob-390-contact-form.png") });
  await mob.close();

  console.log(JSON.stringify(report, null, 2));
  await browser.close();
})().catch((err) => { console.error(err); process.exit(1); });
