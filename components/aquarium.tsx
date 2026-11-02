"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import gsap from "gsap";
import { Moon, Sun, Trash2, Wheat } from "lucide-react";
import { OceanShader } from "@/components/ocean-shader";
import { drawSwimmingFish, loadSprite } from "@/lib/fish-swim";

// Plates that read well at aquarium size, all drawn head-left; size is length in CSS px.
const kinds = [
  { name: "Cá vàng", src: "/species/goldfish.webp", size: 92 },
  { name: "Cá thần tiên hoàng đế", src: "/species/emperor-angelfish.webp", size: 104 },
  { name: "Cá bò Picasso", src: "/species/picasso-triggerfish.webp", size: 96 },
  { name: "Cá mao tiên", src: "/species/lionfish.webp", size: 108 },
  { name: "Cá bướm sọc", src: "/species/butterflyfish.webp", size: 84 },
  { name: "Cá nóc hòm sừng", src: "/species/cowfish.webp", size: 86 },
  { name: "Cá nóc nhím", src: "/species/porcupinefish.webp", size: 92 },
  { name: "Cá vẹt xanh", src: "/species/parrotfish.webp", size: 116 },
  { name: "Cá dây", src: "/species/john-dory.webp", size: 96 },
  { name: "Cá phèn", src: "/species/red-mullet.webp", size: 100 },
  { name: "Cá nhám vằn", src: "/species/zebra-shark.webp", size: 168 },
  { name: "Cá mặt trăng", src: "/species/sunfish.webp", size: 92 },
];
const limit = 10;
const random = (min: number, max: number) => min + Math.random() * (max - min);

interface Swimmer { kind: number; x: number; y: number; vx: number; vy: number; tx: number; ty: number; facing: number; turn: number; tilt: number; wag: number; rest: number; drop: number }
interface Flake { x: number; y: number; age: number }

function TankCanvas({ motion, stock, feedRef }: { motion: boolean; stock: number[]; feedRef: RefObject<(() => void) | null> }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const state = useRef({ swimmers: [] as Swimmer[], flakes: [] as Flake[], sprites: [] as (HTMLCanvasElement | null)[], width: 0, height: 0, redraw: () => {} });

  // Keep the swimmers in step with the stock list: add newcomers at the surface, drop the rest.
  useEffect(() => {
    const tank = state.current;
    const next: Swimmer[] = stock.map((kind, i) => tank.swimmers[i]?.kind === kind ? tank.swimmers[i] : {
      kind, x: random(0.15, 0.85) * (tank.width || 600), y: -20, vx: 0, vy: 1.5, tx: random(0.1, 0.9) * (tank.width || 600),
      ty: random(0.25, 0.75) * (tank.height || 300), facing: Math.random() < 0.5 ? -1 : 1, turn: 1, tilt: 0, wag: random(0, 6), rest: 0, drop: 1,
    });
    next.forEach(fish => { if (fish.drop && !motion) { fish.y = fish.ty; fish.drop = 0; } });
    tank.swimmers = next;
    tank.redraw();
  }, [stock, motion]);

  useEffect(() => {
    const el = canvas.current, ctx = el?.getContext("2d"), tank = state.current;
    if (!el || !ctx) return;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const pointer = { x: -999, y: -999 };
    let active = true, running = false, time = 0;
    kinds.forEach((kind, i) => {
      if (tank.sprites[i]) return;
      void loadSprite(kind.src, kind.size * dpr * 1.2).then(sprite => { if (active) { tank.sprites[i] = sprite; tank.redraw(); } });
    });

    const resize = () => {
      tank.width = el.offsetWidth;
      tank.height = el.offsetHeight;
      el.width = Math.round(tank.width * dpr);
      el.height = Math.round(tank.height * dpr);
    };
    const scale = () => Math.min(1, tank.width / 900) * 0.25 + 0.75;
    const step = (dt: number) => {
      time += dt / 60;
      const floor = tank.height * 0.86;
      for (const fish of tank.swimmers) {
        const size = kinds[fish.kind].size * scale();
        if (fish.drop) {
          fish.vy += 0.12 * dt;
          fish.y += fish.vy * dt;
          if (fish.y > fish.ty) { fish.drop = 0; fish.vy = 0.5; }
          continue;
        }
        // Food beats wandering; otherwise drift to a spot, linger, pick another.
        let goal = null as Flake | null, best = 280 * 280;
        for (const flake of tank.flakes) { const d = (flake.x - fish.x) ** 2 + (flake.y - fish.y) ** 2; if (d < best) { best = d; goal = flake; } }
        const tx = goal ? goal.x : fish.tx, ty = goal ? goal.y : fish.ty;
        const dx = tx - fish.x, dy = ty - fish.y, distance = Math.hypot(dx, dy) || 1;
        if (goal && distance < size * 0.35) tank.flakes.splice(tank.flakes.indexOf(goal), 1);
        if (!goal && distance < 20) {
          fish.rest -= dt / 60;
          if (fish.rest <= 0) { fish.tx = random(0.08, 0.92) * tank.width; fish.ty = random(0.18, 0.78) * tank.height; fish.rest = random(1, 4); }
        }
        const pace = Math.min(goal ? 2.6 : 1.3, distance / 40) * (110 / kinds[fish.kind].size) ** 0.3;
        fish.vx += ((dx / distance) * pace - fish.vx) * 0.03 * dt;
        fish.vy += ((dy / distance) * pace * 0.7 - fish.vy) * 0.03 * dt;
        fish.x = Math.max(size * 0.5, Math.min(tank.width - size * 0.5, fish.x + fish.vx * dt));
        fish.y = Math.max(size * 0.3, Math.min(floor - size * 0.2, fish.y + fish.vy * dt + Math.sin(time * 1.3 + fish.wag) * 0.08));
        if (Math.abs(fish.vx) > 0.35 && Math.sign(fish.vx) !== fish.facing && Math.abs(fish.turn - fish.facing) < 0.05) fish.facing = Math.sign(fish.vx);
        fish.turn += (fish.facing - fish.turn) * Math.min(1, 0.07 * dt);
        fish.tilt += (Math.max(-0.35, Math.min(0.35, Math.atan2(fish.vy, Math.abs(fish.vx) + 0.8))) - fish.tilt) * 0.06 * dt;
        fish.wag += (0.06 + Math.hypot(fish.vx, fish.vy) * 0.08) * dt;
      }
      for (let i = tank.flakes.length - 1; i >= 0; i--) {
        const flake = tank.flakes[i];
        flake.age += dt / 60;
        flake.y = Math.min(floor, flake.y + 0.45 * dt);
        flake.x += Math.sin(flake.age * 2 + i) * 0.15 * dt;
        if (flake.age > 9) tank.flakes.splice(i, 1);
      }
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, tank.width, tank.height);
      ctx.fillStyle = "#f3dfc0";
      for (const flake of tank.flakes) ctx.fillRect(flake.x - 1.5, flake.y - 1.5, 3, 3);
      let hovered: Swimmer | null = null;
      for (const fish of tank.swimmers) {
        const sprite = tank.sprites[fish.kind];
        if (!sprite) continue;
        const w = kinds[fish.kind].size * scale(), h = w * sprite.height / sprite.width;
        if (Math.abs(pointer.x - fish.x) < w / 2 && Math.abs(pointer.y - fish.y) < h / 2) hovered = fish;
        ctx.save();
        ctx.translate(fish.x, fish.y);
        ctx.scale(fish.turn, 1);
        ctx.rotate(fish.tilt);
        ctx.scale(-1, 1);
        drawSwimmingFish(ctx, sprite, w, h, fish.wag, motion ? 0.45 + Math.min(0.4, Math.hypot(fish.vx, fish.vy) * 0.2) : 0, 16);
        ctx.restore();
      }
      if (hovered) {
        const label = kinds[hovered.kind].name, top = hovered.y - kinds[hovered.kind].size * scale() * 0.45 - 12;
        ctx.font = "500 11px 'JetBrains Mono', monospace";
        const width = ctx.measureText(label).width + 18;
        ctx.fillStyle = "rgba(240,236,223,.92)";
        ctx.fillRect(hovered.x - width / 2, top - 18, width, 22);
        ctx.fillStyle = "#193b47";
        ctx.textAlign = "center";
        ctx.fillText(label, hovered.x, top - 3);
      }
    };
    tank.redraw = () => { if (!running) draw(); };

    const tick = (_: number, delta: number) => { step(Math.min(delta, 50) / 16.67); draw(); };
    const run = (on: boolean) => {
      if (!motion || on === running) return;
      running = on;
      if (on) gsap.ticker.add(tick); else gsap.ticker.remove(tick);
    };
    const sprinkle = (x?: number) => {
      const at = x ?? random(0.25, 0.75) * tank.width;
      for (let i = 0; i < 9 && tank.flakes.length < 60; i++) tank.flakes.push({ x: at + random(-40, 40), y: random(4, 20), age: random(0, 0.4) });
      tank.redraw();
    };
    feedRef.current = () => sprinkle();
    const locate = (event: PointerEvent) => { const rect = el.getBoundingClientRect(); return { x: event.clientX - rect.left, y: event.clientY - rect.top }; };
    const hover = (event: PointerEvent) => { Object.assign(pointer, locate(event)); tank.redraw(); };
    const leave = () => { pointer.x = pointer.y = -999; tank.redraw(); };
    const tap = (event: PointerEvent) => sprinkle(locate(event).x);

    resize();
    tank.swimmers.forEach(fish => { if (fish.tx > tank.width) fish.tx = random(0.1, 0.9) * tank.width; });
    draw();
    const resizer = new ResizeObserver(() => { resize(); draw(); });
    resizer.observe(el);
    const observer = new IntersectionObserver(([entry]) => run(entry.isIntersecting));
    observer.observe(el);
    el.addEventListener("pointermove", hover);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("pointerdown", tap);
    return () => {
      active = false;
      run(false);
      observer.disconnect();
      resizer.disconnect();
      el.removeEventListener("pointermove", hover);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointerdown", tap);
      feedRef.current = null;
    };
  }, [motion, feedRef]);

  return <canvas ref={canvas} className="tank-canvas" aria-label="Bể cá: chạm để rắc thức ăn" />;
}

export function Aquarium({ motion }: { motion: boolean }) {
  const [stock, setStock] = useState<number[]>([0, 1, 2, 6]);
  const [night, setNight] = useState(false);
  const feed = useRef<(() => void) | null>(null);
  const counts = kinds.map((_, i) => stock.filter(kind => kind === i).length);

  return (
    <section className="aquarium" id="be-ca" aria-labelledby="aquarium-title">
      <div className="aquarium-head">
        <div className="reveal">
          <span className="folio-label">水槽 / BỂ CÁ CỦA BẠN</span>
          <h2 id="aquarium-title">Một góc đại dương<br /><em>của riêng bạn.</em></h2>
        </div>
        <p className="reveal">Chọn những cư dân bạn thích để thả vào bể. Chạm vào mặt nước để rắc thức ăn, hoặc tắt đèn để xem bể cá về đêm.</p>
      </div>
      <div className={`tank${night ? " is-night" : ""}`} data-quiet-cursor>
        <OceanShader motion={motion} deep={night} className="tank-shader" />
        <span className="tank-sand" aria-hidden="true" />
        <span className="tank-weed tank-weed--one" aria-hidden="true" />
        <span className="tank-weed tank-weed--two" aria-hidden="true" />
        <span className="tank-weed tank-weed--three" aria-hidden="true" />
        <TankCanvas motion={motion} stock={stock} feedRef={feed} />
        <div className="tank-hud font-mono" aria-live="polite">{stock.length}/{limit} CƯ DÂN</div>
      </div>
      <div className="tank-tools">
        <div className="tank-palette" role="group" aria-label="Thả cá vào bể">
          {kinds.map((kind, i) => (
            <button key={kind.name} type="button" className="tank-pick" disabled={stock.length >= limit} onClick={() => setStock(current => [...current, i])} aria-label={`Thả ${kind.name} vào bể`}>
              <img src={kind.src} alt="" loading="lazy" decoding="async" draggable="false" />
              <span>{kind.name}</span>
              {counts[i] > 0 && <b>{counts[i]}</b>}
            </button>
          ))}
        </div>
        <div className="tank-actions font-mono">
          <button type="button" onClick={() => feed.current?.()}><Wheat size={15} /> CHO ĂN</button>
          <button type="button" onClick={() => setNight(on => !on)} aria-pressed={night}>{night ? <Sun size={15} /> : <Moon size={15} />} {night ? "BẬT ĐÈN" : "ĐÈN ĐÊM"}</button>
          <button type="button" onClick={() => setStock([])} disabled={!stock.length}><Trash2 size={15} /> XẢ BỂ</button>
        </div>
      </div>
    </section>
  );
}
