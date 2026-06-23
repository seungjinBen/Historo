"use client";

import { Fragment } from "react";
import { SejongMascot } from "@/components/mascots/SejongMascot";
import { HERO_ACTIONS, HERO_FLOW_STEPS } from "@/lib/home-content";
import type { HeroActionId } from "@/lib/types";

function HeroActionIcon({ id }: { id: HeroActionId }) {
  const common = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  switch (id) {
    case "story":
      return (
        <svg {...common}>
          <path d="M11 4H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      );
    case "study":
      return (
        <svg {...common}>
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
      );
    case "heritage":
      return (
        <svg {...common}>
          <path d="M3 21h18"/>
          <path d="M5 21V10"/>
          <path d="M19 21V10"/>
          <path d="M9 21v-6h6v6"/>
          <path d="M12 3 3 9h18z"/>
        </svg>
      );
    case "gallery":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="9" cy="9" r="2"/>
          <path d="m21 15-5-5L5 21"/>
        </svg>
      );
  }
}

export function HeroSection({ scrollToTarget }: { scrollToTarget: (id: string) => void }) {
  return (
    <section className="home-section home-hero-section">
      <div className="hero">
        <h1 className="hero-title">
          내가 만드는 <span className="hero-title-accent">조선 이야기</span>
        </h1>
        <p className="hero-sub">
          역사를 외우지 마세요. 역사 속에 들어가 나만의 이야기를 만들어봐요.
          <br />오늘은 어떤 <em>&lsquo;만약에&rsquo;</em>부터 시작할까요?
        </p>
      </div>

      <div
        className="hero-mascot hero-mascot-select"
        aria-label="세종대왕과 만드는 이야기 흐름"
      >
        <div className="hero-mascot-figure" aria-hidden="true">
          <SejongMascot />
          <span className="hero-mascot-name">세종대왕</span>
        </div>
        <div className="hero-mascot-body">
          <div className="hero-mascot-bubble">
            <span className="hero-mascot-bubble-tag">이야기 흐름</span>
            <p className="hero-mascot-bubble-text">
              실록 속 진짜 &lsquo;사실&rsquo;에서 시작해, 내가 고른 &lsquo;만약에&rsquo;로 4컷 그림책이 완성돼요.
            </p>
          </div>
          <div className="hero-flow" role="list">
            {HERO_FLOW_STEPS.map((step, i) => (
              <Fragment key={step.label}>
                {i > 0 && <span className="hero-flow-arrow" aria-hidden="true">→</span>}
                <div className="hero-flow-step" role="listitem">
                  <span className="hero-flow-num">{i + 1}</span>
                  <span className="hero-flow-label">{step.label}</span>
                  <span className="hero-flow-sub">{step.sub}</span>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="hero-actions" role="list" aria-label="어디부터 시작할까요?">
        {HERO_ACTIONS.map((act) => (
          <button
            key={act.id}
            type="button"
            role="listitem"
            className={"hero-action hero-action-" + act.id}
            onClick={() => scrollToTarget(act.target)}
            aria-label={act.label}
          >
            <span className="hero-action-icon" aria-hidden="true">
              <HeroActionIcon id={act.id} />
            </span>
            <span className="hero-action-label">{act.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
