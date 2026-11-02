"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { drawSwimmingFish, loadSprite } from "@/lib/fish-swim";
import { OceanShader } from "@/components/ocean-shader";

interface Eyes { x: number; y: number; size: number; gap: number; color: string; blink: number; next: number }

// Plates cruising through the dark: x and y are fractions of the section, width a
// fraction of its width (capped), speed in px per frame. All drawn head-left.
const creatures = [
  { src: "/species/manta-ray.png", x: 0.66, y: 0.3, width: 0.3, speed: 0.22, beat: 0.3 },
  { src: "/species/swordfish.png", x: 0.38, y: 0.72, width: 0.36, speed: 0.4, beat: 0.6 },
  { src: "/species/tuna.png", x: 0.9, y: 0.62, width: 0.2, speed: 0.33, beat: 0.8 },
  { src: "/species/pufferfish.png", x: 0.2, y: 0.42, width: 0.11, speed: 0.12, beat: 1.2 },
  { src: "/species/pike.png", x: 0.08, y: 0.86, width: 0.22, speed: 0.28, beat: 0.7 },
  { src: "/species/anglerfish.webp", x: 0.52, y: 0.5, width: 0.17, speed: 0.07, beat: 0.35 },
  { src: "/species/sunfish.webp", x: 0.18, y: 0.2, width: 0.12, speed: 0.1, beat: 0.25 },
  { src: "/species/grenadier.webp", x: 0.75, y: 0.82, width: 0.2, speed: 0.16, beat: 0.5 },
  { src: "/species/chimaera.webp", x: 0.3, y: 0.58, width: 0.22, speed: 0.13, beat: 0.4 },
];
const glows = ["#9ff7ff", "#ffd38a", "#c7b0ff", "#a8ffd8"];
const random = (min: number, max: number) => min + Math.random() * (max - min);

// A soft glowing dot per colour, blurred once here instead of on every frame.
function glowDot(color: string) {
  const dot = document.createElement("canvas");
  dot.width = dot.height = 32;
  const ctx = dot.getContext("2d")!;
  ctx.fillStyle = ctx.shadowColor = color;
  ctx.shadowBlur = 9;
  ctx.beginPath();
  ctx.arc(16, 16, 4, 0, Math.PI * 2);
  ctx.fill();
  return dot;
}

// The pointer is a lamp. Only what it touches can be seen, and the eyes watching
// from the dark close and vanish the moment the light finds them.
function AbyssCanvas({ motion }: { motion: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current, ctx = el?.getContext("2d"), section = el?.parentElement;
    if (!el || !ctx || !section) return;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    let width = 0, height = 0, time = 0, active = true, running = false;
    const swimmers = creatures.map(kind => ({ ...kind, sprite: null as HTMLCanvasElement | null, px: 0, wag: random(0, 6) }));
    const lamp = { x: 0.6, y: 0.5, tx: 0.6, ty: 0.5, r: 0.24, tr: 0.24, steered: false, idle: 0 };
    let eyes: Eyes[] = [];
    const dots = new Map(glows.map(color => [color, glowDot(color)]));

    const resize = () => {
      width = el.offsetWidth;
      height = el.offsetHeight;
      el.width = Math.round(width * dpr);
      el.height = Math.round(height * dpr);
      // Keep the watchers out of the copy in the top-left corner.
      eyes = Array.from({ length: width < 700 ? 6 : 11 }, () => {
        const y = random(0.2, 0.86), x = y < 0.6 ? random(0.5, 0.96) : random(0.04, 0.96);
        return {
          x: x * width, y: y * height, size: random(1.6, 3.2), gap: random(7, 13),
          color: glows[Math.floor(random(0, glows.length))], blink: 0, next: random(1, 6),
        };
      });
    };

    const draw = (dt: number) => {
      const ease = 1 - Math.exp(-dt * 4);
      if (!lamp.steered) { lamp.tx = 0.55 + Math.sin(time * 0.21) * 0.3; lamp.ty = 0.52 + Math.sin(time * 0.33 + 1) * 0.26; }
      lamp.x += (lamp.tx - lamp.x) * ease;
      lamp.y += (lamp.ty - lamp.y) * ease;
      lamp.r += (lamp.tr - lamp.r) * ease;
      const lx = lamp.x * width, ly = lamp.y * height, radius = lamp.r * Math.max(Math.min(width, height * 1.6), 560);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, width, height);
      // Nothing outside the pool of light is ever visible, so draw only inside it.
      const left = lx - radius, top = ly - radius, size = radius * 2;
      ctx.save();
      ctx.beginPath();
      ctx.rect(left, top, size, size);
      ctx.clip();
      for (const fish of swimmers) {
        if (!fish.sprite) continue;
        const w = fish.width * Math.min(Math.max(width, 700), 1400), h = w * fish.sprite.height / fish.sprite.width;
        fish.px -= fish.speed * dt * 60;
        fish.wag += dt * Math.PI * 2 * fish.beat;
        let x = fish.x * width + fish.px;
        if (x < -w) { fish.px += width + w * 2; x += width + w * 2; }
        if (Math.abs(x - lx) > radius + w / 2 || Math.abs(fish.y * height - ly) > radius + h / 2 + 12) continue;
        ctx.save();
        ctx.translate(x, fish.y * height + Math.sin(time * 0.4 + fish.beat * 5) * 12);
        ctx.rotate(Math.cos(time * 0.4 + fish.beat * 5) * 0.03);
        drawSwimmingFish(ctx, fish.sprite, w, h, fish.wag, 0.4, 14);
        ctx.restore();
      }
      // Cut everything down to the lamp's pool of light.
      const pool = ctx.createRadialGradient(lx, ly, 0, lx, ly, radius);
      pool.addColorStop(0, "rgba(0,0,0,1)");
      pool.addColorStop(0.45, "rgba(0,0,0,.85)");
      pool.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalCompositeOperation = "destination-in";
      ctx.fillStyle = pool;
      ctx.fillRect(left, top, size, size);
      ctx.restore();
      ctx.globalCompositeOperation = "lighter";
      const haze = ctx.createRadialGradient(lx, ly, 0, lx, ly, radius * 1.15);
      haze.addColorStop(0, "rgba(127,227,205,.10)");
      haze.addColorStop(1, "rgba(127,227,205,0)");
      ctx.fillStyle = haze;
      ctx.fillRect(lx - radius * 1.2, ly - radius * 1.2, radius * 2.4, radius * 2.4);

      for (const pair of eyes) {
        pair.next -= dt;
        if (pair.next <= 0) { pair.blink = 1; pair.next = random(2.5, 7); }
        pair.blink = Math.max(0, pair.blink - dt * 5);
        const shy = Math.min(1, Math.max(0, (Math.hypot(pair.x - lx, pair.y - ly) - radius * 0.7) / (radius * 0.8)));
        if (shy <= 0.01) continue;
        const open = 1 - Math.sin(pair.blink * Math.PI);
        ctx.globalAlpha = shy * (0.55 + 0.45 * Math.sin(time * 1.3 + pair.x));
        const dot = dots.get(pair.color)!, scale = pair.size / 4, high = 32 * scale * Math.max(0.08, open);
        for (const side of [-1, 1]) ctx.drawImage(dot, pair.x + side * pair.gap / 2 - 16 * scale, pair.y - high / 2, 32 * scale, high);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    const tick = (_: number, delta: number) => {
      const dt = Math.min(delta, 50) / 1000;
      time += dt;
      lamp.idle += dt;
      if (lamp.idle > 4) lamp.steered = false;
      draw(dt);
    };
    const run = (on: boolean) => {
      if (!motion || on === running) return;
      running = on;
      if (on) gsap.ticker.add(tick); else gsap.ticker.remove(tick);
    };

    resize();
    swimmers.forEach(fish => void loadSprite(fish.src, Math.min(fish.width * Math.max(width, 700), 520) * dpr).then(sprite => {
      if (!active) return;
      fish.sprite = sprite;
      if (!running) draw(0);
    }));

    const aim = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      lamp.tx = (event.clientX - rect.left) / rect.width;
      lamp.ty = (event.clientY - rect.top) / rect.height;
      lamp.steered = true;
      lamp.idle = 0;
    };
    const press = (event: PointerEvent) => { aim(event); lamp.tr = 0.36; };
    const release = () => { lamp.tr = 0.24; };
    const resizer = new ResizeObserver(() => { resize(); draw(0); });
    resizer.observe(el);
    const observer = new IntersectionObserver(([entry]) => run(entry.isIntersecting));
    if (motion) {
      observer.observe(el);
      section.addEventListener("pointermove", aim);
      section.addEventListener("pointerdown", press);
      addEventListener("pointerup", release);
      section.addEventListener("pointerleave", release);
    }
    return () => {
      active = false;
      run(false);
      observer.disconnect();
      resizer.disconnect();
      section.removeEventListener("pointermove", aim);
      section.removeEventListener("pointerdown", press);
      removeEventListener("pointerup", release);
      section.removeEventListener("pointerleave", release);
    };
  }, [motion]);

  return <canvas ref={canvas} className="interlude-canvas" aria-hidden="true" />;
}

export function AbyssInterlude({ motion }: { motion: boolean }) {
  return (
    <section className="folio interlude interlude-abyss" aria-labelledby="abyss-title" data-quiet-cursor>
      <OceanShader motion={motion} deep className="interlude-shader" />
      <AbyssCanvas motion={motion} />
      <div className="folio-topline"><span>間奏 / GIAO KHÚC II</span><span>VÙNG KHÔNG ÁNH SÁNG</span></div>
      <div className="interlude-copy reveal">
        <h2 id="abyss-title">Nơi mặt trời<br /><em>không chạm tới.</em></h2>
        <p>Dưới một nghìn mét, bóng tối là tuyệt đối. Ở đó, nhiều sinh vật tự thắp sáng chính mình. Cầm lấy ngọn đèn và nhìn xem ai đang ở quanh bạn.</p>
      </div>
      <div className="interlude-hint"><span>DI CHUỘT / CHẠM · SOI ĐÈN</span><span>NHẤN GIỮ · ĐÈN SÁNG HƠN</span><span>1000 M · 4°C</span></div>
    </section>
  );
}
