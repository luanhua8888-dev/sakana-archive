"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// The five standard ocean zones; each takes an equal share of the scroll.
const bounds = [0, 200, 1000, 4000, 6000, 11000];
const zones = [
  { name: "Tầng mặt", latin: "Epipelagic", range: "0 – 200 m", text: "Vùng có nắng. Ánh sáng đủ cho tảo biển quang hợp, và phần lớn sự sống của đại dương tụ hội ở đây." },
  { name: "Tầng chạng vạng", latin: "Mesopelagic", range: "200 – 1.000 m", text: "Ánh sáng nhạt dần thành xanh thẫm rồi tắt hẳn. Mỗi đêm, vô số sinh vật bơi lên gần mặt nước kiếm ăn: cuộc di cư lớn nhất hành tinh." },
  { name: "Tầng nửa đêm", latin: "Bathypelagic", range: "1.000 – 4.000 m", text: "Không còn một tia nắng. Ánh sáng duy nhất là ánh phát quang do chính các sinh vật tạo ra." },
  { name: "Tầng vực thẳm", latin: "Abyssopelagic", range: "4.000 – 6.000 m", text: "Nước lạnh gần đóng băng, áp suất gấp hàng trăm lần mặt biển. Những đồng bằng bùn mịn dưới đáy trải rộng hơn nửa bề mặt Trái Đất." },
  { name: "Tầng rãnh sâu", latin: "Hadal", range: "6.000 – 11.000 m", text: "Những rãnh sâu nhất hành tinh. Đáy Challenger ở rãnh Mariana sâu gần 11.000 mét." },
];
const waters = ["#5a969a", "#2a6170", "#11323f", "#071820", "#03090d", "#010305"];
// What lives where, by depth in metres; x is a percentage across the stage.
const sightings = [
  { src: "/species/flying-fish.png", depth: 4, x: 48, width: 150, label: "Cá chuồn · mặt nước" },
  { src: "/species/mahi-mahi.webp", depth: 40, x: 20, width: 190, label: "Cá nục heo cờ · ~40 m" },
  { src: "/species/tuna.png", depth: 130, x: 44, width: 230, label: "Cá ngừ · ~130 m" },
  { src: "/species/swordfish.png", depth: 450, x: 18, width: 270, label: "Cá kiếm · săn mồi ở tầng chạng vạng" },
  { src: "/species/chimaera.webp", depth: 700, x: 46, width: 220, label: "Cá mập ma · ~700 m" },
  { src: "/species/anglerfish.webp", depth: 900, x: 22, width: 170, label: "Cá cần câu · tới ~1.000 m" },
  { src: "/species/grenadier.webp", depth: 1500, x: 42, width: 230, label: "Cá đuôi chuột · ~1.500 m" },
  { glow: true, depth: 2600, x: 26, width: 0, label: "Ánh phát quang sinh học" },
  { glow: true, depth: 3500, x: 54, width: 0, label: "" },
  { glow: true, depth: 5000, x: 36, width: 0, label: "Sứa vực thẳm" },
  { glow: true, depth: 8336, x: 44, width: 0, label: "Cá ốc · 8.336 m · con cá sâu nhất từng được quay phim (2022)" },
  { glow: true, depth: 10935, x: 26, width: 0, label: "Đáy Challenger · 10.935 m" },
];

function share(depth: number) {
  const zone = Math.min(4, bounds.findIndex((edge, i) => depth < bounds[i + 1]));
  return (zone + (depth - bounds[zone]) / (bounds[zone + 1] - bounds[zone])) / 5;
}

function mix(a: string, b: string, t: number) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const channel = (shift: number) => Math.round(((pa >> shift) & 255) + (((pb >> shift) & 255) - ((pa >> shift) & 255)) * t);
  return `rgb(${channel(16)},${channel(8)},${channel(0)})`;
}

export function DescentSection({ motion }: { motion: boolean }) {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = section.current;
    if (!root || !motion) return;
    const stage = root.querySelector<HTMLElement>(".descent-stage")!, track = root.querySelector<HTMLElement>(".descent-track")!;
    const light = root.querySelector<HTMLElement>(".descent-light")!, snow = root.querySelector<HTMLElement>(".descent-snow")!;
    const marker = root.querySelector<HTMLElement>(".descent-gauge i")!;
    const [depthOut, pressureOut, lightOut, tempOut] = ["depth", "pressure", "light", "temp"].map(key => root.querySelector<HTMLElement>(`[data-read=${key}]`)!);
    const zoneItems = [...root.querySelectorAll<HTMLElement>(".descent-zone")];
    let current = -1;

    const apply = (progress: number) => {
      const p = Math.min(0.9999, Math.max(0, progress)), zone = Math.floor(p * 5), t = p * 5 - zone;
      const depth = bounds[zone] + (bounds[zone + 1] - bounds[zone]) * t;
      const height = stage.offsetHeight, travel = height * 5;
      track.style.transform = `translate3d(0,${height * 0.55 - p * travel}px,0)`;
      snow.style.transform = `translate3d(0,${-((p * travel * 0.35) % 400)}px,0)`;
      stage.style.backgroundColor = mix(waters[zone], waters[zone + 1], t);
      light.style.opacity = String(Math.max(0, 1 - p * 5));
      marker.style.transform = `translateY(${p * 100}%)`;
      depthOut.textContent = Math.round(depth).toLocaleString("vi-VN");
      pressureOut.textContent = Math.round(1 + depth / 10).toLocaleString("vi-VN");
      const sun = 100 * Math.exp(-depth / 43);
      lightOut.textContent = sun >= 1 ? `${Math.round(sun)}%` : sun >= 0.01 ? `${sun.toFixed(2)}%` : "0%";
      const temperature = depth < 200 ? 26 - depth * 0.025 : depth < 1000 ? 21 - (depth - 200) * 0.021 : 4.2 - (depth - 1000) * 0.00022;
      tempOut.textContent = `${temperature.toFixed(1)}°C`;
      if (zone !== current) { current = zone; zoneItems.forEach((item, i) => item.classList.toggle("is-active", i === zone)); }
    };
    const trigger = ScrollTrigger.create({ trigger: root, start: "top top", end: "bottom bottom", onUpdate: self => apply(self.progress), onRefresh: self => apply(self.progress) });
    apply(trigger.progress);
    return () => trigger.kill();
  }, [motion]);

  return (
    <section className="descent" ref={section} aria-labelledby="descent-title" data-quiet-cursor>
      <div className="descent-stage">
        <span className="descent-light" aria-hidden="true" />
        <span className="descent-snow" aria-hidden="true" />
        <div className="descent-window" aria-hidden="true"><div className="descent-track">
          {sightings.map(item => (
            <figure key={item.label || item.depth} className={item.glow ? "descent-glow" : "descent-fish"} style={{ top: `${share(item.depth) * 100}%`, left: `${item.x}%`, width: item.width || undefined }}>
              {item.src ? <img src={item.src} alt="" loading="lazy" decoding="async" draggable="false" /> : <span />}
              {item.label && <figcaption>{item.label}</figcaption>}
            </figure>
          ))}
        </div></div>
        <div className="descent-hud">
          <div className="descent-head">
            <span className="folio-label">潜水 / HÀNH TRÌNH LẶN</span>
            <h2 id="descent-title">Lặn xuống <em>11.000 mét.</em></h2>
          </div>
          <dl className="descent-readout font-mono">
            <div className="descent-depth"><dt>ĐỘ SÂU</dt><dd><span data-read="depth">0</span><small> m</small></dd></div>
            <div><dt>ÁP SUẤT</dt><dd>≈ <span data-read="pressure">1</span> atm</dd></div>
            <div><dt>ÁNH NẮNG CÒN LẠI</dt><dd data-read="light">100%</dd></div>
            <div><dt>NHIỆT ĐỘ (VÙNG NHIỆT ĐỚI)</dt><dd data-read="temp">26.0°C</dd></div>
          </dl>
          <ol className="descent-zones">
            {zones.map((zone, i) => (
              <li key={zone.latin} className={`descent-zone${i === 0 ? " is-active" : ""}`}>
                <span className="folio-label">{String(i + 1).padStart(2, "0")} · {zone.range}</span>
                <h3>{zone.name} <i>{zone.latin}</i></h3>
                <p>{zone.text}</p>
              </li>
            ))}
          </ol>
          <div className="descent-gauge" aria-hidden="true"><i />{zones.map(zone => <span key={zone.latin}>{zone.range.split(" – ")[0]}</span>)}<span>11.000</span></div>
        </div>
      </div>
    </section>
  );
}
