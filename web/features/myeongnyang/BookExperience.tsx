"use client";

/* eslint-disable @next/next/no-img-element */
// 동화책 모드 — 명량해전의 만약에 선택 흐름을 한 권의 책 안에서 진행한다.
// 닫힌 책(표지) → 양옆으로 펼쳐지는 오프닝(좌·우 표지 동시 회전) →
// 두 면(LEFT/RIGHT) 스프레드에서 질문 → 선택할 때마다 책장이 척추를 축으로 회전 →
// 마지막에 ① 내가 만든 4컷 ② 실제 4컷 ③ 닫는 말 — 세 스프레드로 마무리.

import { useCallback, useEffect, useRef, useState } from "react";

import {
  Icon,
  DATA,
  EFFECTS,
  EVENT_ID,
  GRADES,
  type GradeKey,
  type Opt,
  REAL_ENDING,
  REAL_HISTORY_SECTIONS,
  REAL_PANELS,
  SOURCE,
  STEP_LABELS,
  STEP_STATS,
} from "./data";

// ── 책장 넘김 효과음 (Web Audio · 합성) ─────────────
let sharedCtx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (sharedCtx && sharedCtx.state !== "closed") return sharedCtx;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  sharedCtx = new Ctor();
  return sharedCtx;
}
function playSfx(kind: "turn" | "open") {
  const ctx = getCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();
  const duration = kind === "open" ? 0.55 : 0.24;
  const sr = ctx.sampleRate;
  const size = Math.max(1, Math.floor(sr * duration));
  const buf = ctx.createBuffer(1, size, sr);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < size; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.025 * white) / 1.025;
    data[i] = last * (kind === "open" ? 3.6 : 2.6);
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = kind === "open" ? 1400 : 2400;
  bp.Q.value = kind === "open" ? 0.55 : 0.85;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = kind === "open" ? 3800 : 5500;
  const gain = ctx.createGain();
  const t0 = ctx.currentTime;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(kind === "open" ? 0.32 : 0.22, t0 + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0008, t0 + duration);
  src.connect(bp).connect(lp).connect(gain).connect(ctx.destination);
  src.start(t0);
  src.stop(t0 + duration + 0.05);
}

const imgUrl = (file: string) => `/images/${EVENT_ID}/${file}`;

type Phase = "closed" | "opening" | "open";

// 스프레드 인덱스
//   0 = 인트로(리드)
//   1·2·3 = Q1·Q2·Q3
//   4 = 내가 만든 4컷 (→ 다른 이야기 고르기 / 실제 역사 공부하기)
//   5·6·7·8 = 실제 역사 1·2·3·4장 (왼쪽 실제 컷 + 오른쪽 실록 본문)
//   9 = 실제 유물 도감 4선
//   10 = 닫는 말
type SpreadKey = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
const LAST_SPREAD: SpreadKey = 10;
// 실제 역사 페이지 (5-8) 첫·끝
const REAL_FIRST: SpreadKey = 5;
const REAL_LAST: SpreadKey = 8;
const HERITAGE_SPREAD: SpreadKey = 9;

// ── 실제 유물 4선 ─ 하드코딩(공모전용) ────────────────
// 출처: 국가유산청 · 현충사관리소 / 국립해양문화재연구소 공공누리 자료를 기반으로 어린이 눈높이로 재구성.
type HeritageItem = {
  id: "portrait" | "panokseon" | "cannonball" | "diary";
  num: 1 | 2 | 3 | 4;
  name: string;
  source: string;
  docent: string;
  imageSrc: string;
};
const HERITAGE_ITEMS: HeritageItem[] = [
  {
    id: "portrait",
    num: 1,
    name: "이순신 장군 표준영정",
    source: "현충사관리소",
    docent:
      "나라에서 공식 지정한 장군님의 얼굴이야. 큰 눈과 굳게 다문 입술에서 바다를 지키려는 위엄이 느껴지지?",
    imageSrc: "/images/heritage/portrait.jpg",
  },
  {
    id: "panokseon",
    num: 2,
    name: "전통군선 판옥선 3D 도면",
    source: "국립해양문화재연구소",
    docent:
      "2층 구조로 만들어져 위에서는 공격하고 아래선 안전하게 노를 젓는, 명량해전을 승리로 이끈 조선의 핵심 무기야.",
    imageSrc: "/images/heritage/panokseon.jpg",
  },
  {
    id: "cannonball",
    num: 3,
    name: "명량대첩 해역 출토 조란환",
    source: "국립해양문화재연구소",
    docent:
      "실제 명량해전이 벌어졌던 울돌목 바다 밑에서 발굴된 돌과 철로 만든 진짜 대포알들의 흔적이란다.",
    imageSrc: "/images/heritage/cannonball.jpg",
  },
  {
    id: "diary",
    num: 4,
    name: "국보 난중일기 및 장도",
    source: "현충사관리소",
    docent:
      "장군님이 전쟁 중에 매일 쓰신 일기장과, 늘 곁에 두고 마음을 다잡았던 2미터가 넘는 거대한 큰 칼이야.",
    imageSrc: "/images/heritage/diary.jpg",
  },
];

// ──────────────────────────────────────────────
// 페이지 콘텐츠 — LEFT / RIGHT 각 면
// ──────────────────────────────────────────────
type SharedProps = {
  picks: number[];
  data: ReturnType<typeof getData>;
};

function getData(grade: GradeKey) {
  return DATA[grade];
}

function HeritageCard({ item }: { item: HeritageItem }) {
  const [err, setErr] = useState(false);
  return (
    <article className="mbook-heritage-card">
      <div className="mbook-heritage-num">{item.num}</div>
      <div className="mbook-heritage-thumb">
        {err ? (
          <div className="mbook-heritage-thumb-ph">사진 준비 중</div>
        ) : (
          <img src={item.imageSrc} alt={item.name} onError={() => setErr(true)} />
        )}
      </div>
      <div className="mbook-heritage-body">
        <div className="mbook-heritage-name">{item.name}</div>
        <div className="mbook-heritage-source">{item.source}</div>
        <p className="mbook-heritage-docent">{item.docent}</p>
      </div>
    </article>
  );
}

function ComicPanel({ src, alt, idx, scene }: { src: string; alt: string; idx: number; scene: string }) {
  const [err, setErr] = useState(false);
  return (
    <figure className="mbook-panel">
      <div className="mbook-panel-num">{idx + 1}</div>
      {err ? (
        <div className="mbook-panel-ph">{scene}<br/><span>(그림 준비 중)</span></div>
      ) : (
        <img src={src} alt={alt} onError={() => setErr(true)} />
      )}
      <figcaption>{scene}</figcaption>
    </figure>
  );
}

function LeftPage({ spread, picks, data }: SharedProps & { spread: SpreadKey }) {
  if (spread === 0) {
    return (
      <div className="mbook-side mbook-side-lead">
        <span className="mbook-eyebrow">실록 기반 · 만약에 체험</span>
        <div className="mbook-illust">
          <img src={imgUrl("_anchor.png")} alt="" />
        </div>
        <p className="mbook-side-quote">“신에게는 아직 12척의<br/>배가 있사옵니다.”</p>
        <p className="mbook-side-cite">— 충무공 이순신</p>
      </div>
    );
  }
  if (spread === 1 || spread === 2 || spread === 3) {
    const upto = spread - 1;
    return (
      <div className="mbook-side mbook-side-recap">
        <span className="mbook-eyebrow">지나온 선택</span>
        {upto === 0 ? (
          <p className="mbook-recap-hint">
            장군이 너의 첫 결정을 기다리고 있어요. 오른쪽 페이지에서 골라 보세요.
          </p>
        ) : (
          <ol className="mbook-recap-list">
            {Array.from({ length: upto }).map((_, i) => {
              const o = data.questions[i].options[picks[i]];
              const eff = EFFECTS[i]?.[picks[i]];
              return (
                <li key={i} className="mbook-recap-item">
                  <span className="mbook-recap-step">{i + 1}</span>
                  <div>
                    <div className="mbook-recap-label">{o.label}</div>
                    {eff && <div className="mbook-recap-effect">→ {eff}</div>}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
        <div className="mbook-stats">
          <span><b>우리</b> {STEP_STATS[spread - 1].ours}</span>
          <span className="mbook-stat-enemy"><b>적</b> {STEP_STATS[spread - 1].enemy}</span>
          <span className="mbook-stat-phase">{STEP_STATS[spread - 1].phase}</span>
        </div>
      </div>
    );
  }
  if (spread === 4) {
    const pathKey = picks.join("-");
    const o1 = data.questions[0].options[picks[0]];
    const o2 = data.questions[1].options[picks[1]];
    return (
      <div className="mbook-side mbook-side-comic">
        <span className="mbook-eyebrow">내가 만든 명량 · ①②</span>
        <ComicPanel src={imgUrl(`${pathKey}_panel1.png`)} alt={o1.scene} idx={0} scene={o1.scene} />
        <ComicPanel src={imgUrl(`${pathKey}_panel2.png`)} alt={o2.scene} idx={1} scene={o2.scene} />
      </div>
    );
  }
  // 스프레드 5-8: 실제 역사 한 컷씩 — 왼쪽에 컷
  if (spread >= REAL_FIRST && spread <= REAL_LAST) {
    const idx = spread - REAL_FIRST;
    const panel = REAL_PANELS[idx];
    return (
      <div className="mbook-side mbook-side-real-cut">
        <span className="mbook-eyebrow">실제 역사 · {idx + 1}장</span>
        <ComicPanel src={panel.src} alt={panel.caption} idx={idx} scene={panel.caption} />
        <p className="mbook-real-bubble">&ldquo;{panel.bubble}&rdquo;</p>
      </div>
    );
  }
  // 스프레드 9: 유물 도감 ①②
  if (spread === HERITAGE_SPREAD) {
    return (
      <div className="mbook-side mbook-side-heritage">
        <span className="mbook-eyebrow mbook-eyebrow-heritage">실제 유물 도감 · ①②</span>
        <HeritageCard item={HERITAGE_ITEMS[0]} />
        <HeritageCard item={HERITAGE_ITEMS[1]} />
      </div>
    );
  }
  // 스프레드 10 — 닫는 말
  const o3 = data.questions[2].options[picks[2]];
  const ending = o3?.ending ?? data.climax;
  return (
    <div className="mbook-side mbook-side-ending">
      <span className="mbook-eyebrow">이야기의 끝</span>
      <p className="mbook-end-quote">{ending}</p>
      <div className="mbook-end-divider" aria-hidden="true">✦  ◆  ✦</div>
      <p className="mbook-end-real">{REAL_ENDING}</p>
      <div className="mbook-end-source">출처 · {SOURCE}</div>
    </div>
  );
}

type RightInteractiveProps = {
  spread: SpreadKey;
  picks: number[];
  data: ReturnType<typeof getData>;
  grade: GradeKey;
  gradeOpen: boolean;
  setGradeOpen: (b: boolean) => void;
  pickGrade: (g: GradeKey) => void;
  speak: (t: string) => void;
  stop: () => void;
  speaking: boolean;
  onChoose: (i: number) => void;
  onRestart: () => void;
  onHome: () => void;
};

function RightPage(props: RightInteractiveProps) {
  const { spread, picks, data, grade, gradeOpen, setGradeOpen, pickGrade,
          speak, stop, speaking, onChoose, onRestart, onHome } = props;

  if (spread === 0) {
    return (
      <div className="mbook-side mbook-side-intro">
        <span className="mbook-eyebrow">제 1 장 · 부르심</span>
        <h2 className="mbook-h2">너는 장군의 작전 참모</h2>
        <p className="mbook-narr">{data.lead}</p>
        <div className="mbook-actions">
          <button
            className={"mbook-mini-listen" + (speaking ? " on" : "")}
            onClick={() => (speaking ? stop() : speak(data.lead))}
          >
            {speaking ? "멈추기" : "읽어줘"}
          </button>
          <GradeMenu grade={grade} gradeOpen={gradeOpen} setGradeOpen={setGradeOpen} pickGrade={pickGrade} />
        </div>
        <div className="mbook-hint-flip">아래 ‘다음 장 →’을 눌러 첫 번째 질문으로</div>
      </div>
    );
  }
  if (spread === 1 || spread === 2 || spread === 3) {
    const q = data.questions[spread - 1];
    return (
      <div className="mbook-side mbook-side-q">
        <span className="mbook-eyebrow">{STEP_LABELS[spread - 1]}</span>
        <h2 className="mbook-h2 mbook-q-prompt">{q.prompt}</h2>
        <ul className="mbook-choices">
          {q.options.map((o, i) => (
            <ChoiceItem key={i} opt={o} index={i} onPick={() => onChoose(i)} />
          ))}
        </ul>
        <div className="mbook-hint-flip">선택하면 책장이 스르륵 넘어가요</div>
      </div>
    );
  }
  if (spread === 4) {
    const pathKey = picks.join("-");
    const o3 = data.questions[2].options[picks[2]];
    return (
      <div className="mbook-side mbook-side-comic">
        <span className="mbook-eyebrow">내가 만든 명량 · ③④</span>
        <ComicPanel src={imgUrl(`${pathKey}_panel3.png`)} alt={data.climax} idx={2} scene={data.climax} />
        <ComicPanel src={imgUrl(`${pathKey}_panel4.png`)} alt={o3.scene} idx={3} scene={o3.scene} />
      </div>
    );
  }
  // 스프레드 5-8: 실제 역사 한 컷씩 — 오른쪽에 실록 본문
  if (spread >= REAL_FIRST && spread <= REAL_LAST) {
    const idx = spread - REAL_FIRST;
    const section = REAL_HISTORY_SECTIONS[idx];
    return (
      <div className="mbook-side mbook-side-real-text">
        <span className="mbook-eyebrow mbook-eyebrow-real">실록 이야기</span>
        <h2 className="mbook-h2 mbook-real-title">{section.title}</h2>
        {section.paragraphs.map((p, j) => (
          <p key={j} className="mbook-narr mbook-real-p">{p}</p>
        ))}
        <div className="mbook-real-meta">
          <div className="mbook-real-source">출처 · {SOURCE}</div>
        </div>
      </div>
    );
  }
  // 스프레드 9: 유물 도감 ③④
  if (spread === HERITAGE_SPREAD) {
    return (
      <div className="mbook-side mbook-side-heritage">
        <span className="mbook-eyebrow mbook-eyebrow-heritage">실제 유물 도감 · ③④</span>
        <HeritageCard item={HERITAGE_ITEMS[2]} />
        <HeritageCard item={HERITAGE_ITEMS[3]} />
        <div className="mbook-heritage-foot">
          본 자료는 국가유산청 · 현충사관리소 · 국립해양문화재연구소가 공개한
          공공누리 자료를 어린이 눈높이로 재구성했어요.
        </div>
      </div>
    );
  }
  // 스프레드 10 — CTA
  return (
    <div className="mbook-side mbook-side-cta">
      <span className="mbook-eyebrow">책을 덮으며</span>
      <h2 className="mbook-h2">너만의 명량 한 권</h2>
      <p className="mbook-narr">
        같은 바다, 같은 13척. 그러나 너의 선택이 만든 단 한 권의 책이에요. 다른 선택으로 또 다른 결말을 만들어 볼까요?
      </p>
      <div className="mbook-cta-row">
        <button className="mbook-cta primary" onClick={onRestart}>다시 펼치기 ↺</button>
        <button className="mbook-cta" onClick={onHome}>다른 이야기 고르기</button>
      </div>
    </div>
  );
}

function ChoiceItem({ opt, index, onPick }: { opt: Opt; index: number; onPick: () => void }) {
  return (
    <li className={"mbook-choice tone-" + opt.tone}>
      <button onClick={onPick} className="mbook-choice-btn">
        <span className="mbook-choice-num">{"①②③"[index]}</span>
        <span className="mbook-choice-icon"><Icon name={opt.icon} /></span>
        <span className="mbook-choice-text">
          <span className="mbook-choice-label">{opt.label}</span>
          {opt.desc && <span className="mbook-choice-desc">{opt.desc}</span>}
        </span>
      </button>
    </li>
  );
}

function GradeMenu({
  grade, gradeOpen, setGradeOpen, pickGrade,
}: {
  grade: GradeKey;
  gradeOpen: boolean;
  setGradeOpen: (b: boolean) => void;
  pickGrade: (g: GradeKey) => void;
}) {
  const gradeMeta = GRADES.find((g) => g.key === grade)!;
  return (
    <div className="mbook-grade">
      <button
        className="mbook-grade-btn"
        onClick={() => setGradeOpen(!gradeOpen)}
        aria-haspopup="listbox"
        aria-expanded={gradeOpen}
      >
        <span>{gradeMeta.emoji}</span> {gradeMeta.label}
        <span className="mbook-grade-caret">{gradeOpen ? "▴" : "▾"}</span>
      </button>
      {gradeOpen && (
        <ul className="mbook-grade-menu" role="listbox">
          {GRADES.map((g) => (
            <li key={g.key}>
              <button
                className={"mbook-grade-item" + (g.key === grade ? " on" : "")}
                onClick={() => pickGrade(g.key)}
              >
                <span>{g.emoji}</span> {g.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// 표지(닫힌 책) — 좌·우 반쪽으로 분할해서 양옆으로 펼친다.
// 각 반쪽의 face는 200% 너비라서, 두 반쪽이 모이면 끊김 없는 한 장의 표지로 보인다.
// ──────────────────────────────────────────────
function CoverFaceContent() {
  return (
    <>
      <span className="mbook-cover-eyebrow">실제 역사</span>
      <h2 className="mbook-cover-title">이순신 장군과<br/>명량의 기적</h2>
      <p className="mbook-cover-sub">1597 · 정유년 가을</p>
      <span className="mbook-cover-orn">✦  ◆  ✦</span>
    </>
  );
}

// ──────────────────────────────────────────────
// 메인 컴포넌트
// ──────────────────────────────────────────────
type Props = {
  onHome: () => void;
  speak: (t: string) => void;
  stop: () => void;
  speaking: boolean;
};

export default function MyeongnyangBookExperience({ onHome, speak, stop, speaking }: Props) {
  const [phase, setPhase] = useState<Phase>("closed");
  const [grade, setGrade] = useState<GradeKey>("1-2");
  const [gradeOpen, setGradeOpen] = useState(false);
  const [spread, setSpread] = useState<SpreadKey>(0);
  const [picks, setPicks] = useState<number[]>([]);
  const [flip, setFlip] = useState<{ from: SpreadKey; to: SpreadKey; dir: "next" | "prev" } | null>(null);

  const data = getData(grade);

  const openBook = useCallback(() => {
    if (phase !== "closed") return;
    playSfx("open");
    setPhase("opening");
  }, [phase]);

  const onCoverEnd = useCallback(() => {
    // 좌측 표지 한쪽이 끝나면 phase를 open으로 전환
    if (phase === "opening") setPhase("open");
  }, [phase]);

  const restart = useCallback(() => {
    stop();
    setSpread(0);
    setPicks([]);
    setFlip(null);
    setPhase("closed");
  }, [stop]);

  const goSpread = useCallback(
    (to: SpreadKey, dir: "next" | "prev") => {
      if (flip || phase !== "open") return;
      if (to === spread) return;
      if (to < 0 || to > LAST_SPREAD) return;
      playSfx("turn");
      setFlip({ from: spread, to, dir });
    },
    [flip, phase, spread],
  );

  const onLeafEnd = useCallback(() => {
    if (!flip) return;
    setSpread(flip.to);
    setFlip(null);
  }, [flip]);

  const pickGrade = useCallback((g: GradeKey) => {
    setGrade(g);
    setGradeOpen(false);
    if (picks.length > 0 || spread > 0) {
      setPicks([]);
      setSpread(0);
    }
  }, [picks.length, spread]);

  const choose = useCallback(
    (i: number) => {
      if (spread < 1 || spread > 3) return;
      stop();
      const next = [...picks];
      next[spread - 1] = i;
      setPicks(next);
      const target = (spread + 1) as SpreadKey;
      goSpread(target, "next");
    },
    [goSpread, picks, spread, stop],
  );

  const stageRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (phase !== "open") return;
    const onKey = (e: KeyboardEvent) => {
      if (flip) return;
      // 질문 단계(1-3)는 선택이 진행 / 스프레드 4는 커스텀 버튼만 사용 → 키보드 nav 비활성
      const canNext =
        spread === 0 ||
        (spread >= REAL_FIRST && spread <= HERITAGE_SPREAD);
      if (e.key === "ArrowRight" && canNext) {
        e.preventDefault();
        goSpread((spread + 1) as SpreadKey, "next");
      }
      if (e.key === "ArrowLeft" && spread > 0 && spread !== 4) {
        e.preventDefault();
        goSpread((spread - 1) as SpreadKey, "prev");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flip, goSpread, phase, spread]);

  // 잎 면 콘텐츠 매핑
  // next: FRONT = 현재 RIGHT, BACK = 도착 LEFT  (0 → -180)
  // prev: FRONT = 도착 RIGHT, BACK = 현재 LEFT  (-180 → 0)
  const leafFrontSpread: SpreadKey | null = flip ? (flip.dir === "next" ? flip.from : flip.to) : null;
  const leafBackSpread: SpreadKey | null  = flip ? (flip.dir === "next" ? flip.to   : flip.from) : null;

  // RightPage용 더미 핸들러 — 잎 face에서는 인터랙션 비활성화
  const noop = () => {};

  const sourceSpread = flip ? flip.from : spread;
  const targetSpread = flip ? flip.to : spread;

  return (
    <div className="screen mbook-screen" key="mbook">
      <div className="mbook-topbar">
        <button className="back" onClick={onHome}>← 다른 이야기 고르기</button>
        {phase === "open" && (
          <div className="mbook-progress">
            <span className="mbook-progress-label">제 {Math.min(spread + 1, LAST_SPREAD + 1)} 장</span>
            <div className="mbook-progress-dots">
              {Array.from({ length: LAST_SPREAD + 1 }).map((_, i) => (
                <span key={i} className={"mbook-progress-dot" + (i === spread ? " on" : i < spread ? " past" : "")} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div
        className={"mbook-stage mbook-phase-" + phase + (flip ? " is-flipping" : "")}
        ref={stageRef}
      >
        <svg className="mbook-defs" aria-hidden="true">
          <defs>
            <filter id="mbook-paper-noise" x="0" y="0" width="100%" height="100%">
              {/* 거친 결 — 한지 섬유 느낌 */}
              <feTurbulence type="fractalNoise" baseFrequency="0.62" numOctaves="3" seed="11" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.24  0 0 0 0 0.17  0 0 0 0 0.10  0 0 0 0.16 0" />
            </filter>
            <filter id="mbook-paper-fiber" x="0" y="0" width="100%" height="100%">
              {/* 세로 섬유 강조 — 한지 결 */}
              <feTurbulence type="turbulence" baseFrequency="0.04 1.2" numOctaves="2" seed="7" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.30  0 0 0 0 0.22  0 0 0 0 0.12  0 0 0 0.09 0" />
            </filter>
          </defs>
        </svg>

        <div className="mbook-shell">
          {/* 책 두께(스택 라인) */}
          <div className="mbook-stack" aria-hidden="true"><span/><span/><span/></div>

          {/* 베이스 1 — 출발 스프레드 (플립 전반부) */}
          <div className="mbook-spread mbook-base mbook-base-source">
            <div className="mbook-half mbook-half-left">
              <div className="mbook-paper">
                <LeftPage spread={sourceSpread} picks={picks} data={data} />
                <div className="mbook-noise" aria-hidden="true" />
                <div className="mbook-spine-shadow right" aria-hidden="true" />
              </div>
            </div>
            <div className="mbook-half mbook-half-right">
              <div className="mbook-paper">
                <RightPage
                  spread={sourceSpread}
                  picks={picks} data={data}
                  grade={grade}
                  gradeOpen={gradeOpen}
                  setGradeOpen={setGradeOpen}
                  pickGrade={pickGrade}
                  speak={speak} stop={stop} speaking={speaking}
                  onChoose={choose}
                  onRestart={restart}
                  onHome={onHome}
                />
                <div className="mbook-noise" aria-hidden="true" />
                <div className="mbook-spine-shadow left" aria-hidden="true" />
              </div>
            </div>
          </div>

          {/* 베이스 2 — 도착 스프레드 (플립 중반부터 크로스페이드) */}
          {flip && (
            <div className="mbook-spread mbook-base mbook-base-target">
              <div className="mbook-half mbook-half-left">
                <div className="mbook-paper">
                  <LeftPage spread={targetSpread} picks={picks} data={data} />
                  <div className="mbook-noise" aria-hidden="true" />
                  <div className="mbook-spine-shadow right" aria-hidden="true" />
                </div>
              </div>
              <div className="mbook-half mbook-half-right">
                <div className="mbook-paper">
                  <RightPage
                    spread={targetSpread}
                    picks={picks} data={data}
                    grade={grade}
                    gradeOpen={false}
                    setGradeOpen={noop}
                    pickGrade={noop as (g: GradeKey) => void}
                    speak={speak} stop={stop} speaking={speaking}
                    onChoose={noop as (i: number) => void}
                    onRestart={restart}
                    onHome={onHome}
                  />
                  <div className="mbook-noise" aria-hidden="true" />
                  <div className="mbook-spine-shadow left" aria-hidden="true" />
                </div>
              </div>
            </div>
          )}

          {/* 책장 잎 — 척추를 축으로 회전 */}
          {flip && (
            <div className={"mbook-leaf to-" + flip.dir} onAnimationEnd={onLeafEnd}>
              <div className="mbook-leaf-face mbook-leaf-front">
                <div className="mbook-paper">
                  <RightPage
                    spread={leafFrontSpread as SpreadKey}
                    picks={picks} data={data}
                    grade={grade}
                    gradeOpen={false}
                    setGradeOpen={noop}
                    pickGrade={noop as (g: GradeKey) => void}
                    speak={speak} stop={stop} speaking={speaking}
                    onChoose={noop as (i: number) => void}
                    onRestart={restart}
                    onHome={onHome}
                  />
                  <div className="mbook-noise" aria-hidden="true" />
                  <div className="mbook-spine-shadow left" aria-hidden="true" />
                </div>
              </div>
              <div className="mbook-leaf-face mbook-leaf-back">
                <div className="mbook-paper">
                  <LeftPage spread={leafBackSpread as SpreadKey} picks={picks} data={data} />
                  <div className="mbook-noise" aria-hidden="true" />
                  <div className="mbook-spine-shadow right" aria-hidden="true" />
                </div>
              </div>
              <div className={"mbook-leaf-shade to-" + flip.dir} aria-hidden="true" />
            </div>
          )}

          {/* 닫힌 책 — 표지 좌·우 분할(양옆으로 펼쳐짐) */}
          {(phase === "closed" || phase === "opening") && (
            <button
              type="button"
              className="mbook-cover-overlay"
              onClick={openBook}
              aria-label={phase === "closed" ? "이 책을 펼치기" : "책 펼치는 중"}
            >
              <div
                className="mbook-cover-half left"
                onAnimationEnd={onCoverEnd}
              >
                <div className="mbook-cover-face">
                  <div className="mbook-cover-frame">
                    <CoverFaceContent />
                  </div>
                </div>
                <div className="mbook-cover-back" aria-hidden="true">
                  <div className="mbook-cover-endpaper" />
                </div>
              </div>
              <div className="mbook-cover-half right">
                <div className="mbook-cover-face">
                  <div className="mbook-cover-frame">
                    <CoverFaceContent />
                  </div>
                </div>
                <div className="mbook-cover-back" aria-hidden="true">
                  <div className="mbook-cover-endpaper" />
                </div>
              </div>
              <div className="mbook-cover-spine" aria-hidden="true" />
            </button>
          )}
        </div>

        {phase === "closed" && (
          <div className="mbook-closed-meta">
            <p className="mbook-closed-hint">표지를 톡 누르면 양옆으로 스르륵 펼쳐져요</p>
            <button className="mbook-open-cta" onClick={openBook}>
              <span className="mbook-open-glow" aria-hidden="true" />
              이 책을 펼치기
            </button>
          </div>
        )}
      </div>

      {/* 인트로(0) — 다음 장 */}
      {phase === "open" && spread === 0 && !flip && (
        <div className="mbook-controls">
          <button className="mbook-ctrl" disabled>
            ← 이전 장
          </button>
          <button
            className="mbook-ctrl primary"
            onClick={() => goSpread(1 as SpreadKey, "next")}
          >
            다음 장 →
          </button>
        </div>
      )}

      {/* 스프레드 4 — 내가 만든 4컷: 커스텀 두 버튼만 */}
      {phase === "open" && spread === 4 && !flip && (
        <div className="mbook-controls mbook-controls-spread4">
          <button
            className="mbook-ctrl"
            onClick={onHome}
            aria-label="다른 이야기 고르기 — 홈으로"
          >
            ← 다른 이야기 고르기
          </button>
          <button
            className="mbook-ctrl primary"
            onClick={() => goSpread(REAL_FIRST, "next")}
            aria-label="실제 역사 공부하러 가기"
          >
            실제 역사 공부하기 →
          </button>
        </div>
      )}

      {/* 실제 역사 / 유물 (5-9) — 표준 prev/next */}
      {phase === "open" && spread >= REAL_FIRST && spread <= HERITAGE_SPREAD && !flip && (
        <div className="mbook-controls">
          <button
            className="mbook-ctrl"
            onClick={() => goSpread((spread - 1) as SpreadKey, "prev")}
          >
            ← 이전 장
          </button>
          <button
            className="mbook-ctrl primary"
            onClick={() => goSpread((spread + 1) as SpreadKey, "next")}
          >
            다음 장 →
          </button>
        </div>
      )}

      {/* 마지막(10) — 다시 펼치기 */}
      {phase === "open" && spread === LAST_SPREAD && !flip && (
        <div className="mbook-controls">
          <button
            className="mbook-ctrl"
            onClick={() => goSpread((spread - 1) as SpreadKey, "prev")}
          >
            ← 이전 장
          </button>
          <button className="mbook-ctrl primary" onClick={restart}>다시 펼치기 ↺</button>
        </div>
      )}

      {/* 질문 단계 — 가벼운 ‘이전 장’만 */}
      {phase === "open" && (spread === 1 || spread === 2 || spread === 3) && !flip && (
        <div className="mbook-controls">
          <button
            className="mbook-ctrl"
            onClick={() => goSpread((spread - 1) as SpreadKey, "prev")}
          >
            ← 이전 장
          </button>
          <span className="mbook-ctrl-note">선택하면 다음 장으로 넘어가요</span>
        </div>
      )}
    </div>
  );
}
