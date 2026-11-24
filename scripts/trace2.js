const puppeteer = require("puppeteer-core");

async function metric(client, ms = 2500) {
  const totals = {};
  const done = new Promise((resolve) => client.once("Tracing.tracingComplete", resolve));
  await client.send("Tracing.start", { categories: "devtools.timeline", transferMode: "ReturnAsStream" });
  await new Promise((r) => setTimeout(r, ms));
  await client.send("Tracing.end");
  const { stream } = await done;
  let data = "";
  for (;;) {
    const chunk = await client.send("IO.read", { handle: stream });
    data += chunk.data;
    if (chunk.eof) break;
  }
  await client.send("IO.close", { handle: stream });
  for (const ev of JSON.parse(data).traceEvents) {
    if (!ev.dur || !ev.name) continue;
    if (["Layout", "UpdateLayoutTree", "Paint", "PrePaint", "FireAnimationFrame"].includes(ev.name)) {
      totals[ev.name] = (totals[ev.name] || 0) + ev.dur / 1000;
    }
  }
  return Object.fromEntries(Object.entries(totals).map(([k, v]) => [k, Math.round(v)]));
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  const client = await page.target().createCDPSession();
  await page.goto("http://127.0.0.1:3100/", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 2000));
  console.log("baseline", await metric(client));

  await page.evaluate(() => {
    // Kill every GSAP animation and the CSS marquees.
    if (window.gsap) window.gsap.globalTimeline.clear();
    document.querySelectorAll("*").forEach((el) => { el.style.animation = "none"; });
  });
  await new Promise((r) => setTimeout(r, 300));
  console.log("all-animations-cleared", await metric(client));

  const pauseOk = await page.evaluate(() => typeof window.gsap !== "undefined");
  console.log("window.gsap exposed:", pauseOk);

  await browser.close();
})();
