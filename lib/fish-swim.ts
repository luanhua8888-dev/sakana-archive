// Halve repeatedly before the final draw so fine engraving lines don't alias.
export function shrink(image: HTMLImageElement, width: number) {
  let source: CanvasImageSource = image, w = image.naturalWidth, h = image.naturalHeight;
  while (w / 2 > width) {
    const step = document.createElement("canvas");
    step.width = Math.round(w / 2);
    step.height = Math.round(h / 2);
    step.getContext("2d")!.drawImage(source, 0, 0, step.width, step.height);
    source = step; w = step.width; h = step.height;
  }
  const sprite = document.createElement("canvas");
  sprite.width = Math.round(width);
  sprite.height = Math.round(width * image.naturalHeight / image.naturalWidth);
  const ctx = sprite.getContext("2d")!;
  ctx.imageSmoothingQuality = "high"; // once, at load; per-frame draws are ~1:1
  ctx.drawImage(source, 0, 0, sprite.width, sprite.height);
  return sprite;
}

export function loadSprite(src: string, width: number) {
  return new Promise<HTMLCanvasElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(shrink(image, width));
    image.onerror = reject;
    image.src = src;
  });
}

// Side-on plates, drawn head-left and centred on the origin. A real tail sweeps toward
// and away from the viewer rather than up and down, so each vertical strip turns about
// the spine: it foreshortens, dims as it faces away, and lifts only a touch.
export function drawSwimmingFish(ctx: CanvasRenderingContext2D, sprite: CanvasImageSource & { width: number; height: number }, width: number, height: number, wag: number, power: number, strips = 24) {
  const alpha = ctx.globalAlpha, source = sprite.width / strips, step = width / strips;
  let x = -width / 2;
  for (let i = 0; i < strips; i++) {
    const u = (i + 0.5) / strips, wave = wag - u * 3.6;
    const turn = Math.sin(wave) * power * u * u, facing = Math.cos(turn);
    const span = step * facing, lift = Math.sin(wave - 0.8) * height * 0.014 * power * u;
    ctx.globalAlpha = alpha * (0.8 + 0.2 * facing);
    // A hair of overlap hides seams; any more doubles the ink where strips meet.
    ctx.drawImage(sprite, i * source, 0, source * (1 + 0.3 / span), sprite.height, x, -height / 2 + lift, span + 0.3, height);
    x += span;
  }
  ctx.globalAlpha = alpha;
}
