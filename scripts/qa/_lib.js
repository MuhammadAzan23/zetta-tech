/**
 * Site audit harness. Runs against the production server on :3100 with Playwright.
 * Prints JSON so results can be turned into QA-REPORT.md.
 *
 * Usage: node scripts/qa/run.js [section]
 */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE = "http://127.0.0.1:3100";
const OUT = path.join(__dirname, "..", "..", ".qa");
const results = [];
const consoleErrors = [];
const failedRequests = [];

function record(section, name, pass, detail) {
  results.push({ section, name, pass: Boolean(pass), detail });
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function newPage(browser, width = 1440, height = 900, opts = {}) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    ...opts,
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    window.__n = (s) => (s || "").replace(/\s+/g, " ").trim();
  });
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push({ url: page.url(), text: msg.text().slice(0, 300) });
  });
  page.on("pageerror", (err) => consoleErrors.push({ url: page.url(), text: `pageerror: ${err.message}`.slice(0, 300) }));
  page.on("response", (res) => {
    if (res.status() >= 400) failedRequests.push({ url: res.url(), status: res.status() });
  });
  return { context, page };
}

/** Scroll the whole page so reveal-on-scroll content settles. */
async function settle(page) {
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.75);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 55));
    }
    window.scrollTo(0, 0);
  });
  await wait(450);
}

module.exports = { BASE, OUT, results, consoleErrors, failedRequests, record, wait, newPage, settle, chromium, fs, path };
