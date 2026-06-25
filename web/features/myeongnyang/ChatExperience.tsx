"use client";

/* eslint-disable @next/next/no-img-element */
// 이순신 명량해전 — 학년별(1~2 / 3~4 / 5~6) '만약에' 3선택 분기 체험 (채팅/대화 모드).
// 데이터·문구는 ./data 의 named export에서 가져오고, 4컷 이미지는 기존 트리와 같은
// /images/yi-myeongnyang-1597/{a}-{b}-{c}_panelN.png 규칙을 그대로 쓴다.

import { useEffect, useState } from "react";

import { MeokdolChatLauncher } from "@/components/mascots/MeokdolChatLauncher";

import {
  DATA,
  EFFECTS,
  EVENT_ID,
  GRADES,
  type GradeKey,
  Icon,
  REAL_ENDING,
  REAL_HISTORY_SECTIONS,
  REAL_PANELS,
  SOURCE,
  STEP_LABELS,
  STEP_STATS,
} from "./data";

const SILLOK_URL = "https://sillok.history.go.kr/id/kna_13011010_005";

// ── 문화재 렌즈 — 실제 4컷에 겹쳐 띄울 고증 포인트 ──────────
type HeritagePoint = {
  id: "portrait" | "panokseon" | "cannonball" | "diary";
  panelIndex: 0 | 1 | 2 | 3;
  // 4컷 패널 내부의 sparkle 위치(이미지 영역 기준 백분율)
  top: string;
  left: string;
  title: string;
  shortLabel: string;
  imageSrc: string;
  imageAlt: string;
  description: string;
  source: string;
};

const HERITAGE_POINTS: HeritagePoint[] = [
  {
    id: "portrait",
    panelIndex: 0,
    top: "30%",
    left: "28%",
    title: "이순신 장군 표준영정 (제1호)",
    shortLabel: "표준영정",
    imageSrc: "/images/heritage/portrait.jpg",
    imageAlt: "이순신 장군 표준영정",
    description:
      "방금 네가 본 멋진 장군님의 모습은 박물관에 있는 ‘표준영정’을 바탕으로 그린 거야. 나라에서 지정한 이순신 장군님의 공식 초상화란다!",
    source: "문화체육관광부 지정 표준영정 제1호 · 현충사관리소 소장",
  },
  {
    id: "panokseon",
    panelIndex: 1,
    top: "70%",
    left: "22%",
    title: "조선 수군의 핵심 — 판옥선",
    shortLabel: "판옥선",
    imageSrc: "/images/heritage/panokseon.jpg",
    imageAlt: "국립해양문화재연구소 판옥선 3D 복원 모형",
    description:
      "이 배의 진짜 이름은 ‘판옥선’이야! 2층 구조로 되어 있어서 위층에서는 군인들이 화살과 대포를 쏘고, 아래층에서는 격군들이 안전하게 노를 저을 수 있는 조선 수군의 핵심 무기였어.",
    source: "국립해양문화재연구소 · 전통군선(판옥선) 3D/2D 복원 데이터",
  },
  {
    id: "cannonball",
    panelIndex: 2,
    top: "44%",
    left: "66%",
    title: "울돌목 바다에서 건진 대포알",
    shortLabel: "조란환·총통",
    imageSrc: "/images/heritage/cannonball.jpg",
    imageAlt: "울돌목 해역 출토 조란환과 지자·현자총통",
    description:
      "실제 명량해전이 벌어졌던 울돌목 바다 깊은 곳을 조사했더니, 당시 사용했던 수많은 돌 대포알과 철 대포알(조란환)이 발견되었어! 진짜 역사의 흔적이지?",
    source: "국립해양문화재연구소 · 명량대첩 해역(울돌목) 출토 유물",
  },
  {
    id: "diary",
    panelIndex: 3,
    top: "56%",
    left: "48%",
    title: "국보 난중일기와 이충무공 장도",
    shortLabel: "난중일기·장도",
    imageSrc: "/images/heritage/diary.jpg",
    imageAlt: "국보 난중일기 원본과 이충무공 장도 실물",
    description:
      "장군님은 전쟁 중에도 매일 일기를 쓰셨는데, 그게 바로 국보 ‘난중일기’야. 그리고 장군님이 곁에 두고 보셨던 큰 칼에는 ‘바다에 맹세하니 어룡이 꿈틀거리고, 밝은 마음에 약속하니 산천이 아는구나’라는 멋진 시가 새겨져 있단다.",
    source: "현충사관리소 · 국보 난중일기 / 이충무공 장도",
  },
];

const HERITAGE_BY_PANEL: Record<number, HeritagePoint | undefined> = HERITAGE_POINTS.reduce(
  (acc, h) => {
    acc[h.panelIndex] = h;
    return acc;
  },
  {} as Record<number, HeritagePoint | undefined>,
);

const imgUrl = (file: string) => `/images/${EVENT_ID}/${file}`;

// ── 4컷 한 칸 ──────────────────────────────────────────
function CutImg({ pathKey, index, scene }: { pathKey: string; index: number; scene: string }) {
  const [err, setErr] = useState(false);
  const [ok, setOk] = useState(false);
  return (
    <div className="cut" style={{ animationDelay: `${index * 0.13}s` }}>
      <div className="num">{index + 1}</div>
      {err ? (
        <div className="ph">
          {scene}
          <br />
          <span style={{ opacity: 0.6 }}>(그림 준비 중)</span>
        </div>
      ) : (
        <img
          src={imgUrl(`${pathKey}_panel${index + 1}.png`)}
          alt={scene}
          className={ok ? "loaded" : ""}
          onLoad={() => setOk(true)}
          onError={() => setErr(true)}
        />
      )}
      {!err && <div className="cap">{scene}</div>}
    </div>
  );
}

// 실제 4컷용 — 4:3 이미지 + 말풍선 텍스트 오버레이
function RealCutImg({
  index,
  src,
  caption,
  bubble,
  lensOn,
  heritage,
  visited,
  onOpenHeritage,
}: {
  index: number;
  src: string;
  caption: string;
  bubble: string;
  lensOn: boolean;
  heritage?: HeritagePoint;
  visited: boolean;
  onOpenHeritage: (h: HeritagePoint) => void;
}) {
  const [err, setErr] = useState(false);
  const [ok, setOk] = useState(false);
  return (
    <div className="cut cut-real" style={{ animationDelay: `${index * 0.13}s` }}>
      <div className="num">{index + 1}</div>
      {err ? (
        <div className="ph">
          {caption}
          <br />
          <span style={{ opacity: 0.6 }}>(그림 준비 중)</span>
        </div>
      ) : (
        <img
          src={src}
          alt={bubble ? `${caption} — ${bubble}` : caption}
          className={ok ? "loaded" : ""}
          onLoad={() => setOk(true)}
          onError={() => setErr(true)}
        />
      )}
      {!err && lensOn && heritage && (
        <button
          type="button"
          className={`heritage-sparkle pos-${heritage.id} ${visited ? "visited" : "unvisited"}`}
          style={{ top: heritage.top, left: heritage.left }}
          onClick={() => onOpenHeritage(heritage)}
          aria-label={`${heritage.title}${visited ? " · 탐색 완료" : " — 실제 유물 보기"}`}
        >
          {!visited && <span className="heritage-sparkle-ring" aria-hidden="true" />}
          <span className="heritage-sparkle-core" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2.5l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.9z" />
            </svg>
          </span>
          {visited && (
            <span className="heritage-sparkle-check" aria-hidden="true">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          )}
        </button>
      )}
      {!err && <div className="cap">{caption}</div>}
    </div>
  );
}

// ── 문화재 모달 — 유물 사진 + 도슨트 텍스트 ──
function HeritageImage({ src, alt, label }: { src: string; alt: string; label: string }) {
  const [err, setErr] = useState(false);
  const [ok, setOk] = useState(false);
  if (err) {
    return (
      <div className="heritage-modal-img placeholder">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
        <span>{label} 유물 사진 준비 중</span>
      </div>
    );
  }
  return (
    <div className="heritage-modal-img">
      <img
        src={src}
        alt={alt}
        className={ok ? "loaded" : ""}
        onLoad={() => setOk(true)}
        onError={() => setErr(true)}
      />
    </div>
  );
}

function HeritageModal({
  heritage,
  onClose,
}: {
  heritage: HeritagePoint;
  onClose: () => void;
}) {
  return (
    <div
      className="heritage-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="heritage-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="heritage-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="heritage-modal-close"
          onClick={onClose}
          aria-label="닫기"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
        <span className="heritage-modal-tag">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2.5l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.9z" />
          </svg>
          실제 고증 유물
        </span>
        <HeritageImage
          src={heritage.imageSrc}
          alt={heritage.imageAlt}
          label={heritage.shortLabel}
        />
        <h3 id="heritage-modal-title" className="heritage-modal-title">
          {heritage.title}
        </h3>
        <p className="heritage-modal-desc">{heritage.description}</p>
        <div className="heritage-modal-source">출처 · {heritage.source}</div>
      </div>
    </div>
  );
}

// ── 학교 숙제용 탐구 보고서 ──────────────────────────────
type ReportInputs = { schoolName: string; studentName: string };

function ReportThumb({ src, label }: { src: string; label: string }) {
  const [err, setErr] = useState(false);
  if (err) {
    return <div className="report-heritage-thumb-ph">{label}<br />사진 준비 중</div>;
  }
  return <img src={src} alt={label} onError={() => setErr(true)} />;
}

function ReportSheet({
  inputs,
  setInputs,
  grade,
  questions,
  choices,
  realSummary,
  realSource,
  heritage,
  visited,
  imagineThumbs,
  realThumbs,
}: {
  inputs: ReportInputs;
  setInputs: (u: (prev: ReportInputs) => ReportInputs) => void;
  grade: string;
  questions: string[];
  choices: string[];
  realSummary: string;
  realSource: string;
  heritage: HeritagePoint[];
  visited: Set<string>;
  imagineThumbs: { src: string; caption: string }[];
  realThumbs: { src: string; caption: string }[];
}) {
  const visitedCount = heritage.filter((h) => visited.has(h.id)).length;
  const totalCount = heritage.length;
  const allDone = visitedCount === totalCount;
  return (
    <div className="report-sheet">
      <div className="report-stitch report-stitch-top" aria-hidden="true" />

      <header className="report-header">
        <div className="report-header-title">
          <span className="report-eyebrow">역사로 · 내가 만드는 조선 이야기</span>
          <h1 className="report-title">명량해전 지략 탐구 보고서</h1>
        </div>
        <div className="report-meta">
          <span className="report-pill">
            <span className="report-pill-label">학교</span>
            <input
              className="report-input wide"
              value={inputs.schoolName}
              onChange={(e) => setInputs((p) => ({ ...p, schoolName: e.target.value }))}
              placeholder="◯◯ 초등학교"
            />
          </span>
          <span className="report-pill">
            <span className="report-pill-label">학년</span>
            <span className="report-pill-static">{grade}</span>
          </span>
          <span className="report-pill">
            <span className="report-pill-label">이름</span>
            <input
              className="report-input"
              value={inputs.studentName}
              onChange={(e) => setInputs((p) => ({ ...p, studentName: e.target.value }))}
              placeholder="홍길동"
            />
          </span>
        </div>
      </header>

      <section className="report-grid">
        <div className="report-col report-col-imagine">
          <h3 className="report-col-title">나의 상상 역사 경로</h3>
          <div className="report-comic-mini" aria-label="상상 4컷">
            {imagineThumbs.map((t, i) => (
              <div key={i} className="report-comic-mini-cell">
                <ReportThumb src={t.src} label={`${i + 1}컷`} />
              </div>
            ))}
          </div>
          <ol className="report-path">
            {questions.map((q, i) => (
              <li key={i}>
                <span className="report-step-num">{i + 1}</span>
                <div className="report-step-body">
                  <div className="report-step-q">{q}</div>
                  <div className="report-step-a">→ {choices[i]}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="report-col report-col-real">
          <h3 className="report-col-title">조선왕조실록 리포트</h3>
          <div className="report-comic-mini" aria-label="실제 4컷">
            {realThumbs.map((t, i) => (
              <div key={i} className="report-comic-mini-cell">
                <ReportThumb src={t.src} label={`${i + 1}컷`} />
              </div>
            ))}
          </div>
          <p className="report-real-body">{realSummary}</p>
          <div className="report-source">출처 · {realSource}</div>
        </div>
      </section>

      <section className="report-heritage">
        <h3 className="report-col-title report-heritage-title">
          탐색 완료한 국가 문화재 도감
          <span className={"report-heritage-count" + (allDone ? " done" : "")}>
            {visitedCount} / {totalCount}
          </span>
        </h3>
        <div className="report-heritage-grid">
          {heritage.map((h) => {
            const isVisited = visited.has(h.id);
            return (
              <div
                key={h.id}
                className={"report-heritage-card" + (isVisited ? "" : " locked")}
              >
                <div className={"report-heritage-thumb" + (isVisited ? "" : " locked")}>
                  {isVisited ? (
                    <ReportThumb src={h.imageSrc} label={h.shortLabel} />
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  )}
                </div>
                <div className="report-heritage-meta">
                  <div className={"report-heritage-name" + (isVisited ? "" : " locked")}>
                    {isVisited ? h.title : "아직 탐색하지 않은 유물"}
                  </div>
                  <div className="report-heritage-src">
                    {isVisited ? h.source : "만화 속 반짝이를 눌러 확인해 보세요"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {!allDone && (
          <div className="report-heritage-hint">
            아직 {totalCount - visitedCount}개의 유물이 더 있어요. 만화 속 반짝이를 모두 눌러 보고서를 완성해 봐요.
          </div>
        )}
      </section>

      <footer className="report-footer">
        <h3 className="report-col-title">장군님께 배우는 나의 한 줄 다짐</h3>
        <div className="report-lines">
          <div className="report-line" />
          <div className="report-line" />
          <div className="report-line" />
        </div>
        <div className="report-watermark">
          본 보고서는 국가유산청 · 국립해양문화재연구소 등 대한민국 문화데이터 광장 Open API 고증 자료를 기반으로 출력되었습니다.
        </div>
      </footer>

      <div className="report-stitch report-stitch-bottom" aria-hidden="true" />
    </div>
  );
}

type Sub = "intro" | "play" | "comic" | "study";

// 실제 역사 공부 — 페이지 흐름 (0-3: 컷+본문, 4: 유물 4점, 5: 끝맺음)
const STUDY_PAGE_COUNT = 6;

// ── 동화책 — 상상 4컷 한 줄 (왼쪽 그림 + 오른쪽 본문) ───────
function BookRow({ index, pathKey, scene }: { index: number; pathKey: string; scene: string }) {
  const [err, setErr] = useState(false);
  const [ok, setOk] = useState(false);
  return (
    <div className="book-row" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="book-row-img">
        <span className="book-row-num">{index + 1}</span>
        {err ? (
          <div className="ph">
            {scene}
            <br />
            <span style={{ opacity: 0.6 }}>(그림 준비 중)</span>
          </div>
        ) : (
          <img
            src={imgUrl(`${pathKey}_panel${index + 1}.png`)}
            alt={scene}
            className={ok ? "loaded" : ""}
            onLoad={() => setOk(true)}
            onError={() => setErr(true)}
          />
        )}
      </div>
      <div className="book-row-text">
        <span className="book-row-chapter">{index + 1}장</span>
        <p className="book-row-scene">{scene}</p>
      </div>
    </div>
  );
}

// ── 실제 역사 공부 — 한 페이지 (왼쪽 실제컷 + 오른쪽 본문) ───
function StudyPageRow({
  index,
  src,
  caption,
  bubble,
  section,
}: {
  index: number;
  src: string;
  caption: string;
  bubble: string;
  section: { title: string; paragraphs: string[] };
}) {
  const [err, setErr] = useState(false);
  const [ok, setOk] = useState(false);
  return (
    <div className="study-row">
      <div className="study-row-img">
        <span className="book-row-num">{index + 1}</span>
        {err ? (
          <div className="ph">
            {caption}
            <br />
            <span style={{ opacity: 0.6 }}>(그림 준비 중)</span>
          </div>
        ) : (
          <img
            src={src}
            alt={`${caption} — ${bubble}`}
            className={ok ? "loaded" : ""}
            onLoad={() => setOk(true)}
            onError={() => setErr(true)}
          />
        )}
        <div className="cap">{caption}</div>
      </div>
      <div className="study-row-text">
        <span className="study-badge">실제 역사</span>
        <h3 className="study-history-title">{section.title}</h3>
        {section.paragraphs.map((p, j) => (
          <p key={j} className="study-history-p">
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}

type Props = {
  onHome: () => void;
  speak: (t: string) => void;
  stop: () => void;
  speaking: boolean;
};

export default function MyeongnyangChatExperience({ onHome, speak, stop, speaking }: Props) {
  const [grade, setGrade] = useState<GradeKey>("1-2");
  const [gradeOpen, setGradeOpen] = useState(false);
  const [sub, setSub] = useState<Sub>("intro");
  const [step, setStep] = useState(0); // 0,1,2 — 질문 단계
  const [picks, setPicks] = useState<number[]>([]);
  const [lensOn, setLensOn] = useState(true);
  const [coachShown, setCoachShown] = useState(true);
  const [activeHeritage, setActiveHeritage] = useState<HeritagePoint | null>(null);
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [reportOpen, setReportOpen] = useState(false);
  const [reportInputs, setReportInputs] = useState<ReportInputs>({ schoolName: "", studentName: "" });
  const [lastEffect, setLastEffect] = useState<string | null>(null);
  const [studyPage, setStudyPage] = useState(0);

  const data = DATA[grade];

  const visitedCount = HERITAGE_POINTS.filter((h) => visited.has(h.id)).length;
  const heritageTotal = HERITAGE_POINTS.length;
  const allExplored = visitedCount === heritageTotal;

  // 모달 열렸을 때 ESC로 닫기
  useEffect(() => {
    if (!activeHeritage) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveHeritage(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeHeritage]);

  // 코치마크 자동 닫기 (8초)
  useEffect(() => {
    if (!coachShown) return;
    const t = setTimeout(() => setCoachShown(false), 8000);
    return () => clearTimeout(t);
  }, [coachShown]);

  // 선택 결과 토스트 자동 닫기 (6초)
  useEffect(() => {
    if (!lastEffect) return;
    const t = setTimeout(() => setLastEffect(null), 6000);
    return () => clearTimeout(t);
  }, [lastEffect]);

  // 보고서 모달 ESC 닫기
  useEffect(() => {
    if (!reportOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setReportOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reportOpen]);

  function resetFlow(toIntro = false) {
    stop();
    setPicks([]);
    setStep(0);
    setLensOn(true);
    setCoachShown(true);
    setActiveHeritage(null);
    setVisited(new Set());
    setLastEffect(null);
    setStudyPage(0);
    setSub(toIntro ? "intro" : "play");
  }

  function startStudy() {
    stop();
    setStudyPage(0);
    setSub("study");
  }

  function openHeritage(h: HeritagePoint) {
    stop();
    setActiveHeritage(h);
    setCoachShown(false);
    setVisited((prev) => {
      if (prev.has(h.id)) return prev;
      const next = new Set(prev);
      next.add(h.id);
      return next;
    });
  }

  function pickGrade(g: GradeKey) {
    setGrade(g);
    setGradeOpen(false);
    // 문구가 학년별로 바뀌므로 진행 중이면 첫 질문부터 다시 시작
    if (sub === "play") {
      stop();
      setPicks([]);
      setStep(0);
    }
  }

  function choose(i: number) {
    stop();
    // 다음 화면 상단에 띄울 결과 카피 — 현재 step + 선택 인덱스로 결정
    const eff = EFFECTS[picks.length]?.[i] ?? null;
    setLastEffect(eff);
    const next = [...picks, i];
    if (next.length >= 3) {
      setPicks(next);
      setSub("comic");
    } else {
      setPicks(next);
      setStep(next.length);
    }
  }

  // ── 학년 선택 드롭다운 ──
  const gradeMeta = GRADES.find((g) => g.key === grade)!;
  const GradeSelector = (
    <div className="myn-grade">
      <button
        className="myn-grade-btn"
        onClick={() => setGradeOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={gradeOpen}
      >
        {gradeMeta.label}
        <span className="myn-grade-caret">{gradeOpen ? "▴" : "▾"}</span>
      </button>
      {gradeOpen && (
        <ul className="myn-grade-menu" role="listbox" aria-label="학년 선택">
          {GRADES.map((g) => (
            <li key={g.key} role="option" aria-selected={g.key === grade}>
              <button
                className={"myn-grade-item" + (g.key === grade ? " on" : "")}
                onClick={() => pickGrade(g.key)}
              >
                {g.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  // ── 인트로 ──
  if (sub === "intro") {
    return (
      <div className="screen myn-screen" key="myn-intro">
        <div className="panel-card myn-card">
          <div className="myn-play-top">
            <button className="back" onClick={onHome}>← 다른 이야기 고르기</button>
            {GradeSelector}
          </div>
          <div className="myn-hero">
            <div className="myn-thumb">
              <img src={imgUrl("_anchor.png")} alt="" />
              {HERITAGE_POINTS[0] && (
                <button
                  type="button"
                  className="myn-thumb-sparkle"
                  onClick={() => openHeritage(HERITAGE_POINTS[0])}
                  aria-label={`${HERITAGE_POINTS[0].title} — 실제 유물 보기`}
                >
                  <span className="heritage-sparkle-ring" aria-hidden="true" />
                  <span className="heritage-sparkle-core" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2.5l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.9z" />
                    </svg>
                  </span>
                </button>
              )}
            </div>
            <span className="myn-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              실제로 있었던 일
            </span>
            <h2 className="myn-title">이순신 장군의 명량해전</h2>
            <p className="myn-lead">{data.lead}</p>
            <button
              className={"btn-speak myn-read" + (speaking ? " playing" : "")}
              onClick={() => (speaking ? stop() : speak(data.lead))}
            >
              {speaking ? "멈추기" : "읽어줘"}
            </button>
            <div className="myn-source">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              출처 · {SOURCE}
            </div>
          </div>

          <button className="myn-cta" onClick={() => resetFlow(false)}>
            나의 &lsquo;만약에&rsquo; 시작하기
          </button>
          <button
            className="myn-ask"
            onClick={() => {
              /* 준비 중 — 지금은 아무 동작도 하지 않음 */
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" />
            </svg>
            이순신에게 직접 물어보기
          </button>
        </div>
        {activeHeritage && (
          <HeritageModal
            heritage={activeHeritage}
            onClose={() => setActiveHeritage(null)}
          />
        )}
        <MeokdolChatLauncher />
      </div>
    );
  }

  // ── 질문 ──
  if (sub === "play") {
    const q = data.questions[step];
    return (
      <div className="screen myn-screen" key={`myn-play-${grade}-${step}`}>
        <div className={`panel-card myn-card myn-card-step-${step}`}>
          <div className="myn-play-top">
            <button className="back" onClick={() => resetFlow(true)}>← 처음으로</button>
            {GradeSelector}
          </div>

          {lastEffect && (
            <div className="myn-effect-toast" role="status" key={`fx-${step}`}>
              <span className="myn-effect-text">
                <b>지난 결정의 결과</b> · {lastEffect}
              </span>
              <button
                type="button"
                className="myn-effect-close"
                onClick={() => setLastEffect(null)}
                aria-label="알림 닫기"
              >
                ×
              </button>
            </div>
          )}

          <div className="steps myn-steps" aria-label={`3단계 중 ${step + 1}번째`}>
            {[0, 1, 2].map((i) => (
              <span key={i} className={"dot" + (i < step ? " on" : i === step ? " now" : "")} />
            ))}
          </div>
          <p className="myn-q-count">{STEP_LABELS[step]}</p>

          {/* 전황 — step별로 적 함대 수와 상황이 변함 */}
          <div className="myn-stats-bar" aria-label="현재 전황" key={`stats-${step}`}>
            <span className="myn-stat">
              <span className="myn-stat-text"><b>우리</b> {STEP_STATS[step].ours}</span>
            </span>
            <span className="myn-stat-sep" aria-hidden="true">·</span>
            <span className="myn-stat enemy">
              <span className="myn-stat-text"><b>적</b> {STEP_STATS[step].enemy}</span>
            </span>
            <span className="myn-stat-sep" aria-hidden="true">·</span>
            <span className="myn-stat phase">
              <span className="myn-stat-text">{STEP_STATS[step].phase}</span>
            </span>
          </div>

          <h2 className="myn-q-prompt">
            {q.prompt}
            <button
              className={"btn-speak myn-read inline" + (speaking ? " playing" : "")}
              onClick={() => (speaking ? stop() : speak(q.prompt))}
            >
              {speaking ? "멈추기" : "읽어줘"}
            </button>
          </h2>

          <div className={"myn-q-grid" + (q.options.some((o) => o.desc) ? " text-first" : "")}>
            {q.options.map((o, i) => {
              const hasDesc = Boolean(o.desc);
              const listenText = o.desc ? `${o.label}. ${o.desc}` : o.label;
              return (
                <div
                  key={i}
                  className={"myn-opt tone-" + o.tone + (hasDesc ? " text-first" : "")}
                  style={{ animationDelay: `${0.06 + i * 0.07}s` }}
                >
                  <button className="myn-opt-main" onClick={() => choose(i)}>
                    <span className="myn-opt-icon">
                      <Icon name={o.icon} />
                    </span>
                    <span className="myn-opt-text">
                      <span className="myn-opt-label">{o.label}</span>
                      {hasDesc && <span className="myn-opt-desc">{o.desc}</span>}
                    </span>
                  </button>
                  <button
                    className="myn-listen"
                    onClick={() => (speaking ? stop() : speak(listenText))}
                    aria-label={`${o.label} 들어보기`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M11 5 6 9H2v6h4l5 4z" />
                      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                    </svg>
                    들어보기
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        <MeokdolChatLauncher />
      </div>
    );
  }

  // ── 4컷 결과 ──
  const pathKey = picks.join("-");
  const o1 = data.questions[0].options[picks[0]];
  const o2 = data.questions[1].options[picks[1]];
  const o3 = data.questions[2].options[picks[2]];
  const scenes = [o1.scene, o2.scene, data.climax, o3.scene];
  const ending = o3.ending ?? "";


  // ── 공유 모달들 (heritage + 보고서) ──
  const sharedModals = (
    <>
      {activeHeritage && (
        <HeritageModal
          heritage={activeHeritage}
          onClose={() => setActiveHeritage(null)}
        />
      )}
      {reportOpen && (
        <div
          className="report-modal-backdrop"
          role="presentation"
          onClick={() => setReportOpen(false)}
        >
          <div
            className="report-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-modal-heading"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="report-modal-close print-hide"
              onClick={() => setReportOpen(false)}
              aria-label="닫기"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
            <h2 id="report-modal-heading" className="report-modal-heading print-hide">
              탐구 보고서 미리보기 — 이름을 적고 인쇄·PDF 저장을 눌러요
            </h2>
            <div className="report-scroll">
              <ReportSheet
                inputs={reportInputs}
                setInputs={setReportInputs}
                grade={gradeMeta.label}
                questions={data.questions.map((q) => q.prompt)}
                choices={[o1.label, o2.label, o3.label]}
                realSummary={REAL_ENDING}
                realSource={SOURCE}
                heritage={HERITAGE_POINTS}
                visited={visited}
                imagineThumbs={scenes.map((scene, i) => ({
                  src: imgUrl(`${pathKey}_panel${i + 1}.png`),
                  caption: scene,
                }))}
                realThumbs={REAL_PANELS.map((p) => ({ src: p.src, caption: p.caption }))}
              />
            </div>
            <div className="report-actions print-hide">
              <button
                type="button"
                className="btn-report-cancel"
                onClick={() => setReportOpen(false)}
              >
                닫기
              </button>
              <button
                type="button"
                className="btn-report-print"
                onClick={() => window.print()}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                PDF로 저장 · 인쇄하기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // ── 동화책 (상상 4컷) — 양옆 레이아웃 ──────────────────
  if (sub === "comic") {
    return (
      <div className="screen myn-screen" key="myn-book">
        <div className="panel-card myn-card myn-book">
          <button className="back" onClick={() => resetFlow(true)}>← 처음으로</button>

          {lastEffect && (
            <div className="myn-effect-toast" role="status" key="fx-comic">
              <span className="myn-effect-icon" aria-hidden="true">⚡</span>
              <span className="myn-effect-text">
                <b>마지막 결정의 결과</b> · {lastEffect}
              </span>
              <button
                type="button"
                className="myn-effect-close"
                onClick={() => setLastEffect(null)}
                aria-label="알림 닫기"
              >
                ×
              </button>
            </div>
          )}

          <div className="book-head">
            <span className="myn-badge book-badge-imagine">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
              내가 만든 상상 이야기
            </span>
            <h2 className="book-title">상상 4컷 — 내가 그린 명량</h2>
            {ending && <p className="book-ending">{ending}</p>}
            <button
              className={"btn-speak book-speak" + (speaking ? " playing" : "")}
              onClick={() => {
                if (speaking) { stop(); return; }
                speak([ending, ...scenes.map((s, i) => `${i + 1}번 그림, ${s}`)].filter(Boolean).join(" "));
              }}
            >
              {speaking ? "멈추기" : "이야기 읽어주기"}
            </button>
          </div>

          <div className="book-grid">
            {scenes.map((s, i) => (
              <BookRow key={i} index={i} pathKey={pathKey} scene={s} />
            ))}
          </div>

          <div className="watermark book-watermark">
            이 이야기는 실제 역사 위에 상상을 더한 &lsquo;역사적 상상력 창작물&rsquo;이에요 · 출처 {SOURCE}
          </div>

          <div className="book-actions">
            <button
              className="book-btn book-btn-ghost"
              onClick={() => resetFlow(true)}
            >
              ← 다른 이야기 고르기
            </button>
            <button
              className="book-btn book-btn-primary"
              onClick={startStudy}
              aria-label="실제 역사 공부하러 가기"
            >
              실제 역사 공부하기 →
            </button>
          </div>
        </div>
        {sharedModals}
        <MeokdolChatLauncher />
      </div>
    );
  }

  // ── 실제 역사 공부하기 — 페이지 흐름 ────────────────────
  if (sub === "study") {
    const isPanelPage = studyPage < 4;
    const isHeritagePage = studyPage === 4;
    const isEndingPage = studyPage === 5;
    const studyTitle = isHeritagePage
      ? "명량해전의 진짜 유물"
      : isEndingPage
        ? "이야기를 마치며"
        : `실제 역사 · ${studyPage + 1}장`;

    return (
      <div className="screen myn-screen" key={`myn-study-${studyPage}`}>
        <div className="panel-card myn-card myn-study">
          <button className="back" onClick={() => setSub("comic")}>← 상상 이야기로 돌아가기</button>

          <div className="study-progress" aria-label={`${STUDY_PAGE_COUNT}장 중 ${studyPage + 1}번째`}>
            <span className="study-progress-eyebrow">실제 역사 공부하기</span>
            <div className="study-progress-dots">
              {Array.from({ length: STUDY_PAGE_COUNT }).map((_, i) => (
                <span
                  key={i}
                  className={"study-dot" + (i < studyPage ? " on" : i === studyPage ? " now" : "")}
                />
              ))}
            </div>
            <span className="study-progress-count">{studyPage + 1} / {STUDY_PAGE_COUNT}</span>
          </div>

          <h2 className="study-page-title">{studyTitle}</h2>

          {isPanelPage && (
            <StudyPageRow
              index={studyPage}
              src={REAL_PANELS[studyPage].src}
              caption={REAL_PANELS[studyPage].caption}
              bubble={REAL_PANELS[studyPage].bubble}
              section={REAL_HISTORY_SECTIONS[studyPage]}
            />
          )}

          {isHeritagePage && (
            <div className="study-heritage">
              <p className="study-heritage-lead">
                박물관 깊은 곳에 잠들어 있던 진짜 유물들이에요. 카드를 눌러 더 자세히 살펴봐요.
              </p>
              <div className="study-heritage-grid">
                {HERITAGE_POINTS.map((h) => {
                  const isVisited = visited.has(h.id);
                  return (
                    <button
                      key={h.id}
                      type="button"
                      className={"study-heritage-card" + (isVisited ? " visited" : "")}
                      onClick={() => openHeritage(h)}
                      aria-label={`${h.title} 자세히 보기`}
                    >
                      <div className="study-heritage-thumb">
                        <img src={h.imageSrc} alt={h.imageAlt} />
                      </div>
                      <div className="study-heritage-meta">
                        <div className="study-heritage-name">{h.title}</div>
                        <p className="study-heritage-desc">{h.description}</p>
                        <div className="study-heritage-src">출처 · {h.source}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {isEndingPage && (
            <div className="study-ending">
              <span className="myn-badge book-badge-real">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                실제 역사
              </span>
              <h3 className="study-ending-title">{REAL_ENDING}</h3>
              <div
                className={"myn-vs-comment " + (picks[0] === 0 ? "match" : "diff")}
                role="note"
              >
                {picks[0] === 0
                  ? "정답이야! 실제 이순신도 거센 물살을 핵심 전술로 삼았어. 너의 직관이 빛났어."
                  : `너는 '${o1.label}'을(를) 골랐지만, 실제 이순신은 거센 물살을 핵심 전술로 삼았어. 둘 다 멋진 작전이야.`}
              </div>
              <div className="study-ending-source">
                <a
                  href={SILLOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sillok-link"
                >
                  실록 원문에서 직접 확인하기 →
                </a>
                <span className="study-ending-src-txt">출처 · {SOURCE}</span>
              </div>
              <div className="study-ending-actions">
                <button
                  type="button"
                  className={"btn btn-report" + (allExplored ? " complete" : "")}
                  onClick={() => setReportOpen(true)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                    <path d="M9 14l2 2 4-4" />
                  </svg>
                  탐구 보고서 만들기
                  <span className="btn-report-progress">
                    {allExplored ? "✓ 완성" : `유물 ${visitedCount} / ${heritageTotal}`}
                  </span>
                </button>
                <div className="row">
                  <button className="btn btn-teal" onClick={() => resetFlow(false)}>
                    다른 선택으로 다시 만들기
                  </button>
                  <button className="btn btn-ghost" onClick={onHome}>
                    다른 이야기 고르기
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="study-nav">
            <button
              type="button"
              className="study-nav-btn"
              disabled={studyPage === 0}
              onClick={() => setStudyPage((p) => Math.max(0, p - 1))}
              aria-label="이전 장"
            >
              ← 이전 장
            </button>
            <span className="study-nav-counter">
              {studyPage + 1} / {STUDY_PAGE_COUNT}
            </span>
            <button
              type="button"
              className="study-nav-btn primary"
              disabled={studyPage === STUDY_PAGE_COUNT - 1}
              onClick={() => setStudyPage((p) => Math.min(STUDY_PAGE_COUNT - 1, p + 1))}
              aria-label="다음 장"
            >
              다음 장 →
            </button>
          </div>
        </div>
        {sharedModals}
        <MeokdolChatLauncher />
      </div>
    );
  }

  return null;
}
