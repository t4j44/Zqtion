import sharp from "sharp";

const [input, masterOutput = "artifacts/hero-z-poster-master.png"] = process.argv.slice(2);

if (!input) {
  throw new Error("Usage: node scripts/prepare-hero-poster.mjs <input.png> [master-output.png]");
}

const source = sharp(input).removeAlpha();
const { data, info } = await source.raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
const alpha = new Uint8Array(width * height).fill(255);
const visited = new Uint8Array(width * height);
const queue = new Int32Array(width * height);
let head = 0;
let tail = 0;

const isBackground = (index) => {
  const offset = index * channels;
  const red = data[offset];
  const green = data[offset + 1];
  const blue = data[offset + 2];
  const lightness = (red + green + blue) / 3;
  const chroma = Math.max(red, green, blue) - Math.min(red, green, blue);
  return lightness >= 186 && chroma <= 13;
};

const enqueue = (index) => {
  if (visited[index] || !isBackground(index)) return;
  visited[index] = 1;
  queue[tail++] = index;
};

for (let x = 0; x < width; x += 1) {
  enqueue(x);
  enqueue((height - 1) * width + x);
}
for (let y = 0; y < height; y += 1) {
  enqueue(y * width);
  enqueue(y * width + width - 1);
}

while (head < tail) {
  const index = queue[head++];
  alpha[index] = 0;
  const x = index % width;
  const y = Math.floor(index / width);
  if (x > 0) enqueue(index - 1);
  if (x + 1 < width) enqueue(index + 1);
  if (y > 0) enqueue(index - width);
  if (y + 1 < height) enqueue(index + width);
}

const rgba = Buffer.alloc(width * height * 4);
for (let index = 0; index < width * height; index += 1) {
  const sourceOffset = index * channels;
  const targetOffset = index * 4;
  rgba[targetOffset] = data[sourceOffset];
  rgba[targetOffset + 1] = data[sourceOffset + 1];
  rgba[targetOffset + 2] = data[sourceOffset + 2];
  rgba[targetOffset + 3] = alpha[index];
}

const transparentMaster = sharp(rgba, { raw: { width, height, channels: 4 } });
await transparentMaster.clone().png({ compressionLevel: 9 }).toFile(masterOutput);

for (const size of [512, 768, 1280]) {
  const resized = transparentMaster.clone().resize(size, size, { fit: "contain" });
  await resized.clone().avif({ quality: 66, effort: 6 }).toFile(`public/hero/z-poster-${size}.avif`);
  await resized.clone().webp({ quality: 78, effort: 6, alphaQuality: 90 }).toFile(`public/hero/z-poster-${size}.webp`);
}

const metadata = await sharp(masterOutput).metadata();
if (!metadata.hasAlpha) throw new Error("Poster export is missing alpha transparency");
console.log(JSON.stringify({ masterOutput, width, height, transparentPixels: alpha.filter((value) => value === 0).length }, null, 2));
