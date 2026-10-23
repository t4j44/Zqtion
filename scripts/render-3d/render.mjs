// Usage: node scripts/render-3d/render.mjs <scene> [--size 800] [--frames 180] [--fps 30] [--out public/3d] [--crf 24]
// Needs ffmpeg on PATH, Google Chrome, and `npm i --no-save puppeteer-core`. See README.md.
import { createServer } from "node:http";
import { readFile, mkdir, writeFile, rm } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import puppeteer from "puppeteer-core";
import sharp from "sharp";

const args = process.argv.slice(2);
const scene = args[0];
const opt = (name, fallback) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : fallback; };
const size = Number(opt("size", 800));
const frames = Number(opt("frames", 180));
const fps = Number(opt("fps", 30));
const outDir = resolve(opt("out", "public/3d"));
const chrome = opt("chrome", "C:/Program Files/Google/Chrome/Application/chrome.exe");
const crf = Number(opt("crf", 24));
const only = opt("only", "");
const alpha = args.includes("--alpha");
const stillT = Number(opt("t", 0)); // "still" renders only the poster frame
if (!scene) throw new Error("scene name required");

const root = resolve("scripts/render-3d");
const three = resolve("node_modules/three");
const types = { ".js": "text/javascript", ".mjs": "text/javascript", ".html": "text/html", ".png": "image/png" };
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://x");
    const file = url.pathname.startsWith("/three/") ? join(three, url.pathname.slice(7)) : url.pathname.startsWith("/artifacts/") ? join(resolve("artifacts"), url.pathname.slice(11)) : join(root, url.pathname === "/" ? "scene.html" : url.pathname);
    res.setHeader("content-type", types[extname(file)] || "application/octet-stream");
    res.end(await readFile(file));
  } catch {
    res.statusCode = 404;
    res.end("not found");
  }
}).listen(0);
const port = server.address().port;

const work = resolve(process.env.RENDER_TMP || "artifacts/render-tmp", scene);
await rm(work, { recursive: true, force: true });
await mkdir(work, { recursive: true });
await mkdir(outDir, { recursive: true });

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--use-gl=angle", "--use-angle=d3d11", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage();
await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
page.on("pageerror", (e) => console.error("page error:", e.message));
page.on("console", (m) => { if (m.type() === "error") console.error("console:", m.text()); });
await page.goto(`http://localhost:${port}/?scene=${scene}&size=${size}${alpha ? "&alpha=1" : ""}`);
await page.waitForFunction("window.__ready === true", { timeout: 30000 });
const count = only === "still" ? 1 : frames;
for (let i = 0; i < count; i += 1) {
  const b64 = await page.evaluate((t) => window.renderAt(t), only === "still" ? stillT : i / frames);
  await writeFile(join(work, `f${String(i).padStart(4, "0")}.png`), Buffer.from(b64, "base64"));
  if (i % 30 === 0) console.log(`frame ${i}/${count}`);
}
await browser.close();
server.close();

if (only === "still") {
  const still = await readFile(join(work, "f0000.png"));
  if (alpha) {
    // Alpha stills (icons) ship as AVIF + WebP directly.
    await sharp(still).resize(size).avif({ quality: 70, effort: 6 }).toFile(join(outDir, `${scene}.avif`));
    await sharp(still).resize(size).webp({ quality: 88, alphaQuality: 95 }).toFile(join(outDir, `${scene}.webp`));
  } else {
    await writeFile(join(outDir, `${scene}-poster.png`), still);
  }
  process.exit(0);
}
// Poster shown before the video starts (and for reduced-motion / Save-Data visitors).
const posterPng = await readFile(join(work, "f0000.png"));
await sharp(posterPng).resize(640).avif({ quality: 55, effort: 6 }).toFile(join(outDir, `${scene}-poster.avif`));
await sharp(posterPng).resize(640).webp({ quality: 80 }).toFile(join(outDir, `${scene}-poster.webp`));

const input = join(work, "f%04d.png");
const color = ["-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709"];
const vf = "scale=in_range=full:out_range=tv:out_color_matrix=bt709,format=yuv420p";
execFileSync("ffmpeg", ["-y", "-framerate", String(fps), "-i", input, "-vf", vf, ...color, "-c:v", "libx264", "-preset", "slow", "-crf", String(crf), "-x264-params", "aq-mode=3", "-movflags", "+faststart", "-an", join(outDir, `${scene}.mp4`)], { stdio: "inherit" });
if (args.includes("--webm")) execFileSync("ffmpeg", ["-y", "-framerate", String(fps), "-i", input, "-vf", vf, ...color, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", String(crf + 8), "-row-mt", "1", "-an", join(outDir, `${scene}.webm`)], { stdio: "inherit" });
console.log("done", outDir);
