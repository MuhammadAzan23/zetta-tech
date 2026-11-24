const puppeteer = require("puppeteer-core");
(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
  });
  const page = await browser.newPage();
  const failed = [];
  page.on("requestfailed", (req) => failed.push({ url: req.url(), err: req.failure()?.errorText }));
  page.on("response", async (res) => {
    if (res.status() >= 400) failed.push({ url: res.url(), status: res.status() });
  });
  await page.goto("http://127.0.0.1:3001/", { waitUntil: "networkidle0" });
  const info = await page.evaluate(() => ({
    next: typeof window.next,
    scripts: [...document.querySelectorAll("script[src]")].map((s) => s.src).filter((s) => s.includes("_next")),
    overlay: document.querySelector("nextjs-portal")?.innerHTML?.slice(0, 400) || null,
    reactRoot: !!document.getElementById("__next") || !!document.querySelector("[data-reactroot]"),
  }));
  console.log(JSON.stringify({ info, failed: failed.slice(0, 20) }, null, 2));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
