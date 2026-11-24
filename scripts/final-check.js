const puppeteer = require("puppeteer-core");
const BASE = "http://127.0.0.1:3100";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
  });
  const out = {};

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(`${BASE}/`, { waitUntil: "load", timeout: 120000 });
  await wait(1200);

  // ---------- C4: beam button ----------
  out.beam = await page.evaluate(() => {
    const btn = document.querySelector(".beam-button");
    if (!btn) return { found: false };
    const before = getComputedStyle(btn, "::before");
    const after = getComputedStyle(btn, "::after");
    const beams = document.querySelectorAll(".beam-button").length;
    const headerQuote = [...document.querySelectorAll("header a")].find((a) => a.textContent?.trim() === "Request a quote");
    return {
      found: true,
      count: beams,
      text: btn.textContent.trim(),
      beforeBackground: before.backgroundImage.slice(0, 60),
      beforeAnimation: before.animationName,
      beforeDuration: before.animationDuration,
      afterBackground: after.backgroundColor,
      afterInset: after.inset,
      registered: CSS.registerProperty ? "supported-api" : "no-api",
      headerQuoteHasBeam: headerQuote ? headerQuote.classList.contains("beam-button") : null,
      heroMailtoStillPresent: !!document.querySelector('a[href^="mailto:"]'),
    };
  });

  // ---------- C3: logo marquee ----------
  out.marquee = await page.evaluate(() => {
    const track = document.querySelector(".logo-marquee-track");
    if (!track) return { found: false };
    const sets = track.querySelectorAll(".logo-set");
    const first = sets[0];
    const second = sets[1];
    const cs = getComputedStyle(track);
    return {
      found: true,
      sets: sets.length,
      itemsPerSet: first.querySelectorAll(".logo-item").length,
      duplicateHidden: second.getAttribute("aria-hidden"),
      duplicateTabIndex: second.querySelector("a")?.tabIndex,
      animation: cs.animationName,
      playState: cs.animationPlayState,
      running: track.dataset.running,
      mask: getComputedStyle(document.querySelector(".logo-marquee")).maskImage !== "none",
      /* identical width is what makes the -50% loop seamless */
      firstWidth: Math.round(first.getBoundingClientRect().width),
      secondWidth: Math.round(second.getBoundingClientRect().width),
      names: [...first.querySelectorAll(".logo-wordmark")].map((n) => n.textContent),
      imgs: first.querySelectorAll("img").length,
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });

  // Pause on hover.
  const marqueeBox = await page.evaluate(() => {
    const r = document.querySelector(".logo-marquee").getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  await page.mouse.move(marqueeBox.x, marqueeBox.y);
  await wait(200);
  out.marqueeHover = await page.evaluate(
    () => getComputedStyle(document.querySelector(".logo-marquee-track")).animationPlayState,
  );
  await page.mouse.move(5, 5);

  // Pause while off-screen.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await wait(700);
  out.marqueeOffscreen = await page.evaluate(() => {
    const t = document.querySelector(".logo-marquee-track");
    return { running: t.dataset.running, playState: getComputedStyle(t).animationPlayState };
  });

  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(900);
  await page.screenshot({ path: ".ohmyagent/home-hero.png", clip: { x: 0, y: 0, width: 1280, height: 700 } });
  await page.evaluate(() => document.querySelector(".logo-marquee").scrollIntoView({ block: "center" }));
  await wait(500);
  await page.screenshot({ path: ".ohmyagent/logo-marquee.png" });

  // ---------- C1: attendance stepper ----------
  await page.goto(`${BASE}/products/attendance-management`, { waitUntil: "load", timeout: 120000 });
  await wait(900);
  out.stepperInitial = await page.evaluate(() => {
    const s = document.querySelector(".stepper");
    if (!s) return { found: false };
    return {
      found: true,
      count: s.querySelector(".stepper-count")?.textContent?.trim(),
      title: s.querySelector(".stepper-title")?.textContent?.trim(),
      backDisabled: s.querySelector(".stepper-actions button[type=button]")?.disabled,
      steps: s.querySelectorAll(".stepper-step").length,
      current: s.querySelector('[aria-current="step"] .stepper-step-label')?.textContent,
      progressbar: !!s.querySelector('[role="progressbar"]'),
    };
  });

  // Advance without answering: expect a validation error.
  await page.click(".stepper-actions button[type=submit]");
  await wait(300);
  out.stepperValidation = await page.evaluate(() => ({
    error: document.querySelector(".stepper-error")?.textContent?.trim(),
    stillStep: document.querySelector(".stepper-count")?.textContent?.trim(),
  }));

  // Answer each question, advancing each time.
  const picks = [0, 2, 0, 0, 1, 0];
  for (let i = 0; i < picks.length; i++) {
    const clicked = await page.evaluate((index) => {
      const panel = document.querySelector(".stepper-panel");
      const labels = panel.querySelectorAll(".stepper-choice");
      if (!labels[index]) return false;
      labels[index].querySelector("input").click();
      return true;
    }, picks[i]);
    if (!clicked) break;
    await wait(120);
    await page.click(".stepper-actions button[type=submit]");
    await wait(420);
  }

  out.stepperSummary = await page.evaluate(() => {
    const s = document.querySelector(".stepper");
    return {
      count: s.querySelector(".stepper-count")?.textContent?.trim(),
      title: s.querySelector(".stepper-title")?.textContent?.trim(),
      lead: s.querySelector(".stepper-plan-lead")?.textContent?.replace(/\s+/g, " ").trim(),
      primary: s.querySelector(".stepper-actions button[type=submit]")?.textContent?.trim(),
      finishedSteps: s.querySelectorAll(".stepper-step.is-done").length,
      note: s.querySelector(".stepper-plan-note")?.textContent?.replace(/\s+/g, " ").trim().slice(0, 60),
    };
  });
  await page.screenshot({ path: ".ohmyagent/attendance-summary.png" });

  // Back button returns and keeps the answer.
  await page.click(".stepper-actions button[type=button]");
  await wait(400);
  out.stepperBack = await page.evaluate(() => ({
    count: document.querySelector(".stepper-count")?.textContent?.trim(),
    picked: [...document.querySelectorAll(".stepper-choice.is-picked")].map((l) => l.textContent.trim()),
  }));

  // ---------- C1: contact quote ----------
  await page.goto(`${BASE}/contact`, { waitUntil: "load", timeout: 120000 });
  await wait(900);
  out.contact = await page.evaluate(() => {
    const s = document.querySelector(".stepper");
    return {
      found: !!s,
      count: s?.querySelector(".stepper-count")?.textContent?.trim(),
      steps: s?.querySelectorAll(".stepper-step").length,
      title: s?.querySelector(".stepper-title")?.textContent?.trim(),
    };
  });
  await page.click(".stepper-actions button[type=submit]");
  await wait(300);
  out.contactValidation = await page.evaluate(() => document.querySelector(".stepper-error")?.textContent?.trim());

  await page.type("#quote-name", "Ali Raza");
  await page.type("#quote-email", "ali@example.com");
  await page.click(".stepper-actions button[type=submit]");
  await wait(450);
  out.contactStep2 = await page.evaluate(() => ({
    count: document.querySelector(".stepper-count")?.textContent?.trim(),
    title: document.querySelector(".stepper-title")?.textContent?.trim(),
  }));
  await page.evaluate(() => {
    document.querySelectorAll(".stepper-chip input")[0].click();
    document.querySelectorAll(".stepper-chip input")[3].click();
  });
  await page.type("#quote-message", "Two doors at reception and one gate.");
  await page.click(".stepper-actions button[type=submit]");
  await wait(450);
  out.contactReview = await page.evaluate(() => ({
    count: document.querySelector(".stepper-count")?.textContent?.trim(),
    values: [...document.querySelectorAll(".stepper-plan-list > div")].map((d) => d.textContent.replace(/\s+/g, " ").trim()),
    primary: document.querySelector(".stepper-actions button[type=submit]")?.textContent?.trim(),
  }));

  // ---------- C2: site plan demo ----------
  await page.goto(`${BASE}/products/networking`, { waitUntil: "load", timeout: 120000 });
  await wait(900);
  out.planInitial = await page.evaluate(() => {
    const d = document.querySelector(".plan-demo");
    if (!d) return { found: false };
    return {
      found: true,
      tabs: [...d.querySelectorAll('[role="tab"]')].map((t) => `${t.textContent.trim()}:${t.getAttribute("aria-selected")}`),
      counts: [...d.querySelectorAll(".plan-demo-counts > div")].map((x) => x.textContent.replace(/\s+/g, " ").trim()),
      label: d.querySelector("svg")?.getAttribute("aria-label")?.slice(0, 50),
      camCircles: d.querySelectorAll(".sp-cam circle").length,
      readers: d.querySelectorAll(".sp-device rect").length,
      drawPaths: d.querySelectorAll(".sp-draw").length,
    };
  });

  await page.evaluate(() => document.getElementById("plan-tab-factory").click());
  await wait(700);
  out.planFactory = await page.evaluate(() => {
    const d = document.querySelector(".plan-demo");
    return {
      counts: [...d.querySelectorAll(".plan-demo-counts > div")].map((x) => x.textContent.replace(/\s+/g, " ").trim()),
      selected: d.querySelector('[aria-selected="true"]')?.textContent.trim(),
      camCircles: d.querySelectorAll(".sp-cam circle").length,
      readers: d.querySelectorAll(".sp-device rect").length,
      drawing: getComputedStyle(d.querySelector(".sp-draw")).strokeDashoffset,
    };
  });

  // Arrow-key navigation moves selection.
  await page.focus("#plan-tab-factory");
  await page.keyboard.press("ArrowRight");
  await wait(500);
  out.planKeyboard = await page.evaluate(() => ({
    selected: document.querySelector('.plan-demo [aria-selected="true"]')?.textContent.trim(),
    focused: document.activeElement?.id,
    counts: [...document.querySelectorAll(".plan-demo-counts dd")].map((x) => x.textContent.trim()),
  }));
  await page.screenshot({ path: ".ohmyagent/plan-demo.png" });

  // ---------- Part B: thermal ----------
  await page.goto(`${BASE}/products/cctv-nvrs`, { waitUntil: "load", timeout: 120000 });
  await wait(900);
  out.thermal = await page.evaluate(() => {
    const f = document.querySelector(".thermal-showcase");
    if (!f) return { found: false };
    const frame = f.querySelector(".thermal-showcase-frame");
    return {
      found: true,
      caption: f.querySelector(".thermal-showcase-label")?.textContent?.trim(),
      hasSvg: !!f.querySelector("svg"),
      hasImg: !!f.querySelector("img"),
      ratio: frame ? (frame.getBoundingClientRect().width / frame.getBoundingClientRect().height).toFixed(2) : null,
      border: frame ? getComputedStyle(frame).borderTopWidth : null,
      legend: !!f.querySelector(".thermal-showcase-scale-track"),
      role: f.querySelector("svg")?.getAttribute("role"),
      ariaLabel: f.querySelector("svg")?.getAttribute("aria-label")?.slice(0, 40),
    };
  });
  await page.evaluate(() => document.querySelector(".thermal-showcase")?.scrollIntoView({ block: "center" }));
  await wait(500);
  await page.screenshot({ path: ".ohmyagent/thermal-showcase.png" });

  // ---------- Reduced motion ----------
  const rm = await browser.newPage();
  await rm.setViewport({ width: 1280, height: 900 });
  await rm.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await rm.goto(`${BASE}/`, { waitUntil: "load", timeout: 120000 });
  await wait(800);
  out.reducedMotion = await rm.evaluate(() => {
    const track = document.querySelector(".logo-marquee-track");
    const sets = track.querySelectorAll(".logo-set");
    return {
      marqueeAnimation: getComputedStyle(track).animationName,
      marqueeWrap: getComputedStyle(track).flexWrap,
      duplicateDisplay: getComputedStyle(sets[1]).display,
      beamAnimation: getComputedStyle(document.querySelector(".beam-button"), "::before").animationName,
      beamBackground: getComputedStyle(document.querySelector(".beam-button"), "::before").backgroundImage,
    };
  });
  await rm.close();

  // ---------- Narrow viewport overflow ----------
  for (const width of [360, 768, 1440]) {
    const vp = await browser.newPage();
    await vp.setViewport({ width, height: 900, isMobile: width < 768, hasTouch: width < 768 });
    const rows = {};
    for (const path of ["/", "/catalog", "/contact", "/products/networking", "/products/cctv-nvrs", "/products/attendance-management"]) {
      await vp.goto(BASE + path, { waitUntil: "load", timeout: 120000 });
      await wait(500);
      rows[path] = await vp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    }
    out[`overflow_${width}`] = rows;
    await vp.close();
  }

  console.log(JSON.stringify(out, null, 2));
  await browser.close();
})();
