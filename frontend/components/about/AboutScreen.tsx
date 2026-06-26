"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { toCdnUrl } from "@/lib/api";

// 데모용 — 현재 CDN에 있는 최신 명량 4컷 (이순신 A-1-α 스토리라인)
const DEMO_CUTS = [
  "이순신/A/1/α/컷1.png",
  "이순신/A/1/α/컷2.png",
  "이순신/A/1/α/컷3.png",
  "이순신/A/1/α/컷4.png",
].map((p) => toCdnUrl(p).replace(/\.png($|\?)/, ".webp$1"));

const STATS = [
  { num: "10편", label: "펼칠 수 있는 조선 이야기" },
  { num: "6,400만 자", label: "AI가 읽은 조선왕조실록" },
  { num: "100%", label: "사실은 실록 그대로 고정" },
  { num: "2~3분", label: "한 편이 완성되는 시간" },
];

const PROBLEMS = [
  {
    title: "외우면, 잊어버려요",
    body: "시험이 끝나면 연표도 이름도 사라져요. 머리에 남는 역사가 없어요.",
  },
  {
    title: "‘왜?’가 빠져 있어요",
    body: "사건은 외워도, 그 다음 ‘만약에’를 스스로 상상해본 적은 없어요.",
  },
  {
    title: "700년 전 이야기가 멀어요",
    body: "교과서 속 인물이 내 이야기가 되지 않아요. 그래서 재미가 없어요.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "사건을 봐요",
    body: "실록 속 진짜 사건을 먹돌이가 아이 눈높이로 풀어줘요.",
  },
  {
    n: "2",
    title: "‘만약에’를 골라요",
    body: "채팅으로 답하거나 준비된 선택지를 골라 이야기를 분기시켜요.",
  },
  {
    n: "3",
    title: "4컷으로 완성돼요",
    body: "내가 고른 ‘만약에’가 고증 화풍의 4컷 그림책으로 펼쳐져요.",
  },
];

const SOURCES = [
  "조선왕조실록 (국사편찬위원회)",
  "e뮤지엄 소장품 (국립중앙박물관)",
  "국가유산 정보 (국가유산청)",
  "한국민족문화대백과 (한국학중앙연구원)",
];

const PIPELINE = [
  {
    tag: "실록 원문",
    head: "尙有十二 微臣不死",
    body: "“신에게는 아직 열두 척의 배가 있사옵니다.” — 선조실록, 1597년",
  },
  {
    tag: "events.json",
    head: "사실만 추출·구조화",
    body: "13척으로 130척을 막았다 · 울돌목의 빠른 물살을 이용했다 — 사실 레이어로 분리 저장",
  },
  {
    tag: "4컷 완성",
    head: "AI는 이 사실만 사용",
    body: "연도를 지어내지 않고 주입된 사실만 그림으로. 결말에 출처가 자동으로 표기돼요.",
  },
];

const EDU = [
  {
    title: "능동 학습",
    body: "선택과 창작으로 역사를 ‘내 것’으로 경험해요. 외우는 역사가 아니에요.",
  },
  {
    title: "창의력·문해력",
    body: "이야기를 짓고 다듬으며 서사 구성력과 글쓰기 힘을 길러요.",
  },
  {
    title: "AI 리터러시",
    body: "AI를 소비가 아니라 창작 도구로 다루는 경험을 쌓아요.",
  },
];

const FAQS = [
  {
    q: "역사 왜곡이 걱정돼요.",
    a: "실록에 기록된 ‘사실’은 그대로 고정하고, 아이는 그 이후의 ‘만약에’만 상상해요. 사실 구간과 상상 구간을 색과 배지로 또렷이 구분해, 둘이 섞이지 않도록 했어요.",
  },
  {
    q: "글을 못 쓰는 아이도 할 수 있나요?",
    a: "네. 글을 직접 쓰지 않아도 돼요. 먹돌이와 대화하거나 준비된 선택지를 고르기만 하면, 한 편의 이야기가 완성돼요.",
  },
  {
    q: "이 사이트는 누가, 무엇으로 만들었나요?",
    a: "조선왕조실록을 비롯한 공개 문화데이터를 바탕으로 만든 학습용 서비스예요. 그림과 ‘만약에’ 이야기는 학습을 위한 ‘역사적 상상력 창작물’이에요.",
  },
];

// 뷰포트에 들어오면 0 → 목표값으로 차오르는 숫자
function CountUp({ to, decimals = 0, suffix = "" }: { to: number; decimals?: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const ran = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !ran.current) {
          ran.current = true;
          const start = performance.now();
          const dur = 1100;
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(to * eased);
            if (p < 1) requestAnimationFrame(tick);
            else setVal(to);
          };
          requestAnimationFrame(tick);
          obs.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [to]);

  return <span ref={ref}>{val.toFixed(decimals)}{suffix}</span>;
}

// 자동 재생되는 사용법 데모 — 탭을 누르면 멈추고 해당 단계로
function UsageDemo() {
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

export function AboutScreen({ onBack }: { onBack: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);

  // About는 진입 시 마운트되므로 전용 관찰자로 스크롤 등장을 직접 건다
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    root.querySelectorAll("[data-rv]").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="screen abt" key="about" ref={rootRef}>
      <button className="screen-back" onClick={onBack} aria-label="홈으로">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 12H5" />
          <path d="m12 19-7-7 7-7" />
        </svg>
        홈으로
      </button>

      {/* 히어로 */}
      <section className="abt-hero">
        <span className="abt-eyebrow" data-rv="up">조선왕조실록 × AI 역사 창작</span>
        <h1 className="abt-hero-title" data-rv="up" data-rv-d="60">
          역사를 외우지 마세요.<br />
          <span className="abt-accent">직접 만들어 보세요.</span>
        </h1>
        <p className="abt-hero-sub" data-rv="up" data-rv-d="120">
          실록의 진짜 ‘사실’에서 출발해, 내가 고른 ‘만약에’로 4컷 그림책이 완성돼요.
        </p>
        <div className="abt-hero-cta" data-rv="up" data-rv-d="180">
          <button className="abt-btn primary" onClick={onBack}>이야기 만들러 가기 →</button>
        </div>
        <div className="abt-stats" data-rv="up" data-rv-d="240">
          {STATS.map((s) => (
            <div className="abt-stat" key={s.label}>
              <div className="abt-stat-num">{s.num}</div>
              <div className="abt-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 문제 통계 밴드 */}
      <section className="abt-section">
        <div className="abt-statband" data-rv="up">
          <div className="abt-statband-row">
            <div className="abt-statband-item">
              <div className="abt-statband-num"><CountUp to={96.8} decimals={1} suffix="%" /></div>
              <div className="abt-statband-cap">“역사는 중요하다”고 답한 초등학생</div>
            </div>
            <div className="abt-statband-vs" aria-hidden="true">그런데</div>
            <div className="abt-statband-item muted">
              <div className="abt-statband-num">최하위</div>
              <div className="abt-statband-cap">전 과목 중 역사 ‘흥미도’ 순위</div>
            </div>
          </div>
          <p className="abt-statband-line">
            중요한 건 알지만, 재미가 없어요. <b>역사로는 이 간극을 메웁니다.</b>
          </p>
          <span className="abt-statband-src">초등학생 1,104명 설문</span>
        </div>
      </section>

      {/* 문제 공감 */}
      <section className="abt-section">
        <div className="abt-head" data-rv="up">
          <span className="abt-section-eyebrow">이런 적, 있으시죠</span>
          <h2 className="abt-h2">역사는 왜 늘 외우기만 할까요?</h2>
        </div>
        <div className="abt-grid-3">
          {PROBLEMS.map((p, i) => (
            <div className="abt-card abt-problem" key={p.title} data-rv="up" data-rv-d={String(i * 80)}>
              <h3 className="abt-card-title">{p.title}</h3>
              <p className="abt-card-body">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 작동 방식 3스텝 */}
      <section className="abt-section">
        <div className="abt-head" data-rv="up">
          <span className="abt-section-eyebrow">어떻게 만들어요</span>
          <h2 className="abt-h2">대화하고 고르면, 4컷이 완성돼요</h2>
          <p className="abt-section-sub">글을 못 써도 괜찮아요. 말하거나 고르기만 하면 됩니다.</p>
        </div>
        <UsageDemo />
      </section>

      {/* 사실 vs 만약에 */}
      <section className="abt-section">
        <div className="abt-head" data-rv="up">
          <span className="abt-section-eyebrow">왜곡 없는 창작</span>
          <h2 className="abt-h2">‘사실’은 고정, ‘만약에’만 나의 상상</h2>
          <p className="abt-section-sub">
            실록의 사실은 그대로 두고, 그 이후만 아이가 상상해요. 색과 배지로 둘을 또렷이 나눕니다.
          </p>
        </div>
        <div className="abt-vs" data-rv="up">
          <div className="abt-vs-card fact">
            <span className="abt-tag fact">실록 사실 · 고정</span>
            <p className="abt-vs-text">1446년, 세종이 훈민정음을 반포했다.</p>
            <span className="abt-vs-note">실록에 기록된 그대로 — 바꿀 수 없어요.</span>
          </div>
          <div className="abt-vs-arrow" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </div>
          <div className="abt-vs-card imagine">
            <span className="abt-tag imagine">나의 만약에 · 상상</span>
            <p className="abt-vs-text">만약, 백성들이 새 글자를 거부했다면?</p>
            <span className="abt-vs-note">여기서부터는 내가 고르는 이야기예요.</span>
          </div>
        </div>
      </section>

      {/* 데이터 파이프라인 */}
      <section className="abt-section">
        <div className="abt-head" data-rv="up">
          <span className="abt-section-eyebrow">데이터가 콘텐츠가 되기까지</span>
          <h2 className="abt-h2">실록 한 줄이, 그림 한 컷이 됩니다</h2>
          <p className="abt-section-sub">
            AI가 연도를 기억으로 지어내지 않아요. 실록에서 뽑은 사실만 그림에 쓰입니다.
          </p>
        </div>
        <div className="abt-pipe">
          {PIPELINE.map((p, i) => (
            <div className="abt-pipe-wrap" key={p.tag}>
              <div className="abt-pipe-card">
                <span className="abt-pipe-tag">{p.tag}</span>
                <p className="abt-pipe-head">{p.head}</p>
                <p className="abt-pipe-body">{p.body}</p>
              </div>
              {i < PIPELINE.length - 1 && (
                <div className="abt-pipe-arrow" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 차별성 */}
      <section className="abt-section">
        <div className="abt-head" data-rv="up">
          <span className="abt-section-eyebrow">왜 역사로인가요</span>
          <h2 className="abt-h2">보는 역사에서, 만드는 역사로</h2>
        </div>
        <div className="abt-diff" data-rv="up">
          <div className="abt-diff-card old">
            <span className="abt-diff-label">지금까지</span>
            <p className="abt-diff-text">학습만화·영상으로 <b>듣고 보기만</b> 했어요. 아이는 구경꾼이었죠.</p>
          </div>
          <div className="abt-diff-card new">
            <span className="abt-diff-label hot">역사로</span>
            <p className="abt-diff-text">아이가 <b>직접 ‘만약에’를 골라 이야기를 만들어요.</b> 역사의 주인공이 됩니다.</p>
          </div>
        </div>
        <p className="abt-diff-note">
          ‘능동 창작’과 ‘공공 역사 고증’을 동시에 만족하는 건, 역사로뿐이에요.
        </p>
      </section>

      {/* 교육 효과 */}
      <section className="abt-section">
        <div className="abt-head" data-rv="up">
          <span className="abt-section-eyebrow">무엇이 남나요</span>
          <h2 className="abt-h2">놀이처럼, 그러나 제대로 배워요</h2>
        </div>
        <div className="abt-grid-3">
          {EDU.map((e) => (
            <div className="abt-card" key={e.title}>
              <h3 className="abt-card-title">{e.title}</h3>
              <p className="abt-card-body">{e.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 신뢰 — 데이터 출처 */}
      <section className="abt-section">
        <div className="abt-head" data-rv="up">
          <span className="abt-section-eyebrow">무엇으로 만들었나요</span>
          <h2 className="abt-h2">공개된 우리 문화데이터 위에서</h2>
          <p className="abt-section-sub">
            검증된 공공 자료를 아이 눈높이로 다시 풀어, 환각 없이 사실에 충실하게 만들었어요.
          </p>
        </div>
        <div className="abt-sources" data-rv="up">
          {SOURCES.map((s) => (
            <span className="abt-source" key={s}>{s}</span>
          ))}
        </div>
        <p className="abt-sources-note">모두 공공누리 자유이용 대상인 개방 데이터예요.</p>
      </section>

      {/* FAQ */}
      <section className="abt-section">
        <div className="abt-head" data-rv="up">
          <span className="abt-section-eyebrow">자주 묻는 질문</span>
          <h2 className="abt-h2">궁금한 점이 있으신가요?</h2>
        </div>
        <div className="abt-faq" data-rv="up">
          {FAQS.map((f) => (
            <details className="abt-faq-item" key={f.q}>
              <summary className="abt-faq-q">
                {f.q}
                <span className="abt-faq-mark" aria-hidden="true">+</span>
              </summary>
              <p className="abt-faq-a">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* 마무리 CTA */}
      <section className="abt-cta" data-rv="up">
        <h2 className="abt-cta-title">사실은 실록이, 이야기는 네가.</h2>
        <p className="abt-cta-sub">오늘은 어떤 ‘만약에’부터 시작할까요?</p>
        <button className="abt-btn primary lg" onClick={onBack}>지금 이야기 만들기 →</button>
      </section>
    </div>
  );
}
