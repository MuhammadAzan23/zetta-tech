const puppeteer = require("puppeteer-core");
(async () => {
  const browser = await puppeteer.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  const client = await page.target().createCDPSession();
  await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.goto("http://127.0.0.1:3100/", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 2000));

  // Count style/layout cost over 3 seconds while idle, with and without the marquee.
  async function sample(label) {
    const trace = await client.send("Tracing.start", { categories: "devtools.timeline", transferMode: "ReturnAsStream" });
    await new Promise((r) => setTimeout(r, 3000));
    const done = new Promise((resolve) => client.once("Tracing.tracingComplete", resolve));
    await client.send("Tracing.end");
    const { stream } = await done;
    let data = "";
    for (;;) {
      const chunk = await client.send("IO.read", { handle: stream });
      data += chunk.data;
      if (chunk.eof) break;
    }
    await client.send("IO.close", { handle: stream });
    const json = JSON.parse(data);
    const totals = {};
    for (const ev of json.traceEvents) {
      if (!ev.dur || !ev.name) continue;
      if (["Layout", "UpdateLayoutTree", "Paint", "PrePaint", "Layerize", "FunctionCall", "TimerFire", "FireAnimationFrame", "Animation", "HitTest", "RecalculateStyles"].includes(ev.name)) {
        totals[ev.name] = (totals[ev.name] || 0) + ev.dur / 1000;
      }
    }
    console.log(label, JSON.stringify(Object.fromEntries(Object.entries(totals).map(([k, v]) => [k, Math.round(v)])), null, 2));
  }

  await sample("with-marquee");
  await page.evaluate(() => {
    document.querySelectorAll(".testimonial-track").forEach((el) => (el.style.animation = "none"));
  });
  await sample("marquee-off");

  // Now stop GSAP global timeline.
  await page.evaluate(() => { document.querySelectorAll("svg").forEach((s) => (s.style.display = "none")); });
  await sample("svg-off");

  await browser.close();
})();
