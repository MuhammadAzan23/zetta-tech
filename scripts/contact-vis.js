const puppeteer = require("puppeteer-core");
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    protocolTimeout: 180000,
  });

  // Mobile: header strip + opened menu.
  const m = await browser.newPage();
  await m.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await m.goto("http://127.0.0.1:3100/", { waitUntil: "load", timeout: 120000 });
  await wait(1200);
  await m.screenshot({ path: ".ohmyagent/m-header.png", clip: { x: 0, y: 0, width: 390, height: 130 } });
  await m.click('button[aria-controls="mobile-menu"]');
  await wait(500);
  const menuLinks = await m.evaluate(() =>
    [...document.querySelectorAll("#mobile-menu a")].map((a) => ({
      text: a.textContent.replace(/\s+/g, " ").trim(),
      href: a.getAttribute("href"),
      visible: a.getBoundingClientRect().height > 0,
    })),
  );
  console.log("mobile menu:", JSON.stringify(menuLinks, null, 1));
  await m.screenshot({ path: ".ohmyagent/m-menu.png", clip: { x: 0, y: 0, width: 390, height: 560 } });
  await m.close();

  // Overflow check at narrow widths after the header change.
  for (const width of [320, 360, 390, 400]) {
    const p = await browser.newPage();
    await p.setViewport({ width, height: 800, isMobile: true, hasTouch: true });
    await p.goto("http://127.0.0.1:3100/", { waitUntil: "load", timeout: 120000 });
    await wait(700);
    const o = await p.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      stripW: Math.round(document.querySelector("header .label").getBoundingClientRect().width),
      stripScroll: document.querySelector("header .label").scrollWidth,
    }));
    console.log(width, JSON.stringify(o));
    await p.close();
  }

  await browser.close();
})();
