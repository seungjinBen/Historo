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
      { threshold: 0.08, rootMargin: "0px 0px -36px 0px" }
    );

    const observe = () =>
      document.querySelectorAll<Element>("[data-rv]").forEach((el) => obs.observe(el));

    observe();
    const t = setTimeout(observe, 350);
    return () => { obs.disconnect(); clearTimeout(t); };
  }, []);

  return null;
}
