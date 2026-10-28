"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { CursorSchool } from "@/components/cursor-school";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, ScrambleTextPlugin, MotionPathPlugin, DrawSVGPlugin);
ScrollTrigger.config({ ignoreMobileResize: true });

const headings = ".section-heading h2, .story-copy h2, .folio h2, .chapter-heading h2";
const plates = ".journal-plate img, .care-plate img";
const labels = ".folio-topline span, .section-heading .eyebrow, .story-copy .eyebrow, .chapter-kicker, .folio-label, .collection-foot span, .image-label";
const scrambleChars = "海魚波水さかな潮01";
const settled = "transform,opacity,visibility,transition,filter";
const deepest = 10994;

function showAllReveals() {
  document.querySelectorAll(".reveal").forEach(item => item.classList.add("visible"));
}

function headerHeight() {
  return document.querySelector("header")?.offsetHeight ?? 0;
}

// Preloader, hero intro, smooth scrolling and every scroll-linked scene. With motion
// off, every GSAP change is reverted and the page falls back to its static CSS.
export function ScrollMotion({ motion, itemCount, locked }: { motion: boolean; itemCount: number; locked: boolean }) {
  const introPlayed = useRef(false);
  const loading = useRef(false);
  const lenis = useRef<Lenis | null>(null);
  const lockedRef = useRef(locked);

  const release = () => {
    loading.current = false;
    document.documentElement.classList.remove("is-loading");
    if (!lockedRef.current) lenis.current?.start();
  };

  useGSAP(() => {
    const preloader = document.querySelector<HTMLElement>(".preloader");
    if (!motion || introPlayed.current) { preloader?.classList.add("is-done"); return; }
    introPlayed.current = true;
    let seen = false;
    try { seen = sessionStorage.getItem("sakana-intro") === "1"; sessionStorage.setItem("sakana-intro", "1"); } catch {}
    if (seen) preloader?.classList.add("is-done");
    loading.current = !seen;
    if (!seen) { document.documentElement.classList.add("is-loading"); lenis.current?.stop(); }

    const count = document.querySelector(".preloader-count");
    const counter = { value: 0 };
    const title = SplitText.create(".hero h1 > span", { type: "words,chars" });
    const hero = gsap.timeline({ defaults: { ease: "expo.out", duration: 1.2 } })
      .from(".hero-top > span", { y: -18, autoAlpha: 0, stagger: 0.12 }, 0)
      .from(".hero-watermark", { autoAlpha: 0, scale: 1.25, duration: 2.6 }, 0)
      .from(".hero-copy .eyebrow, .hero-label", { x: -36, autoAlpha: 0, stagger: 0.12 }, 0.2)
      .from(title.chars, { yPercent: 90, rotateX: -90, transformPerspective: 600, transformOrigin: "50% 100%", autoAlpha: 0, stagger: 0.022, duration: 1.3 }, 0.35)
      .from(".hero-lede, .hero-cta", { y: 26, autoAlpha: 0, stagger: 0.14, clearProps: settled }, "-=0.9")
      .from(".ocean-scene .orbit", { autoAlpha: 0, scale: 0.6, duration: 2.4, stagger: 0.25 }, 0.1)
      .from(".fish-layer", { autoAlpha: 0, stagger: 0.2, duration: 2 }, 0.45)
      .from(".floating-note", { autoAlpha: 0 }, 1)
      .from(".ocean-kanji, .compass, .scene-coordinate", { y: 30, autoAlpha: 0, stagger: 0.12 }, 1.1)
      .from(".hero-bottom > *", { y: 18, autoAlpha: 0, stagger: 0.1 }, 1.3);

    if (seen) return;
    gsap.timeline({ onComplete: () => { preloader?.classList.add("is-done"); release(); } })
      .from(".preloader-kanji", { yPercent: 35, autoAlpha: 0, duration: 1, ease: "expo.out" }, 0)
      .from(".preloader-meta", { autoAlpha: 0, y: 12, duration: 0.8, ease: "power2.out" }, 0.2)
      .fromTo(".preloader-line", { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "power2.inOut" }, 0)
      .to(counter, {
        value: 100, duration: 1.1, ease: "power2.inOut",
        onUpdate: () => { if (count) count.textContent = String(Math.round(counter.value)).padStart(3, "0"); },
      }, 0)
      .to(".preloader-inner", { yPercent: -40, autoAlpha: 0, duration: 0.5, ease: "power2.in" }, 1.15)
      .fromTo(".preloader", { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.9, ease: "expo.inOut" }, 1.3)
      .add(hero, 1.5);

    return () => { preloader?.classList.add("is-done"); release(); };
  }, { dependencies: [motion], revertOnUpdate: true });

  useEffect(() => {
    if (!motion) return;
    const instance = new Lenis({ autoRaf: false, lerp: 0.1, anchors: { offset: -headerHeight() } });
    lenis.current = instance;
    if (loading.current || lockedRef.current) instance.stop();
    instance.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      instance.destroy();
      lenis.current = null;
    };
  }, [motion]);

  useEffect(() => {
    lockedRef.current = locked;
    if (locked) lenis.current?.stop();
    else if (!loading.current) lenis.current?.start();
  }, [locked]);

  useGSAP((_, contextSafe) => {
    if (!motion) { showAllReveals(); return; }
    const cleanups: (() => void)[] = [];
    const mm = gsap.matchMedia();

    // Pinned horizontal rail first, so later triggers measure the pin spacing.
    mm.add("(min-width: 1051px)", () => {
      const section = document.querySelector<HTMLElement>(".chapter-shapes");
      const list = section?.querySelector<HTMLElement>(".chapter-shape-list");
      if (!section || !list) return;
      section.classList.add("is-rail");
      const travel = () => {
        const style = getComputedStyle(section);
        return list.scrollWidth - (section.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight));
      };
      const rail = gsap.to(list, {
        x: () => -travel(), ease: "none",
        scrollTrigger: {
          trigger: section, start: () => `top ${headerHeight()}`, end: () => `+=${travel()}`,
          pin: true, scrub: 0.4, invalidateOnRefresh: true, anticipatePin: 1,
        },
      });
      gsap.utils.toArray<HTMLElement>(".chapter-shape-row").forEach(row => {
        gsap.fromTo(row.querySelector(".chapter-shape-art"), { xPercent: -14, rotation: -5 }, {
          xPercent: 14, rotation: 5, ease: "none",
          scrollTrigger: { containerAnimation: rail, trigger: row, start: "left right", end: "right left", scrub: true },
        });
        gsap.from(row.querySelector(".chapter-shape-copy"), {
          y: 40, autoAlpha: 0, ease: "power2.out",
          scrollTrigger: { containerAnimation: rail, trigger: row, start: "left 85%", end: "left 45%", scrub: true },
        });
      });
      return () => section.classList.remove("is-rail");
    });
    mm.add("(max-width: 1050px)", () => {
      gsap.utils.toArray<HTMLElement>(".chapter-shape-art").forEach((art, index) => {
        const from = index % 2 ? 22 : -22;
        gsap.fromTo(art, { xPercent: from, rotation: from / 6 }, {
          xPercent: -from, rotation: -from / 6, ease: "none",
          scrollTrigger: { trigger: art.parentElement, start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    });

    gsap.to(".scroll-progress", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } });
    const gauge = document.querySelector(".depth-gauge-value");
    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate: self => { if (gauge) gauge.textContent = String(Math.round(self.progress * deepest)).padStart(5, "0"); },
    });
    gsap.to(".depth-gauge-fill", { scaleY: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } });

    gsap.timeline({ scrollTrigger: { trigger: ".hero", start: 0, end: "bottom top", scrub: true } })
      .to(".hero-copy", { y: -150, autoAlpha: 0.1, ease: "none" }, 0)
      .to(".ocean-scene", { y: 170, ease: "none" }, 0)
      .to(".hero-bottom", { y: 30, autoAlpha: 0, ease: "none", duration: 0.4 }, 0);

    const field = document.querySelector<HTMLElement>(".bubble-field");
    if (field) {
      const loops: gsap.core.Tween[] = [];
      const bubbles = Array.from({ length: 12 }, () => {
        const bubble = document.createElement("span");
        const size = gsap.utils.random(4, 18);
        bubble.className = "bubble";
        Object.assign(bubble.style, { width: `${size}px`, height: `${size}px`, left: `${gsap.utils.random(35, 98)}%` });
        field.appendChild(bubble);
        loops.push(gsap.fromTo(bubble, { y: 0, opacity: gsap.utils.random(0.25, 0.8) }, {
          y: () => -field.clientHeight - 40, opacity: 0, duration: gsap.utils.random(7, 16), ease: "none",
          repeat: -1, delay: gsap.utils.random(0, 10),
        }));
        loops.push(gsap.to(bubble, { x: gsap.utils.random(-28, 28), duration: gsap.utils.random(1.6, 3.2), ease: "sine.inOut", yoyo: true, repeat: -1 }));
        return bubble;
      });
      ScrollTrigger.create({ trigger: ".hero", start: 0, end: "bottom top", onToggle: self => loops.forEach(loop => loop.paused(!self.isActive)) });
      cleanups.push(() => bubbles.forEach(bubble => bubble.remove()));
    }

    // Reveal: hand the element its final CSS state, then let GSAP play it in.
    const reveal = contextSafe!((items: Element[], vars: gsap.TweenVars) => {
      gsap.set(items, { transition: "none" });
      items.forEach(item => item.classList.add("visible"));
      gsap.from(items, { autoAlpha: 0, duration: 1.2, ease: "expo.out", stagger: 0.1, clearProps: settled, ...vars });
    });
    ScrollTrigger.batch(".specimen-card.reveal:not(.visible)", {
      start: "top 90%", once: true,
      onEnter: items => reveal(items, { y: 90, rotateX: -32, transformPerspective: 900, transformOrigin: "50% 0%" }),
    });
    ScrollTrigger.batch(".reveal:not(.specimen-card):not(.visible)", {
      start: "top 88%", once: true,
      onEnter: items => reveal(items, { y: 60 }),
    });

    gsap.utils.toArray<HTMLElement>(headings).forEach(heading => SplitText.create(heading, {
      type: "lines", autoSplit: true,
      onSplit: self => gsap.from(self.lines, {
        yPercent: 70, autoAlpha: 0, stagger: 0.14, duration: 1.3, ease: "expo.out",
        scrollTrigger: { trigger: heading, start: "top 86%", once: true },
      }),
    }));

    gsap.utils.toArray<HTMLElement>(plates).forEach(img => gsap.fromTo(img,
      { clipPath: "inset(14% 10% 14% 10%)" },
      { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: img, start: "top 95%", end: "center 55%", scrub: true } }));
    gsap.fromTo(".depth-plate img", { clipPath: "inset(0% 0% 100% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: ".depth-plate", start: "top 80%", end: "bottom 90%", scrub: true } });
    gsap.timeline({ scrollTrigger: { trigger: ".current-plate", start: "top 92%", end: "top 35%", scrub: true } })
      .fromTo(".current-plate img", { clipPath: "inset(0% 50% 0% 50%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "power2.out" });

    gsap.to(".depth-progress", { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".depth-index", start: "top 70%", end: "bottom 55%", scrub: true } });
    gsap.utils.toArray<HTMLElement>(".depth-index article").forEach(article =>
      ScrollTrigger.create({ trigger: article, start: "top 62%", toggleClass: "is-active" }));

    gsap.to(".story-stamp", { rotation: 60, ease: "none", scrollTrigger: { trigger: ".story", start: "top bottom", end: "bottom top", scrub: true } });

    // Labels decode themselves like an archive index card being read.
    gsap.utils.toArray<HTMLElement>(labels).filter(label => !label.children.length && label.textContent?.trim()).forEach(label =>
      gsap.to(label, {
        scrambleText: { text: label.textContent!, chars: scrambleChars, speed: 0.5, revealDelay: 0.25, tweenLength: false },
        duration: 1.6, ease: "none", scrollTrigger: { trigger: label, start: "top 92%", once: true },
      }));

    // A drop of ink: the dark current chapter spreads open from one point.
    const current = document.querySelector<HTMLElement>(".folio-current");
    const cover = () => current ? 2 * Math.hypot(current.offsetWidth / 2, current.offsetHeight * 0.82) / 200 + 0.5 : 1;
    gsap.fromTo(".ink-drop", { scale: 0.3 }, {
      scale: cover, ease: "power2.in", immediateRender: false,
      scrollTrigger: { trigger: ".folio-current", start: "top bottom", end: "top 30%", scrub: true, invalidateOnRefresh: true },
    });

    mm.add("(min-width: 701px)", () => {
      gsap.timeline({ scrollTrigger: { trigger: ".story", start: "top 75%", end: "bottom 30%", scrub: true } })
        .fromTo(".swim-trail", { drawSVG: "0%" }, { drawSVG: "100%", ease: "none" }, 0)
        .to(".story-swimmer", {
          ease: "none", motionPath: { path: ".swim-trail", align: ".swim-trail", alignOrigin: [0.5, 0.5], autoRotate: 180 },
        }, 0)
        .fromTo(".story-swimmer", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.08, ease: "none" }, 0)
        .to(".story-swimmer", { autoAlpha: 0, duration: 0.08, ease: "none" }, 0.92);
      gsap.to(".story-swimmer img", { rotation: 4, y: 4, duration: 0.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
    });

    const hero = document.querySelector<HTMLElement>(".hero");
    const splash = (event: PointerEvent) => {
      if (!hero || (event.target as Element).closest("a, button")) return;
      const rect = hero.getBoundingClientRect();
      [0, 0.18, 0.36].forEach(delay => {
        const ring = document.createElement("span");
        ring.className = "ripple";
        Object.assign(ring.style, { left: `${event.clientX - rect.left}px`, top: `${event.clientY - rect.top}px` });
        hero.appendChild(ring);
        gsap.fromTo(ring, { scale: 0, opacity: 0.7 }, { scale: 1, opacity: 0, duration: 1.8, delay, ease: "expo.out", onComplete: () => ring.remove() });
      });
    };
    hero?.addEventListener("pointerdown", splash);
    cleanups.push(() => hero?.removeEventListener("pointerdown", splash));

    gsap.utils.toArray<HTMLElement>(".ocean-marquee-row").forEach((row, index) => {
      const track = row.querySelector(".ocean-marquee-track");
      const skew = gsap.quickTo(track, "skewX", { duration: 0.5, ease: "power3" });
      gsap.fromTo(track, { xPercent: index ? -50 : 0 }, {
        xPercent: index ? 0 : -50, ease: "none",
        scrollTrigger: {
          trigger: ".ocean-marquee", start: "top bottom", end: "bottom top", scrub: 0.5,
          onUpdate: self => skew(gsap.utils.clamp(-12, 12, self.getVelocity() / -250)),
        },
      });
    });

    mm.add("(pointer: fine)", () => {
      const magnets = gsap.utils.toArray<HTMLElement>("[data-magnetic]").map(item => {
        gsap.set(item, { transition: "background-color .3s, box-shadow .3s, color .3s" });
        const itemX = gsap.quickTo(item, "x", { duration: 0.4, ease: "power3" });
        const itemY = gsap.quickTo(item, "y", { duration: 0.4, ease: "power3" });
        const pull = (event: PointerEvent) => {
          const rect = item.getBoundingClientRect();
          itemX((event.clientX - rect.left - rect.width / 2) * 0.35);
          itemY((event.clientY - rect.top - rect.height / 2) * 0.35);
        };
        const drop = () => gsap.to(item, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" });
        item.addEventListener("pointermove", pull);
        item.addEventListener("pointerleave", drop);
        return () => { item.removeEventListener("pointermove", pull); item.removeEventListener("pointerleave", drop); };
      });
      // Cards tilt toward the pointer and catch a glint of light where it rests.
      const grid = document.querySelector<HTMLElement>(".specimen-grid");
      const tilt = (event: PointerEvent) => {
        const card = (event.target as Element).closest<HTMLElement>(".specimen-card");
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width, py = (event.clientY - rect.top) / rect.height;
        card.style.setProperty("--rx", `${(0.5 - py) * 16}deg`);
        card.style.setProperty("--ry", `${(px - 0.5) * 16}deg`);
        card.style.setProperty("--gx", `${px * 100}%`);
        card.style.setProperty("--gy", `${py * 100}%`);
      };
      grid?.addEventListener("pointermove", tilt);

      return () => {
        grid?.removeEventListener("pointermove", tilt);
        magnets.forEach(remove => remove());
      };
    });

    return () => cleanups.forEach(cleanup => cleanup());
  }, { dependencies: [motion, itemCount], revertOnUpdate: true });

  return <>
    <div className="preloader" aria-hidden="true">
      <div className="preloader-inner">
        <span className="preloader-kanji">魚</span>
        <div className="preloader-meta"><span>SAKANA / THỦY TỘC CHÍ</span><span className="preloader-count">000</span></div>
        <span className="preloader-line" />
      </div>
    </div>
    <div className="scroll-progress" aria-hidden="true" />
    <div className="depth-gauge" aria-hidden="true">
      <span className="depth-gauge-track"><span className="depth-gauge-fill" /></span>
      <span>ĐỘ SÂU</span><strong className="depth-gauge-value">00000</strong><span>M</span>
    </div>
    <CursorSchool motion={motion} />
  </>;
}

// The specimen plate drifts in when a dialog opens, then keeps gently swimming.
export function useDialogEntrance(selected: number | null, motion: boolean) {
  useGSAP(() => {
    if (selected === null || !motion) return;
    const art = ".fish-dialog .dialog-art > *";
    const title = document.querySelector(".fish-dialog .dialog-title");
    gsap.timeline({ defaults: { ease: "expo.out" } })
      .from(art, { x: -120, rotation: -14, scale: 0.6, autoAlpha: 0, filter: "blur(12px)", duration: 1.3, clearProps: "filter" }, 0.05)
      .to(title, { scrambleText: { text: title?.textContent ?? "", chars: scrambleChars, speed: 0.6 }, duration: 0.9, ease: "none" }, 0.15)
      .from(".fish-dialog .eyebrow, .fish-dialog .latin, .fish-dialog .dialog-description, .fish-facts > div, .fish-dialog .fish-note, .fish-dialog .illustration-note", { y: 18, autoAlpha: 0, stagger: 0.07, duration: 0.9 }, 0.2)
      .to(art, { y: -8, rotation: 1.5, duration: 2.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
  }, { dependencies: [selected, motion], revertOnUpdate: true });
}

const marqueeWords =["さかな", "THỦY TỘC CHÍ", "海", "MỘT ĐẠI DƯƠNG CHUNG", "魚", "VẠN ĐIỀU KỲ DIỆU"];

export function OceanMarquee() {
  return (
    <div className="ocean-marquee" aria-hidden="true">
      {[0, 1].map(row => (
        <div className={`ocean-marquee-row ocean-marquee-row--${row ? "outline" : "fill"}`} key={row}>
          <div className="ocean-marquee-track">
            {[0, 1].map(copy => <span key={copy}>{marqueeWords.map(word => <span key={word}>{word}<i>✦</i></span>)}</span>)}
          </div>
        </div>
      ))}
    </div>
  );
}
