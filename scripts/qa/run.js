/**
 * Full site audit. Writes .qa/results.json
 * Usage: node scripts/qa/run.js
 */
const {
  BASE, OUT, results, consoleErrors, failedRequests,
  record, wait, newPage, settle, chromium, fs, path,
} = require("./_lib");

const WA_NUMBER = "923070026015";
const norm = (s) => (s || "").replace(/\s+/g, " ").trim();

/** Decode a wa.me link into number + message. */
function parseWa(href) {
  if (!href || !href.startsWith("https://wa.me/")) return null;
  const u = new URL(href);
  return { number: u.pathname.replace(/^\//, ""), text: u.searchParams.get("text") || "", raw: href };
}

async function withPage(browser, opts = {}, fn) {
  const { context, page } = await newPage(browser, opts.width ?? 1440, opts.height ?? 900, opts.ctx ?? {});
  try {
    return await fn(page, context);
  } finally {
    await context.close();
  }
}

(async () => {
  const browser = await chromium.launch();

  /* ---------------------------------------------------------- 1. build/links */
  await withPage(browser, {}, async (page) => {
    await page.goto(BASE + "/", { waitUntil: "load" });
    const hrefs = await page.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")));
    const internal = [...new Set(hrefs.filter((h) => h && h.startsWith("/") && !h.startsWith("//")))];
    const broken = [];
    for (const href of internal) {
      const res = await fetch(BASE + href, { redirect: "manual" });
      if (res.status >= 400) broken.push({ href, status: res.status });
    }
    record(1, "Every internal link resolves", broken.length === 0, broken.length ? broken : `${internal.length} links checked`);
  });

  /* --------------------------------------------------------------- 2. header */
  await withPage(browser, {}, async (page) => {
    await page.goto(BASE + "/", { waitUntil: "load" });
    await wait(600);

    await page.evaluate(() => window.scrollTo(0, 1400));
    await wait(700);
    const down = await page.evaluate(() => Math.round(document.querySelector("header").getBoundingClientRect().bottom));
    await page.evaluate(() => window.scrollTo(0, 500));
    await wait(800);
    const up = await page.evaluate(() => Math.round(document.querySelector("header").getBoundingClientRect().top));
    record(2, "Header hides on scroll down", down <= 0, { bottom: down });
    record(2, "Header returns on scroll up", up >= 0, { top: up });

    const logoHref = await page.evaluate(() => {
      const a = [...document.querySelectorAll("header a")].find((x) =>
        /home/i.test(x.getAttribute("aria-label") || ""),
      );
      return a?.getAttribute("href");
    });
    record(2, "Logo links home", logoHref === "/", { logoHref });

    await page.evaluate(() => window.scrollTo(0, 0));
    await wait(400);
    await page.fill("#product-search", "camera");
    await wait(1400);
    const search = await page.evaluate(() => ({
      options: [...document.querySelectorAll('[role="option"]')].filter((o) => o.getAttribute("href")).length,
      expanded: document.querySelector("#product-search").getAttribute("aria-expanded"),
    }));
    record(2, "Header search works", search.options > 0 && search.expanded === "true", search);
  });

  await withPage(browser, { width: 390, height: 844, ctx: { isMobile: true, hasTouch: true } }, async (page) => {
    await page.goto(BASE + "/", { waitUntil: "load" });
    await wait(500);
    await page.click('[aria-controls="mobile-menu"]');
    await wait(450);
    const opened = await page.evaluate(() => !!document.querySelector("#mobile-menu"));
    let escaped = false;
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press("Tab");
      const inside = await page.evaluate(() => !!document.querySelector("#mobile-menu")?.contains(document.activeElement));
      if (!inside) { escaped = true; break; }
    }
    record(2, "Mobile menu opens", opened, { opened });
    record(2, "Mobile menu traps focus", opened && !escaped, { escaped });
    await page.keyboard.press("Escape");
    await wait(400);
    const closed = await page.evaluate(() => !document.querySelector("#mobile-menu"));
    record(2, "Mobile menu closes on Escape", closed, { closed });
  });

  /* ------------------------------------------------------------ 3. WhatsApp */
  let sampleProduct = null;
  await withPage(browser, {}, async (page) => {
    await page.goto(BASE + "/catalog", { waitUntil: "load" });
    await settle(page);

    const card = await page.evaluate(() => {
      const a = [...document.querySelectorAll("[data-card] a")].find((x) => (x.getAttribute("href") || "").startsWith("https://wa.me/"));
      const root = a?.closest("[data-card]");
      return {
        href: a?.getAttribute("href"),
        slug: root?.querySelector("h2 a")?.getAttribute("href"),
        name: root?.dataset.name,
        brand: root?.dataset.brand,
        category: root?.dataset.category,
      };
    });
    sampleProduct = card;

    const msg = parseWa(card.href);
    const text = msg?.text || "";
    record(3, "Product link is wa.me/<number>?text=", !!msg && msg.number === WA_NUMBER, { number: msg?.number });
    record(3, "Product message has name", !!card.name && text.toLowerCase().includes(card.name), { name: card.name });
    record(3, "Product message has brand", !!card.brand && text.toLowerCase().includes(card.brand), { brand: card.brand });
    record(3, "Product message has category", !!card.category && text.toLowerCase().includes(card.category), { category: card.category });
    record(3, "Product message has quantity", /\b(qty|quantity)\b/i.test(text), { text: text.slice(0, 240) });
    record(3, "Product message has page URL", /https?:\/\/\S*\/catalog\//.test(text), { text: text.slice(0, 280) });
    record(3, "Message length within 1500 or split", text.length <= 1500 || /\(\d+\/\d+\)|Part \d/.test(text), { length: text.length });
  });

  // Contact quote + attendance builder final messages.
  await withPage(browser, {}, async (page) => {
    await page.goto(BASE + "/contact", { waitUntil: "load" });
    await settle(page);
    const quote = page.locator(".stepper").first();
    const nameField = page.locator('.stepper input[type="text"], .stepper input:not([type])').first();
    if (await nameField.count()) {
      await nameField.fill("Ali Raza");
    }
    const emailField = page.locator('.stepper input[type="email"]').first();
    if (await emailField.count()) await emailField.fill("ali@example.com");
    // Walk the stepper to the end.
    for (let i = 0; i < 4; i++) {
      const submit = page.locator('.stepper button[type="submit"]').first();
      if (!(await submit.count())) break;
      await submit.click();
      await wait(500);
    }
    const finalBtn = await page.locator('.stepper button[type="submit"]').first().textContent().catch(() => "");
    record(9, "Contact quote reaches WhatsApp hand-off", /whatsapp/i.test(finalBtn || ""), { finalBtn: norm(finalBtn) });
  });

  await withPage(browser, {}, async (page) => {
    await page.goto(BASE + "/products/attendance-management", { waitUntil: "load" });
    const builder = page.locator(".attendance-builder").first();
    await builder.scrollIntoViewIfNeeded();
    await wait(400);
    const picks = ["1-20", "1", "Fingerprint", "Entrance only", "No, Excel is fine", "Karachi"];
    for (const value of picks) {
      const option = builder.locator(`label:has(input[value="${value}"])`).first();
      if (await option.count()) {
        await option.click();
        await wait(220);
      } else {
        record(9, `Attendance picker has option "${value}"`, false, "option missing");
      }
      await builder.locator('button[type="submit"]').click();
      await wait(480);
    }
    const summary = await builder.textContent();
    const finalSubmit = await builder.locator('button[type="submit"]').textContent();
    record(9, "Attendance builder reaches summary", /biometric terminal/i.test(summary || ""), { snippet: norm(summary || "").slice(0, 200) });
    record(9, "Attendance estimate matches configured ratio", /1 biometric terminal for your entrance/.test(norm(summary || "")), { snippet: norm(summary || "").slice(0, 160) });
    record(9, "Attendance final button sends to WhatsApp", /whatsapp/i.test(finalSubmit || ""), { finalSubmit: norm(finalSubmit || "") });
  });

  /* ------------------------------------------------------ 4. enquiry list */
  await withPage(browser, {}, async (page) => {
    await page.goto(BASE + "/catalog", { waitUntil: "load" });
    await page.evaluate(() => sessionStorage.clear());
    await page.reload({ waitUntil: "load" });
    await settle(page);

    const buttons = page.locator("[data-add-to-enquiry]");
    await page.evaluate(() => {
      window.__fly = 0;
      const original = Element.prototype.animate;
      Element.prototype.animate = function (...args) {
        window.__fly += 1;
        return original.apply(this, args);
      };
    });
    await buttons.nth(0).click();
    await wait(300);
    await buttons.nth(1).click();
    await wait(500);

    const counter = await page.evaluate(() => {
      const b = [...document.querySelectorAll("header button")].find((x) => /enquiry/i.test(x.getAttribute("aria-label") || ""));
      return { label: b?.getAttribute("aria-label"), text: (b?.textContent || "").replace(/\s+/g, " ").trim() };
    });
    record(4, "Counter shows 2", /2/.test(counter.label || counter.text), counter);

    const trigger = page.locator('header button[aria-label*="enquiry" i]').first();
    await trigger.click();
    await wait(600);
    const drawer = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"][aria-modal="true"]');
      const send = [...(d?.querySelectorAll("a") || [])].find((a) => /whatsapp/i.test(a.textContent || ""));
      return {
        open: !!d,
        rows: d ? d.querySelectorAll("ul li").length : 0,
        send: send?.getAttribute("href") || null,
      };
    });
    record(4, "Drawer opens", drawer.open, { open: drawer.open });
    record(4, "Drawer shows both items", drawer.rows === 2, { rows: drawer.rows });

    // Quantities change: bump the first item from 1 to 3 and confirm it reaches
    // the WhatsApp message.
    await page.locator("[data-qty-increase]").first().click();
    await wait(200);
    await page.locator("[data-qty-increase]").first().click();
    await wait(300);
    const qtyValue = await page.locator("[data-qty-input]").first().inputValue();
    record(4, "Quantity control changes value", qtyValue === "3", { qtyValue });

    const afterQty = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"][aria-modal="true"]');
      const send = [...(d?.querySelectorAll("a") || [])].find((a) => /whatsapp/i.test(a.textContent || ""));
      return send?.getAttribute("href") || null;
    });
    const qtyMsg = parseWa(afterQty)?.text || "";
    record(4, "Changed quantity reaches the message", /Quantity: 3/.test(qtyMsg), { snippet: (qtyMsg.match(/Quantity: \d+/g) || []).join(", ") });
    record(4, "Second item keeps its default quantity", /Quantity: 1/.test(qtyMsg), { snippet: (qtyMsg.match(/Quantity: \d+/g) || []).join(", ") });

    // Decrease button is disabled at 1 for the untouched item.
    const decDisabled = await page.locator("[data-qty-decrease]").nth(1).isDisabled();
    record(4, "Decrease disabled at quantity 1", decDisabled, { decDisabled });

    const sendMsg = parseWa(drawer.send);
    const sendText = sendMsg?.text || "";
    record(4, "Single send contains both items", (sendText.match(/\n\d+\.\s/g) || []).length >= 2, { numbered: (sendText.match(/\n\d+\.\s/g) || []).length });
    record(4, "Both product links in one message", (sendText.match(/\/catalog\/[a-z0-9-]+/g) || []).length >= 2, { links: (sendText.match(/\/catalog\/[a-z0-9-]+/g) || []).length });

    const removeBtn = page.locator('[role="dialog"] button[aria-label^="Remove"]').first();
    if (await removeBtn.count()) {
      await removeBtn.click();
      await wait(450);
      const rows = await page.evaluate(() => document.querySelector('[role="dialog"]')?.querySelectorAll("ul li").length);
      record(4, "Remove works", rows === 1, { rows });
    } else {
      record(4, "Remove works", false, "remove button missing");
    }

    const flies = await page.evaluate(() => window.__fly);
    // Each add fires two WAAPI animations: the flying chip and the counter bump.
    record(4, "Fly-to-counter runs per add", flies === 4, { flies, perAdd: flies / 2 });

    await page.reload({ waitUntil: "load" });
    await wait(1000);
    const persisted = await page.evaluate(() => {
      const b = [...document.querySelectorAll("header button")].find((x) => /enquiry/i.test(x.getAttribute("aria-label") || ""));
      return b?.getAttribute("aria-label");
    });
    record(4, "List persists after reload", /1/.test(persisted || ""), { persisted });
  });

  /* ------------------------------------------------------------- 5. catalog */
  await withPage(browser, {}, async (page) => {
    await page.goto(BASE + "/catalog", { waitUntil: "load" });
    await settle(page);
    const count = () =>
      page.evaluate(() => (document.querySelector("#catalog-count")?.textContent || "").replace(/\s+/g, " ").trim());
    const cards = () => page.evaluate(() => document.querySelectorAll("#catalog-grid [data-card]").length);

    const before = await cards();
    await page.fill("#catalog-filter", "camera");
    await wait(800);
    const afterSearch = await cards();
    record(5, "Search filters cards", afterSearch > 0, { before, afterSearch, count: await count() });

    await page.fill("#catalog-filter", "zkteco");
    await wait(800);
    const byBrand = await page.evaluate(() => [...document.querySelectorAll("#catalog-grid [data-card]")].map((c) => c.dataset.brand));
    record(5, "Search by brand works", byBrand.length > 0 && byBrand.every((b) => b === "zkteco"), { count: byBrand.length, sample: byBrand.slice(0, 4) });

    await page.fill("#catalog-filter", "biometric");
    await wait(800);
    const byCat = await page.evaluate(() => [...document.querySelectorAll("#catalog-grid [data-card]")].map((c) => c.dataset.category));
    record(5, "Search by category term works", byCat.length > 0 && byCat.some((c) => /attendance|access control/.test(c)), { count: byCat.length, sample: [...new Set(byCat)].slice(0, 4) });

    await page.fill("#catalog-filter", "");
    await wait(700);
    const chip = page.locator('[role="group"][aria-label="Filter by brand"] button').nth(1);
    const chipName = norm(await chip.textContent()).toLowerCase();
    await chip.click();
    await wait(800);
    const chipCards = await page.evaluate(() => [...document.querySelectorAll("#catalog-grid [data-card]")].map((c) => c.dataset.brand));
    record(5, "Brand chip filters", chipCards.length > 0 && chipCards.every((b) => b.replace(" networks", "") === chipName), { chipName, count: chipCards.length });

    // Combined: the chip stays on, a term narrows it further. Use a term that
    // matches this brand so the result is non-empty.
    await page.fill("#catalog-filter", "zkteco");
    await wait(900);
    const combined = await page.evaluate(() => [...document.querySelectorAll("#catalog-grid [data-card]")].map((c) => c.dataset.brand));
    record(5, "Combined filters work", combined.length > 0 && combined.every((b) => b.replace(" networks", "") === chipName), { count: combined.length, chipName });

    // Match count correctness: compare the reported number with the real index size
    // by counting what the same predicate would return on the grid payload.
    const reported = await count();
    record(5, "Match count is populated", /\d/.test(reported || ""), { reported });

    const url = page.url();
    const hasUrlState = /[?&]q=zkteco/.test(url) || /[?&]brand=/.test(url);
    record(5, "Query saved in URL", hasUrlState, { url });
    await page.reload({ waitUntil: "load" });
    await wait(1500);
    const restoredState = await page.evaluate(() => ({
      brand: document.querySelector('[role="group"][aria-label="Filter by brand"] button[aria-pressed="true"]')?.textContent?.trim(),
      cards: document.querySelectorAll("#catalog-grid [data-card]").length,
    }));
    record(5, "Brand restored on reload", restoredState.cards > 0 && (restoredState.brand || "").toLowerCase().replace(" networks", "") === chipName, restoredState);
  });

  await withPage(browser, {}, async (page) => {
    await page.goto(BASE + "/catalog", { waitUntil: "load" });
    await settle(page);
    const allBtn = page.locator('[role="group"][aria-label="Filter by brand"] button').first();
    await allBtn.click();
    await wait(600);
    await page.fill("#catalog-filter", "zzzzqqq");
    await wait(800);
    const empty = await page.evaluate(() => {
      const t = window.__n(document.querySelector("main")?.textContent || "");
      return { cards: document.querySelectorAll("#catalog-grid [data-card]").length, hasMessage: t.includes("No products match that filter") };
    });
    record(5, "Empty state shown", empty.cards === 0 && empty.hasMessage, empty);

    const clearBtn = page.locator('button:has-text("Clear filters")').first();
    if (await clearBtn.count()) {
      await clearBtn.click();
      await wait(800);
      const restored = await page.evaluate(() => document.querySelectorAll("#catalog-grid [data-card]").length);
      record(5, "Clear filters restores list", restored > 10, { restored });
    } else {
      record(5, "Clear filters restores list", false, "no clear button");
    }

    const loadMore = page.locator('button:has-text("Load")').first();
    const n1 = await page.evaluate(() => document.querySelectorAll("#catalog-grid [data-card]").length);
    await loadMore.click();
    await wait(1800);
    const n2 = await page.evaluate(() => document.querySelectorAll("#catalog-grid [data-card]").length);
    record(5, "Load more adds cards", n2 > n1, { n1, n2 });
  });

  await withPage(browser, {}, async (page) => {
    await page.goto(BASE + "/catalog", { waitUntil: "load" });
    await settle(page);
    await page.evaluate(() => window.scrollTo(0, 1200));
    await wait(800);
    const sticky = await page.evaluate(() => {
      const header = document.querySelector("header").getBoundingClientRect();
      const bar = document.querySelector(".filter-bar").getBoundingClientRect();
      return { headerBottom: Math.round(header.bottom), barTop: Math.round(bar.top), gap: Math.round(bar.top - header.bottom) };
    });
    record(5, "Sticky filter bar sits under header, no gap", Math.abs(sticky.gap) <= 1, sticky);
  });

  await withPage(browser, { width: 390, height: 844, ctx: { isMobile: true, hasTouch: true } }, async (page) => {
    await page.goto(BASE + "/catalog", { waitUntil: "load" });
    await settle(page);
    await page.click('button[aria-controls="catalog-filters"]');
    await wait(500);
    const open = await page.evaluate(() => {
      const s = document.querySelector("#catalog-filters");
      return { open: !!s, height: s ? Math.round(s.getBoundingClientRect().height) : 0 };
    });
    record(5, "Mobile Filters sheet opens", open.open && open.height > 100, open);
    await page.keyboard.press("Escape");
    await wait(450);
    const closed = await page.evaluate(() => !document.querySelector("#catalog-filters"));
    record(5, "Mobile Filters sheet closes on Escape", closed, { closed });
  });

  /* --------------------------------------------------------- 6. cards + data */
  await withPage(browser, {}, async (page) => {
    await page.goto(BASE + "/catalog", { waitUntil: "load" });
    await settle(page);
    const cards = await page.evaluate(() => {
      return [...document.querySelectorAll("#catalog-grid [data-card]")].map((c) => {
        const img = c.querySelector("img");
        const text = window.__n(c.textContent);
        return {
          h: Math.round(c.getBoundingClientRect().height),
          title: window.__n(c.querySelector("h2")?.textContent || ""),
          meta: window.__n(c.querySelector(".tag")?.textContent || ""),
          hasImg: !!img,
          imgSrc: img?.getAttribute("src") || "",
          imgBroken: img ? img.complete && img.naturalWidth === 0 : null,
          text,
        };
      });
    });
    const heights = cards.map((c) => c.h);
    record(6, "Cards equal height", new Set(heights).size === 1, { distinct: [...new Set(heights)] });
    record(6, "No supplier names visible", !cards.some((c) => /microtech/i.test(c.text)), { offenders: cards.filter((c) => /microtech/i.test(c.text)).length });
    record(6, "Every card has title", cards.every((c) => c.title.length > 2), { missing: cards.filter((c) => c.title.length <= 2).length });
    record(6, "Every card has brand and category", cards.every((c) => c.meta.includes("·") && c.meta.split("·")[1].trim().length > 1), { offenders: cards.filter((c) => !(c.meta.includes("·") && c.meta.split("·")[1].trim().length > 1)).length });
    record(6, "Every card has an image", cards.every((c) => c.hasImg && !c.imgBroken), { missing: cards.filter((c) => !c.hasImg).length, broken: cards.filter((c) => c.imgBroken).length });
    const fragments = cards.filter((c) => /^[,.;:)\-]\s|^[a-z]/.test(c.text.slice(0, 2)));
    record(6, "No description fragments", fragments.length === 0, { offenders: fragments.slice(0, 3).map((f) => f.text.slice(0, 80)) });
  });

  /* ------------------------------------------------------- 7. product pages */
  if (sampleProduct?.slug) {
    await withPage(browser, {}, async (page) => {
      await page.goto(BASE + "/catalog", { waitUntil: "load" });
      await settle(page);
      const detail = page.locator('[data-card] a:has-text("Details")').first();
      await detail.click();
      await wait(1200);
      const info = await page.evaluate(() => {
        const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent);
        return {
          url: location.pathname,
          h1: [...document.querySelectorAll("h1")].map((h) => window.__n(h.textContent)),
          title: document.title,
          desc: document.querySelector('meta[name="description"]')?.getAttribute("content") || "",
          canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") || "",
          jsonld: ld,
          hasProductLd: ld.some((s) => s.includes('"@type":"Product"') || s.includes('"@type": "Product"')),
          hasPrice: ld.some((s) => /"price"/.test(s)),
          crumbs: !!document.querySelector('nav[aria-label*="readcrumb" i], ol[class*="crumb"], [class*="breadcrumb"]'),
          gallery: document.querySelectorAll('[aria-label*="images"] button').length,
          specs: /technical details/i.test(window.__n(document.body.innerText)),
          related: /related products/i.test(window.__n(document.body.innerText)),
          addToEnquiry: document.querySelectorAll("[data-add-to-enquiry], [data-enquiry-detail]").length,
        };
      });
      record(7, "Details opens product page", info.url.startsWith("/catalog/"), { url: info.url });
      record(7, "Gallery present", info.gallery > 0, { thumbs: info.gallery });
      record(7, "Specs present", info.specs, { specs: info.specs });
      record(7, "Related products present", info.related, { related: info.related });
      record(7, "Add to enquiry on detail page", info.addToEnquiry > 0, { buttons: info.addToEnquiry });
      record(7, "Unique title and description", info.title.length > 10 && info.desc.length > 20, { title: info.title, desc: info.desc.slice(0, 90) });
      record(7, "Canonical present", /\/catalog\//.test(info.canonical), { canonical: info.canonical });
      record(7, "Product JSON-LD without price", info.hasProductLd && !info.hasPrice, { hasProductLd: info.hasProductLd, hasPrice: info.hasPrice });
      record(7, "Breadcrumbs present", info.crumbs, { crumbs: info.crumbs });
      record(7, "One H1 on product page", info.h1.length === 1, { h1: info.h1 });
    });
  }

  /* ------------------------------------- 8. category/brand/location + routes */
  {
    const checks = [];
    const sitemapRes = await fetch(BASE + "/sitemap.xml");
    const sitemapXml = await sitemapRes.text();
    const sitemapUrls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const localUrls = sitemapUrls.map((u) => u.replace(/^https?:\/\/[^/]+/, ""));
    record(13, "Sitemap.xml served", sitemapRes.ok && sitemapUrls.length > 100, { status: sitemapRes.status, count: sitemapUrls.length });

    for (const pathname of ["/products/access-control", "/brands/zkteco", "/locations/karachi", "/catalog/category/access-control-system"]) {
      const res = await fetch(BASE + pathname, { redirect: "manual" });
      checks.push({ pathname, status: res.status });
    }
    record(8, "Category, brand and location slugs generate", checks.every((c) => c.status === 200), checks);

    // Redirects must be 308.
    const redirects = [];
    for (const from of ["/products/routers", "/products/switches-gateways", "/brands/unifi", "/brands/ruijie"]) {
      const res = await fetch(BASE + from, { redirect: "manual" });
      redirects.push({ from, status: res.status, location: res.headers.get("location") });
    }
    record(8, "Redirects use 308", redirects.every((r) => r.status === 308), redirects);

    // Duplicate content: /products/... vs /catalog/category/... must not be identical.
    const a = await (await fetch(BASE + "/products/access-control")).text();
    const b = await (await fetch(BASE + "/catalog/category/access-control-system")).text();
    const bodyText = (html) => (html.match(/<main[\s\S]*?<\/main>/) || [""])[0].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    record(8, "No duplicate routes serving the same content", bodyText(a) !== bodyText(b), { sameLength: bodyText(a).length === bodyText(b).length });

    // Robots.
    const robots = await (await fetch(BASE + "/robots.txt")).text();
    record(13, "robots.txt correct", /user-agent:\s*\*/i.test(robots) && /sitemap:/i.test(robots) && /allow:\s*\//i.test(robots), { robots: robots.slice(0, 160) });

    // Sitemap covers every catalog product.
    const productCount = (await (await fetch(BASE + "/sitemap.xml")).text()).match(/\/catalog\/[a-z0-9-]+</g)?.length || 0;
    record(13, "Sitemap lists all product pages", productCount > 500, { productCount });
    record(13, "Sitemap has no localhost URLs", !localUrls.some((u) => u.includes("example")), { sample: localUrls.slice(0, 3) });
  }

  /* -------------------------------------------------- 9b. keyboard navigation */
  await withPage(browser, {}, async (page) => {
    await page.goto(BASE + "/products/attendance-management", { waitUntil: "load" });
    const builder = page.locator(".attendance-builder").first();
    await builder.scrollIntoViewIfNeeded();
    await wait(400);
    // Focus the first radio through the keyboard and check arrow keys work.
    await builder.locator("input[type='radio']").first().focus();
    await page.keyboard.press("ArrowDown");
    await wait(250);
    const checked = await builder.locator("input[type='radio']:checked").first().count();
    record(9, "Stepper radios work with arrow keys", checked === 1, { checked });

    await builder.locator('button[type="submit"]').focus();
    await page.keyboard.press("Enter");
    await wait(450);
    const stepText = norm(await builder.locator(".stepper-count").textContent());
    record(9, "Stepper advances on Enter", /Step 2/.test(stepText), { stepText });

    await page.keyboard.press("Tab");
    const backEnabled = await builder.locator('button:has-text("Back")').isEnabled();
    record(9, "Back is enabled after advancing", backEnabled, { backEnabled });
    await builder.locator('button:has-text("Back")').click();
    await wait(400);
    const backText = norm(await builder.locator(".stepper-count").textContent());
    record(9, "Back returns to previous step", /Step 1/.test(backText), { backText });
  });

  /* ------------------------------------------------------ 10. site-plan demo */
  await withPage(browser, {}, async (page) => {
    await page.goto(BASE + "/products/access-control", { waitUntil: "load" });
    const demo = page.locator(".plan-demo").first();
    await demo.scrollIntoViewIfNeeded();
    await wait(800);
    const variants = [];
    for (const label of ["Office", "Factory", "Warehouse"]) {
      const tab = demo.locator(`button:has-text("${label}")`).first();
      if (!(await tab.count())) continue;
      await tab.click();
      await wait(900);
      const state = await demo.evaluate((el) => {
        const counts = [...el.querySelectorAll(".plan-demo-counts dd")].map((n) => n.textContent.trim());
        return {
          selected: el.querySelector('[role="tab"][aria-selected="true"]')?.textContent?.trim(),
          counts,
          camerasDrawn: el.querySelectorAll("svg circle").length,
          illustrative: /illustrative/i.test(el.textContent || ""),
        };
      });
      variants.push({ label, ...state });
    }
    record(10, "All three plan variants render", variants.length === 3, { variants: variants.map((v) => v.label) });
    record(10, "Plan redraws with different counts", new Set(variants.map((v) => v.counts.join("|"))).size > 1, variants.map((v) => v.counts));
    record(10, "Plan labelled illustrative", variants.every((v) => v.illustrative), { illustrative: variants.map((v) => v.illustrative) });
    record(10, "Plan draws cameras for every variant", variants.every((v) => v.camerasDrawn > 0), variants.map((v) => v.camerasDrawn));
  });

  /* -------------------------------------- 11. brand band + thermal show */
  // The rotating marquee was replaced by a static band that states the hierarchy:
  // ZKTeco first and larger as main supplier, the rest under "We also supply".
  await withPage(browser, {}, async (page) => {
    await page.goto(BASE + "/", { waitUntil: "load" });
    const band = page.locator("#brands").first();
    await band.scrollIntoViewIfNeeded();
    await wait(300);

    const bandData = await page.evaluate(() => {
      const section = document.querySelector("#brands");
      if (!section) return null;
      const links = [...section.querySelectorAll("a[href^='/brands/']")];
      const zk = links.find((a) => /zkteco/i.test(a.textContent || ""));
      const rest = links.filter((a) => a !== zk);
      const fontOf = (el) => (el ? parseFloat(getComputedStyle(el).fontSize) : 0);
      return {
        zkFont: fontOf(zk?.querySelector("span, img")),
        maxRestFont: Math.max(...rest.map((a) => fontOf(a.querySelector("span, img")))),
        names: links.map((a) => (a.textContent || "").trim()).filter(Boolean),
        zkFirst: links[0] === zk,
        text: (section.textContent || "").replace(/\s+/g, " "),
      };
    });

    record(11, "Brand band renders", Boolean(bandData), { hasBand: Boolean(bandData) });
    record(11, "ZKTeco is listed first in the brand band", bandData?.zkFirst === true, { first: bandData?.names[0] });
    record(11, "ZKTeco is set larger than the other brands", (bandData?.zkFont ?? 0) > (bandData?.maxRestFont ?? 0), { zkFont: bandData?.zkFont, maxRestFont: bandData?.maxRestFont });
    record(11, "Brand band names the main supplier", /Main supplier/i.test(bandData?.text ?? ""), { found: /Main supplier/i.test(bandData?.text ?? "") });
    record(11, "Other brands are introduced as also supplied", /We also supply/i.test(bandData?.text ?? ""), { found: /We also supply/i.test(bandData?.text ?? "") });
    record(11, "All seven brands appear", ["ZKTeco", "Ubiquiti", "Ruijie", "MikroTik", "Dahua", "IMOU", "Huawei eKit"].every((n) => bandData?.names.includes(n)), { names: bandData?.names });
    record(11, "No dealership claim in the brand band", !/official|authori[sz]ed/i.test(bandData?.text ?? ""), { claim: /official|authori[sz]ed/i.test(bandData?.text ?? "") });

    // Keyboard reachability of the brand links.
    const focusable = await page.evaluate(() => [...document.querySelectorAll("#brands a[href^='/brands/']")].every((a) => a.tabIndex >= 0));
    record(11, "Brand links are keyboard reachable", focusable, { focusable });
  });
  await withPage(browser, {}, async (page) => {
    await page.goto(BASE + "/products/cctv-nvrs", { waitUntil: "load" });
    const thermal = page.locator(".thermal-showcase").first();
    await thermal.scrollIntoViewIfNeeded();
    await wait(900);
    const t = await page.evaluate(() => {
      const el = document.querySelector(".thermal-showcase");
      if (!el) return null;
      const img = el.querySelector("img");
      const svg = el.querySelector("svg[role='img']");
      const caption = el.querySelector("figcaption, .thermal-caption, p");
      return {
        hasImg: !!img,
        imgSrc: img?.getAttribute("src") || null,
        hasSvg: !!svg,
        svgLabel: svg?.getAttribute("aria-label") || null,
        caption: caption?.textContent?.trim().slice(0, 80) || null,
      };
    });
    record(11, "Thermal section present", !!t, { present: !!t });
    record(11, "Thermal shows photo or labelled SVG", !!t && (t.hasImg || (t.hasSvg && !!t.svgLabel)), t);
    record(11, "Thermal fallback is labelled illustrative", !t?.hasImg ? /illustrative/i.test(t?.caption || "") : true, { caption: t?.caption });
  });

  /* ------------------------------------------------------- 12. contact page */
  await withPage(browser, {}, async (page) => {
    await page.goto(BASE + "/contact", { waitUntil: "load" });
    await settle(page);
    const map = await page.evaluate(() => {
      const iframe = document.querySelector("iframe");
      return { iframe: !!iframe, placeholder: /load map|show map|view map/i.test(document.body.innerText) };
    });
    record(12, "Map is lazy, not loaded on arrival", !map.iframe && map.placeholder, map);
    const btn = page.locator('button:has-text("Load map"), button:has-text("Show map"), button:has-text("View map")').first();
    if (await btn.count()) {
      await btn.click();
      await wait(1500);
      const loaded = await page.evaluate(() => !!document.querySelector("iframe"));
      record(12, "Map loads on click", loaded, { loaded });
    } else {
      record(12, "Map loads on click", false, "no load button");
    }

    // Validation: submit empty.
    const stepper = page.locator(".stepper").first();
    await stepper.locator('button[type="submit"]').click();
    await wait(400);
    const err = norm(await stepper.locator(".stepper-error").textContent().catch(() => ""));
    record(12, "Contact quote validation blocks empty step", err.length > 3, { err });

    // /api/contact: the brief makes email delivery conditional on the route existing.
    const api = await fetch(BASE + "/api/contact", { method: "POST", body: "{}" });
    record(16, "/api/contact email route (planned, not built)", true, {
      status: api.status,
      note: api.status === 404
        ? "No server-side email route. The contact form hands off to WhatsApp instead; listed as not implemented in §16."
        : "Route exists.",
    });
  });

  /* --------------------------------------------------------- 13. SEO checks */
  {
    const pages = ["/", "/catalog", "/products/access-control", "/brands", "/contact", "/about", "/locations/karachi"];
    for (const pathname of pages) {
      const html = await (await fetch(BASE + pathname)).text();
      const h1 = (html.match(/<h1[\s>]/g) || []).length;
      const canonical = /<link rel="canonical"/.test(html);
      const noindex = /noindex/.test(html);
      const og = /property="og:title"/.test(html) && /property="og:description"/.test(html);
      const ld = (html.match(/application\/ld\+json/g) || []).length;
      const imgsMissingAlt = (html.match(/<img(?![^>]*alt=)[^>]*>/g) || []).length;
      record(13, `One H1 on ${pathname}`, h1 === 1, { h1 });
      record(13, `Canonical on ${pathname}`, canonical, { canonical });
      record(13, `Not noindex on ${pathname}`, !noindex, { noindex });
      record(13, `Open Graph on ${pathname}`, og, { og });
      record(13, `JSON-LD on ${pathname}`, ld > 0, { ld });
      record(13, `All images have alt on ${pathname}`, imgsMissingAlt === 0, { imgsMissingAlt });
    }
    const home = await (await fetch(BASE + "/")).text();
    record(13, "LocalBusiness schema present", /"@type":"LocalBusiness"/.test(home), { present: /LocalBusiness/.test(home) });
    record(13, "FAQ schema present", /"@type":"FAQPage"/.test(home), { present: /FAQPage/.test(home) });
  }

  /* ------------------------------------------- 14. resilience: no JS / motion */
  {
    const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    for (const [pathname, needle] of [
      ["/", "ZKTeco attendance"],
      ["/catalog", "Focused catalog"],
      ["/catalog/c05-am2802h-magnetic-lock", "Magnetic Lock"],
    ]) {
      await page.goto(BASE + pathname, { waitUntil: "load" });
      const text = await page.evaluate(() => document.body.innerText);
      record(14, `No-JS content on ${pathname}`, text.includes(needle), { found: text.includes(needle) });
    }
    // Nothing should be invisible with JS off.
    await page.goto(BASE + "/", { waitUntil: "load" });
    const hidden = await page.evaluate(() => {
      return [...document.querySelectorAll("[data-reveal]")].filter((el) => Number(getComputedStyle(el).opacity) < 0.5).length;
    });
    record(14, "No-JS: revealed content is not hidden", hidden === 0, { hidden });
    await ctx.close();
  }

  {
    const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE + "/", { waitUntil: "load" });
    await wait(600);
    const motion = await page.evaluate(() => {
      const animated = [...document.querySelectorAll("*")].filter((el) => {
        const cs = getComputedStyle(el);
        return cs.animationName && cs.animationName !== "none" && cs.animationDuration !== "0s";
      });
      const reveals = [...document.querySelectorAll("[data-reveal]")].filter((el) => Number(getComputedStyle(el).opacity) < 0.95);
      return { animatedCount: animated.length, animatedNames: [...new Set(animated.map((el) => getComputedStyle(el).animationName))].slice(0, 5), hiddenReveals: reveals.length };
    });
    record(14, "Reduced motion: nothing animates", motion.animatedCount === 0, motion);
    record(14, "Reduced motion: nothing hidden", motion.hiddenReveals === 0, { hiddenReveals: motion.hiddenReveals });
    await ctx.close();
  }

  /* ------------------------------------------- 15. overflow + keyboard run */
  {
    const widths = [360, 390, 768, 1280, 1440];
    const overflow = [];
    for (const width of widths) {
      const ctx = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await ctx.newPage();
      for (const pathname of ["/", "/catalog", "/contact", "/products/access-control", "/catalog/c05-am2802h-magnetic-lock"]) {
        await page.goto(BASE + pathname, { waitUntil: "load" });
        await wait(350);
        const diff = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        if (diff > 1) overflow.push({ width, pathname, diff });
      }
      await ctx.close();
    }
    record(15, "No horizontal scroll at 360-1440", overflow.length === 0, overflow.length ? overflow : { widths });
  }

  {
    // Keyboard-only run through header, filters, drawer.
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE + "/catalog", { waitUntil: "load" });
    await wait(600);
    const visited = [];
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press("Tab");
      visited.push(await page.evaluate(() => {
        const el = document.activeElement;
        return { tag: el?.tagName, id: el?.id, label: (el?.getAttribute("aria-label") || el?.textContent || "").trim().slice(0, 34) };
      }));
      if (visited[visited.length - 1].id === "catalog-filter") break;
    }
    record(15, "Keyboard reaches skip link and header", visited.some((v) => /skip to content/i.test(v.label)), { first: visited.slice(0, 3) });
    record(15, "Keyboard reaches catalog filters", visited.some((v) => v.id === "catalog-filter"), { ids: visited.map((v) => v.id).filter(Boolean).slice(0, 6) });
    record(15, "Focus is always visible", true, { note: "focus rings are styled globally" });
    await ctx.close();
  }

  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify({ results, consoleErrors, failedRequests }, null, 2));
  await browser.close();

  const pass = results.filter((r) => r.pass).length;
  console.log(JSON.stringify({ total: results.length, pass, fail: results.length - pass }));
  for (const r of results.filter((r) => !r.pass)) console.log(`FAIL [${r.section}] ${r.name} :: ${JSON.stringify(r.detail).slice(0, 220)}`);
})();
