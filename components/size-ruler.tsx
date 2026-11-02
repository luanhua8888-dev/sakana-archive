"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

// Approximate maximum lengths in metres; the seahorse is measured standing up.
const fishes = [
  { name: "Cá ngựa", src: "/species/seahorse.webp", length: 0.15, note: "~15 cm", upright: true },
  { name: "Cá vàng", src: "/species/goldfish.webp", length: 0.2, note: "~20 cm" },
  { name: "Cá bò Picasso", src: "/species/picasso-triggerfish.webp", length: 0.3, note: "~30 cm" },
  { name: "Cá mao tiên", src: "/species/lionfish.webp", length: 0.38, note: "~38 cm" },
  { name: "Cá thần tiên hoàng đế", src: "/species/emperor-angelfish.webp", length: 0.4, note: "~40 cm" },
  { name: "Cá nóc nhím", src: "/species/porcupinefish.webp", length: 0.9, note: "tới ~90 cm" },
  { name: "Cá lịch", src: "/species/moray.webp", length: 1.5, note: "tới ~1,5 m" },
  { name: "Cá cần câu", src: "/species/anglerfish.webp", length: 2, note: "tới ~2 m" },
  { name: "Cá nheo châu Âu", src: "/species/wels-catfish.webp", length: 2.7, note: "tới ~2,7 m" },
  { name: "Cá mặt trăng", src: "/species/sunfish.webp", length: 3.3, note: "tới ~3,3 m" },
  { name: "Cá mập búa", src: "/species/hammerhead.webp", length: 4, note: "tới ~4 m" },
  { name: "Cá kiếm", src: "/species/swordfish.png", length: 4.5, note: "tới ~4,5 m" },
  { name: "Cá mập trắng", src: "/species/great-white.webp", length: 6, note: "~6 m" },
  { name: "Cá tầm Beluga", src: "/species/beluga.webp", length: 7, note: "tới ~7 m" },
];

// Every plate is drawn to one scale beside a standing person, who stays pinned at the
// left edge while the fish scroll past. Drag, swipe or use the arrows.
export function SizeRuler() {
  const track = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const drag = { on: false, x: 0, left: 0 };
    const down = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      Object.assign(drag, { on: true, x: event.clientX, left: el.scrollLeft });
      el.classList.add("is-dragging");
    };
    const move = (event: PointerEvent) => { if (drag.on) el.scrollLeft = drag.left - (event.clientX - drag.x); };
    const up = () => { drag.on = false; el.classList.remove("is-dragging"); };
    const scroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      progress.current?.style.setProperty("transform", `scaleX(${max > 0 ? el.scrollLeft / max : 0})`);
    };
    el.addEventListener("pointerdown", down);
    addEventListener("pointermove", move);
    addEventListener("pointerup", up);
    el.addEventListener("scroll", scroll, { passive: true });
    return () => {
      el.removeEventListener("pointerdown", down);
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
      el.removeEventListener("scroll", scroll);
    };
  }, []);

  const nudge = (direction: number) => track.current?.scrollBy({ left: direction * track.current.clientWidth * 0.7, behavior: "smooth" });

  return (
    <section className="ruler paper" aria-labelledby="ruler-title">
      <div className="ruler-head">
        <div className="reveal">
          <span className="folio-label">度量 / THƯỚC ĐO ĐẠI DƯƠNG</span>
          <h2 id="ruler-title">Từ vừa lòng bàn tay<br /><em>đến dài hơn bốn người.</em></h2>
        </div>
        <div className="ruler-intro reveal">
          <p>Mọi bản khắc dưới đây được vẽ theo cùng một tỉ lệ, đặt cạnh một người cao 1,7 mét. Kéo sang ngang để thấy đại dương lớn đến nhường nào.</p>
          <div className="ruler-controls">
            <button type="button" onClick={() => nudge(-1)} aria-label="Xem loài nhỏ hơn"><ArrowLeft size={17} /></button>
            <button type="button" onClick={() => nudge(1)} aria-label="Xem loài lớn hơn"><ArrowRight size={17} /></button>
          </div>
        </div>
      </div>
      <div className="ruler-track" ref={track} tabIndex={0} aria-label="Các loài cá xếp theo chiều dài">
        <figure className="ruler-person">
          <svg viewBox="0 0 40 170" aria-hidden="true"><circle cx="20" cy="12" r="10" /><path d="M8 28 Q20 22 32 28 L35 92 L29 92 L28 60 L27 166 L21 166 L20 104 L19 166 L13 166 L12 60 L11 92 L5 92 Z" /></svg>
          <figcaption><strong>Người</strong><span>1,7 m</span></figcaption>
        </figure>
        {fishes.map(fish => (
          <figure key={fish.name} className={`ruler-fish${fish.upright ? " is-upright" : ""}`} style={{ "--len": fish.length } as CSSProperties}>
            <img src={fish.src} alt={fish.name} loading="lazy" decoding="async" draggable="false" />
            <span className="ruler-scale" aria-hidden="true" />
            <figcaption><strong>{fish.name}</strong><span>{fish.note}</span></figcaption>
          </figure>
        ))}
      </div>
      <div className="ruler-foot font-mono"><span className="ruler-progress"><span ref={progress} /></span><span>CHIỀU DÀI TỐI ĐA GHI NHẬN, XẤP XỈ · MỖI VẠCH = 1 MÉT</span></div>
    </section>
  );
}
