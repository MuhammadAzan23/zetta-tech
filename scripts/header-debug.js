const puppeteer = require("puppeteer-core");
(async () => {
  const browser = await puppeteer.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto("http://127.0.0.1:3100/", { waitUntil: "networkidle0" });
  await page.mouse.move(700, 500);
  for (let i = 0; i < 10; i++) { await page.mouse.wheel({ deltaY: 120 }); await new Promise((r) => setTimeout(r, 60)); }
  await new Promise((r) => setTimeout(r, 500));
  const down = await page.evaluate(() => ({
    y: window.scrollY,
    cls: document.querySelector("header").className,
    transform: getComputedStyle(document.querySelector("header")).transform,
    rectTop: document.querySelector("header").getBoundingClientRect().top,
  }));
  for (let i = 0; i < 4; i++) { await page.mouse.wheel({ deltaY: -120 }); await new Promise((r) => setTimeout(r, 60)); }
  await new Promise((r) => setTimeout(r, 500));
  const up = await page.evaluate(() => ({
    y: window.scrollY,
    cls: document.querySelector("header").className,
    transform: getComputedStyle(document.querySelector("header")).transform,
  }));
  console.log(JSON.stringify({ down, up }, null, 2));
  await browser.close();
})();
