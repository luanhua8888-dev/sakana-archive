"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { drawSwimmingFish } from "@/lib/fish-swim";

type Point = [number, number];

// Outlines that keep a crop of the engraving sheet from catching its neighbours.
const clips: Record<number, Point[]> = {
  45: [[0, 33], [18, 17], [30, 0], [56, 7], [78, 20], [79, 36], [100, 28], [100, 72], [77, 66], [69, 83], [44, 81], [40, 100], [30, 98], [24, 71], [0, 65]],
  100: [[0, 20], [30, 17], [40, 0], [70, 0], [70, 20], [100, 20], [100, 80], [62, 82], [61, 100], [42, 100], [40, 84], [0, 75]],
  565: [[30, 0], [100, 0], [100, 100], [0, 100], [0, 42], [10, 25]],
};

export function cropClip(x: number) {
  const points = clips[x];
  return points && `polygon(${points.map(([px, py]) => `${px}% ${py}%`).join(",")})`;
}

// One entry per .fish-layer in the hero, in DOM order. The layers stay in the page for
// layout and captions; their plates are hidden and swum here instead.
const school = [
  { crop: [100, 0, 445, 173], tilt: -13, depth: [-32, -25], alpha: 0.7, phase: 0, beat: 0.75 },
  { crop: [45, 158, 490, 303], tilt: -10, depth: [65, 45], alpha: 1, phase: 2.3, beat: 0.5 },
  { crop: [100, 0, 445, 173], tilt: 13, depth: [100, 70], alpha: 0.76, phase: 4.1, beat: 0.9 },
];
const pad = 14;

// Cut the crop, turn its dark paper transparent and its lines to pale ink (the same
// matrix as #ink-light), and bake in a faint glow, all once at load time.
function inkPlate(sheet: HTMLImageElement, [x, y, w, h]: number[]) {
  const plate = document.createElement("canvas");
  plate.width = w;
  plate.height = h;
  const ctx = plate.getContext("2d", { willReadFrequently: true })!;
  const outline = clips[x];
  if (outline) {
    ctx.beginPath();
    outline.forEach(([px, py], i) => ctx[i ? "lineTo" : "moveTo"](px / 100 * w, py / 100 * h));
    ctx.clip();
  }
  ctx.drawImage(sheet, -x, -y);
  const image = ctx.getImageData(0, 0, w, h), data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    const ink = data[i + 3] ? (data[i] + data[i + 1] + data[i + 2]) / 255 - 0.89 : 0;
    data[i] = 217; data[i + 1] = 222; data[i + 2] = 201;
    data[i + 3] = Math.max(0, Math.min(255, ink * 255));
  }
  ctx.putImageData(image, 0, 0);
  const sprite = document.createElement("canvas");
  sprite.width = w + pad * 2;
  sprite.height = h + pad * 2;
  const glow = sprite.getContext("2d")!;
  glow.shadowColor = "rgba(127,227,205,.3)";
  glow.shadowBlur = 9;
  glow.drawImage(plate, pad, pad);
  return sprite;
}

export function HeroSchool({ motion }: { motion: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current, ctx = el?.getContext("2d"), scene = el?.parentElement;
    const hero = scene?.closest<HTMLElement>(".hero");
    if (!el || !ctx || !scene || !hero) return;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const fish = school.map(kind => ({ ...kind, sprite: null as HTMLCanvasElement | null, x: 0, y: 0, w: 0, h: 0, wag: kind.phase }));
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let time = 0, active = true, running = false;

    // Read each hidden plate's laid-out box, so every breakpoint in the CSS still applies.
    const measure = () => {
      el.width = Math.round(el.offsetWidth * dpr);
      el.height = Math.round(el.offsetHeight * dpr);
      scene.querySelectorAll<HTMLElement>(".fish-layer").forEach((layer, index) => {
        const plate = layer.querySelector<HTMLElement>(".specimen"), f = fish[index];
        if (!plate || !f) return;
        f.w = plate.offsetWidth;
        f.h = plate.offsetHeight;
        f.x = layer.offsetLeft + plate.offsetLeft + f.w / 2 - el.offsetLeft;
        f.y = layer.offsetTop + plate.offsetTop + f.h / 2 - el.offsetTop;
      });
    };

    const draw = (dt: number) => {
      const ease = 1 - Math.exp(-dt * 3);
      pointer.x += (pointer.tx - pointer.x) * ease;
      pointer.y += (pointer.ty - pointer.y) * ease;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, el.width, el.height);
      fish.forEach(f => {
        if (!f.sprite || !f.w) return;
        // Holding station in a slow current: a long gentle drift, a slower rise and fall,
        // nose following the climb, and the tail beating harder while pushing forward.
        const t = time + f.phase;
        const forward = Math.max(0, Math.cos(t * 0.14));
        const scale = f.w / (f.sprite.width - pad * 2);
        f.wag += dt * Math.PI * 2 * f.beat * (0.8 + forward * 0.7);
        ctx.save();
        ctx.translate(f.x + Math.sin(-t * 0.14) * f.w * 0.03 + pointer.x * f.depth[0], f.y + Math.sin(t * 0.23) * f.h * 0.07 + pointer.y * f.depth[1]);
        ctx.rotate(f.tilt * Math.PI / 180 - Math.cos(t * 0.23) * 0.035 + Math.sin(f.wag) * 0.006);
        ctx.globalAlpha = f.alpha;
        drawSwimmingFish(ctx, f.sprite, f.sprite.width * scale, f.sprite.height * scale, f.wag, motion ? 0.55 + forward * 0.25 : 0, 28);
        ctx.restore();
      });
    };
    const tick = (_: number, delta: number) => {
      const dt = Math.min(delta, 50) / 1000;
      time += dt;
      draw(dt);
    };
    const run = (on: boolean) => {
      if (!motion || on === running) return;
      running = on;
      if (on) gsap.ticker.add(tick); else gsap.ticker.remove(tick);
    };

    const sheet = new Image();
    sheet.decoding = "async";
    sheet.onload = () => {
      if (!active) return;
      fish.forEach(f => { f.sprite = inkPlate(sheet, f.crop); });
      measure();
      draw(0);
    };
    sheet.src = "/fish-archive.png";

    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const rect = hero.getBoundingClientRect();
      pointer.tx = (event.clientX - rect.left) / rect.width - 0.5;
      pointer.ty = (event.clientY - rect.top) / rect.height - 0.5;
    };
    const leave = () => { pointer.tx = pointer.ty = 0; };
    const resizer = new ResizeObserver(() => { measure(); draw(0); });
    resizer.observe(scene);
    const observer = new IntersectionObserver(([entry]) => run(entry.isIntersecting));
    if (motion) {
      observer.observe(el);
      hero.addEventListener("pointermove", move);
      hero.addEventListener("pointerleave", leave);
    }
    return () => {
      active = false;
      run(false);
      observer.disconnect();
      resizer.disconnect();
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", leave);
    };
  }, [motion]);

  return <canvas ref={canvas} className="hero-fish" aria-hidden="true" />;
}
