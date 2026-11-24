const puppeteer = require("puppeteer-core");

(async () => {
  const browser = await puppeteer.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: "new" });
  const out = {};

  // ---- Desktop: header offset var, sticky bar tracking, chip scroller ----
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto("http://127.0.0.1:3100/catalog", { waitUntil: "load", timeout: 90000 });
    await new Promise((r) => setTimeout(r, 900));
    out.desktop = await page.evaluate(() => {
      const root = document.documentElement;
      const header = document.querySelector("header");
      const bar = document.querySelector(".filter-bar");
      const track = document.querySelector(".filter-chips-track");
      const cards = [...document.querySelectorAll("#catalog-grid [data-card]")].slice(0, 4);
      const tiles = cards.map((c) => {
        const media = c.querySelector(".catalog-card-media");
        const img = c.querySelector("img");
        return {
          cardH: Math.round(c.getBoundingClientRect().height),
          ratio: media ? (media.getBoundingClientRect().width / media.getBoundingClientRect().height).toFixed(2) : null,
          blend: img ? getComputedStyle(img).mixBlendMode : null,
          objectFit: img ? getComputedStyle(img).objectFit : null,
          bg: media ? getComputedStyle(media).backgroundColor : null,
        };
      });
      const actionTops = cards.map((c) => {
        const a = c.querySelector(".catalog-card-actions");
        return a ? Math.round(a.getBoundingClientRect().top + window.scrollY) : null;
      });
      const real = cards.map((c) => {
        const b = c.getBoundingClientRect();
        return { top: Math.round(b.top + window.scrollY), h: Math.round(b.height) };
      });
      return {
        headerOffsetVar: root.style.getPropertyValue("--header-offset"),
        headerH: header ? Math.round(header.getBoundingClientRect().height) : null,
        barPosition: bar ? getComputedStyle(bar).position : null,
        barZ: bar ? getComputedStyle(bar).zIndex : null,
        barBg: bar ? getComputedStyle(bar).backgroundColor : null,
        chipScrollable: track ? track.scrollWidth > track.clientWidth + 4 : null,
        chipSnap: track ? getComputedStyle(track).scrollSnapType : null,
        tile: tiles,
        actionTops,
        cardTops: real,
        searchVisible: !!document.querySelector("#catalog-filter") && document.querySelector("#catalog-filter").getBoundingClientRect().width > 0,
        countText: document.querySelector("#catalog-count")?.textContent?.trim(),
      };
    });

    // Scroll down: header hides, bar must follow to top: 0.
    await page.evaluate(() => window.scrollTo(0, 1200));
    await new Promise((r) => setTimeout(r, 350));
    await page.evaluate(() => window.scrollTo(0, 2400));
    await new Promise((r) => setTimeout(r, 700));
    out.desktopScroll = await page.evaluate(() => {
      const root = document.documentElement;
      const header = document.querySelector("header");
      const bar = document.querySelector(".filter-bar");
      return {
        headerOffsetVar: root.style.getPropertyValue("--header-offset"),
        headerTransform: header ? getComputedStyle(header).transform : null,
        barTop: bar ? Math.round(bar.getBoundingClientRect().top) : null,
      };
    });

    // Scroll up: header returns, bar must sit below it again.
    await page.evaluate(() => window.scrollTo(0, 1500));
    await new Promise((r) => setTimeout(r, 700));
    out.desktopScrollUp = await page.evaluate(() => {
      const root = document.documentElement;
      const header = document.querySelector("header");
      const bar = document.querySelector(".filter-bar");
      return {
        headerOffsetVar: root.style.getPropertyValue("--header-offset"),
        headerH: header ? Math.round(header.getBoundingClientRect().height) : null,
        barTop: bar ? Math.round(bar.getBoundingClientRect().top) : null,
      };
    });

    // Filtering still works and the count updates.
    await page.type("#catalog-filter", "camera");
    await new Promise((r) => setTimeout(r, 600));
    out.desktopFilter = await page.evaluate(() => ({
      cards: document.querySelectorAll("#catalog-grid [data-card]").length,
      count: document.querySelector("#catalog-count")?.textContent?.trim(),
    }));
    await page.screenshot({ path: ".ohmyagent/catalog-desktop.png", fullPage: false });
    await page.close();
  }

  // ---- Mobile: Filters button + bottom sheet ----
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await page.goto("http://127.0.0.1:3100/catalog", { waitUntil: "load", timeout: 90000 });
    await new Promise((r) => setTimeout(r, 900));
    out.mobile = await page.evaluate(() => {
      const bar = document.querySelector(".filter-bar");
      const btn = [...document.querySelectorAll("button")].find((b) => b.textContent?.trim().startsWith("Filters"));
      return {
        stickyBarHidden: bar ? getComputedStyle(bar).display === "none" : true,
        buttonVisible: !!btn && btn.getBoundingClientRect().height > 0,
        overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });

    const btn = await page.evaluateHandle(() => [...document.querySelectorAll("button")].find((b) => b.textContent?.trim().startsWith("Filters")));
    await btn.asElement().click();
    await new Promise((r) => setTimeout(r, 450));
    out.mobileSheet = await page.evaluate(() => {
      const panel = document.querySelector("#catalog-filters");
      return {
        open: !!panel,
        role: panel?.getAttribute("role"),
        modal: panel?.getAttribute("aria-modal"),
        expanded: [...document.querySelectorAll("button")].find((b) => b.getAttribute("aria-controls") === "catalog-filters")?.getAttribute("aria-expanded"),
        focusInside: panel ? panel.contains(document.activeElement) : false,
        bodyLocked: getComputedStyle(document.body).overflow,
        chipsScrollable: (() => {
          const t = panel?.querySelector(".filter-chips-track");
          return t ? t.scrollWidth > t.clientWidth + 4 : null;
        })(),
      };
    });
    await page.screenshot({ path: ".ohmyagent/catalog-mobile-sheet.png" });
    await page.keyboard.press("Escape");
    await new Promise((r) => setTimeout(r, 250));
    out.mobileSheetClosed = await page.evaluate(() => ({
      panel: !!document.querySelector("#catalog-filters"),
      expanded: [...document.querySelectorAll("button")].find((b) => b.getAttribute("aria-controls") === "catalog-filters")?.getAttribute("aria-expanded"),
    }));
    await page.close();
  }

  console.log(JSON.stringify(out, null, 2));
  await browser.close();
})();
