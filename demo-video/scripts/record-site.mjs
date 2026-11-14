// Records the live FairLens site analysing the Adult census data, for the video's main scene.
//
//   ADULT_CSV=~/Downloads/adult-census-income.csv npm run record
//
// Writes public/site.mp4 and src/data/site-timing.json (when each step happened, in seconds into the
// clip). Uses the system Chrome. Nothing is mocked: this is the deployed site and API.
import { chromium } from "playwright-core";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SITE = process.env.FAIRLENS_URL ?? "https://fairlens-a.vercel.app/";
const CSV = process.env.ADULT_CSV ?? `${process.env.HOME}/Downloads/adult-census-income.csv`;
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
// The page at its normal size, so whole report cards and charts fit in the video's browser frame.
const VIEW = { width: 1620, height: 856 };
const SIZE = VIEW;
const here = new URL("..", import.meta.url).pathname;

// A visible cursor: Playwright's recording does not draw the real one.
const CURSOR = `
  addEventListener("DOMContentLoaded", () => {
    const c = document.createElement("div");
    c.style.cssText = "position:fixed;z-index:99999;width:24px;height:24px;border-radius:50%;pointer-events:none;" +
      "background:rgba(60,230,221,.35);border:2px solid #3CE6DD;transform:translate(-50%,-50%);left:-50px;top:-50px;transition:transform .12s";
    document.body.appendChild(c);
    addEventListener("mousemove", (e) => { c.style.left = e.clientX + "px"; c.style.top = e.clientY + "px"; });
    addEventListener("mousedown", () => (c.style.transform = "translate(-50%,-50%) scale(.7)"));
    addEventListener("mouseup", () => (c.style.transform = "translate(-50%,-50%)"));
  });`;

const dir = mkdtempSync(join(tmpdir(), "fairlens-rec-"));
const browser = await chromium.launch({ executablePath: CHROME });
const context = await browser.newContext({ viewport: VIEW, colorScheme: "dark", recordVideo: { dir, size: VIEW } });
await context.addInitScript(CURSOR);
const page = await context.newPage();
const t0 = Date.now();
const at = () => (Date.now() - t0) / 1000;

const moveTo = async (locator, steps = 18) => {
  const b = await locator.boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps });
  return b;
};
// Scrolls so the element sits just below the sticky navbar (or centred).
const smoothScrollTo = async (locator, block = "start") => {
  await locator.evaluate((el, block) => {
    const r = el.getBoundingClientRect();
    const top = block === "center" ? r.top + scrollY - (innerHeight - r.height) / 2 : r.top + scrollY - 76;
    scrollTo({ top, behavior: "smooth" });
  }, block);
  await page.waitForTimeout(1300);
};

await page.goto(SITE);
await page.waitForLoadState("networkidle");
await page.waitForTimeout(300);
const start = at(); // everything before this is a blank page loading; trimmed off below
await page.mouse.move(810, 330);
await page.waitForTimeout(1600); // the hero, with the RCC banner

const getStarted = page.getByRole("button", { name: /Get Started/ });
await moveTo(getStarted);
await page.waitForTimeout(250);
await getStarted.click();
const uploadAt = at();
await page.waitForTimeout(700);

// The file dialog can't be recorded, so the file is handed to the same <input> a click opens.
await moveTo(page.getByText("1. Choose a CSV file"), 12);
await page.locator('input[type="file"]').setInputFiles(CSV);
await page.getByText("32,561 rows").waitFor();
const fileAt = at();
await page.waitForTimeout(900);

// The columns FairLens picked by itself: income as the outcome, age/race/sex/... as people columns.
await smoothScrollTo(page.getByText("2. What outcome are you predicting?"), "start");
const columnsAt = at();
await moveTo(page.locator("select").first(), 14);
await page.waitForTimeout(700);
await moveTo(page.getByRole("button", { name: "age", exact: true }).first(), 14);
await page.waitForTimeout(500);
await moveTo(page.getByRole("button", { name: "native_country", exact: true }).first(), 14);
await page.waitForTimeout(600);

const analyze = page.getByRole("button", { name: "Analyze Dataset" });
await analyze.scrollIntoViewIfNeeded();
await moveTo(analyze);
await page.waitForTimeout(250);
const analyzeAt = at();
await analyze.click();
await page.getByRole("heading", { name: "Bias Report" }).waitFor({ timeout: 60000 });
const reportAt = at();
await page.mouse.move(1560, 140, { steps: 10 });
await page.waitForTimeout(3600); // rows, issues, severity, and the plain-English summary

// The outcome-rate charts, then group sizes.
await smoothScrollTo(page.locator("h2", { hasText: "Outcome rate by group" }), "start");
const outcomesAt = at();
await page.waitForTimeout(4600);
await smoothScrollTo(page.locator("h2", { hasText: "Group sizes" }), "start");
const sizesAt = at();
await page.waitForTimeout(3400);
const end = at();

await context.close();
await browser.close();

const webm = join(dir, readdirSync(dir).find((f) => f.endsWith(".webm")));
const out = join(here, "public", "site.mp4");
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", String(start), "-i", webm, "-t", String(end - start),
  "-vf", `scale=${SIZE.width}:${SIZE.height}:flags=lanczos`, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16", "-r", "30", out]);
const rel = (t) => +(t - start).toFixed(2);
const timing = {
  uploadAt: rel(uploadAt), fileAt: rel(fileAt), columnsAt: rel(columnsAt), analyzeAt: rel(analyzeAt),
  reportAt: rel(reportAt), outcomesAt: rel(outcomesAt), sizesAt: rel(sizesAt), durationSec: rel(end),
};
writeFileSync(join(here, "src", "data", "site-timing.json"), JSON.stringify(timing, null, 2) + "\n");
console.log("recorded", out, timing);
