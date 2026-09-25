import React from "react";

interface SakanaLogoProps {
  className?: string;
  size?: number; // width in px
  showText?: boolean;
  theme?: "ink" | "light"; // 'ink' for paper background (#193b47), 'light' for dark background (#f0ecdf)
}

/**
 * SakanaLogo — Bản khắc cá biển uốn lượn bồng bềnh (Flowing Marine Specimen)
 * Khắc họa dáng cá bơi uyển chuyển hình chữ S với vây lụa mềm mại theo phong cách thủy ấn họa và tranh mộc bản truyền thống Nhật Bản (Ukiyo-e / Sumi-e).
 */
export function SakanaLogo({
  className = "",
  size = 52,
  theme = "ink",
}: SakanaLogoProps) {
  const inkColor = theme === "light" ? "#f0ecdf" : "#193b47";
  const softInk = theme === "light" ? "#a7c6bd" : "#3d5e68";
  const fineLine = theme === "light" ? "#1f3c47" : "#f0ecdf";
  const accentSea = theme === "light" ? "#c6ded5" : "#6f9188";
  const cinnabar = "#ba3b32";

  // Aspect ratio 140 x 85
  const height = Math.round((size * 85) / 140);

  return (
    <div className={`sakana-brand-logo inline-flex items-center select-none ${className}`}>
      <div
        className="relative flex items-center justify-center transition-transform duration-500 hover:scale-105"
        style={{ width: size, height }}
      >
        <svg
          viewBox="0 0 140 85"
          width={size}
          height={height}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          {/* Làn sóng nước xoáy mềm mại làm nền (Flowing Water Ripples) */}
          <path
            d="M 10 58 C 35 48, 62 62, 92 52 C 114 45, 126 56, 136 50"
            stroke={accentSea}
            strokeWidth="0.9"
            strokeDasharray="2 3"
            opacity="0.45"
          />
          <path
            d="M 22 66 C 48 58, 75 70, 105 60 C 122 55, 130 63, 138 60"
            stroke={accentSea}
            strokeWidth="0.7"
            strokeDasharray="3 3"
            opacity="0.3"
          />

          {/* VÂY ĐUÔI LỤA BỒNG BỀNH (Flowing Silk Caudal Fin) — 3 dải vây xếp lớp mềm mại */}
          {/* Dải vây đuôi trên */}
          <path
            d="M 32 46 C 22 34, 12 22, 4 15 C 8 26, 14 36, 18 44 C 24 45, 28 46, 32 46 Z"
            fill={inkColor}
            opacity="0.88"
          />
          <path
            d="M 6 18 C 14 28, 22 38, 30 45"
            stroke={fineLine}
            strokeWidth="0.6"
            opacity="0.6"
          />

          {/* Dải vây đuôi giữa (dài thướt tha) */}
          <path
            d="M 28 47 C 18 46, 8 48, 2 52 C 10 54, 18 53, 26 49 Z"
            fill={softInk}
            opacity="0.75"
          />

          {/* Dải vây đuôi dưới */}
          <path
            d="M 30 48 C 22 56, 14 68, 6 78 C 14 72, 22 62, 27 52 C 28 50, 29 49, 30 48 Z"
            fill={inkColor}
            opacity="0.85"
          />
          <path
            d="M 8 75 C 16 66, 24 57, 29 50"
            stroke={fineLine}
            strokeWidth="0.6"
            opacity="0.6"
          />

          {/* VÂY HẬU MÔN UỐN LƯỢN (Anal Fin) */}
          <path
            d="M 46 62 C 40 68, 32 74, 25 76 C 30 70, 36 64, 40 59 Z"
            fill={softInk}
            opacity="0.7"
          />

          {/* THÂN CÁ UỐN LƯỢN HÌNH CHỮ S (Curved Swimming Fish Body) */}
          <path
            d="M 30 47 
               C 42 34, 62 25, 86 24 
               C 106 24, 124 32, 134 41 
               C 136 43, 135 45, 132 46 
               C 118 55, 96 61, 74 61 
               C 52 61, 38 56, 30 47 Z"
            fill={inkColor}
          />

          {/* Nét khắc lườn bụng sáng (Ventral Contour Highlight) */}
          <path
            d="M 38 52 C 54 59, 78 59, 100 55 C 114 52, 124 47, 130 43"
            stroke={fineLine}
            strokeWidth="0.6"
            strokeDasharray="4 2"
            opacity="0.4"
          />

          {/* VÂY LƯNG GỢN SÓNG (Undulating Dorsal Fin) */}
          <path
            d="M 94 24 C 90 14, 78 12, 68 15 C 62 17, 56 24, 54 28 C 66 25, 80 24, 94 24 Z"
            fill={inkColor}
            opacity="0.95"
          />
          {/* Tia vây lưng */}
          <path d="M 88 23 C 86 16, 82 14, 76 13" stroke={fineLine} strokeWidth="0.5" opacity="0.6" />
          <path d="M 78 24 C 74 18, 70 16, 65 17" stroke={fineLine} strokeWidth="0.5" opacity="0.6" />

          {/* VÂY NGỰC XÒE NHƯ DẢI LỤA (Flowing Ribbon Pectoral Fin) */}
          <path
            d="M 106 43 C 100 54, 86 64, 72 63 C 82 56, 94 49, 104 42 Z"
            fill={softInk}
          />
          <path
            d="M 102 44 C 94 52, 84 59, 74 62"
            stroke={fineLine}
            strokeWidth="0.5"
            opacity="0.55"
          />

          {/* VẢY CÁ KHẮC NÉT HÌNH TRĂNG LƯỠI LIỀM (Crescent Woodblock Scales) */}
          <g stroke={fineLine} strokeWidth="0.5" opacity="0.45" fill="none">
            <path d="M 82 34 C 84 38, 84 42, 82 46" />
            <path d="M 74 36 C 76 40, 76 44, 74 48" />
            <path d="M 66 38 C 68 41, 68 45, 66 48" />
            <path d="M 58 40 C 60 43, 60 46, 58 49" />
          </g>

          {/* MANG CÁ (Operculum / Gill Arch) */}
          <path
            d="M 112 33 C 116 40, 115 47, 108 51"
            stroke={fineLine}
            strokeWidth="0.8"
            opacity="0.75"
          />

          {/* MẮT CÁ (Fish Eye with Vitality Gleam) */}
          <circle cx="123" cy="38" r="2.8" fill={fineLine} />
          <circle cx="123" cy="38" r="1.6" fill={inkColor} />
          <circle cx="123.7" cy="37.3" r="0.7" fill={fineLine} />

          {/* MIỆNG CÁ (Mouth Notch) */}
          <path d="M 132 44 C 134 43, 135 42, 135 41" stroke={fineLine} strokeWidth="0.7" />

          {/* CHẤM SON ĐỎ TRUYỀN THỐNG TRÊN ĐẦU CÁ (Tancho Cinnabar Mark) */}
          <circle cx="118" cy="29" r="1.8" fill={cinnabar} opacity="0.85" />
        </svg>
      </div>
    </div>
  );
}
