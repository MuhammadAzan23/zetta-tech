const puppeteer = require("puppeteer-core");
const { join } = require("path");

const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const out = join(__dirname, "..", ".ohmyagent", "design", "v1", "compare");
const product = "http://127.0.0.1:3001/";
const proto = "file:///C:/Users/wajiz.pk/Documents/zetta-tech/.ohmyagent/design/v1/prototype.html";

const frames = [
  { name: "desk-1440-100", width: 1440, height: 900, dpr: 1 },
  { name: "desk-1440-075", width: 1440, height: 900, dpr: 0.75 },
  { name: "desk-1440-125", width: 1440, height: 900, dpr: 1.25 },
  { name: "tab-768-100", width: 768, height: 1024, dpr: 1 },
  { name: "tab-768-075", width: 768, height: 1024, dpr: 0.75 },
  { name: "tab-768-125", width: 768, height: 1024, dpr: 1.25 },
  { name: "mob-375-100", width: 375, height: 812, dpr: 1 },
  { name: "mob-375-075", width: 375, height: 812, dpr: 0.75 },
  { name: "mob-375-125", width: 375, height: 812, dpr: 1.25 },
  { name: "mob-430-100", width: 430, height: 932, dpr: 1 },
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: "new",
    args: ["--hide-scrollbars"],
  });
  const metrics = [];
  for (const frame of frames) {
    for (const [label, url] of [["product", product], ["proto", proto]]) {
      const page = await browser.newPage();
      await page.setViewport({ width: frame.width, height: frame.height, deviceScaleFactor: frame.dpr });
      await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
      const measure = await page.evaluate(() => ({
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        bodyScrollWidth: document.body.scrollWidth,
      }));
      const overflow = measure.scrollWidth - measure.innerWidth;
      metrics.push({ label, frame: frame.name, zoomProxyDpr: frame.dpr, overflow, ...measure });
      await page.screenshot({ path: join(out, `${label}-${frame.name}.png`) });
      await page.close();
    }
  }
  console.log(JSON.stringify(metrics, null, 2));
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
