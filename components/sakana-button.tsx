"use client";

import React, { type ReactNode } from "react";
import { WaveButtonFrame } from "@/components/wave-button-frame";

export interface SakanaButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  idPrefix?: string;
  target?: string;
  rel?: string;
  "aria-label"?: string;
}

export function SakanaButton({
  children,
  href,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  idPrefix,
  target,
  rel,
  "aria-label": ariaLabel,
}: SakanaButtonProps) {
  const baseClasses =
    "group relative inline-flex items-center justify-center px-6 py-2.5 bg-[#f0ecdf] hover:bg-[#faf7ee] text-[#193b47] border border-[#193b47] shadow-[0_4px_16px_-4px_rgba(25,59,71,0.22)] hover:shadow-[0_8px_24px_-4px_rgba(25,59,71,0.35)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none transition-all duration-300 select-none cursor-pointer font-mono text-[12px] font-medium tracking-[0.14em] uppercase";

  const content = (
    <>
      <WaveButtonFrame idPrefix={idPrefix} />
      <span className="relative z-10 flex items-center justify-center gap-2 group-hover:text-[#0b222a] leading-none">
        {children}
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        target={target}
        rel={rel}
        aria-label={ariaLabel}
        className={`${baseClasses} ${className}`}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${baseClasses} ${className}`}
    >
      {content}
    </button>
  );
}
