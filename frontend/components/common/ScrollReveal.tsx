"use client";
import { useEffect } from "react";

export function ScrollReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            obs.unobserve(e.target);
          }
        });
      },
      // threshold 0 = 1px만 보여도 즉시 트리거 (재방문 시 뷰포트 안 요소 처리)
      { threshold: 0, rootMargin: "0px 0px -20px 0px" }
    );

    const observe = () =>
      document.querySelectorAll<Element>("[data-rv]").forEach((el) => {
        if (!el.classList.contains("is-visible")) obs.observe(el);
      });

    observe();
    // 렌더 직후 DOM이 아직 없을 수 있어 두 번 실행
    const t1 = setTimeout(observe, 100);
    const t2 = setTimeout(observe, 500);
    return () => { obs.disconnect(); clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return null;
}
