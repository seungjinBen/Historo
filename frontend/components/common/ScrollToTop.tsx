"use client";

import { useEffect, useState } from "react";

// 일정 거리(400px) 이상 내려가면 우하단에 페이드인, 클릭 시 맨 위로 스무스 스크롤.
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function goTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <button
      type="button"
      className={"scroll-top" + (visible ? " visible" : "")}
      onClick={goTop}
      aria-label="맨 위로 가기"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </svg>
    </button>
  );
}
