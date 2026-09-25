import sharp from "sharp";
import fs from "fs";
import path from "path";

export async function isolateFishSpecimen(inputPath, outputPath, options = {}) {
  const { cropBorderPx = 0 } = options;
  
  let image = sharp(inputPath);
  if (cropBorderPx > 0) {
    const meta = await image.metadata();
    image = image.extract({
      left: cropBorderPx,
      top: cropBorderPx,
      width: meta.width - cropBorderPx * 2,
      height: meta.height - cropBorderPx * 2
    });
  }

  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // 1. Calculate luminance for every pixel
  const lum = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const srcIdx = i * channels;
    lum[i] = 0.299 * data[srcIdx] + 0.587 * data[srcIdx + 1] + 0.114 * data[srcIdx + 2];
  }

  // 2. Classify background passable pixels.
  // Ink lines of the engraving are dark navy/black (lum < 115).
  // Aged paper, parchment grain, and tea stains have lum > 140.
  const INK_EDGE_THRESHOLD = 125;
  const isBgPassable = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    if (lum[i] >= INK_EDGE_THRESHOLD) {
      isBgPassable[i] = 1;
    }
  }

  // 3. Flood fill from borders to identify pure outer background
  const isOuterBg = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let qHead = 0, qTail = 0;

  function push(idx) {
    if (!isOuterBg[idx] && isBgPassable[idx]) {
      isOuterBg[idx] = 1;
      queue[qTail++] = idx;
    }
  }

  for (let x = 0; x < width; x++) {
    push(x);
    push((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    push(y * width);
    push(y * width + (width - 1));
  }

  while (qHead < qTail) {
    const curr = queue[qHead++];
    const cx = curr % width;
    const cy = Math.floor(curr / width);

    if (cx > 0) push(curr - 1);
    if (cx < width - 1) push(curr + 1);
    if (cy > 0) push(curr - width);
    if (cy < height - 1) push(curr + width);
  }

  // 4. Initial alpha map:
  // - Pixels reached by outerBg -> 0
  // - Pixels inside fish -> 255
  const rawAlpha = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    rawAlpha[i] = isOuterBg[i] ? 0 : 255;
  }

  // 5. Eliminate any stray noise, flecks, or border fragments:
  // Only keep the largest connected component (the main fish specimen)
  const visited = new Uint8Array(width * height);
  const comp = new Int32Array(width * height);
  let maxCompSize = 0;
  let maxCompId = -1;
  const compList = [];

  for (let i = 0; i < width * height; i++) {
    if (rawAlpha[i] > 0 && !visited[i]) {
      let cHead = 0, cTail = 0;
      visited[i] = 1;
      comp[cTail++] = i;

      while (cHead < cTail) {
        const curr = comp[cHead++];
        const cx = curr % width;
        const cy = Math.floor(curr / width);

        const neighbors = [
          cx > 0 ? curr - 1 : -1,
          cx < width - 1 ? curr + 1 : -1,
          cy > 0 ? curr - width : -1,
          cy < height - 1 ? curr + width : -1
        ];

        for (const n of neighbors) {
          if (n >= 0 && rawAlpha[n] > 0 && !visited[n]) {
            visited[n] = 1;
            comp[cTail++] = n;
          }
        }
      }

      if (cTail > maxCompSize) {
        maxCompSize = cTail;
        maxCompId = compList.length;
      }
      compList.push(comp.slice(0, cTail));
    }
  }

  // Erase any component that is not part of the main fish (size < 10,000 pixels)
  for (let c = 0; c < compList.length; c++) {
    if (c !== maxCompId && compList[c].length < 10000) {
      for (const idx of compList[c]) {
        rawAlpha[idx] = 0;
      }
    }
  }

  // 6. Anti-alias the fish perimeter smoothly
  // Find outer pixels adjacent to the fish and calculate subpixel alpha based on ink darkness
  const finalAlpha = new Uint8Array(rawAlpha);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (rawAlpha[idx] === 0) {
        // Check if adjacent to fish pixel
        let touchesFish = false;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const ny = y + dy, nx = x + dx;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              if (rawAlpha[ny * width + nx] > 0) {
                touchesFish = true;
                break;
              }
            }
          }
          if (touchesFish) break;
        }

        if (touchesFish) {
          const l = lum[idx];
          // Smooth edge alpha
          if (l < 210) {
            const t = Math.max(0, Math.min(1, (210 - l) / (210 - 70)));
            finalAlpha[idx] = Math.round(t * 255);
          }
        }
      }
    }
  }

  // 7. Assemble 4-channel RGBA buffer
  const out = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const srcIdx = i * channels;
    const dstIdx = i * 4;
    const a = finalAlpha[i];

    if (a > 0) {
      out[dstIdx] = data[srcIdx];
      out[dstIdx + 1] = data[srcIdx + 1];
      out[dstIdx + 2] = data[srcIdx + 2];
      out[dstIdx + 3] = a;
    } else {
      out[dstIdx] = 0;
      out[dstIdx + 1] = 0;
      out[dstIdx + 2] = 0;
      out[dstIdx + 3] = 0;
    }
  }

  // 8. Auto-trim transparent borders and pad evenly
  const trimmed = await sharp(out, { raw: { width, height, channels: 4 } })
    .trim({ threshold: 0 })
    .extend({
      top: 24,
      bottom: 24,
      left: 36,
      right: 36,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png({ compressionLevel: 9 })
    .toBuffer();

  await sharp(trimmed).toFile(outputPath);
  console.log(`[OK] Isolated cleanly -> ${outputPath}`);
}
