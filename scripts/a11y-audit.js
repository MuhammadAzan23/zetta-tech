const puppeteer = require("puppeteer-core");
(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto("http://127.0.0.1:3100/", { waitUntil: "networkidle0" });
  const report = await page.evaluate(() => {
    const visible = (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    const buttons = [...document.querySelectorAll("button, [role=button]")].map((el) => ({
      text: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 80),
      visible: visible(el),
    }));
    const inputs = [...document.querySelectorAll("input, textarea, select")].map((el) => {
      const id = el.id;
      const label = id ? document.querySelector(`label[for="${id}"]`) : null;
      return {
        id,
        type: el.getAttribute("type"),
        hasLabel: !!(label || el.getAttribute("aria-label") || el.getAttribute("aria-labelledby")),
        placeholder: el.getAttribute("placeholder"),
      };
    });
    const images = [...document.querySelectorAll("img")].slice(0, 12).map((img) => ({
      alt: img.getAttribute("alt"),
      hasAlt: img.hasAttribute("alt"),
    }));
    return {
      title: document.title,
      landmarks: {
        header: !!document.querySelector("header"),
        nav: !!document.querySelector("nav"),
        main: !!document.querySelector("main"),
        footer: !!document.querySelector("footer"),
      },
      h1: [...document.querySelectorAll("h1")].map((el) => el.textContent.trim()),
      buttons,
      inputs,
      images,
      svgLabeled: [...document.querySelectorAll("svg[role=img]")].map((el) => el.getAttribute("aria-label")),
    };
  });
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  const active = await page.evaluate(() => {
    const el = document.activeElement;
    return { tag: el?.tagName, id: el?.id, href: el?.getAttribute?.("href"), aria: el?.getAttribute?.("aria-label") };
  });
  console.log(JSON.stringify({ report, afterTabs: active }, null, 2));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

