"use client";

import Link from "next/link";

type Props = {
  onHome: () => void;
  onAbout: () => void;
};

// 상단 브랜드 · 책장(준비중) · 역사로 · 로그인 — 모든 화면 공통.
export function TopBar({ onHome, onAbout }: Props) {
  return (
    <div className="top">
      <button
        className="brand brand-link"
        onClick={onHome}
        aria-label="역사로 — 홈으로"
      >
        역사로<span className="hanja">歷史路</span>
      </button>
      <div className="top-actions">
        <button
          className="top-btn"
          onClick={() => { /* 책장: 준비중 */ }}
          aria-label="책장 (준비중)"
        >
          책장
        </button>
        <button
          className="top-btn"
          onClick={onAbout}
          aria-label="역사로 소개"
        >
          역사로
        </button>
        <Link
          href="/login"
          className="top-btn top-btn-login"
          aria-label="로그인 페이지로"
        >
          로그인
        </Link>
      </div>
    </div>
  );
}
