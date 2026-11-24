const puppeteer = require("puppeteer-core");

async function run(label, url, { js = true, throttle = true } = {}) {
  const browser = await puppeteer.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: "new" });
  const page = await browser.newPage();
  await page.setJavaScriptEnabled(js);
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const client = await page.target().createCDPSession();
  if (throttle) {
    await client.send("Network.enable");
    await client.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 });
    await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  }
  await page.evaluateOnNewDocument(() => {
    window.__lcp = [];
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) window.__lcp.push({ t: Math.round(e.startTime), tag: e.element?.tagName, cls: (e.element?.className || "").toString().slice(0, 40) });
    }).observe({ type: "largest-contentful-paint", buffered: true });
    window.__paint = {};
    new PerformanceObserver((list) => { for (const e of list.getEntries()) window.__paint[e.name] = Math.round(e.startTime); }).observe({ type: "paint", buffered: true });
  });
  const t0 = Date.now();
  await page.goto(url, { waitUntil: "load", timeout: 120000 });
  await new Promise((r) => setTimeout(r, 4000));
  const info = await page.evaluate(() => ({ lcp: window.__lcp.slice(-1)[0], paints: window.__paint }));
  console.log(label, Date.now() - t0, "ms", JSON.stringify(info));
  await browser.close();
}

(async () => {
  await run("home/no-js", "http://127.0.0.1:3100/", { js: false });
  await run("home/js", "http://127.0.0.1:3100/");
  await run("home/js-unthrottled", "http://127.0.0.1:3100/", { throttle: false });
})();
