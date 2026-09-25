"use client";

import { useId } from "react";

export function WaveButtonFrame({ idPrefix }: { idPrefix?: string }) {
  const autoId = useId().replace(/[^a-zA-Z0-9-_]/g, "");
  const prefix = idPrefix || `wbf-${autoId}`;
  return (
    <>
      <span aria-hidden="true" className="absolute inset-[4px] border border-[#193b47]/25 pointer-events-none transition-colors duration-300 group-hover:border-[#193b47]/45" />
      <span aria-hidden="true" className="absolute top-[2px] left-4 right-4 h-[4px] pointer-events-none overflow-hidden opacity-75 group-hover:opacity-100 transition-opacity">
        <svg className="w-full h-full" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id={`${prefix}-wave-top`} width="8" height="4" patternUnits="userSpaceOnUse"><path d="M 0 3.5 Q 2 0.5, 4 3.5 T 8 3.5" fill="none" stroke="#193b47" strokeWidth="0.8" strokeLinecap="round" /></pattern></defs>
          <rect width="100%" height="100%" fill={`url(#${prefix}-wave-top)`} />
        </svg>
      </span>
      <span aria-hidden="true" className="absolute bottom-[2px] left-4 right-4 h-[4px] pointer-events-none overflow-hidden opacity-75 group-hover:opacity-100 transition-opacity">
        <svg className="w-full h-full" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id={`${prefix}-wave-bottom`} width="8" height="4" patternUnits="userSpaceOnUse"><path d="M 0 0.5 Q 2 3.5, 4 0.5 T 8 0.5" fill="none" stroke="#193b47" strokeWidth="0.8" strokeLinecap="round" /></pattern></defs>
          <rect width="100%" height="100%" fill={`url(#${prefix}-wave-bottom)`} />
        </svg>
      </span>
      <span aria-hidden="true" className="absolute left-[2px] top-3 bottom-3 w-[4px] pointer-events-none overflow-hidden opacity-75 group-hover:opacity-100 transition-opacity">
        <svg className="w-full h-full" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id={`${prefix}-wave-left`} width="4" height="8" patternUnits="userSpaceOnUse"><path d="M 3.5 0 Q 0.5 2, 3.5 4 T 3.5 8" fill="none" stroke="#193b47" strokeWidth="0.8" strokeLinecap="round" /></pattern></defs>
          <rect width="100%" height="100%" fill={`url(#${prefix}-wave-left)`} />
        </svg>
      </span>
      <span aria-hidden="true" className="absolute right-[2px] top-3 bottom-3 w-[4px] pointer-events-none overflow-hidden opacity-75 group-hover:opacity-100 transition-opacity">
        <svg className="w-full h-full" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id={`${prefix}-wave-right`} width="4" height="8" patternUnits="userSpaceOnUse"><path d="M 0.5 0 Q 3.5 2, 0.5 4 T 0.5 8" fill="none" stroke="#193b47" strokeWidth="0.8" strokeLinecap="round" /></pattern></defs>
          <rect width="100%" height="100%" fill={`url(#${prefix}-wave-right)`} />
        </svg>
      </span>
      <span aria-hidden="true" className="absolute top-[2.5px] left-[2.5px] w-2 h-2 pointer-events-none text-[#193b47]"><svg viewBox="0 0 8 8" className="w-full h-full"><path d="M 0 8 L 0 0 L 8 0" fill="none" stroke="currentColor" strokeWidth="1.2" /><circle cx="4" cy="4" r="0.8" fill="#ba3b32" /></svg></span>
      <span aria-hidden="true" className="absolute top-[2.5px] right-[2.5px] w-2 h-2 pointer-events-none text-[#193b47]"><svg viewBox="0 0 8 8" className="w-full h-full"><path d="M 8 8 L 8 0 L 0 0" fill="none" stroke="currentColor" strokeWidth="1.2" /><circle cx="4" cy="4" r="0.8" fill="#ba3b32" /></svg></span>
      <span aria-hidden="true" className="absolute bottom-[2.5px] left-[2.5px] w-2 h-2 pointer-events-none text-[#193b47]"><svg viewBox="0 0 8 8" className="w-full h-full"><path d="M 0 0 L 0 8 L 8 8" fill="none" stroke="currentColor" strokeWidth="1.2" /><circle cx="4" cy="4" r="0.8" fill="#ba3b32" /></svg></span>
      <span aria-hidden="true" className="absolute bottom-[2.5px] right-[2.5px] w-2 h-2 pointer-events-none text-[#193b47]"><svg viewBox="0 0 8 8" className="w-full h-full"><path d="M 8 0 L 8 8 L 0 8" fill="none" stroke="currentColor" strokeWidth="1.2" /><circle cx="4" cy="4" r="0.8" fill="#ba3b32" /></svg></span>
    </>
  );
}
