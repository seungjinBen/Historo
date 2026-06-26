"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { toCdnUrl } from "@/lib/api";

const STEPS = [
  { n: "1", title: "사건을 봐요", body: "실록 속 진짜 사건을 먹돌이가 아이 눈높이로 풀어줘요." },
  { n: "2", title: "‘만약에’를 골라요", body: "채팅으로 답하거나 준비된 선택지를 골라 이야기를 분기시켜요." },
  { n: "3", title: "4컷으로 완성돼요", body: "내가 고른 ‘만약에’가 고증 화풍의 4컷 그림책으로 펼쳐져요." },
];

// 현재 CDN에 있는 최신 명량 4컷 (이순신 A-1-α 스토리라인)
const DEMO_CUTS = [
  "이순신/A/1/α/컷1.png",
  "이순신/A/1/α/컷2.png",
  "이순신/A/1/α/컷3.png",
  "이순신/A/1/α/컷4.png",
].map((p) => toCdnUrl(p).replace(/\.png($|\?)/, ".webp$1"));

// 자동 재생되는 사용법 데모 — 탭을 누르면 멈추고 해당 단계로
export function UsageDemo() {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setStep((s) => (s + 1) % 3), 3200);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <div className="abt-demo">
      <div className="abt-demo-tabs" role="tablist" aria-label="사용 단계">
        {STEPS.map((s, i) => (
          <button
            key={s.n}
            role="tab"
            aria-selected={step === i}
            className={"abt-demo-tab" + (step === i ? " on" : "")}
            onClick={() => { setStep(i); setPaused(true); }}
          >
            <span className="abt-demo-tab-num">{s.n}</span>
            <span className="abt-demo-tab-text">
              <span className="abt-demo-tab-title">{s.title}</span>
              <span className="abt-demo-tab-body">{s.body}</span>
            </span>
            {step === i && !paused && <span className="abt-demo-tab-bar" aria-hidden="true" />}
          </button>
        ))}
      </div>

      <div className="abt-demo-canvas">
        <div className="abt-demo-screen" key={step}>
          {step === 0 && (
            <div className="abt-demo-pane">
              <span className="abt-demo-pill fact">실록 사실</span>
              <p className="abt-demo-line">
                1597년 명량, 이순신은 단 <b>13척</b>으로 130척이 넘는 적을 막아야 했어요.
              </p>
              <p className="abt-demo-note">먹돌이가 진짜 사건을 아이 눈높이로 들려줘요.</p>
            </div>
          )}
          {step === 1 && (
            <div className="abt-demo-pane">
              <span className="abt-demo-pill imagine">나의 만약에</span>
              <p className="abt-demo-q">좁은 울돌목, 너라면 어떻게 싸울까?</p>
              <div className="abt-demo-choices">
                <span className="abt-demo-choice on">① 빠른 물살로 적을 끌어들인다</span>
                <span className="abt-demo-choice">② 정면으로 돌파한다</span>
                <span className="abt-demo-choice">③ 잠시 물러나 기회를 본다</span>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="abt-demo-pane">
              <span className="abt-demo-pill">4컷 완성</span>
              <div className="abt-demo-grid">
                {DEMO_CUTS.map((src, i) => (
                  <div className="abt-demo-panel" key={i} style={{ animationDelay: `${(i + 1) * 0.1}s` }}>
                    <img src={src} alt={`이순신 명량 이야기 ${i + 1}컷`} loading="lazy" />
                  </div>
                ))}
              </div>
              <p className="abt-demo-note">내가 고른 ‘만약에’가 진짜 4컷 그림책으로 펼쳐져요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
