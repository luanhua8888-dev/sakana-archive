"use client";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { ArrowUpRight, ArrowRight, Waves, Compass, Pause, Play, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { SiteHeader } from "@/components/site-header";
import { SakanaLogo } from "@/components/sakana-logo";
import { AddSpecimenDialog } from "@/components/add-specimen-dialog";
import { WaveButtonFrame } from "@/components/wave-button-frame";
import { SakanaButton } from "@/components/sakana-button";
import { OceanChapters } from "@/components/ocean-chapters";
import { loadSpecimens, type SavedSpecimen } from "@/lib/collection-storage";

interface FishSpecies {
  id?: string;
  name: string;
  latin: string;
  tag: string;
  description: string;
  habitat: string;
  trait: string;
  note: string;
  crop?: number[];
  image?: string;
}

const species: FishSpecies[] = [
  {
    name: "Cá trích",
    latin: "Clupeidae",
    crop: [100, 0, 445, 173],
    tag: "BẦY ĐÀN",
    description: "Những đàn cá bạc di chuyển như một cơ thể thống nhất. Mỗi lần đổi hướng, hàng nghìn chiếc vảy cùng bắt sáng, tạo nên những dải lấp lánh trong làn nước.",
    habitat: "Vùng biển ven bờ",
    trait: "Sống thành đàn",
    note: "Một chuyển động nhỏ, cả đàn cùng đổi hướng."
  },
  {
    name: "Cá đuối",
    latin: "Batoidea",
    crop: [565, 545, 490, 416],
    tag: "ĐÁY ĐẠI DƯƠNG",
    description: "Đôi vây ngực mở rộng như cánh, đưa cá đuối lướt qua nước bằng chuyển động nhịp nhàng. Cơ thể dẹt giúp nhiều loài ẩn mình giữa cát và quan sát thế giới sát đáy biển.",
    habitat: "Đáy cát và vùng biển mở",
    trait: "Bộ xương sụn",
    note: "Một đôi cánh, một cách bay khác."
  },
  {
    name: "Cá chuồn",
    latin: "Exocoetidae",
    crop: [70, 1180, 450, 200],
    tag: "MẶT BIỂN",
    description: "Cá chuồn tăng tốc dưới nước rồi lao lên khỏi mặt biển. Những chiếc vây ngực dài dang rộng giúp chúng lượn trong không khí trước khi trở về với đại dương.",
    habitat: "Biển nhiệt đới và cận nhiệt đới",
    trait: "Lượn trên mặt nước",
    note: "Nơi ranh giới giữa biển và trời mờ đi."
  },
  {
    name: "Cá Chó",
    latin: "Esox lucius (Northern Pike)",
    image: "/species/pike.png",
    tag: "SĂN MỒI VÙNG LẠNH",
    description: "Chiếc mõm vịt đặc trưng cùng hàm răng sắc nhọn và hoa văn da đốm lốm đốm. Kẻ săn mồi thượng thặng rình rập giữa thảm cỏ nước với tốc độ phóng mồi chớp nhoáng.",
    habitat: "Vùng nước ngọt & lợ phương Bắc",
    trait: "Phục kích tốc độ cao",
    note: "Tĩnh lặng tựa gỗ mục, vụt bay như mũi tên săn mồi."
  },
  {
    name: "Cá ngừ đại dương",
    latin: "Thunnus orientalis (Bluefin Tuna)",
    image: "/species/tuna.png",
    tag: "KÌNH NGƯ VIỄN KHƠI",
    description: "Thân hình thoi khí động học hoàn hảo với vây đuôi hình trăng khuyết và các vây phụ nhọn. Chúng bơi liên tục suốt đời không ngừng nghỉ, xé toạc những dòng hải lưu Thái Bình Dương.",
    habitat: "Vùng biển khơi Thái Bình Dương",
    trait: "Kình ngư đường dài",
    note: "Trái tim không bao giờ ngừng đập giữa dòng hải lưu lạnh."
  },
  {
    name: "Cá tráp đỏ",
    latin: "Pagrus major (Red Seabream)",
    image: "/species/seabream.png",
    tag: "BIỂU TƯỢNG MAY MẮN",
    description: "Chiếc lưng vòm cao kiêu hãnh với những tia vây lưng sắc nhọn và lớp vảy ánh bạc óng ánh. Biểu trưng cho sự tôn nghiêm, may mắn và thịnh vượng trong văn hóa biển Nhật Bản.",
    habitat: "Vùng rạn đá đáy biển ven bờ",
    trait: "Vảy giáp kiên cố",
    note: "Sắc vóc uy nghiêm mang phúc lành của biển cả."
  },
  {
    name: "Cá nóc",
    latin: "Tetraodontidae",
    image: "/species/pufferfish.png",
    tag: "VỆ BINH GAI GÓC",
    description: "Cá nóc có thể phồng cơ thể khi gặp nguy hiểm, khiến kẻ săn mồi khó nuốt chúng. Một số loài còn mang độc tố mạnh, vì vậy vẻ ngoài nhỏ bé của chúng là lời cảnh báo đầy hiệu quả giữa đại dương.",
    habitat: "Biển nhiệt đới và cận nhiệt đới",
    trait: "Phồng mình để tự vệ",
    note: "Giữa làn nước rộng, một cơ thể nhỏ cũng có cách tự bảo vệ riêng."
  },
];

function subscribeMotionPreference(callback: () => void) {
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  preference.addEventListener("change", callback);
  return () => preference.removeEventListener("change", callback);
}

function getMotionPreference() {
  return !matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function Specimen({ crop, image, className = "" }: { crop?: number[]; image?: string; className?: string }) {
  if (image) {
    return (
      <div
        aria-hidden="true"
        className={`specimen-art ${className}`}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
          filter: "none"
        }}
      >
        <img
          src={image}
          alt=""
          draggable="false"
          style={{
            maxHeight: "185px",
            maxWidth: "96%",
            objectFit: "contain",
            filter: "url(#ink-cutout)"
          }}
        />
      </div>
    );
  }
  const [x, y, w, h] = crop!;
  const clip = x === 45 ? "polygon(0% 33%,18% 17%,30% 0%,56% 7%,78% 20%,79% 36%,100% 28%,100% 72%,77% 66%,69% 83%,44% 81%,40% 100%,30% 98%,24% 71%,0% 65%)" : x === 100 ? "polygon(0% 20%,30% 17%,40% 0%,70% 0%,70% 20%,100% 20%,100% 80%,62% 82%,61% 100%,42% 100%,40% 84%,0% 75%)" : x === 565 ? "polygon(30% 0%,100% 0%,100% 100%,0% 100%,0% 42%,10% 25%)" : undefined;
  return <div aria-hidden="true" className={`specimen ${className}`} style={{ aspectRatio: `${w}/${h}`, maxWidth: `calc(var(--specimen-height, 10000px) * ${w/h})`, clipPath: clip }}><img src="/fish-archive.png" alt="" draggable="false" style={{ width: `${1080 / w * 100}%`, left: `${-x / w * 100}%`, top: `${-y / h * 100}%` }} /></div>;
}
export default function Home() {
  const [selected, setSelected] = useState<number | null>(null);
  const motionPreference = useSyncExternalStore(subscribeMotionPreference, getMotionPreference, () => true);
  const [motionOverride, setMotionOverride] = useState<boolean | null>(null);
  const motion = motionOverride ?? motionPreference;
  const [addOpen, setAddOpen] = useState(false);
  const [customSpecies, setCustomSpecies] = useState<FishSpecies[]>([]);
  const [collectionError, setCollectionError] = useState("");
  const imageUrls = useRef<string[]>([]);
  const scene = useRef<HTMLDivElement>(null);
  const speciesList = [...species, ...customSpecies];
  useEffect(() => {
    let active = true;
    void loadSpecimens().then(items => {
      if (!active) return;
      const loaded = items.map(item => {
        const image = URL.createObjectURL(item.imageBlob);
        imageUrls.current.push(image);
        return { ...item, image };
      });
      setCustomSpecies(current => {
        const existing = new Set(current.map(item => item.id));
        return [...loaded.filter(item => !existing.has(item.id)), ...current];
      });
    }).catch(() => { if (active) setCollectionError("Không mở được bộ sưu tập đã lưu trong trình duyệt."); });
    return () => {
      active = false;
      imageUrls.current.forEach(url => URL.revokeObjectURL(url));
      imageUrls.current = [];
    };
  }, []);
  function addSpecimen(item: SavedSpecimen) {
    const image = URL.createObjectURL(item.imageBlob);
    imageUrls.current.push(image);
    setCustomSpecies(current => [...current, { ...item, image }]);
  }
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(item => observer.observe(item));
    return () => observer.disconnect();
  }, [customSpecies.length]);
  return <main className={motion ? "" : "motion-paused"}>
    <svg width="0" height="0" aria-hidden="true" className="image-filters"><defs><filter id="ink-light" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 .85 0 0 0 0 .87 0 0 0 0 .79 1 1 1 0 -.89"/></filter><filter id="ink-dark" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 .15 0 0 0 0 .26 0 0 0 0 .29 1 1 1 0 -.89"/></filter><filter id="ink-cutout" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values=".265 .52 .10 0 .062 .22 .43 .08 0 .186 .187 .367 .068 0 .226 0 0 0 1 0"/></filter></defs></svg>
    <SiteHeader />
    <section className="hero" id="kham-pha" onPointerMove={event => {
      if (!motion || event.pointerType === "touch" || !scene.current) return;
      const r = event.currentTarget.getBoundingClientRect();
      scene.current.style.setProperty("--mx", `${(event.clientX-r.left)/r.width-.5}`);
      scene.current.style.setProperty("--my", `${(event.clientY-r.top)/r.height-.5}`);
    }} onPointerLeave={() => { scene.current?.style.setProperty("--mx", "0"); scene.current?.style.setProperty("--my", "0"); }}>
      <div className="hero-grain"/>
      <div className="hero-top"><span className="font-mono tracking-[0.22em] font-medium text-[#cbe0d5]">MỘT BỘ SƯU TẬP TỪ LÒNG BIỂN</span><span className="font-mono tracking-[0.2em] text-[#cbe0d5]/80">EST. 2026 &nbsp; / &nbsp; VOL. 01</span></div>
      <div className="hero-copy">
        {/* Eyebrow trang nhã phong cách thư tịch biển */}
        <div className="eyebrow font-mono text-[10px] sm:text-[11px] tracking-[0.25em] text-[#93b8ac] flex items-center gap-3.5 mb-5 select-none">
          <span className="w-8 h-[1px] bg-[#93b8ac]/60" />
          <span>THỦY TỘC CHÍ · CHƯƠNG I</span>
        </div>

        {/* Bố cục chữ lớn dạng Poster Khảo cứu: Cỡ chữ cực đại, phông Monospace giãn cách rộng, nền chìm chữ Hán mờ */}
        <div className="relative pl-5 sm:pl-8 border-l border-[#76a899]/35 my-6 sm:my-9 select-none">
          {/* Nền chìm chữ Hán mờ ảo tạo chiều sâu mỹ thuật đại dương */}
          <div
            aria-hidden="true"
            className="absolute -left-4 -top-10 sm:-top-16 text-[150px] sm:text-[230px] lg:text-[270px] font-japanese text-[#ffffff]/[0.035] leading-none pointer-events-none select-none -z-10 font-normal tracking-widest"
          >
            海洋
          </div>

          {/* Dòng định danh Poster Khảo cứu */}
          <div className="flex items-center gap-3 text-[10px] sm:text-[11px] font-mono tracking-[0.28em] text-[#86aba0] uppercase mb-4 sm:mb-5">
            <span className="w-8 h-[1px] bg-[#86aba0]/60" />
            <span>CHƯƠNG I // KHẢO CỨU ĐẠI DƯƠNG</span>
            <span className="text-[#aab3a6]/30 hidden sm:inline">|</span>
            <span className="text-[#86aba0]/60 hidden sm:inline">VOL. 2026</span>
          </div>

          {/* Tiêu đề chính cỡ cực đại, giãn cách thoáng, không có bất kỳ dấu chấm nào */}
          <h1 className="font-mono tracking-[0.03em] sm:tracking-[0.05em] leading-[1.05] my-0">
            <span className="block text-[46px] sm:text-[68px] lg:text-[84px] font-light text-[#f2efe6]">
              Một đại dương
            </span>
            <span className="block text-[46px] sm:text-[68px] lg:text-[84px] font-light text-[#9ec7ba] italic my-1 sm:my-2.5">
              Vạn điều
            </span>
            <span className="block text-[46px] sm:text-[68px] lg:text-[84px] font-normal text-[#dcf5ec]">
              kỳ diệu
            </span>
          </h1>
        </div>

        {/* Khối mô tả thanh lịch */}
        <p className="font-mono font-light text-[14.5px] sm:text-[16px] text-[#cde0d7]/90 leading-[1.85] tracking-[0.01em] max-w-[480px] mb-8">
          Lặn vào thế giới của những chiếc vây.<br/>
          Mỗi loài cá, một câu chuyện chưa kể.
        </p>
        <SakanaButton
          href="#bo-suu-tap"
          idPrefix="hero-explore"
          className="px-8 sm:px-10 py-3.5 sm:py-4 text-[13px] sm:text-[14px]"
        >
          <span>BẮT ĐẦU KHÁM PHÁ</span>
          <ArrowRight size={16} />
        </SakanaButton>
      </div>
      <div className="ocean-scene" ref={scene}>
        <div className="orbit orbit-one"/><div className="orbit orbit-two"/><span className="scene-coordinate font-mono tracking-[0.22em]">35° 00′ N &nbsp; 139° 30′ E</span>
        <div className="fish-layer fish-one"><Specimen crop={[100, 0, 445, 173]}/><span className="specimen-caption font-mono tracking-[0.16em]">Fig. 01 — Clupeidae</span></div>
        <div className="fish-layer fish-two"><Specimen crop={[45, 158, 490, 303]}/></div>
        <div className="fish-layer fish-three"><Specimen crop={[100, 0, 445, 173]}/></div>
        <div className="floating-note font-mono"><span className="font-mono">FIELD NOTES / 001</span><p className="font-mono">“Biển luôn có<br/>một điều gì đó<br/><em>để kể.”</em></p><Waves size={31} strokeWidth={1}/></div>
        <span className="ocean-kanji" aria-hidden="true">魚</span>
        <div className="compass font-mono"><Compass size={55} strokeWidth={0.7}/><span className="font-mono">THE OCEAN ARCHIVE</span></div>
      </div>
      <div className="hero-bottom font-mono"><a href="#bo-suu-tap" className="font-mono"><span className="scroll-indicator"/> CUỘN ĐỂ LẶN SÂU HƠN</a><span className="hero-bottom-center font-mono">Vẻ đẹp nằm dưới bề mặt.</span><button onClick={() => setMotionOverride(!motion)} aria-pressed={!motion} aria-label={motion ? "Tạm dừng chuyển động" : "Bật chuyển động"} className="font-mono">{motion ? <Pause size={13}/> : <Play size={13}/>}<span>{motion ? "TẠM DỪNG" : "CHUYỂN ĐỘNG"}</span></button></div>
    </section>
    <section className="collection paper" id="bo-suu-tap">
      <div className="section-heading reveal"><div><div className="eyebrow font-mono">01 / THỦY TỘC CHÍ</div><h2>Những cư dân <em>của biển.</em></h2></div><div className="collection-heading-actions"><p className="font-mono font-light text-[15px]">Từ tầng nước lấp lánh đến đáy biển tĩnh lặng,<br/>mỗi hình dáng là một cách sống.</p><SakanaButton onClick={() => setAddOpen(true)} idPrefix="collection-add">THÊM MẪU CÁ</SakanaButton></div></div>
      {collectionError && <p className="collection-error" role="alert">{collectionError}</p>}
      <div className="specimen-grid">{speciesList.map((fish, index) => <button className="specimen-card reveal" style={{ "--delay": `${index * 100}ms` } as CSSProperties} key={fish.id ?? fish.name} onClick={() => setSelected(index)} aria-label={`Khám phá ${fish.name}`}><div className="card-top font-mono"><span>PLATE {String(index + 1).padStart(2, "0")}</span><span>{fish.tag}</span></div><div className="card-art"><Specimen crop={fish.crop} image={fish.image}/><span className="card-orbit"/></div><div className="card-bottom"><div><h3 className="font-mono">{fish.name}</h3><p className="font-mono italic text-[13.5px]">{fish.latin}</p></div><span className="circle-arrow"><ArrowUpRight size={21}/></span></div></button>)}</div>
      <div className="collection-foot font-mono"><span>{speciesList.length} HÌNH DÁNG. {speciesList.length} CÁCH SỐNG.</span><Waves size={25} strokeWidth={1}/><span>MỘT ĐẠI DƯƠNG CHUNG.</span></div>
    </section>
    <section className="story" id="cau-chuyen"><div className="story-image reveal"><img src="/ocean-collage.png" alt="Collage cá bạc, tranh sóng biển Nhật Bản và những trang giấy cổ" loading="lazy"/><span className="image-label font-mono">FRAGMENTS OF THE SEA — 001</span><div className="story-stamp font-mono">海<span className="font-mono">BIỂN CẢ</span></div></div><div className="story-copy reveal"><div className="eyebrow font-mono">02 / CHUYỆN TỪ LÒNG BIỂN</div><h2>Không chỉ là cá.<br/>Là cả một<br/><em>thế giới.</em></h2><p className="font-mono font-light text-[15px] leading-[1.85]">Có những vẻ đẹp chỉ hiện ra khi ta chậm lại. Một đường vân trên vảy, nhịp đập của vây, hay cách cả đàn cá cùng đổi hướng.</p><p className="font-mono font-light text-[15px] leading-[1.85]">Sakana là một cuốn thủy tộc chí nhỏ — nơi chúng ta quan sát, tìm hiểu và yêu thêm thế giới ở phía bên kia mặt nước.</p><div className="pt-2"><SakanaButton href="#bo-suu-tap" idPrefix="story-collection"><span>Mở cuốn thủy tộc chí</span> <ArrowRight size={16}/></SakanaButton></div></div></section>
    <OceanChapters onAddSpecimen={() => setAddOpen(true)} />
    <footer><a className="brand" href="#kham-pha" aria-label="Sakana — Về đầu trang"><SakanaLogo size={48} theme="ink" /><div className="flex flex-col"><div className="flex items-center gap-2"><span className="font-japanese text-[22px] text-[#193b47] leading-none">さかな</span><span className="px-1.5 py-0.5 bg-[#ba3b32] text-[#fbf8f1] text-[9px] font-serif rounded-[2px] leading-tight">魚</span></div><span className="font-mono tracking-[0.24em] text-[11px] font-semibold text-[#193b47] uppercase mt-0.5">SAKANA</span></div></a><p className="font-mono italic text-[14.5px]">Một chút tò mò. Cả một đại dương.</p><div className="flex justify-end"><SakanaButton href="#kham-pha" idPrefix="footer-kham-pha" className="px-5 py-2 text-[11.5px]"><span>Trở về mặt nước</span> <ArrowUpRight size={15}/></SakanaButton></div><span className="footer-bottom font-mono">© 2026 SAKANA &nbsp; · &nbsp; AN OCEAN OF CURIOSITY</span></footer>
    <Dialog open={selected !== null} onOpenChange={open => { if (!open) setSelected(null); }}><DialogContent className="fish-dialog paper font-mono" showCloseButton={false}>{selected !== null && speciesList[selected] && <><DialogClose className="dialog-close" aria-label="Đóng thông tin"><X size={22}/></DialogClose><span className="eyebrow font-mono">THỦY TỘC CHÍ / PLATE {String(selected + 1).padStart(2, "0")}</span><div className="dialog-art"><Specimen crop={speciesList[selected].crop} image={speciesList[selected].image}/></div><DialogTitle className="dialog-title font-mono">{speciesList[selected].name}</DialogTitle><span className="latin font-mono">{speciesList[selected].latin}</span><DialogDescription className="dialog-description font-mono">{speciesList[selected].description}</DialogDescription><dl className="fish-facts font-mono"><div><dt className="font-mono">MÔI TRƯỜNG</dt><dd className="font-mono">{speciesList[selected].habitat}</dd></div><div><dt className="font-mono">ĐẶC ĐIỂM</dt><dd className="font-mono">{speciesList[selected].trait}</dd></div></dl><p className="fish-note font-mono">{speciesList[selected].note}</p><p className="illustration-note font-mono">{speciesList[selected].id ? "Ảnh và thông tin do bạn thêm, lưu trên trình duyệt này." : "Tranh khắc minh họa theo nhóm cá, không dùng để định danh loài."}</p></>}</DialogContent></Dialog>
    <AddSpecimenDialog open={addOpen} onOpenChange={setAddOpen} onAdded={addSpecimen}/>
  </main>;
}

