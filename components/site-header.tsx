"use client";

import { useEffect, useState } from "react";
import { BookOpen, Compass, Menu, X, ArrowUpRight, ArrowRight } from "lucide-react";
import { SakanaLogo } from "@/components/sakana-logo";
import { SakanaButton } from "@/components/sakana-button";

export interface ChapterNav {
  id: string;
  num: string;
  kanji: string;
  kanjiLabel: string;
  shortLabel: string;
  fullTitle: string;
  subtitle: string;
  desc: string;
}

export const CHAPTERS: ChapterNav[] = [
  {
    id: "bo-suu-tap",
    num: "01",
    kanji: "壱",
    kanjiLabel: "第一章",
    shortLabel: "Thủy tộc chí",
    fullTitle: "01 / THỦY TỘC CHÍ",
    subtitle: "Những cư dân của biển",
    desc: "Bộ sưu tập mẫu cá & tiêu bản từ tầng nước lấp lánh đến đáy biển tĩnh lặng.",
  },
  {
    id: "cau-chuyen",
    num: "02",
    kanji: "弐",
    kanjiLabel: "第二章",
    shortLabel: "Chuyện biển",
    fullTitle: "02 / CHUYỆN TỪ LÒNG BIỂN",
    subtitle: "Không chỉ là cá",
    desc: "Những quan sát chậm rãi về đường vân, nhịp vây và thế giới bên kia mặt nước.",
  },
  {
    id: "tang-nuoc",
    num: "03",
    kanji: "参",
    kanjiLabel: "第三章",
    shortLabel: "Tầng nước",
    fullTitle: "03 / NHỮNG TẦNG NƯỚC",
    subtitle: "Một lát cắt đại dương",
    desc: "Hành trình theo chiều sâu: từ mặt sóng, vùng nước giữa đến nền cát sát đáy.",
  },
  {
    id: "dong-chay",
    num: "04",
    kanji: "四",
    kanjiLabel: "第四章",
    shortLabel: "Dòng chảy",
    fullTitle: "04 / DÒNG CHẢY",
    subtitle: "Chuyển động không ngừng",
    desc: "Nhịp điệu bầy đàn giữa biển rộng: một lần nghiêng mình, cả đàn cùng đổi hướng.",
  },
  {
    id: "hinh-dang",
    num: "05",
    kanji: "五",
    kanjiLabel: "第五章",
    shortLabel: "Hình dáng",
    fullTitle: "05 / HÌNH DÁNG",
    subtitle: "Mỗi đường nét là một cách sống",
    desc: "Khảo cứu dáng bơi: lướt như cánh chim, vút qua dòng nước hay ẩn mình phục kích.",
  },
  {
    id: "quan-sat",
    num: "06",
    kanji: "六",
    kanjiLabel: "第六章",
    shortLabel: "Quan sát",
    fullTitle: "06 / NHẬT KÝ QUAN SÁT",
    subtitle: "Những điều nhỏ bé",
    desc: "Nhìn gần hơn để thấy nhiều hơn — trang ghi chép đầu tiên của riêng bạn.",
  },
  {
    id: "giu-bien",
    num: "07",
    kanji: "七",
    kanjiLabel: "第七章",
    shortLabel: "Giữ biển",
    fullTitle: "07 / GIỮ BIỂN TRONG LÀNH",
    subtitle: "Ngôi nhà chung",
    desc: "Yêu một sinh vật là trân trọng vùng nước nuôi dưỡng nó: tự do, nguyên vẹn và sạch trong.",
  },
  {
    id: "hanh-trinh",
    num: "08",
    kanji: "八",
    kanjiLabel: "第八章",
    shortLabel: "Hành trình",
    fullTitle: "08 / MỘT TRANG MỚI",
    subtitle: "Hết một chương, mở một hải trình",
    desc: "Mang theo sự tò mò để cùng viết tiếp cuốn thủy tộc chí của riêng bạn.",
  },
];

export function SiteHeader() {
  const [activeSection, setActiveSection] = useState<string>("bo-suu-tap");
  const [catalogOpen, setCatalogOpen] = useState(false);

  // Active section tracking on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sectionIds = CHAPTERS.map((c) => c.id);
      let current = sectionIds[0];

      // Check if user is at top hero section
      if (window.scrollY < 300) {
        setActiveSection("");
        return;
      }

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 220) {
            current = id;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when catalog modal is open
  useEffect(() => {
    if (catalogOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [catalogOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCatalogOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const scrollTo = (id: string) => {
    setCatalogOpen(false);
    if (id === "kham-pha") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const target = document.getElementById(id);
    if (target) {
      const yOffset = -92;
      const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#f0ecdf]/98 backdrop-blur-md border-b border-[#c8d1c5] shadow-[0_4px_20px_-10px_rgba(25,59,71,0.1)] transition-all duration-300">
        <div className="max-w-[1720px] mx-auto h-[82px] sm:h-[86px] flex items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo SAKANA */}
          <a
            href="#kham-pha"
            onClick={(e) => {
              e.preventDefault();
              scrollTo("kham-pha");
            }}
            className="group flex items-center gap-3 shrink-0 focus:outline-none select-none"
            aria-label="SAKANA — Thủy tộc chí"
          >
            <div className="transition-transform duration-500 group-hover:-translate-x-1">
              <SakanaLogo size={46} theme="ink" />
            </div>

            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 leading-none">
                <span className="font-japanese text-[24px] sm:text-[26px] text-[#193b47] tracking-[0.12em] font-normal leading-none">
                  さかな
                </span>
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 bg-[#ba3b32] text-[#fbf8f1] text-[9px] font-serif rounded-[2px] tracking-wider shadow-sm select-none">
                  魚
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 leading-none">
                <span className="font-mono tracking-[0.22em] text-[10.5px] font-semibold text-[#193b47] uppercase">
                  SAKANA
                </span>
                <span className="text-[8px] font-mono tracking-[0.18em] uppercase font-normal text-[#5c726a] hidden sm:inline">
                  · THỦY TỘC CHÍ
                </span>
              </div>
            </div>
          </a>

          {/* Desktop Navigation Links — 8 CHƯƠNG ĐẦY ĐỦ (Hiển thị mượt mà trên desktop) */}
          <nav
            aria-label="8 chương Thủy tộc chí"
            className="hidden xl:flex items-center gap-1 2xl:gap-2.5 h-full px-2"
          >
            {CHAPTERS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(item.id);
                  }}
                  className={`group relative h-full flex items-center px-2 py-1 font-mono transition-all duration-200 select-none ${
                    isActive
                      ? "text-[#193b47] font-semibold"
                      : "text-[#4b655d] hover:text-[#193b47]"
                  }`}
                  title={`${item.fullTitle}: ${item.subtitle}`}
                >
                  <span className="flex items-center gap-1 text-[11px] 2xl:text-[12px] tracking-[0.04em] whitespace-nowrap">
                    <span
                      className={`text-[9px] transition-colors font-mono ${
                        isActive
                          ? "text-[#ba3b32] font-bold"
                          : "text-[#779489] group-hover:text-[#ba3b32]"
                      }`}
                    >
                      {item.num}.
                    </span>
                    <span>{item.shortLabel}</span>
                  </span>

                  {/* Vệt mực gạch chân chỉ báo chương đang xem */}
                  <span
                    className={`absolute bottom-0 left-1.5 right-1.5 h-[2px] transition-all duration-300 ${
                      isActive
                        ? "bg-[#193b47] opacity-100 scale-x-100"
                        : "bg-[#193b47]/25 opacity-0 scale-x-0 group-hover:opacity-60 group-hover:scale-x-100"
                    }`}
                  />
                  {isActive && (
                    <span className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#ba3b32] ring-2 ring-[#f0ecdf]" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Action buttons (Right side) */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Nút mở Mục Lục 8 Chương toàn diện */}
            <SakanaButton
              onClick={() => setCatalogOpen(true)}
              idPrefix="header-catalog"
              className="px-4 sm:px-5 py-2 text-[11px] sm:text-[11.5px]"
            >
              <span className="flex items-center gap-1.5">
                <BookOpen size={13} className="text-[#ba3b32]" />
                <span className="hidden sm:inline">MỤC LỤC</span>
                <span className="font-mono text-[9.5px] px-1 py-0.2 bg-[#193b47]/10 rounded text-[#193b47]">
                  8 PHẦN
                </span>
              </span>
            </SakanaButton>

            {/* Nút bấm Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setCatalogOpen(!catalogOpen)}
              className="xl:hidden p-2 text-[#193b47] hover:text-[#ba3b32] focus:outline-none transition-colors border border-[#193b47]/20 rounded bg-[#ebe6d8] hover:bg-[#faf7ee]"
              aria-label={catalogOpen ? "Đóng mục lục" : "Mở mục lục 8 chương"}
              aria-expanded={catalogOpen}
            >
              {catalogOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
      </header>

      {/* MODAL MỤC LỤC 8 PHẦN TOÀN DIỆN (BÁT ĐẠI CHƯƠNG) */}
      {catalogOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#0c1f25]/60 backdrop-blur-md flex flex-col justify-start overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setCatalogOpen(false)}
        >
          <div
            className="w-full max-w-[1280px] mx-auto my-0 sm:my-6 bg-[#f0ecdf] border-x sm:border border-[#193b47]/30 shadow-2xl relative p-5 sm:p-8 lg:p-10 text-[#193b47] paper font-mono flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header của Modal Mục Lục */}
            <div className="flex items-start justify-between pb-6 border-b border-[#193b47]/20">
              <div className="flex items-start gap-4">
                <div className="hidden sm:flex flex-col items-center justify-center w-12 h-14 bg-[#193b47] text-[#f0ecdf] border border-[#193b47]">
                  <span className="font-serif text-lg text-[#f0ecdf] font-bold">目</span>
                  <span className="font-serif text-xs text-[#ba3b32]">録</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono tracking-[0.25em] text-[#557168] uppercase">
                    <span>SAKANA · THỦY TỘC CHÍ</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ba3b32]" />
                    <span>TOÀN BỘ 8 PHẦN</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-mono font-normal tracking-[0.02em] text-[#193b47] mt-1">
                    Mục Lục Khảo Cứu Đại Dương
                  </h2>
                  <p className="text-[12px] sm:text-[13px] text-[#5b736b] mt-1 font-light max-w-[580px]">
                    Chọn một chương để lướt ngay đến phân đoạn tư liệu hoặc mẫu vật tương ứng.
                  </p>
                </div>
              </div>

              {/* Nút Đóng Modal */}
              <button
                type="button"
                onClick={() => setCatalogOpen(false)}
                className="group flex items-center gap-2 px-3 py-1.5 border border-[#193b47]/30 hover:border-[#ba3b32] text-[#193b47] hover:text-[#ba3b32] transition-colors text-[11px] tracking-wider uppercase bg-[#faf7ee]"
                aria-label="Đóng mục lục"
              >
                <span>Đóng</span>
                <X size={16} />
              </button>
            </div>

            {/* Lưới 8 Chương — Giao diện 8 thẻ trực quan, thanh nhã */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-6">
              {CHAPTERS.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    className={`group relative text-left p-4 sm:p-5 border transition-all duration-300 flex flex-col justify-between min-h-[170px] ${
                      isActive
                        ? "bg-[#faf7ee] border-[#193b47] shadow-[0_8px_20px_-6px_rgba(25,59,71,0.25)] ring-1 ring-[#193b47]"
                        : "bg-[#e9e5d6]/70 hover:bg-[#faf7ee] border-[#193b47]/20 hover:border-[#193b47]/60 hover:shadow-md"
                    }`}
                  >
                    {/* Viền góc cổ điển */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-[3px] border border-[#193b47]/15 pointer-events-none group-hover:border-[#193b47]/35 transition-colors"
                    />

                    <div>
                      {/* Dòng định danh số chương & Kanji */}
                      <div className="flex items-center justify-between text-[10px] tracking-widest text-[#5c736a] uppercase pb-2 mb-2 border-b border-[#193b47]/10">
                        <span className="flex items-center gap-1 font-semibold text-[#193b47]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ba3b32]" />
                          CHƯƠNG {item.num}
                        </span>
                        <span className="font-serif text-[12px] text-[#ba3b32] font-normal">
                          〔 {item.kanji} 〕
                        </span>
                      </div>

                      {/* Tiêu đề chương */}
                      <h3 className="font-mono text-[16px] sm:text-[17px] font-medium text-[#193b47] group-hover:text-[#0b222a] leading-tight mb-1">
                        {item.shortLabel}
                      </h3>
                      <p className="text-[11px] text-[#718a7f] italic font-serif leading-snug mb-2">
                        {item.subtitle}
                      </p>

                      {/* Tóm tắt ngắn gọn */}
                      <p className="text-[11.5px] text-[#4d665e] font-light leading-relaxed line-clamp-3">
                        {item.desc}
                      </p>
                    </div>

                    {/* Chân thẻ: Trạng thái & Mũi tên */}
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#193b47]/10 text-[10px] tracking-wider uppercase text-[#193b47]">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 text-[#ba3b32] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ba3b32] animate-pulse" />
                          Đang xem
                        </span>
                      ) : (
                        <span className="text-[#6c867c] group-hover:text-[#193b47] transition-colors">
                          Khám phá
                        </span>
                      )}
                      <span className="p-1 rounded bg-[#193b47]/5 group-hover:bg-[#193b47] group-hover:text-[#f0ecdf] transition-all">
                        <ArrowRight size={13} />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Chân Modal Mục Lục: Phím tắt & Điều hướng nhanh */}
            <div className="pt-4 border-t border-[#193b47]/20 flex flex-wrap items-center justify-between gap-4 text-[11px] text-[#5c736a]">
              <div className="flex items-center gap-3">
                <span className="font-serif text-[#ba3b32] font-bold text-sm">魚</span>
                <span>SAKANA · CUỐN THỦY TỘC CHÍ 8 PHẦN TỪ LÒNG ĐẠI DƯƠNG</span>
              </div>
              <div className="flex items-center gap-3">
                <SakanaButton
                  onClick={() => scrollTo("kham-pha")}
                  idPrefix="catalog-top"
                  className="px-4 py-2 text-[11px]"
                >
                  <span>Về đầu trang</span>
                  <ArrowUpRight size={14} />
                </SakanaButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
