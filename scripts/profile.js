const puppeteer = require("puppeteer-core");
const fs = require("fs");
const { join } = require("path");

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  const client = await page.target().createCDPSession();
  await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });

  await client.send("Profiler.enable");
  await client.send("Profiler.setSamplingInterval", { interval: 200 });
  await client.send("Profiler.start");
  const t0 = Date.now();
  await page.goto("http://127.0.0.1:3100/", { waitUntil: "networkidle0", timeout: 90000 });
  await new Promise((r) => setTimeout(r, 3000));
  const { profile } = await client.send("Profiler.stop");
  console.log("elapsed ms", Date.now() - t0);

  // Aggregate self time by function.
  const byId = new Map(profile.nodes.map((n) => [n.id, n]));
  const self = new Map();
  const total = profile.samples.length;
  for (const id of profile.samples) {
    const node = byId.get(id);
    if (!node) continue;
    const cf = node.callFrame;
    const key = `${cf.functionName || "(anon)"} @ ${(cf.url || "").split("/").pop()}:${cf.lineNumber}`;
    self.set(key, (self.get(key) || 0) + 1);
  }
  const top = [...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25);
  for (const [key, count] of top) console.log(`${((count / total) * 100).toFixed(1)}%  ${key}`);

  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    const lcp = performance.getEntriesByType("largest-contentful-paint").slice(-1)[0];
    return {
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
      load: Math.round(nav.loadEventEnd),
      lcp: lcp?.startTime?.toFixed(0),
      lcpEl: lcp?.element?.tagName,
      nodes: document.querySelectorAll("*").length,
      longTasks: performance.getEntriesByType("longtask")?.length ?? "unsupported",
    };
  });
  console.log(JSON.stringify(metrics, null, 2));
  fs.writeFileSync(join(__dirname, "..", ".ohmyagent", "motion-audit", "cpu-home.json"), JSON.stringify(profile));
  await browser.close();
})();
