const puppeteer = require("puppeteer-core");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://127.0.0.1:3100";
const log = (...a) => console.log(...a);

async function newPage(browser, opts = {}) {
  const page = await browser.newPage();
  await page.setViewport({ width: opts.width || 390, height: opts.height || 844 });
  if (opts.reduced) await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  if (opts.nojs) await page.setJavaScriptEnabled(false);
  return page;
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new" });
  const out = {};

  // 1. Reveals fire on scroll; hero CSS animation completes with no hydration.
  {
    const page = await newPage(browser, { width: 1440, height: 900 });
    await page.goto(BASE + "/", { waitUntil: "load" });
    await new Promise((r) => setTimeout(r, 1500));
    const hero = await page.evaluate(() => ({
      jsClass: document.documentElement.classList.contains("js"),
      h1Visible: getComputedStyle(document.querySelector("h1")).opacity,
      lineTransforms: [...document.querySelectorAll(".line-mask > span")].map((el) => getComputedStyle(el).transform),
    }));
    await page.evaluate(() => window.scrollTo(0, 2400));
    await new Promise((r) => setTimeout(r, 1200));
    const mid = await page.evaluate(() => {
      const els = [...document.querySelectorAll("[data-reveal],[data-reveal-group]")];
      return { total: els.length, inCount: els.filter((e) => e.classList.contains("is-in")).length };
    });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise((r) => setTimeout(r, 1500));
    const bottom = await page.evaluate(() => {
      const els = [...document.querySelectorAll("[data-reveal],[data-reveal-group]")];
      const hidden = els.filter((e) => getComputedStyle(e.firstElementChild || e).opacity === "0");
      return { total: els.length, inCount: els.filter((e) => e.classList.contains("is-in")).length, stillHidden: hidden.length };
    });
    out.reveals = { hero, mid, bottom };
    await page.close();
  }

  // 2. Reduced motion: nothing hidden, no transforms.
  {
    const page = await newPage(browser, { reduced: true, width: 1440, height: 900 });
    await page.goto(BASE + "/", { waitUntil: "load" });
    await new Promise((r) => setTimeout(r, 1200));
    out.reduced = await page.evaluate(() => ({
      hidden: [...document.querySelectorAll("[data-reveal],[data-reveal-group]>*")].filter((el) => getComputedStyle(el).opacity === "0").length,
      heroTransforms: [...document.querySelectorAll(".line-mask > span, [data-hero-fade]")].map((el) => getComputedStyle(el).transform).filter((t) => t !== "none").length,
      ruleScale: [...document.querySelectorAll("[data-rule]")].map((el) => getComputedStyle(el).transform).filter((t) => t !== "none").length,
    }));
    await page.close();
  }

  // 3. No-JS: everything visible.
  {
    const page = await newPage(browser, { nojs: true });
    await page.goto(BASE + "/", { waitUntil: "load" });
    await new Promise((r) => setTimeout(r, 600));
    out.nojs = await page.evaluate(() => ({
      hasJsClass: document.documentElement.classList.contains("js"),
      hidden: [...document.querySelectorAll("[data-reveal],[data-reveal-group]>*,.line-mask>span")].filter((el) => getComputedStyle(el).opacity === "0").length,
      h1: (document.querySelector("h1")?.innerText || "").trim().slice(0, 40),
      faqAnswers: document.querySelectorAll("details p").length,
      cards: document.querySelectorAll("[data-card], article").length,
      bodyChars: document.body.innerText.trim().length,
    }));
    await page.close();
  }

  // 4. Site plan + rack + process animate.
  {
    const page = await newPage(browser, { width: 1440, height: 900 });
    await page.goto(BASE + "/", { waitUntil: "load" });
    await new Promise((r) => setTimeout(r, 300));
    const early = await page.evaluate(() => {
      const wall = document.querySelector(".site-plan .sp-draw");
      const row = document.querySelector(".rack-row");
      return { wallOffset: wall ? getComputedStyle(wall).strokeDashoffset : null, rackOpacity: row ? getComputedStyle(row).opacity : null };
    });
    await new Promise((r) => setTimeout(r, 1600));
    const late = await page.evaluate(() => {
      const wall = document.querySelector(".site-plan .sp-draw");
      return { wallOffset: wall ? getComputedStyle(wall).strokeDashoffset : null };
    });
    await page.evaluate(() => document.querySelector("#how-we-work")?.scrollIntoView({ block: "center" }));
    await new Promise((r) => setTimeout(r, 1600));
    const process = await page.evaluate(() => {
      const nums = [...document.querySelectorAll(".process-steps li > div > span:first-child")];
      return { count: nums.length, scales: nums.map((n) => getComputedStyle(n).transform) };
    });
    out.svgMotion = { early, late, process };
    await page.close();
  }

  // 5. Enquiry: add -> counter -> drawer -> Escape.
  {
    const page = await newPage(browser, { width: 1440, height: 900 });
    await page.goto(BASE + "/catalog", { waitUntil: "load" });
    await new Promise((r) => setTimeout(r, 800));
    await page.evaluate(() => {
      const btn = document.querySelector("[data-add-to-enquiry]");
      btn?.scrollIntoView({ block: "center" });
      btn?.click();
    });
    await new Promise((r) => setTimeout(r, 1200));
    const count = await page.evaluate(() => document.querySelector("[data-enquiry-count]")?.textContent ?? "none");
    await page.evaluate(() => document.querySelector("[data-enquiry-anchor]")?.click());
    await new Promise((r) => setTimeout(r, 700));
    const drawer = await page.evaluate(() => ({ open: !!document.querySelector('[role=dialog]'), items: document.querySelectorAll('[role=dialog] li').length, focus: document.activeElement?.tagName }));
    await page.keyboard.press("Escape");
    await new Promise((r) => setTimeout(r, 600));
    const closed = await page.evaluate(() => !document.querySelector('[role=dialog]'));
    out.enquiry = { count, drawer, closedOnEsc: closed };
    await page.close();
  }

  // 6. Catalog filter + load more.
  {
    const page = await newPage(browser, { width: 1440, height: 900 });
    await page.goto(BASE + "/catalog", { waitUntil: "load" });
    await new Promise((r) => setTimeout(r, 600));
    const before = await page.evaluate(() => document.querySelectorAll("[data-card]").length);
    await page.type("#catalog-filter", "camera", { delay: 20 });
    await new Promise((r) => setTimeout(r, 900));
    const filtered = await page.evaluate(() => ({ cards: document.querySelectorAll("[data-card]").length, countText: document.querySelector("#catalog-count")?.textContent?.trim() }));
    await page.evaluate(() => { const i = document.querySelector("#catalog-filter"); i.value = ""; i.dispatchEvent(new Event("input", { bubbles: true })); });
    await new Promise((r) => setTimeout(r, 900));
    const cleared = await page.evaluate(() => document.querySelectorAll("[data-card]").length);
    let loadMore = null;
    const btn = await page.evaluate(() => {
      const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim().startsWith("Load"));
      if (!b) return null;
      b.scrollIntoView({ block: "center" });
      b.click();
      return b.textContent.trim();
    });
    if (btn) {
      await new Promise((r) => setTimeout(r, 2500));
      loadMore = await page.evaluate(() => document.querySelectorAll("[data-card]").length);
    }
    out.catalog = { before, filtered, cleared, loadMoreLabel: btn, afterLoadMore: loadMore };
    await page.close();
  }

  // 7. Mobile menu trap + contact form validation.
  {
    const page = await newPage(browser, { width: 390, height: 844 });
    await page.goto(BASE + "/", { waitUntil: "load" });
    await new Promise((r) => setTimeout(r, 600));
    await page.click('button[aria-controls="mobile-menu"]');
    await new Promise((r) => setTimeout(r, 700));
    const menu = await page.evaluate(() => ({ open: !!document.querySelector("#mobile-menu"), expanded: document.querySelector('button[aria-controls="mobile-menu"]')?.getAttribute("aria-expanded"), focusInMenu: !!document.querySelector("#mobile-menu")?.contains(document.activeElement) }));
    await page.keyboard.press("Escape");
    await new Promise((r) => setTimeout(r, 400));
    const menuClosed = await page.evaluate(() => !document.querySelector("#mobile-menu"));
    await page.goto(BASE + "/contact", { waitUntil: "load" });
    await new Promise((r) => setTimeout(r, 500));
    await page.evaluate(() => document.querySelector("form button[type=submit]")?.click());
    await new Promise((r) => setTimeout(r, 500));
    const form = await page.evaluate(() => ({ invalid: document.querySelectorAll('[aria-invalid="true"]').length, live: document.querySelector("[aria-live]")?.textContent?.trim()?.slice(0, 50), focus: document.activeElement?.id }));
    out.menuAndForm = { menu, menuClosed, form };
    await page.close();
  }

  // 8. Header hide/return.
  {
    const page = await newPage(browser, { width: 1440, height: 900 });
    await page.goto(BASE + "/", { waitUntil: "load" });
    await new Promise((r) => setTimeout(r, 600));
    const header = await page.evaluate(async () => {
      const el = document.querySelector("header");
      window.scrollTo(0, 600);
      await new Promise((r) => setTimeout(r, 500));
      const down = getComputedStyle(el).transform;
      const shadow = getComputedStyle(el).boxShadow;
      window.scrollTo(0, 300);
      await new Promise((r) => setTimeout(r, 500));
      const up = getComputedStyle(el).transform;
      return { down, shadow: shadow !== "none", up };
    });
    out.header = header;
    await page.close();
  }

  console.log(JSON.stringify(out, null, 2));
  await browser.close();
})();
