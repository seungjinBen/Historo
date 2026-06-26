"use client";

/* eslint-disable @next/next/no-img-element */
// 이순신 BookExperience와 완전 동일한 mbook-* 구조.
// comic JSON (questions + 27 storylines)으로 구동하는 범용 버전.
// Spread 0: 인트로  | 1: Q1  | 2: Q2  | 3: Q3
// Spread 4: 4컷 결과  | 5: CTA

import { useCallback, useEffect, useState } from "react";
import { MeokdolChatLauncher } from "@/components/mascots/MeokdolChatLauncher";
import { ComicCutViewer } from "@/components/story/ComicCutViewer";
import { api, type ApiComicCut, type ApiComicQuestions, type ApiComicStoryline } from "@/lib/api";
import { GRADES, type GradeKey } from "@/features/myeongnyang/data";
import { GRADE_INTRO } from "@/lib/grade-content";
import type { EventMeta, Tree } from "@/lib/types";

// ── 선택지 키 매핑 ────────────────────────────
const Q1_KEYS = ["A", "B", "C"];
const Q2_KEYS = ["1", "2", "3"];
const Q3_KEYS = ["α", "β", "γ"];

// path_text("A선택 ➔ B선택 ➔ C선택")에서 선택지 레이블 추출
function extractChoiceLabels(storylines: ApiComicStoryline[]) {
  const q1: Record<string, string> = {};
  const q2: Record<string, string> = {};
  const q3: Record<string, string> = {};
  storylines.forEach((sl) => {
    const parts = sl.pathText.split(/\s*➔\s*/);
    if (parts.length === 3) {
      q1[sl.q1] = parts[0].trim();
      q2[sl.q2] = parts[1].trim();
      q3[sl.q3] = parts[2].trim();
    }
  });
  return {
    q1: Q1_KEYS.map((k) => ({ key: k, label: q1[k] ?? k })),
    q2: Q2_KEYS.map((k) => ({ key: k, label: q2[k] ?? k })),
    q3: Q3_KEYS.map((k) => ({ key: k, label: q3[k] ?? k })),
  };
}

// ── 책장 효과음 ──────────────────────────────
let _ctx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (_ctx && _ctx.state !== "closed") return _ctx;
  const C = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!C) return null; _ctx = new C(); return _ctx;
}
function playSfx(kind: "turn" | "open") {
  const ctx = getCtx(); if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();
  const dur = kind === "open" ? 0.55 : 0.24;
  const buf = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * dur)), ctx.sampleRate);
  const d = buf.getChannelData(0); let last = 0;
  for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; last = (last + 0.025 * w) / 1.025; d[i] = last * (kind === "open" ? 3.6 : 2.6); }
  const src = ctx.createBufferSource(); src.buffer = buf;
  const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = kind === "open" ? 1400 : 2400; bp.Q.value = 0.7;
  const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = kind === "open" ? 3800 : 5500;
  const g = ctx.createGain(); const t0 = ctx.currentTime;
  g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(kind === "open" ? 0.32 : 0.22, t0 + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
  src.connect(bp).connect(lp).connect(g).connect(ctx.destination);
  src.start(t0); src.stop(t0 + dur + 0.05);
}

// ── 이벤트별 표지 색상 ───────────────────────
const COVER_BG: Record<string, string> = {
  "taejo-foundation-1392":       "#3D1F0E",
  "park-yeon-aak-1430":          "#1A2A4A",
  "jangnyeongsil-jagyeokru-1434":"#0E2233",
  "sejong-hunmin-1446":          "#6B1A1A",
  "shin-saimdang-art-1551":      "#1A3A2A",
  "yi-myeongnyang-1597":         "#1A1A2A",
  "heojun-donguibogam-1613":     "#1A3318",
  "gwanghaegun-junglib-1619":    "#1A2A38",
  "kim-hongdo-genre-1780":       "#3D2800",
  "jeong-yakyong-geojunggi-1792":"#0D1A33",
};
const COVER_EYEBROW: Record<string, string> = {
  "taejo-foundation-1392":       "조선 건국 1392",
  "park-yeon-aak-1430":          "아악 정비 1430",
  "jangnyeongsil-jagyeokru-1434":"자격루 발명 1434",
  "sejong-hunmin-1446":          "훈민정음 반포 1446",
  "shin-saimdang-art-1551":      "예술과 삶 1551",
  "yi-myeongnyang-1597":         "명량 해전 1597",
  "heojun-donguibogam-1613":     "동의보감 완성 1613",
  "gwanghaegun-junglib-1619":    "중립 외교 1619",
  "kim-hongdo-genre-1780":       "풍속화의 시대 1780",
  "jeong-yakyong-geojunggi-1792":"거중기 발명 1792",
};
const STEP_LABELS = ["제 1 장 · 첫 번째 선택", "제 2 장 · 두 번째 선택", "제 3 장 · 세 번째 선택"];

type Phase = "closed" | "opening" | "open";
type SpreadKey = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
// 스프레드 4 = 완성 4컷(전용 뷰어), 5~8 = 실제 역사, 9 = 결말
const REAL_FIRST = 5 as SpreadKey;
const REAL_LAST  = 8 as SpreadKey;
const LAST_SPREAD: SpreadKey = 9;

// ── 컷 패널 (이순신 mbook-panel과 동일 구조) ───
// "먹돌이가 그리는 중" 연출 → 이미지 준비 + 최소 연출시간 모두 충족 시 그려지듯 공개
function CutPanel({ idx, scene, cdnUrl }: { idx: number; scene: string; cdnUrl?: string }) {
  const [err, setErr] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [minDone, setMinDone] = useState(false);

  // 이미지가 즉시 떠도 컷이 순차로 "그려지는" 느낌을 주려고 최소 연출시간을 둔다
  useEffect(() => {
    const t = setTimeout(() => setMinDone(true), 700 + (idx % 2) * 450);
    return () => clearTimeout(t);
  }, [idx]);

  const ok = loaded && minDone;
  const generating = !ok && !err && !!cdnUrl;

  return (
    <figure className="mbook-panel">
      {/* AI 생성 연출 — 그림 준비 전까지 */}
      {generating && (
        <div className="mbook-panel-gen" role="status" aria-label="그림을 그리는 중">
          <svg className="mbook-gen-svg" viewBox="0 0 72 44" aria-hidden="true">
            <path className="mbook-gen-stroke" d="M6 30 C 18 8, 30 8, 38 26 S 58 38, 66 14" fill="none" />
          </svg>
          <span className="mbook-gen-text">그림을 그리는 중</span>
        </div>
      )}
      {/* 에러 폴백 */}
      {err && (
        <div className="mbook-panel-ph">{scene}<br/><span>(그림 준비 중)</span></div>
      )}
      {/* 이미지: opacity 0으로 항상 DOM에 놔서 브라우저 캐시 선점 */}
      {cdnUrl && !err && (
        <img
          src={cdnUrl}
          alt={scene}
          loading="eager"
          className={ok ? "mbook-panel-reveal" : ""}
          style={ok
            ? { flex: 1, width: "100%", objectFit: "contain" }
            : { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", opacity: 0 }
          }
          onLoad={() => setLoaded(true)}
          onError={() => setErr(true)}
        />
      )}
      <figcaption>
        <div className="mbook-panel-num">{idx + 1}</div>
        <span>{scene}</span>
      </figcaption>
    </figure>
  );
}

// ── 공유 타입 ────────────────────────────────
type ComicData = {
  questions: ApiComicQuestions;
  choices: {
    q1: { key: string; label: string }[];
    q2: { key: string; label: string }[];
    q3: { key: string; label: string }[];
  };
  storylines: ApiComicStoryline[];
};

// ── 인트로 이미지 (컷1 = 공통도입, 모든 스토리라인 동일) ──────
function IntroImage({ comic }: { comic: ComicData | null }) {
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState(false);
  const url = comic?.storylines[0]?.cuts[0]?.imageUrl;
  if (!url || err) {
    return (
      <div className="mbook-illust gbook-illust-ph" aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M24 11c-4-3-9-3.5-14-2v26c5-1.5 10-1 14 2 4-3 9-3.5 14-2V9c-5-1.5-10-1-14 2z" />
          <path d="M24 11v26" />
        </svg>
      </div>
    );
  }
  return (
    <div className="gbook-intro-img-wrap">
      <img src={url} alt="도입 그림" className={ok ? "loaded" : ""}
        onLoad={() => setOk(true)} onError={() => setErr(true)} />
    </div>
  );
}

// ── LEFT PAGE ─────────────────────────────────
function LeftPage({ spread, picks, comic, event }: {
  spread: SpreadKey; picks: number[]; comic: ComicData | null; event: EventMeta;
}) {
  const cuts = picks.length === 3 && comic
    ? comic.storylines.find(
        (sl) => sl.q1 === Q1_KEYS[picks[0]] && sl.q2 === Q2_KEYS[picks[1]] && sl.q3 === Q3_KEYS[picks[2]]
      )?.cuts ?? null
    : null;

  if (spread === 0) {
    return (
      <div className="mbook-side mbook-side-lead">
        <span className="mbook-eyebrow">실록 기반 · 만약에 체험</span>
        <IntroImage comic={comic} />
        <p className="mbook-side-quote">&ldquo;{event.factCard.split(/[.!?。]/)[0].trim()}&rdquo;</p>
        <p className="mbook-side-cite">— {event.character?.name ?? event.king}</p>
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
            {event.character?.name ?? event.king}의 첫 번째 결정을 선택해 보세요.
          </p>
        ) : (
          <ol className="mbook-recap-list">
            {Array.from({ length: upto }).map((_, i) => {
              const keys = [comic?.choices.q1, comic?.choices.q2, comic?.choices.q3][i];
              const label = keys?.[picks[i]]?.label ?? picks[i];
              return (
                <li key={i} className="mbook-recap-item">
                  <span className="mbook-recap-step">{i + 1}</span>
                  <div><div className="mbook-recap-label">{label}</div></div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    );
  }

  // spread 5-8 — 실제 역사 컷 1장씩 (이순신 구조 동일)
  if (spread >= REAL_FIRST && spread <= REAL_LAST) {
    const idx = (spread - REAL_FIRST) as number;
    const cuts = picks.length === 3 && comic
      ? comic.storylines.find(
          (s) => s.q1 === Q1_KEYS[picks[0]] && s.q2 === Q2_KEYS[picks[1]] && s.q3 === Q3_KEYS[picks[2]]
        )?.cuts ?? null
      : null;
    return (
      <div className="mbook-side mbook-side-real-cut">
        <span className="mbook-eyebrow mbook-eyebrow-real">실제 역사 · {idx + 1}장</span>
        <CutPanel
          idx={idx}
          scene={cuts?.[idx]?.description ?? ""}
          cdnUrl={cuts?.[idx]?.imageUrl}
        />
      </div>
    );
  }

  // spread 9 — CTA 왼쪽
  return (
    <div className="mbook-side mbook-side-ending">
      <span className="mbook-eyebrow">책을 덮으며</span>
      <p className="mbook-end-quote">{event.title}</p>
      <div className="mbook-end-divider" aria-hidden="true">✦  ◆  ✦</div>
    </div>
  );
}

// ── RIGHT PAGE ───────────────────────────────
function RightPage({ spread, picks, comic, event, speak, stop, speaking, onChoose, onRestart, onHome, grade, setGrade, gradeOpen, setGradeOpen }: {
  spread: SpreadKey; picks: number[]; comic: ComicData | null; event: EventMeta;
  speak: (t: string) => void; stop: () => void; speaking: boolean;
  onChoose: (i: number) => void; onRestart: () => void; onHome: () => void;
  grade: GradeKey; setGrade: (g: GradeKey) => void; gradeOpen: boolean; setGradeOpen: (v: boolean) => void;
}) {
  const cuts = picks.length === 3 && comic
    ? comic.storylines.find(
        (sl) => sl.q1 === Q1_KEYS[picks[0]] && sl.q2 === Q2_KEYS[picks[1]] && sl.q3 === Q3_KEYS[picks[2]]
      )?.cuts ?? null
    : null;

  if (spread === 0) {
    // 학년별 맞춤 인트로 텍스트 — grade-content.ts 우선, 없으면 fallback
    const gradeMap = GRADE_INTRO[event.id];
    const intro = gradeMap?.[grade]
      ?? (grade === "1-2" ? event.factCard : (comic?.questions.Q1 ?? event.factCard));
    return (
      <div className="mbook-side mbook-side-intro">
        <span className="mbook-eyebrow">제 1 장 · 이야기의 시작</span>
        <h2 className="mbook-h2">{event.title}</h2>
        <p className="mbook-narr">{intro}</p>
        <div className="mbook-actions">
          <button className={"mbook-mini-listen" + (speaking ? " on" : "")}
            onClick={() => (speaking ? stop() : speak(intro))}>
            {speaking ? "멈추기" : "읽어줘"}
          </button>
          {/* 학년별 맞춤 선택기 — 이순신과 동일 UI */}
          <div className="mbook-grade">
            <button
              className="mbook-grade-btn"
              onClick={() => setGradeOpen(!gradeOpen)}
              aria-expanded={gradeOpen}
            >
              {GRADES.find((g) => g.key === grade)?.label}
              <span className="mbook-grade-caret">{gradeOpen ? "▴" : "▾"}</span>
            </button>
            {gradeOpen && (
              <ul className="mbook-grade-menu" role="listbox">
                {GRADES.map((g) => (
                  <li key={g.key}
                    role="option"
                    aria-selected={g.key === grade}
                    className={"mbook-grade-item" + (g.key === grade ? " on" : "")}
                    onClick={() => { setGrade(g.key); setGradeOpen(false); }}
                  >{g.label}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="mbook-hint-flip">아래 &lsquo;다음 장 →&rsquo;을 눌러 첫 번째 질문으로</div>
      </div>
    );
  }

  if (spread === 1 || spread === 2 || spread === 3) {
    const qIdx = spread - 1;
    const qText = [comic?.questions.Q1, comic?.questions.Q2, comic?.questions.Q3][qIdx] ?? "";
    const opts = [comic?.choices.q1, comic?.choices.q2, comic?.choices.q3][qIdx] ?? [];
    return (
      <div className="mbook-side mbook-side-q">
        <span className="mbook-eyebrow">{STEP_LABELS[qIdx]}</span>
        <h2 className="mbook-h2 mbook-q-prompt">{qText}</h2>
        <ul className="mbook-choices">
          {opts.map((o, i) => (
            <li key={i} className="mbook-choice">
              <button onClick={() => onChoose(i)} className="mbook-choice-btn gbook-choice-btn">
                <span className="mbook-choice-num">{"①②③"[i]}</span>
                <span className="mbook-choice-text">
                  <span className="mbook-choice-label gbook-choice-label">{o.label}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="mbook-hint-flip">선택하면 책장이 스르륵 넘어가요</div>
      </div>
    );
  }

  // spread 5-8 — 실제 역사 오른쪽 (컷5=factCard, 컷6-8=장면 설명)
  if (spread >= REAL_FIRST && spread <= REAL_LAST) {
    const idx = (spread - REAL_FIRST) as number;
    const cuts = picks.length === 3 && comic
      ? comic.storylines.find(
          (s) => s.q1 === Q1_KEYS[picks[0]] && s.q2 === Q2_KEYS[picks[1]] && s.q3 === Q3_KEYS[picks[2]]
        )?.cuts ?? null
      : null;
    if (idx === 0) {
      return (
        <div className="mbook-side mbook-side-real-text">
          <span className="mbook-eyebrow mbook-eyebrow-real">실록 이야기</span>
          <h2 className="mbook-h2 mbook-real-title">{event.title}</h2>
          <p className="gbook-real-fact">{event.factCard}</p>
          <div className="gbook-real-source">출처 · {event.source}</div>
          {event.sillokUrl && (
            <a href={event.sillokUrl} target="_blank" rel="noopener noreferrer" className="gbook-real-sillok">
              조선왕조실록 원문 보기 →
            </a>
          )}
        </div>
      );
    }
    return (
      <div className="mbook-side mbook-side-real-text">
        <span className="mbook-eyebrow mbook-eyebrow-real">실록 이야기 · {idx + 1}장</span>
        <h2 className="mbook-h2 mbook-real-title">{cuts?.[idx]?.description ?? ""}</h2>
        <div className="gbook-real-source">출처 · {event.source}</div>
        {event.sillokUrl && (
          <a href={event.sillokUrl} target="_blank" rel="noopener noreferrer" className="gbook-real-sillok">
            조선왕조실록 원문 보기 →
          </a>
        )}
      </div>
    );
  }

  // spread 9 — CTA
  return (
    <div className="mbook-side mbook-side-cta">
      <span className="mbook-eyebrow">책을 덮으며</span>
      <h2 className="mbook-h2">너만의 {event.character?.name ?? event.title} 한 권</h2>
      <p className="mbook-narr">같은 역사, 하지만 너의 선택이 만든 단 한 권의 책이에요. 다른 선택으로 또 다른 결말을 만들어 볼까요?</p>
      <div className="mbook-cta-row">
        <button className="mbook-cta primary" onClick={onRestart}>다시 펼치기 ↺</button>
        <button className="mbook-cta" onClick={onHome}>다른 이야기 고르기</button>
      </div>
    </div>
  );
}

// ── 표지 ─────────────────────────────────────
function CoverFace({ event }: { event: EventMeta }) {
  return (
    <>
      <span className="mbook-cover-eyebrow">{COVER_EYEBROW[event.id] ?? `실제 역사 · ${event.year}`}</span>
      <h2 className="mbook-cover-title">{event.title}</h2>
      <p className="mbook-cover-sub">{event.year} · {event.era}</p>
      <span className="mbook-cover-orn">✦  ◆  ✦</span>
    </>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────
type Props = { event: EventMeta; onHome: () => void; speak: (t: string) => void; stop: () => void; speaking: boolean; };

export default function GenericBookExperience({ event, onHome, speak, stop, speaking }: Props) {
  const [phase, setPhase] = useState<Phase>("closed");
  const [spread, setSpread] = useState<SpreadKey>(0);
  const [grade, setGrade] = useState<GradeKey>("3-4");
  const [gradeOpen, setGradeOpen] = useState(false);
  const [picks, setPicks] = useState<number[]>([]);
  const [flip, setFlip] = useState<{ from: SpreadKey; to: SpreadKey; dir: "next" | "prev" } | null>(null);
  const [comic, setComic] = useState<ComicData | null>(null);

  const coverBg = COVER_BG[event.id] ?? "#4A1A0E";

  // 선택 경로에 해당하는 완성 4컷 (스프레드 4 전용 뷰어용)
  const cutsForPicks = picks.length === 3 && comic
    ? comic.storylines.find(
        (s) => s.q1 === Q1_KEYS[picks[0]] && s.q2 === Q2_KEYS[picks[1]] && s.q3 === Q3_KEYS[picks[2]]
      )?.cuts ?? null
    : null;

  useEffect(() => {
    api.getComic(event.id).then((data) => {
      setComic({
        questions: data.questions ?? { Q1: "", Q2: "", Q3: "" },
        choices: extractChoiceLabels(data.storylines),
        storylines: data.storylines,
      });
    }).catch(() => {});
  }, [event.id]);

  // Q2 선택(picks.length≥2) 시 해당 Q1+Q2 조합의 모든 Q3 스토리라인 이미지 preload
  // → Q3 선택 전에 미리 캐시해 spread 4 도달 즉시 표시
  useEffect(() => {
    if (!comic || picks.length < 2) return;
    const preloaded = new Set<string>();
    const q1 = Q1_KEYS[picks[0]];
    const q2 = Q2_KEYS[picks[1]];
    comic.storylines
      .filter((s) => s.q1 === q1 && (picks.length < 2 || s.q2 === q2))
      .forEach((sl) => {
        sl.cuts.forEach((cut) => {
          if (preloaded.has(cut.imageUrl)) return;
          preloaded.add(cut.imageUrl);
          const img = new window.Image();
          img.src = cut.imageUrl;
        });
      });
  }, [picks, comic]);

  const openBook = useCallback(() => {
    if (phase !== "closed") return; playSfx("open"); setPhase("opening");
  }, [phase]);

  const onCoverEnd = useCallback(() => {
    if (phase === "opening") setPhase("open");
  }, [phase]);

  const restart = useCallback(() => {
    stop(); setSpread(0); setPicks([]); setFlip(null); setPhase("closed");
  }, [stop]);

  const goSpread = useCallback((to: SpreadKey, dir: "next" | "prev") => {
    if (flip || phase !== "open" || to === spread || to < 0 || to > LAST_SPREAD) return;
    // 4컷 뷰어(스프레드 4)는 3D 책장 넘김 대신 페이드 전환 (가로 컷 ↔ 세로 책 구조가 달라서)
    if (to === 4 || spread === 4) { playSfx("turn"); setSpread(to); return; }
    playSfx("turn"); setFlip({ from: spread, to, dir });
  }, [flip, phase, spread]);

  const onLeafEnd = useCallback(() => {
    if (!flip) return; setSpread(flip.to); setFlip(null);
  }, [flip]);

  const choose = useCallback((i: number) => {
    if (spread < 1 || spread > 3) return;
    stop();
    const next = [...picks]; next[spread - 1] = i; setPicks(next);
    goSpread((spread + 1) as SpreadKey, "next");
  }, [goSpread, picks, spread, stop]);

  useEffect(() => {
    if (phase !== "open") return;
    const onKey = (e: KeyboardEvent) => {
      if (flip) return;
      if (spread === 4) return; // 4컷 뷰어는 자체 화살표 처리
      const canNext = spread === 0 || (spread >= REAL_FIRST && spread < REAL_LAST);
      if (e.key === "ArrowRight" && canNext) { e.preventDefault(); goSpread((spread + 1) as SpreadKey, "next"); }
      if (e.key === "ArrowLeft" && spread > 0) { e.preventDefault(); goSpread((spread - 1) as SpreadKey, "prev"); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flip, goSpread, phase, spread]);

  const sourceSpread = flip ? flip.from : spread;
  const targetSpread = flip ? flip.to : spread;
  const leafFrontSpread: SpreadKey | null = flip ? (flip.dir === "next" ? flip.from : flip.to) : null;
  const leafBackSpread: SpreadKey | null = flip ? (flip.dir === "next" ? flip.to : flip.from) : null;
  const noop = () => {};

  const shared = { event, picks, comic };

  return (
    <div className="screen mbook-screen" key="gbook" style={{ "--gbook-cover-bg": coverBg } as React.CSSProperties}>
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

      {phase === "open" && spread === 4 ? (
        <ComicCutViewer
          cuts={cutsForPicks ?? []}
          onHome={onHome}
          onDone={() => goSpread(5, "next")}
        />
      ) : (
      <div className={"mbook-stage mbook-phase-" + phase + (flip ? " is-flipping" : "")}>
        <svg className="mbook-defs" aria-hidden="true">
          <defs>
            <filter id="mbook-paper-noise" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.62" numOctaves="3" seed="11" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.24  0 0 0 0 0.17  0 0 0 0 0.10  0 0 0 0.16 0" />
            </filter>
          </defs>
        </svg>

        <div className="mbook-shell">
          <div className="mbook-stack" aria-hidden="true"><span/><span/><span/></div>

          <div className="mbook-spread mbook-base mbook-base-source">
            <div className="mbook-half mbook-half-left"><div className="mbook-paper">
              <LeftPage spread={sourceSpread} {...shared} />
              <div className="mbook-noise" aria-hidden="true" />
              <div className="mbook-spine-shadow right" aria-hidden="true" />
            </div></div>
            <div className="mbook-half mbook-half-right"><div className="mbook-paper">
              <RightPage spread={sourceSpread} {...shared} speak={speak} stop={stop} speaking={speaking} onChoose={choose} onRestart={restart} onHome={onHome} grade={grade} setGrade={setGrade} gradeOpen={gradeOpen} setGradeOpen={setGradeOpen} />
              <div className="mbook-noise" aria-hidden="true" />
              <div className="mbook-spine-shadow left" aria-hidden="true" />
            </div></div>
          </div>

          {flip && (
            <div className="mbook-spread mbook-base mbook-base-target">
              <div className="mbook-half mbook-half-left"><div className="mbook-paper">
                <LeftPage spread={targetSpread} {...shared} />
                <div className="mbook-noise" aria-hidden="true" />
                <div className="mbook-spine-shadow right" aria-hidden="true" />
              </div></div>
              <div className="mbook-half mbook-half-right"><div className="mbook-paper">
                <RightPage spread={targetSpread} {...shared} speak={speak} stop={stop} speaking={speaking} onChoose={noop as (i: number) => void} onRestart={restart} onHome={onHome} grade={grade} setGrade={setGrade} gradeOpen={gradeOpen} setGradeOpen={setGradeOpen} />
                <div className="mbook-noise" aria-hidden="true" />
                <div className="mbook-spine-shadow left" aria-hidden="true" />
              </div></div>
            </div>
          )}

          {flip && (
            <div className={"mbook-leaf to-" + flip.dir} onAnimationEnd={onLeafEnd}>
              <div className="mbook-leaf-face mbook-leaf-front"><div className="mbook-paper">
                <RightPage spread={leafFrontSpread as SpreadKey} {...shared} speak={speak} stop={stop} speaking={speaking} onChoose={noop as (i: number) => void} onRestart={restart} onHome={onHome} grade={grade} setGrade={setGrade} gradeOpen={gradeOpen} setGradeOpen={setGradeOpen} />
                <div className="mbook-noise" aria-hidden="true" />
                <div className="mbook-spine-shadow left" aria-hidden="true" />
              </div></div>
              <div className="mbook-leaf-face mbook-leaf-back"><div className="mbook-paper">
                <LeftPage spread={leafBackSpread as SpreadKey} {...shared} />
                <div className="mbook-noise" aria-hidden="true" />
                <div className="mbook-spine-shadow right" aria-hidden="true" />
              </div></div>
              <div className={"mbook-leaf-shade to-" + flip.dir} aria-hidden="true" />
            </div>
          )}

          {(phase === "closed" || phase === "opening") && (
            <button type="button" className="mbook-cover-overlay" onClick={openBook}
              aria-label={phase === "closed" ? "이 책을 펼치기" : "책 펼치는 중"}
              style={{ "--gbook-cover-bg": coverBg } as React.CSSProperties}>
              <div className="mbook-cover-half left" onAnimationEnd={onCoverEnd}>
                <div className="mbook-cover-face gbook-cover-face"><div className="mbook-cover-frame"><CoverFace event={event} /></div></div>
                <div className="mbook-cover-back" aria-hidden="true"><div className="mbook-cover-endpaper" /></div>
              </div>
              <div className="mbook-cover-half right">
                <div className="mbook-cover-face gbook-cover-face"><div className="mbook-cover-frame"><CoverFace event={event} /></div></div>
                <div className="mbook-cover-back" aria-hidden="true"><div className="mbook-cover-endpaper" /></div>
              </div>
              <div className="mbook-cover-spine" aria-hidden="true" />
            </button>
          )}
        </div>

        {phase === "closed" && (
          <div className="mbook-closed-meta">
            <p className="mbook-closed-hint">표지를 톡 누르면 양옆으로 스르륵 펼쳐져요</p>
            <button className="mbook-open-cta" onClick={openBook}><span className="mbook-open-glow" aria-hidden="true" />이 책을 펼치기</button>
          </div>
        )}
      </div>
      )}

      {phase === "open" && spread === 0 && !flip && (
        <div className="mbook-controls">
          <button className="mbook-ctrl" disabled>← 이전 장</button>
          <button className="mbook-ctrl primary" onClick={() => goSpread(1, "next")}>다음 장 →</button>
        </div>
      )}
      {phase === "open" && (spread === 1 || spread === 2 || spread === 3) && !flip && (
        <div className="mbook-controls">
          <button className="mbook-ctrl" onClick={() => goSpread((spread - 1) as SpreadKey, "prev")}>← 이전 장</button>
          <span className="mbook-ctrl-note">선택하면 다음 장으로 넘어가요</span>
        </div>
      )}
      {/* 실제 역사 스프레드: 이전/다음 */}
      {phase === "open" && spread >= REAL_FIRST && spread <= REAL_LAST && !flip && (
        <div className="mbook-controls">
          <button className="mbook-ctrl" onClick={() => goSpread((spread - 1) as SpreadKey, "prev")}>← 이전 장</button>
          {spread < REAL_LAST
            ? <button className="mbook-ctrl primary" onClick={() => goSpread((spread + 1) as SpreadKey, "next")}>다음 장 →</button>
            : <button className="mbook-ctrl primary" onClick={() => goSpread(LAST_SPREAD, "next")}>마무리 →</button>
          }
        </div>
      )}
      {phase === "open" && spread === LAST_SPREAD && !flip && (
        <div className="mbook-controls">
          <button className="mbook-ctrl" onClick={() => goSpread(REAL_LAST, "prev")}>← 이전 장</button>
          <button className="mbook-ctrl primary" onClick={restart}>다시 펼치기 ↺</button>
        </div>
      )}

      <MeokdolChatLauncher context={event.title} eventId={event.id} />
    </div>
  );
}
