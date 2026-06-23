"use client";

import { useId } from "react";

// 박물관(랜드마크) 모양 — 단색 그라데이션 채움. 🏛️ 이모지 대체용.
export function HeritageIcon({ size = 16, className }: { size?: number; className?: string }) {
  const rawId = useId();
  const gid = `hgrad-${rawId.replace(/:/g, "_")}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D65249" />
          <stop offset="100%" stopColor="#8A2A22" />
        </linearGradient>
      </defs>
      <g fill={`url(#${gid})`}>
        {/* 박공 지붕 */}
        <path d="M12 2.2 22 8H2z" />
        {/* 처마 */}
        <rect x="2.2" y="8.4" width="19.6" height="1.6" rx="0.4" />
        {/* 기둥 4개 */}
        <rect x="3.6" y="10.5" width="2.2" height="8.4" rx="0.4" />
        {/* 기둥 2 */}
        <rect x="7.8" y="10.5" width="2.2" height="8.4" rx="0.4" />
        {/* 기둥 3 */}
        <rect x="14" y="10.5" width="2.2" height="8.4" rx="0.4" />
        {/* 기둥 4 */}
        <rect x="18.2" y="10.5" width="2.2" height="8.4" rx="0.4" />
        {/* 바닥/계단 */}
        <rect x="2.2" y="19.4" width="19.6" height="1.5" rx="0.4" />
        <rect x="1.4" y="21.2" width="21.2" height="1.4" rx="0.4" />
      </g>
    </svg>
  );
}
