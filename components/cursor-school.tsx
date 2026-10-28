"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface Fish { x: number; y: number; vx: number; vy: number; width: number; slotX: number; slotY: number; phase: number; wag: number; speed: number; facing: number; turn: number; tilt: number; sprite: number; nextBubble: number }
interface Bubble { x: number; y: number; r: number; vy: number; age: number; life: number; seed: number }

// Engraved plates, all drawn head-left; width is the on-screen length in CSS px.
const species = [
  { src: "/species/herring.png", width: 62 },
  { src: "/species/tuna.png", width: 68 },
  { src: "/species/seabream.png", width: 54 },
  { src: "/species/flying-fish.png", width: 64 },
  { src: "/species/pufferfish.png", width: 46 },
  { src: "/species/herring.png", width: 50 },
];
const strips = 8;
const random = (min: number, max: number) => min + Math.random() * (max - min);

// Halve repeatedly before the final draw so fine engraving lines don't alias.
function shrink(image: HTMLImageElement, width: number) {
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

// A small school of engraved fish that trails the pointer and lets out the odd bubble.
export function CursorSchool({ motion }: { motion: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx || !motion || !matchMedia("(pointer: fine)").matches) return;

    const pointer = { x: innerWidth / 2, y: innerHeight / 2, seen: false, inside: true };
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const dirty = { x0: 0, y0: 0, x1: 0, y1: 0 };
    let alpha = 0, time = 0, active = true;
    const sprites: (HTMLCanvasElement | null)[] = species.map(() => null);
    species.forEach((kind, index) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => { if (active) sprites[index] = shrink(image, kind.width * dpr); };
      image.src = kind.src;
    });
    // Each fish keeps its own spot beside the pointer, never straight above or below it,
    // so a resting school has no reason to keep turning round.
    const school: Fish[] = species.map((kind, index) => {
      const side = index % 2 ? 1 : -1;
      return {
        x: pointer.x, y: pointer.y, vx: 0, vy: 0, width: kind.width,
        slotX: side * random(34, 95), slotY: random(-50, 50), phase: random(0, Math.PI * 2),
        wag: random(0, Math.PI * 2), speed: random(3, 5), facing: -side, turn: -side, tilt: 0, sprite: index, nextBubble: random(1, 4),
      };
    });
    const bubbles: Bubble[] = [];

    const resize = () => {
      el.width = Math.round(innerWidth * dpr);
      el.height = Math.round(innerHeight * dpr);
    };
    const move = (event: PointerEvent) => {
      if (!pointer.seen) school.forEach(fish => { fish.x = event.clientX + random(-40, 40); fish.y = event.clientY + random(-40, 40); });
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.seen = true;
      pointer.inside = true;
    };
    const leave = () => { pointer.inside = false; };

    const blow = (fish: Fish, count: number) => {
      for (let i = 0; i < count && bubbles.length < 40; i++) bubbles.push({
        x: fish.x + fish.facing * fish.width * 0.5, y: fish.y + Math.sin(fish.tilt) * fish.width * 0.5,
        r: random(1.4, 3.4), vy: random(0.35, 0.85), age: -i * 0.2, life: random(1.5, 2.6), seed: random(0, 10),
      });
    };

    // The plate is sliced into vertical strips that follow a travelling wave,
    // stronger towards the tail, so the body flexes as the fish swims.
    const drawFish = (fish: Fish, sprite: HTMLCanvasElement) => {
      const w = fish.width, h = w * sprite.height / sprite.width;
      const pace = Math.min(1, Math.hypot(fish.vx, fish.vy) / fish.speed);
      const amplitude = h * (0.05 + pace * 0.11);
      const strip = sprite.width / strips, stripW = w / strips;
      ctx.save();
      ctx.translate(fish.x, fish.y + Math.sin(time * 1.4 + fish.phase) * 1.6 * (1 - pace));
      ctx.scale(fish.turn, 1);
      ctx.rotate(fish.tilt);
      ctx.scale(-1, 1);
      for (let i = 0; i < strips; i++) {
        const u = (i + 0.5) / strips;
        const bend = Math.sin(fish.wag - u * 4.2) * amplitude * Math.pow(u, 1.6);
        ctx.drawImage(sprite, i * strip, 0, strip + 1, sprite.height, -w / 2 + i * stripW, -h / 2 + bend, stripW + 0.6, h);
      }
      ctx.restore();
    };

    const tick = (_: number, delta: number) => {
      const dt = Math.min(delta, 50) / 16.67, seconds = dt / 60;
      time += seconds;
      alpha += ((pointer.seen && pointer.inside ? 1 : 0) - alpha) * Math.min(1, 0.08 * dt);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (dirty.x1 > dirty.x0) ctx.clearRect(dirty.x0, dirty.y0, dirty.x1 - dirty.x0, dirty.y1 - dirty.y0);
      dirty.x0 = dirty.y0 = Infinity;
      dirty.x1 = dirty.y1 = -Infinity;
      const mark = (x: number, y: number, reach: number) => {
        dirty.x0 = Math.min(dirty.x0, Math.floor(x - reach)); dirty.y0 = Math.min(dirty.y0, Math.floor(y - reach));
        dirty.x1 = Math.max(dirty.x1, Math.ceil(x + reach)); dirty.y1 = Math.max(dirty.y1, Math.ceil(y + reach));
      };
      if (alpha < 0.01) return;

      school.forEach((fish, index) => {
        // Drift lazily around the spot, and ease to a stop when arriving.
        const tx = pointer.x + fish.slotX + Math.sin(time * 0.35 + fish.phase) * 10;
        const ty = pointer.y + fish.slotY + Math.cos(time * 0.5 + fish.phase) * 6;
        const dx = tx - fish.x, dy = ty - fish.y, distance = Math.hypot(dx, dy) || 1;
        const pace = Math.min(fish.speed, distance / 28);
        fish.vx += ((dx / distance) * pace - fish.vx) * 0.05 * dt;
        fish.vy += ((dy / distance) * pace - fish.vy) * 0.05 * dt;
        school.forEach((other, otherIndex) => {
          if (otherIndex === index) return;
          const ox = fish.x - other.x, oy = fish.y - other.y, gap = Math.hypot(ox, oy), room = (fish.width + other.width) * 0.38;
          if (gap > 0 && gap < room) { fish.vx += (ox / gap) * 0.2 * dt; fish.vy += (oy / gap) * 0.2 * dt; }
        });
        fish.x += fish.vx * dt;
        fish.y += fish.vy * dt;
        // Turn round only for real horizontal swimming, and only once the last turn is done;
        // a resting fish keeps facing the way it was.
        if (Math.abs(fish.vx) > 1.1 && Math.sign(fish.vx) !== fish.facing && Math.abs(fish.turn - fish.facing) < 0.05) fish.facing = Math.sign(fish.vx);
        fish.turn += (fish.facing - fish.turn) * Math.min(1, 0.09 * dt);
        // Pitch nose up or down with the climb, never more than about 30 degrees.
        const climb = Math.max(-0.5, Math.min(0.5, Math.atan2(fish.vy, Math.abs(fish.vx) + 1.2)));
        fish.tilt += (climb - fish.tilt) * Math.min(1, 0.08 * dt);
        fish.wag += (0.07 + Math.hypot(fish.vx, fish.vy) * 0.06) * dt;
        fish.nextBubble -= seconds;
        if (fish.nextBubble <= 0) { blow(fish, Math.ceil(random(0, 3))); fish.nextBubble = random(2.5, 6); }
      });

      ctx.globalAlpha = alpha;
      school.forEach(fish => { const sprite = sprites[fish.sprite]; if (!sprite) return; drawFish(fish, sprite); mark(fish.x, fish.y, fish.width * 0.6 + 6); });

      ctx.lineWidth = 1;
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const bubble = bubbles[i];
        bubble.age += seconds;
        if (bubble.age >= bubble.life) { bubbles.splice(i, 1); continue; }
        if (bubble.age < 0) continue;
        bubble.y -= bubble.vy * dt;
        const x = bubble.x + Math.sin(bubble.age * 4 + bubble.seed) * 3, fade = 1 - bubble.age / bubble.life;
        const r = bubble.r * (1 + bubble.age * 0.25);
        mark(x, bubble.y, r + 3);
        ctx.globalAlpha = alpha * fade;
        ctx.strokeStyle = "#7fa9a0";
        ctx.beginPath();
        ctx.arc(x, bubble.y, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,.75)";
        ctx.beginPath();
        ctx.arc(x - r * 0.35, bubble.y - r * 0.35, r * 0.28, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    resize();
    addEventListener("resize", resize);
    addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    gsap.ticker.add(tick);
    return () => {
      active = false;
      gsap.ticker.remove(tick);
      removeEventListener("resize", resize);
      removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, el.width, el.height);
    };
  }, [motion]);

  return <canvas ref={canvas} className="cursor-school" aria-hidden="true" />;
}
