const puppeteer = require("puppeteer-core");

(async () => {
  const browser = await puppeteer.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:3100/", { waitUntil: "load", timeout: 90000 });
  await new Promise((r) => setTimeout(r, 1200));

  // Take an accessibility snapshot without scrolling: deferred sections must still be exposed.
  const snap = await page.accessibility.snapshot({ interestingOnly: false });
  const strings = [];
  (function walk(n) {
    if (!n) return;
    if (n.name) strings.push(n.name);
    (n.children || []).forEach(walk);
  })(snap);
  const all = strings.join(" | ");

  const checks = {
    faqQuestionExposed: all.includes("Common questions") || all.includes("Do you install"),
    footerExposed: all.includes("Zetta Tech"),
    productsExposed: all.includes("Focused catalog") || all.includes("access control"),
    citiesExposed: all.includes("Karachi"),
    totalNames: strings.length,
  };

  // Also confirm the DOM text is present without scrolling.
  const dom = await page.evaluate(() => ({
    details: document.querySelectorAll("details").length,
    sections: document.querySelectorAll(".defer-paint").length,
    innerTextLen: document.body.innerText.length,
  }));

  console.log(JSON.stringify({ checks, dom }, null, 2));
  await browser.close();
})();
