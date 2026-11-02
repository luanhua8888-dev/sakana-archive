"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { drawSwimmingFish, loadSprite } from "@/lib/fish-swim";

interface Boid { x: number; y: number; vx: number; vy: number; z: number; wag: number; panic: number }
interface Bait { x: number; y: number; age: number }

const random = (min: number, max: number) => min + Math.random() * (max - min);
const reach = 70, personal = 20, wall = 90, fear = 150;

// A school of herring that follows three local rules (keep apart, keep pace, keep
// together) and nothing else. The pointer is a predator; a tap drops bait.
function SchoolCanvas({ motion, onCount }: { motion: boolean; onCount: (count: number) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current, ctx = el?.getContext("2d"), section = el?.parentElement;
    if (!el || !ctx || !section) return;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const count = innerWidth < 700 ? 70 : 150;
    onCount(count);
    let width = 0, height = 0, time = 0, active = true, running = false;
    let sprite: HTMLCanvasElement | null = null;
    const predator = { x: -999, y: -999, on: false };
    const baits: Bait[] = [];
    const school: Boid[] = [];

    const resize = () => {
      width = el.offsetWidth;
      height = el.offsetHeight;
      el.width = Math.round(width * dpr);
      el.height = Math.round(height * dpr);
    };
    resize();
    const heading = random(0, Math.PI * 2);
    for (let i = 0; i < count; i++) school.push({
      x: width * 0.55 + random(-160, 160), y: height * 0.5 + random(-90, 90),
      vx: Math.cos(heading + random(-0.4, 0.4)) * 2, vy: Math.sin(heading + random(-0.4, 0.4)) * 2,
      z: random(0.55, 1), wag: random(0, Math.PI * 2), panic: 0,
    });
    school.sort((a, b) => a.z - b.z);

    const step = (dt: number) => {
      time += dt / 60;
      for (const fish of school) {
        let ax = 0, ay = 0, cx = 0, cy = 0, n = 0, sx = 0, sy = 0;
        for (const other of school) {
          if (other === fish) continue;
          const dx = other.x - fish.x, dy = other.y - fish.y;
          if (Math.abs(dx) > reach || Math.abs(dy) > reach) continue;
          const d2 = dx * dx + dy * dy;
          if (d2 > reach * reach) continue;
          n++; ax += other.vx; ay += other.vy; cx += other.x; cy += other.y;
          const room = personal * fish.z;
          if (d2 < room * room && d2 > 0) { const d = Math.sqrt(d2); sx -= dx / d * (room - d); sy -= dy / d * (room - d); }
        }
        if (n) {
          fish.vx += ((ax / n - fish.vx) * 0.05 + (cx / n - fish.x) * 0.0035) * dt;
          fish.vy += ((ay / n - fish.vy) * 0.05 + (cy / n - fish.y) * 0.0035) * dt;
        }
        fish.vx += sx * 0.03 * dt;
        fish.vy += sy * 0.03 * dt;
        // A slow, shifting current keeps the school wandering when nothing disturbs it.
        const drift = Math.sin(fish.x * 0.004 + time * 0.3) + Math.cos(fish.y * 0.005 - time * 0.2);
        fish.vx += Math.cos(drift * 1.6) * 0.03 * dt;
        fish.vy += Math.sin(drift * 1.6) * 0.03 * dt;
        if (fish.x < wall) fish.vx += (wall - fish.x) * 0.004 * dt;
        if (fish.x > width - wall) fish.vx -= (fish.x - width + wall) * 0.004 * dt;
        if (fish.y < wall) fish.vy += (wall - fish.y) * 0.004 * dt;
        if (fish.y > height - wall) fish.vy -= (fish.y - height + wall) * 0.004 * dt;
        if (predator.on) {
          const dx = fish.x - predator.x, dy = fish.y - predator.y, d = Math.hypot(dx, dy);
          if (d < fear && d > 0) { const push = (1 - d / fear) * 1.4; fish.vx += dx / d * push * dt; fish.vy += dy / d * push * dt; fish.panic = 1; }
        }
        for (const bait of baits) {
          const dx = bait.x - fish.x, dy = bait.y - fish.y, d = Math.hypot(dx, dy);
          if (d < 420 && d > 12) { fish.vx += dx / d * 0.09 * dt; fish.vy += dy / d * 0.09 * dt; }
        }
        fish.panic = Math.max(0, fish.panic - 0.012 * dt);
        const speed = Math.hypot(fish.vx, fish.vy) || 1;
        const top = (2.2 + fish.panic * 2.6) * (0.7 + fish.z * 0.4), bottom = 1.1;
        const limit = Math.max(bottom, Math.min(top, speed));
        fish.vx = fish.vx / speed * limit;
        fish.vy = fish.vy / speed * limit;
        fish.x += fish.vx * dt;
        fish.y += fish.vy * dt;
        fish.wag += (0.12 + limit * 0.09) * dt;
      }
      for (let i = baits.length - 1; i >= 0; i--) if ((baits[i].age += dt / 60) > 3.2) baits.splice(i, 1);
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      for (const bait of baits) {
        const t = bait.age / 3.2;
        ctx.globalAlpha = (1 - t) * 0.6;
        ctx.strokeStyle = "#bff3e4";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(bait.x, bait.y, 8 + t * 70, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#f3dfc0";
        for (let k = 0; k < 5; k++) ctx.fillRect(bait.x + Math.sin(k * 2.4) * 10, bait.y + k * 3 + bait.age * 9, 2, 2);
      }
      if (!sprite) return;
      for (const fish of school) {
        const angle = Math.atan2(fish.vy, fish.vx);
        const w = 22 + fish.z * 18, h = w * sprite.height / sprite.width;
        // Silver flanks flash as the school turns through the light from above.
        const flash = 0.5 + 0.5 * Math.cos(2 * (angle + 0.5));
        ctx.save();
        ctx.translate(fish.x, fish.y);
        ctx.rotate(angle);
        if (Math.cos(angle) < 0) ctx.scale(1, -1);
        ctx.scale(-1, 1);
        ctx.globalAlpha = (0.5 + fish.z * 0.4) * (0.55 + flash * 0.45);
        drawSwimmingFish(ctx, sprite, w, h, fish.wag, 0.55 + fish.panic * 0.4, 4);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    };

    const tick = (_: number, delta: number) => { step(Math.min(delta, 50) / 16.67); draw(); };
    const run = (on: boolean) => {
      if (!motion || on === running) return;
      running = on;
      if (on) gsap.ticker.add(tick); else gsap.ticker.remove(tick);
    };
    void loadSprite("/species/herring.png", 40 * dpr).then(image => {
      if (!active) return;
      sprite = image;
      if (!motion) { for (let i = 0; i < 160; i++) step(1); }
      draw();
    });

    const locate = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    const move = (event: PointerEvent) => { Object.assign(predator, locate(event), { on: true }); };
    const leave = () => { predator.on = false; };
    const drop = (event: PointerEvent) => { if (baits.length < 4) baits.push({ ...locate(event), age: 0 }); };
    const resizer = new ResizeObserver(() => { resize(); draw(); });
    resizer.observe(el);
    const observer = new IntersectionObserver(([entry]) => run(entry.isIntersecting));
    if (motion) {
      observer.observe(el);
      section.addEventListener("pointermove", move);
      section.addEventListener("pointerleave", leave);
      section.addEventListener("pointerdown", drop);
    }
    return () => {
      active = false;
      run(false);
      observer.disconnect();
      resizer.disconnect();
      section.removeEventListener("pointermove", move);
      section.removeEventListener("pointerleave", leave);
      section.removeEventListener("pointerdown", drop);
    };
  }, [motion, onCount]);

  return <canvas ref={canvas} className="interlude-canvas" aria-hidden="true" />;
}

export function SchoolInterlude({ motion }: { motion: boolean }) {
  const [count, setCount] = useState(150);
  return (
    <section className="folio interlude interlude-school" aria-labelledby="school-title" data-quiet-cursor>
      <SchoolCanvas motion={motion} onCount={setCount} />
      <div className="folio-topline"><span>間奏 / GIAO KHÚC I</span><span>BẦY ĐÀN</span></div>
      <div className="interlude-copy reveal">
        <h2 id="school-title">Hàng trăm chiếc vảy bạc.<br /><em>Một nhịp thở.</em></h2>
        <p>Không có con đầu đàn. Mỗi con cá chỉ giữ khoảng cách, giữ nhịp và giữ lấy vài người hàng xóm gần nhất — vậy mà cả đàn chuyển động như một sinh thể.</p>
      </div>
      <div className="interlude-hint"><span>DI CHUỘT · LÀM CẢ ĐÀN GIẬT MÌNH</span><span>CHẠM · THẢ MỒI</span><span>{count} CÁ TRÍCH / 1 ĐÀN</span></div>
    </section>
  );
}
