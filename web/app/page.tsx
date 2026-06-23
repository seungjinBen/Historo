"use client";

/* eslint-disable @next/next/no-img-element */
// MVP 뷰어: public/ 의 정적 JSON·이미지를 직접 읽는다.
// 나중에 Spring Boot로 옮길 때는 아래 fetch 경로만 백엔드 주소로 바꾸면 된다.

import { Fragment, useEffect, useRef, useState } from "react";
import MyeongnyangExperience from "./myeongnyang-book";

// ── 초등학생 시선 우선순위 (선택모드 박스 그리드 정렬) ─────────────────
const KID_ORDER = [
  "yi-myeongnyang-1597",
  "sejong-hunmin-1446",
  "jangnyeongsil-jagyeokru-1434",
  "jeong-yakyong-geojunggi-1792",
  "kim-hongdo-genre-1780",
  "shin-saimdang-art-1551",
  "heojun-donguibogam-1613",
  "taejo-foundation-1392",
  "park-yeon-aak-1430",
  "gwanghaegun-junglib-1619",
];

// ── 홈 이야기 흐름 4단계 ─────────────────
const HERO_FLOW_STEPS: { label: string; sub: string }[] = [
  { label: "사실", sub: "실록에서 가져와요" },
  { label: "만약에", sub: "내가 골라요" },
  { label: "전개", sub: "이야기가 펼쳐져요" },
  { label: "결말", sub: "나만의 4컷 완성" },
];

// ── 연표 노드 미리보기 경로 (eventId → pathKey) ──────────────────────
const NODE_PREVIEW_PATH: Record<string, string> = {
  "sejong-hunmin-1446": "0-0-0",
  "yi-myeongnyang-1597": "0-0-0",
};

type Panel = { scene: string; sceneEn: string };
type StoryNode = {
  narration: string;
  choices?: { label: string; node: StoryNode }[];
  ending?: string;
  panels?: Panel[];
};
type Tree = { eventId: string; root: StoryNode };
type EventMeta = {
  id: string;
  heritageId?: string;
  title: string;
  year: number;
  king: string;
  era: string;
  category: string;
  status: "ready" | "coming" | "heritage";
  source: string;
  sillokUrl?: string | null;
  factCard: string;
  character?: { name: string; appearance?: string } | null;
};

type HeritageItem = {
  id: string;
  name: string;
  imagePath: string;
  docentText: string;
  source: string;
  sourceUrl: string;
};
type HeritageEvent = {
  id: string;
  title: string;
  year: string;
  heritageItems: HeritageItem[];
};

type KidStory = {
  eventId: string;
  source: string;
  sillokUrl: string | null;
  fromSillok: boolean;
  kidStory: string;
  funFacts: string[];
};

const imgUrl = (eventId: string, file: string) => `/images/${eventId}/${file}`;

// 트리의 선택 단계 수(깊이) = 진행 점 개수
function treeDepth(node: StoryNode): number {
  if (!node.choices || node.choices.length === 0) return 0;
  return 1 + Math.max(...node.choices.map((c) => treeDepth(c.node)));
}

function Steps({ current, total }: { current: number; total: number }) {
  return (
    <div className="steps" aria-label={`${total}단계 중 ${current + 1}번째`}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={"dot" + (i < current ? " on" : i === current ? " now" : "")} />
      ))}
    </div>
  );
}

function Thumb({ eventId }: { eventId: string }) {
  const [err, setErr] = useState(false);
  const [ok, setOk] = useState(false);
  if (err) return <div className="ph">그림 준비 중</div>;
  return (
    <img
      src={imgUrl(eventId, "_anchor.png")}
      alt=""
      className={ok ? "loaded" : ""}
      onLoad={() => setOk(true)}
      onError={() => setErr(true)}
    />
  );
}

function Cut({ eventId, pathKey, index, scene }: { eventId: string; pathKey: string; index: number; scene: string }) {
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
          src={imgUrl(eventId, `${pathKey}_panel${index + 1}.png`)}
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

function EventBoxThumb({ ev, heritage }: { ev: EventMeta; heritage: HeritageEvent | null }) {
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState(false);
  if (ev.status === "coming") {
    return (
      <div className="event-thumb event-thumb-locked" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
    );
  }
  const src = ev.status === "ready"
    ? `/images/${ev.id}/_anchor.png`
    : (heritage?.heritageItems?.[0]?.imagePath ?? null);
  if (!src || err) {
    return (
      <div className="event-thumb">
        <div className="event-thumb-ph">그림 준비 중</div>
      </div>
    );
  }
  return (
    <div className="event-thumb">
      <img
        src={src}
        alt=""
        className={ok ? "loaded" : ""}
        onLoad={() => setOk(true)}
        onError={() => setErr(true)}
      />
    </div>
  );
}

function SejongMascot() {
  return (
    <svg
      className="sejong-svg"
      viewBox="0 0 240 260"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="귀여운 세종대왕 마스코트"
    >
      <defs>
        <radialGradient id="haloGrad" cx="50%" cy="42%" r="55%">
          <stop offset="0%" stopColor="#FBE5A4" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FBE5A4" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="robeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D65249" />
          <stop offset="100%" stopColor="#A0352C" />
        </linearGradient>
        <linearGradient id="faceGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE7C8" />
          <stop offset="100%" stopColor="#F5C99F" />
        </linearGradient>
      </defs>

      {/* 후광 */}
      <circle cx="120" cy="125" r="115" fill="url(#haloGrad)" />

      {/* 곤룡포 — 본체 */}
      <path
        d="M 55 235 L 55 200 Q 55 168 80 158 L 160 158 Q 185 168 185 200 L 185 235 Z"
        fill="url(#robeGrad)"
      />
      {/* 곤룡포 — 깃 V */}
      <path d="M 95 158 L 120 195 L 145 158 Z" fill="#FFF8EC" />
      <path
        d="M 92 159 L 120 200 L 148 159"
        stroke="#C9882A"
        strokeWidth="2.5"
        fill="none"
        strokeLinejoin="round"
      />
      {/* 용 문양 (단순화) */}
      <circle cx="120" cy="215" r="13" fill="#FBE5A4" stroke="#C9882A" strokeWidth="2" />
      <path d="M 113 215 Q 120 208 127 215 Q 120 222 113 215 Z" fill="#C8453B" />
      <circle cx="120" cy="215" r="2" fill="#1A1612" />
      {/* 소매 */}
      <ellipse cx="58" cy="200" rx="14" ry="24" fill="url(#robeGrad)" />
      <ellipse cx="182" cy="200" rx="14" ry="24" fill="url(#robeGrad)" />
      <ellipse cx="58" cy="222" rx="11" ry="6" fill="#FFF8EC" />
      <ellipse cx="182" cy="222" rx="11" ry="6" fill="#FFF8EC" />

      {/* 귀 */}
      <ellipse cx="74" cy="118" rx="6" ry="9" fill="url(#faceGrad)" />
      <ellipse cx="166" cy="118" rx="6" ry="9" fill="url(#faceGrad)" />

      {/* 얼굴 */}
      <ellipse cx="120" cy="122" rx="47" ry="52" fill="url(#faceGrad)" />

      {/* 익선관 — 양옆 날개(사모) */}
      <ellipse cx="63" cy="83" rx="23" ry="9" fill="#1A1612" transform="rotate(-10 63 83)" />
      <ellipse cx="177" cy="83" rx="23" ry="9" fill="#1A1612" transform="rotate(10 177 83)" />
      <circle cx="52" cy="80" r="2.6" fill="#C9882A" />
      <circle cx="188" cy="80" r="2.6" fill="#C9882A" />

      {/* 익선관 — 본체 */}
      <path
        d="M 70 88 Q 66 50 120 42 Q 174 50 170 88 L 170 96 Q 120 108 70 96 Z"
        fill="#1A1612"
      />
      {/* 익선관 — 상단 구슬 */}
      <ellipse cx="120" cy="42" rx="7" ry="3" fill="#1A1612" />
      <circle cx="120" cy="36" r="4.5" fill="#C9882A" />
      <circle cx="119" cy="35" r="1.5" fill="#FBE5A4" />

      {/* 눈썹 */}
      <path
        d="M 90 108 Q 99 104 108 108"
        stroke="#2B221A"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 132 108 Q 141 104 150 108"
        stroke="#2B221A"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* 눈 — 행복한 곡선 */}
      <path
        d="M 92 121 Q 99 115 106 121"
        stroke="#1A1612"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 134 121 Q 141 115 148 121"
        stroke="#1A1612"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* 볼터치 */}
      <ellipse cx="84" cy="140" rx="7" ry="4.5" fill="#F5A6A0" opacity="0.6" />
      <ellipse cx="156" cy="140" rx="7" ry="4.5" fill="#F5A6A0" opacity="0.6" />

      {/* 입 */}
      <path
        d="M 110 146 Q 120 154 130 146"
        stroke="#1A1612"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* 수염 */}
      <path
        d="M 102 160 Q 120 174 138 160 Q 130 168 120 169 Q 110 168 102 160 Z"
        fill="#8B7E70"
        opacity="0.5"
      />
    </svg>
  );
}

function MeokdolMascot() {
  return (
    <svg
      className="meokdol-svg"
      viewBox="0 0 240 260"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="귀여운 먹돌이 마스코트"
    >
      <defs>
        <radialGradient id="meokHalo" cx="50%" cy="44%" r="55%">
          <stop offset="0%" stopColor="#FBE5A4" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FBE5A4" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="meokBody" cx="34%" cy="28%" r="85%">
          <stop offset="0%" stopColor="#E36057" />
          <stop offset="55%" stopColor="#C8453B" />
          <stop offset="100%" stopColor="#8A2A22" />
        </radialGradient>
        <radialGradient id="meokShine" cx="35%" cy="22%" r="32%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 후광 */}
      <circle cx="120" cy="140" r="115" fill="url(#meokHalo)" />

      {/* 붓 — 머리 뒤 */}
      <g transform="translate(160 25) rotate(18)">
        <rect x="-4" y="0" width="8" height="62" rx="2" fill="#8B5A2B" />
        <path d="M -7 0 L 7 0 L 5 -14 L -5 -14 Z" fill="#1A1612" />
        <path d="M -5 -14 Q 0 -26 5 -14 Z" fill="#1A1612" />
        <ellipse cx="0" cy="62" rx="6" ry="4" fill="#C9882A" />
      </g>

      {/* 본체 — 동글한 먹덩이 */}
      <ellipse cx="120" cy="148" rx="90" ry="92" fill="url(#meokBody)" />
      <ellipse cx="120" cy="148" rx="90" ry="92" fill="url(#meokShine)" />

      {/* 아래 그림자 */}
      <ellipse cx="120" cy="232" rx="64" ry="10" fill="#1A1612" opacity="0.18" />

      {/* 눈 — 큰 호 모양 (행복) */}
      <path
        d="M 86 128 Q 98 116 110 128"
        stroke="#1A1612"
        strokeWidth="4.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 130 128 Q 142 116 154 128"
        stroke="#1A1612"
        strokeWidth="4.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* 볼터치 */}
      <ellipse cx="76" cy="160" rx="10" ry="6" fill="#FBE5A4" opacity="0.55" />
      <ellipse cx="164" cy="160" rx="10" ry="6" fill="#FBE5A4" opacity="0.55" />

      {/* 입 — 큰 미소 */}
      <path
        d="M 100 168 Q 120 188 140 168"
        stroke="#1A1612"
        strokeWidth="3.8"
        fill="#5C2018"
        strokeLinecap="round"
      />
      {/* 혀 살짝 */}
      <path d="M 115 178 Q 120 183 125 178 Q 122 183 120 184 Q 118 183 115 178 Z" fill="#F5A6A0" opacity="0.85" />

      {/* "먹" 글자 — 가슴 부분 */}
      <text
        x="120"
        y="220"
        textAnchor="middle"
        fill="#FBE5A4"
        fontSize="24"
        fontFamily="'Black Han Sans', sans-serif"
        opacity="0.9"
      >
        먹
      </text>

      {/* 반짝이 */}
      <g transform="translate(202 78)">
        <path
          d="M 0 -11 L 2.5 -2.5 L 11 0 L 2.5 2.5 L 0 11 L -2.5 2.5 L -11 0 L -2.5 -2.5 Z"
          fill="#FBE5A4"
        />
      </g>
      <circle cx="44" cy="100" r="3" fill="#FBE5A4" opacity="0.7" />
    </svg>
  );
}

function MiniPanel({ eventId, pathKey, n }: { eventId: string; pathKey: string; n: number }) {
  const [err, setErr] = useState(false);
  const [ok, setOk] = useState(false);
  return (
    <div className="mini-panel">
      {err ? (
        <div className="mini-ph">{n}</div>
      ) : (
        <img
          src={imgUrl(eventId, `${pathKey}_panel${n}.png`)}
          alt={`${n}번 컷`}
          className={ok ? "loaded" : ""}
          onLoad={() => setOk(true)}
          onError={() => setErr(true)}
        />
      )}
    </div>
  );
}

function HeritageItemCard({ item }: { item: HeritageItem }) {
  const [err, setErr] = useState(false);
  const [ok, setOk] = useState(false);
  return (
    <div className="heritage-item">
      <div className="heritage-thumb">
        {err ? (
          <div className="heritage-thumb-ph">유물 이미지 준비 중</div>
        ) : (
          <img
            src={item.imagePath}
            alt={item.name}
            className={ok ? "loaded" : ""}
            onLoad={() => setOk(true)}
            onError={() => setErr(true)}
          />
        )}
      </div>
      <div className="heritage-body">
        <div className="heritage-name">{item.name}</div>
        <p className="heritage-docent">{item.docentText}</p>
        <a
          className="heritage-source"
          href={item.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          출처 · {item.source} →
        </a>
      </div>
    </div>
  );
}

function SpeakBtn({
  text,
  speak,
  stop,
  speaking,
}: {
  text: string;
  speak: (t: string) => void;
  stop: () => void;
  speaking: boolean;
}) {
  return (
    <button
      className={"btn-speak" + (speaking ? " playing" : "")}
      onClick={() => (speaking ? stop() : speak(text))}
      aria-label={speaking ? "읽기 멈추기" : "텍스트 읽어주기"}
    >
      {speaking ? "멈추기" : "읽어주기"}
    </button>
  );
}

type Screen = "home" | "intro" | "play" | "comic" | "myeongnyang" | "chat" | "about";
type Mode = "select" | "chat";

function findFirstPanelPath(root: StoryNode): { node: StoryNode; path: number[] } | null {
  const dfs = (n: StoryNode, p: number[]): { node: StoryNode; path: number[] } | null => {
    if (Array.isArray(n.panels)) return { node: n, path: p };
    if (!n.choices) return null;
    for (let i = 0; i < n.choices.length; i++) {
      const r = dfs(n.choices[i].node, [...p, i]);
      if (r) return r;
    }
    return null;
  };
  return dfs(root, []);
}

export default function Page() {
  const [screen, setScreen] = useState<Screen>("home");
  const [mode, setMode] = useState<Mode>("select");
  const [events, setEvents] = useState<EventMeta[] | null>(null);
  const [event, setEvent] = useState<EventMeta | null>(null);
  const [tree, setTree] = useState<Tree | null>(null);
  const [node, setNode] = useState<StoryNode | null>(null);
  const [path, setPath] = useState<number[]>([]);
  const [chatDraft, setChatDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  // TTS 상태
  const [speaking, setSpeaking] = useState(false);
  const [autoRead, setAutoRead] = useState(false);
  const koVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  const [previewEventId, setPreviewEventId] = useState<string | null>(null);
  const [heritageOpenEventId, setHeritageOpenEventId] = useState<string | null>(null);
  const [heritage, setHeritage] = useState<Record<string, HeritageEvent> | null>(null);

  const [kidStoryOpen, setKidStoryOpen] = useState(false);
  const [kidStoryData, setKidStoryData] = useState<KidStory | null>(null);
  const [kidStoryLoading, setKidStoryLoading] = useState(false);
  const [kidStoryError, setKidStoryError] = useState(false);

  useEffect(() => {
    fetch("/data/events.json")
      .then((r) => r.json())
      .then((d) => setEvents(d.events))
      .catch(() => setError("data/events.json 을 불러오지 못했어요. public/data/ 에 복사했는지 확인해 주세요."));
  }, []);

  useEffect(() => {
    fetch("/heritage.json")
      .then((r) => r.json())
      .then((d: { events: HeritageEvent[] }) => {
        const map: Record<string, HeritageEvent> = {};
        d.events.forEach((e) => { map[e.id] = e; });
        setHeritage(map);
      })
      .catch(() => {});
  }, []);

  // 한국어 음성 로드: getVoices()는 비동기로 채워지므로 voiceschanged를 기다림
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const load = () => {
      const vs = window.speechSynthesis.getVoices();
      koVoiceRef.current =
        vs.find((v) => v.lang === "ko-KR") ??
        vs.find((v) => v.lang.startsWith("ko")) ??
        null;
    };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", load);
      window.speechSynthesis.cancel();
    };
  }, []);

  // ESC 키로 미리보기·유물 패널 닫기
  useEffect(() => {
    if (!previewEventId && !heritageOpenEventId) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPreviewEventId(null);
        setHeritageOpenEventId(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [previewEventId, heritageOpenEventId]);

  // 화면 전환 시 이전 발화 중단 + kidStory 초기화
  useEffect(() => {
    setKidStoryOpen(false);
    setKidStoryData(null);
    setKidStoryLoading(false);
    setKidStoryError(false);
    return () => {
      window.speechSynthesis?.cancel();
      setSpeaking(false);
    };
  }, [screen]);

  // autoRead: play 화면에서 narration이 바뀔 때 자동 읽기
  useEffect(() => {
    if (!autoRead || screen !== "play" || !node?.narration) return;
    doSpeak(node.narration);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node, autoRead]);

  function doSpeak(text: string) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ko-KR";
    u.rate = 0.95;
    if (koVoiceRef.current) u.voice = koVoiceRef.current;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }

  function doStop() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  function handleKidStoryToggle() {
    const next = !kidStoryOpen;
    setKidStoryOpen(next);
    if (next && event && !kidStoryData && !kidStoryLoading) {
      setKidStoryLoading(true);
      setKidStoryError(false);
      fetch(`/kidstory/${event.id}.json`)
        .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
        .then((d: KidStory) => { setKidStoryData(d); setKidStoryLoading(false); })
        .catch(() => { setKidStoryLoading(false); setKidStoryError(true); });
    }
  }

  async function openEvent(ev: EventMeta) {
    // 명량해전은 동화책 모드(전용 체험)로 바로 진입
    if (ev.id === "yi-myeongnyang-1597") {
      setEvent(ev);
      setScreen("myeongnyang");
      return;
    }
    try {
      const t: Tree = await fetch(`/trees/${ev.id}.json`).then((r) => r.json());
      setEvent(ev);
      setTree(t);
      setNode(t.root);
      setPath([]);
      setScreen("intro");
    } catch {
      setError(`트리를 불러오지 못했어요: /trees/${ev.id}.json`);
    }
  }

  function openChat() {
    setChatDraft("");
    setEvent(null);
    setTree(null);
    setNode(null);
    setPath([]);
    setScreen("chat");
  }

  async function chatSend() {
    if (!events) return;
    const ev = events.find((e) => e.id === "yi-myeongnyang-1597") ?? events.find((e) => e.status === "ready");
    if (!ev) return;
    try {
      const t: Tree = await fetch(`/trees/${ev.id}.json`).then((r) => r.json());
      const found = findFirstPanelPath(t.root);
      if (!found) return;
      setEvent(ev);
      setTree(t);
      setPath(found.path);
      setNode(found.node);
      setChatDraft("");
      setScreen("comic");
    } catch {
      setError(`트리를 불러오지 못했어요: /trees/${ev.id}.json`);
    }
  }

  function scrollToTarget(id: string) {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function choose(i: number) {
    if (!node?.choices) return;
    const next = node.choices[i].node;
    setPath([...path, i]);
    setNode(next);
    setScreen(Array.isArray(next.panels) ? "comic" : "play");
  }

  const replay = () => {
    if (!tree) return;
    setNode(tree.root);
    setPath([]);
    setScreen("play");
  };
  const home = () => {
    setScreen("home");
    setEvent(null);
    setTree(null);
    setNode(null);
    setPath([]);
    setPreviewEventId(null);
    setHeritageOpenEventId(null);
  };

  if (error) return <div className="wrap"><div className="panel-card center">{error}</div></div>;
  if (!events) return <div className="wrap"><div className="center">불러오는 중…</div></div>;

  const totalSteps = tree ? treeDepth(tree.root) : 0;

  return (
    <div className="wrap">
      <div className="top">
        <button
          className="brand brand-link"
          onClick={home}
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
            onClick={() => setScreen("about")}
            aria-label="역사로 소개"
          >
            역사로
          </button>
          <button
            className={"btn-auto-read" + (autoRead ? " on" : "")}
            onClick={() => setAutoRead((r) => !r)}
            aria-pressed={autoRead}
            aria-label={autoRead ? "자동 읽어주기 끄기" : "자동 읽어주기 켜기"}
          >
            {autoRead ? "자동 읽기 켬" : "자동 읽기"}
          </button>
        </div>
      </div>

      {screen === "home" && (
        <div className="screen" key="home">
          <div className="home-modebar">
            <div className="mode-toggle" role="tablist" aria-label="이야기 모드 선택">
              <button
                role="tab"
                aria-selected={mode === "select"}
                className={"mode-toggle-btn" + (mode === "select" ? " active" : "")}
                onClick={() => setMode("select")}
              >
                선택모드
              </button>
              <button
                role="tab"
                aria-selected={mode === "chat"}
                className={"mode-toggle-btn chat" + (mode === "chat" ? " active" : "")}
                onClick={() => setMode("chat")}
              >
                채팅모드
              </button>
            </div>
          </div>
          {/* ════════ SECTION 1 — 앱 소개 + 마스코트 ════════ */}
          <section className="home-section home-hero-section">
            <div className="hero">
              <span className="hero-eyebrow">조선 1392 — 1897</span>
              <h1 className="hero-title">
                내가 만드는 <span className="hero-title-accent">조선 이야기</span>
              </h1>
              <p className="hero-sub">
                역사를 외우지 마세요. 역사 속에 들어가 나만의 이야기를 만들어봐요.
                <br />오늘은 어떤 <em>&lsquo;만약에&rsquo;</em>부터 시작할까요?
              </p>
            </div>

            <div
              className={"hero-mascot " + (mode === "chat" ? "hero-mascot-chat" : "hero-mascot-select")}
              aria-label={mode === "chat" ? "먹돌이와 만드는 이야기 흐름" : "세종대왕과 만드는 이야기 흐름"}
            >
              <div className="hero-mascot-figure" aria-hidden="true">
                {mode === "chat" ? <MeokdolMascot /> : <SejongMascot />}
                <span className="hero-mascot-name">{mode === "chat" ? "먹돌이" : "세종대왕"}</span>
              </div>
              <div className="hero-mascot-body">
                <div className="hero-mascot-bubble">
                  <span className="hero-mascot-bubble-tag">이야기 흐름</span>
                  <p className="hero-mascot-bubble-text">
                    {mode === "chat"
                      ? "안녕! 나는 먹돌이야. 너에게 딱 맞는 이야기를 같이 찾아, 4컷 그림책으로 만들어줄게."
                      : "실록 속 진짜 ‘사실’에서 시작해, 내가 고른 ‘만약에’로 4컷 그림책이 완성돼요."}
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
                <div className="hero-cta-row">
                  {mode === "select" ? (
                    <button
                      className="hero-cta primary"
                      onClick={() => scrollToTarget("events-section")}
                      aria-label="사건 박스로 이동해 나의 이야기 만들기"
                    >
                      나의 이야기 만들기 →
                    </button>
                  ) : (
                    <>
                      <button
                        className="hero-cta primary chat"
                        onClick={openChat}
                        aria-label="먹돌이와 채팅 시작하기"
                      >
                        먹돌이와 채팅 시작하기 →
                      </button>
                      <button
                        className="hero-cta secondary"
                        onClick={() => scrollToTarget("study-timeline-section")}
                        aria-label="역사 공부 먼저하기 — 연표로 이동"
                      >
                        역사 공부 먼저하기?
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ════════ SECTION 2 (채팅) — 이야기 재료 모으기 ════════ */}
          {mode === "chat" && (
            <section className="home-section">
              <div className="section-header">
                <span className="section-header-eyebrow">이야기 재료 모으기</span>
                <h2 className="section-header-title">먹돌이와 함께 4단계로 완성해요</h2>
                <p className="section-header-sub">관심사 한 마디에서 시작해, 함께 줄거리를 좁혀가요.</p>
              </div>
              <div className="story-flow" aria-label="이야기 만드는 4단계">
                <ol className="story-flow-steps">
                  <li className="flow-step">
                    <span className="flow-step-num">1</span>
                    <div className="flow-step-name">관심사 찾기</div>
                    <div className="flow-step-sample">
                      <span className="sample-line">바다·전쟁 영웅</span>
                    </div>
                  </li>
                  <li className="flow-step">
                    <span className="flow-step-num">2</span>
                    <div className="flow-step-name">만약에 선택</div>
                    <div className="flow-step-sample">
                      <span className="sample-line"><b>사건</b>이순신 명량해전</span>
                      <span className="sample-line"><b>인물</b>이순신</span>
                    </div>
                  </li>
                  <li className="flow-step">
                    <span className="flow-step-num">3</span>
                    <div className="flow-step-name">줄거리 완성</div>
                    <div className="flow-step-sample">
                      <span className="sample-line"><b>1장</b>후퇴해 때를 기다린다</span>
                      <span className="sample-line"><b>2장</b>물살에 배를 맡긴다</span>
                      <span className="sample-line"><b>3장</b>…</span>
                    </div>
                  </li>
                  <li className="flow-step">
                    <span className="flow-step-num">4</span>
                    <div className="flow-step-name">그림책 만들기</div>
                    <div className="flow-step-sample">
                      <span className="sample-line">나만의 4컷 완성</span>
                    </div>
                  </li>
                </ol>
              </div>
            </section>
          )}

          {/* ════════ SECTION 2 (선택) — 오늘의 이야기 + 핵심 기능 ════════ */}
          {mode === "select" && (
            <section className="home-section">
              <div className="section-header">
                <span className="section-header-eyebrow">오늘의 이야기</span>
                <h2 className="section-header-title">먼저 한 편, 같이 만들어볼까요?</h2>
                <p className="section-header-sub">추천 사건으로 4컷 그림책 흐름을 익혀보세요.</p>
              </div>
              <div className="myn-feature">
                <div className="myn-feature-thumb">
                  <Thumb eventId="yi-myeongnyang-1597" />
                </div>
                <div className="myn-feature-body">
                  <span className="myn-feature-tag">오늘의 이야기</span>
                  <div className="myn-feature-title">이순신 장군의 명량해전</div>
                  <p className="myn-feature-desc">
                    남은 배는 단 몇 척. 내가 이순신이라면 어떻게 했을까요? 학년에 맞춰 &lsquo;만약에&rsquo;를 골라 나만의 4컷 이야기를 만들어요.
                  </p>
                  <button
                    className="myn-feature-btn"
                    onClick={() => setScreen("myeongnyang")}
                    aria-label="이순신 장군의 명량해전 이야기 만들기"
                  >
                    이야기 만들기 →
                  </button>
                </div>
              </div>
              <div className="feat-grid" role="list">
                <div className="feat-card" role="listitem">
                  <svg className="feat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                  <div className="feat-title">실록을 쉬운 이야기로</div>
                  <div className="feat-desc">700년 전 실록 기록을 AI가 아이 눈높이로 풀어줘요</div>
                </div>
                <div className="feat-card" role="listitem">
                  <svg className="feat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                  </svg>
                  <div className="feat-title">내가 만드는 만약에</div>
                  <div className="feat-desc">&lsquo;만약에&rsquo;를 골라 나만의 역사 4컷을 창작해요</div>
                </div>
                <div className="feat-card" role="listitem">
                  <svg className="feat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <div className="feat-title">누구나 함께</div>
                  <div className="feat-desc">읽어주기로 글이 어려운 아이도 함께, 사건은 계속 늘어나요</div>
                </div>
              </div>
            </section>
          )}

          {/* ════════ SECTION 3 — 사건 박스 / 역사의 길 ════════ */}
          {mode === "select" ? (
            <section className="home-section" id="events-section">
              <div className="section-header">
                <span className="section-header-eyebrow">사건 박스</span>
                <h2 className="section-header-title">좋아하는 이야기부터 골라봐요</h2>
                <p className="section-header-sub">관심 가는 사건의 박스를 눌러 4컷 이야기를 만들어보세요.</p>
              </div>
              <div className="event-grid">
                {events
                  .slice()
                  .sort((a, b) => {
                    const ai = KID_ORDER.indexOf(a.id);
                    const bi = KID_ORDER.indexOf(b.id);
                    if (ai === -1 && bi === -1) return a.year - b.year;
                    if (ai === -1) return 1;
                    if (bi === -1) return -1;
                    return ai - bi;
                  })
                  .map((ev, idx) => {
                    const heritageData = ev.heritageId && heritage ? heritage[ev.heritageId] : null;
                    const heritageOpen = heritageOpenEventId === ev.id;
                    return (
                      <Fragment key={ev.id}>
                        <div
                          className={"event-box " + ev.status + (heritageOpen ? " heritage-open" : "")}
                          style={{ animationDelay: `${idx * 0.04}s` }}
                        >
                          <EventBoxThumb ev={ev} heritage={heritageData} />
                          <div className="event-body">
                            <div className="event-meta">
                              <span className="event-year">{ev.year}</span>
                              <span className="event-king">{ev.king}</span>
                              <span className="event-cat">{ev.category}</span>
                            </div>
                            <div className="event-title">{ev.title}</div>
                            {ev.status !== "coming" && (
                              <p className="event-fact">{ev.factCard}</p>
                            )}
                            <div className="event-actions">
                              {ev.status === "ready" && (
                                <button
                                  className="event-cta"
                                  onClick={() => openEvent(ev)}
                                  aria-label={`${ev.title} 이야기 만들기`}
                                >
                                  이야기 만들기 →
                                </button>
                              )}
                              {ev.status === "heritage" && heritageData && (
                                <button
                                  className="event-cta event-cta-heritage"
                                  onClick={() => setHeritageOpenEventId((id) => id === ev.id ? null : ev.id)}
                                  aria-expanded={heritageOpen}
                                  aria-controls={`event-heritage-${ev.id}`}
                                  aria-label={`${ev.title} 실제 유물 ${heritageData.heritageItems.length}점 보기`}
                                >
                                  실제 유물 보러 가기 →
                                </button>
                              )}
                              {ev.status === "ready" && heritageData && (
                                <button
                                  className="event-sub"
                                  onClick={() => setHeritageOpenEventId((id) => id === ev.id ? null : ev.id)}
                                  aria-expanded={heritageOpen}
                                  aria-controls={`event-heritage-${ev.id}`}
                                  aria-label={`${ev.title} 실제 유물 ${heritageData.heritageItems.length}점 보기`}
                                >
                                  실제 유물 보기
                                </button>
                              )}
                              {ev.status === "coming" && (
                                <span className="event-lock">곧 만나요</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {heritageData && heritageOpen && (
                          <div
                            className="event-grid-peek"
                            id={`event-heritage-${ev.id}`}
                            role="region"
                            aria-label={`${ev.title} 관련 유물`}
                          >
                            <div className="heritage-peek-head">
                              <span className="heritage-peek-eyebrow">실제 유물 · {heritageData.heritageItems.length}점</span>
                              <span className="heritage-peek-title">{heritageData.title}</span>
                            </div>
                            <div className="heritage-grid">
                              {heritageData.heritageItems.map((item) => (
                                <HeritageItemCard key={item.id} item={item} />
                              ))}
                            </div>
                          </div>
                        )}
                      </Fragment>
                    );
                  })}
              </div>
            </section>
          ) : (
            <section className="home-section" id="study-timeline-section">
              <div className="section-header">
                <span className="section-header-eyebrow" id="study-timeline">역사의 길</span>
                <h2 className="section-header-title">조선 1392 — 1897</h2>
                <p className="section-header-sub">먼저 공부할 사건을 골라보세요.</p>
              </div>
              <div className="timeline">
            {["조선 초기", "조선 중기", "조선 후기"].map((era) => {
              const eraEvents = events
                .filter((ev) => ev.era === era)
                .sort((a, b) => a.year - b.year);
              if (eraEvents.length === 0) return null;
              return (
                <div key={era} className="tl-era">
                  <div className="tl-era-label">{era}</div>
                  <div className="tl-list">
                    {eraEvents.map((ev, idx) => {
                      const heritageData = ev.heritageId && heritage ? heritage[ev.heritageId] : null;
                      const heritageBtn = heritageData ? (
                        <button
                          className={"tl-heritage-col" + (heritageOpenEventId === ev.id ? " open" : "")}
                          onClick={() => setHeritageOpenEventId((id) => id === ev.id ? null : ev.id)}
                          aria-expanded={heritageOpenEventId === ev.id}
                          aria-controls={`heritage-${ev.id}`}
                          aria-label={`${ev.title} 실제 유물 ${heritageData.heritageItems.length}점 보기`}
                        >
                          <svg className="tl-heritage-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M3 21h18"/>
                            <path d="M5 21V10"/>
                            <path d="M19 21V10"/>
                            <path d="M9 21v-6h6v6"/>
                            <path d="M12 3 3 9h18z"/>
                          </svg>
                          <span className="tl-heritage-label">실제 유물 보기</span>
                          <span className="tl-heritage-count">{heritageData.heritageItems.length}점</span>
                        </button>
                      ) : null;

                      const heritagePeek = heritageData && heritageOpenEventId === ev.id ? (
                        <div
                          className="tl-heritage-peek"
                          id={`heritage-${ev.id}`}
                          role="region"
                          aria-label={`${ev.title} 관련 유물`}
                        >
                          <div className="heritage-peek-head">
                            <span className="heritage-peek-eyebrow">실제 유물 · {heritageData.heritageItems.length}점</span>
                            <span className="heritage-peek-title">{heritageData.title}</span>
                          </div>
                          <div className="heritage-grid">
                            {heritageData.heritageItems.map((item) => (
                              <HeritageItemCard key={item.id} item={item} />
                            ))}
                          </div>
                        </div>
                      ) : null;

                      return (
                        <div key={ev.id} className="tl-item">
                          <div className={"tl-dot" + (ev.status === "ready" ? " ready" : ev.status === "heritage" ? " heritage" : "")} />
                          {ev.status === "ready" ? (
                            <>
                              <div
                                className={"tl-card ready" + (previewEventId === ev.id ? " peek-open" : "") + (heritageOpenEventId === ev.id ? " heritage-open" : "")}
                                style={{ animationDelay: `${idx * 0.07}s` }}
                              >
                                <div className="tl-inner">
                                  <div className="tl-mini" aria-hidden="true">
                                    <div className="mini-comic">
                                      {[1, 2, 3, 4].map((n) => (
                                        <MiniPanel
                                          key={n}
                                          eventId={ev.id}
                                          pathKey={NODE_PREVIEW_PATH[ev.id] ?? "0-0-0"}
                                          n={n}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  <div className="tl-content">
                                    <div className="tl-meta">
                                      <span className="tl-year">{ev.year}</span>
                                      <span className="tl-king">{ev.king}</span>
                                      <span className="tl-cat">{ev.category}</span>
                                    </div>
                                    <div className="tl-title">{ev.title}</div>
                                    <div className="tl-actions">
                                      {mode === "chat" ? (
                                        <button
                                          className="tl-btn-primary chat"
                                          onClick={() => setPreviewEventId((id) => id === ev.id ? null : ev.id)}
                                          aria-expanded={previewEventId === ev.id}
                                          aria-controls={`peek-${ev.id}`}
                                          aria-label={`${ev.title} 공부하기`}
                                        >
                                          이 사건 공부하기 →
                                        </button>
                                      ) : (
                                        <>
                                          <button
                                            className="tl-btn-primary"
                                            onClick={() => openEvent(ev)}
                                            aria-label={`${ev.title} 이야기 만들기`}
                                          >
                                            이야기 만들기 →
                                          </button>
                                          <button
                                            className="tl-btn-peek"
                                            onClick={() => setPreviewEventId((id) => id === ev.id ? null : ev.id)}
                                            aria-expanded={previewEventId === ev.id}
                                            aria-controls={`peek-${ev.id}`}
                                          >
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                              <circle cx="12" cy="12" r="3"/>
                                            </svg>
                                            무슨 일이 있었을까?
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  {heritageBtn}
                                </div>
                              </div>
                              {previewEventId === ev.id && (
                                <div
                                  className="tl-peek"
                                  id={`peek-${ev.id}`}
                                  role="region"
                                  aria-label={`${ev.title} 사건 미리보기`}
                                >
                                  <p className="peek-text">{ev.factCard}</p>
                                  <div className="peek-source">출처 · {ev.source}</div>
                                  {ev.sillokUrl && (
                                    <a
                                      href={ev.sillokUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="peek-sillok"
                                    >
                                      실록 원문 보기 →
                                    </a>
                                  )}
                                  <button
                                    className={"peek-cta" + (mode === "chat" ? " chat" : "")}
                                    onClick={() => mode === "chat" ? openChat() : openEvent(ev)}
                                  >
                                    {mode === "chat" ? "먹돌이와 함께 이야기 만들기 →" : "이제 내 이야기 만들기 →"}
                                  </button>
                                </div>
                              )}
                              {heritagePeek}
                            </>
                          ) : ev.status === "heritage" ? (
                            <>
                              <div
                                className={"tl-card heritage" + (heritageOpenEventId === ev.id ? " heritage-open" : "")}
                                style={{ animationDelay: `${idx * 0.07}s` }}
                              >
                                <div className="tl-inner">
                                  <div className="tl-content">
                                    <div className="tl-meta">
                                      <span className="tl-year">{ev.year}</span>
                                      <span className="tl-king">{ev.king}</span>
                                      <span className="tl-cat">{ev.category}</span>
                                    </div>
                                    <div className="tl-title">{ev.title}</div>
                                  </div>
                                  {heritageBtn}
                                </div>
                              </div>
                              {heritagePeek}
                            </>
                          ) : (
                            <div
                              className="tl-card coming"
                              aria-label={`${ev.year}년 ${ev.title} — 곧 만나요`}
                            >
                              <div className="tl-inner">
                                <div className="tl-mini" aria-hidden="true">
                                  <div className="mini-locked">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                    </svg>
                                  </div>
                                </div>
                                <div className="tl-content">
                                  <div className="tl-meta">
                                    <span className="tl-year">{ev.year}</span>
                                    <span className="tl-king">{ev.king}</span>
                                    <span className="tl-cat">{ev.category}</span>
                                  </div>
                                  <div className="tl-title">{ev.title}</div>
                                  <span className="tl-lock">곧 만나요</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
              </div>
            </section>
          )}

          {/* ════════ SECTION 4 — 실록이 만든 이야기 (공통 하단) ════════ */}
          <section className="home-section home-section-pillars">
            <div className="sillok-pillars" aria-label="실록이 만든 이야기">
            <div className="sillok-pillars-head">
              <span className="sillok-pillars-eyebrow">실록이 만든 이야기</span>
              <h2 className="sillok-pillars-title">
                조선왕조실록 <em>6,400만 자</em>가<br/>AI의 고증 엔진이 됩니다
              </h2>
              <p className="sillok-pillars-sub">데이터가 곧 창작의 재료예요.</p>
            </div>
            <div className="sillok-pillars-grid">
              <div className="sillok-pillar">
                <div className="sillok-pillar-icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                </div>
                <div className="sillok-pillar-title">역사 왜곡 걱정 없이</div>
                <p className="sillok-pillar-desc">
                  사실 구간과 &lsquo;만약에&rsquo; 상상 구간을 분리하고, 모든 결과물에 창작물 표시와 출처를 남겨요.
                </p>
              </div>
              <div className="sillok-pillar">
                <div className="sillok-pillar-icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                </div>
                <div className="sillok-pillar-title">누구나 2~3분이면</div>
                <p className="sillok-pillar-desc">
                  읽기가 어려워도, 글을 못 써도 괜찮아요. 선택만으로 나만의 역사 창작물이 완성돼요.
                </p>
              </div>
            </div>
            </div>
          </section>
        </div>
      )}

      {screen === "myeongnyang" && (
        <MyeongnyangExperience
          key="myeongnyang"
          onHome={home}
          speak={doSpeak}
          stop={doStop}
          speaking={speaking}
        />
      )}

      {screen === "about" && (
        <div className="panel-card screen about-screen" key="about">
          <button className="back" onClick={home}>← 홈으로</button>
          <div className="about-head">
            <div className="about-logo">역사로<span className="hanja">歷史路</span></div>
            <p className="about-sub">
              역사를 외우지 마세요. 역사 속에 들어가 직접 이야기를 만들어봐요.
            </p>
          </div>
          <div className="about-section">
            <h2 className="about-h">이렇게 만들어요</h2>
            <ol className="about-list">
              <li>
                <b>사건 보기.</b> 700년 전 실록 기록을 AI가 아이 눈높이로 풀어줘요.
              </li>
              <li>
                <b>만약에 고르기.</b> 선택모드는 준비된 &lsquo;만약에&rsquo;를 고르고, 채팅모드는 그 시대 인물에게 직접 말을 걸어요.
              </li>
              <li>
                <b>4컷 이야기 완성.</b> 내가 만든 &lsquo;만약에&rsquo;가 4컷 그림 이야기로 펼쳐져요.
              </li>
            </ol>
          </div>
          <div className="about-section">
            <h2 className="about-h">이 사이트는</h2>
            <p className="about-p">
              조선왕조실록, 한국민족문화대백과사전, 국립중앙박물관 등 공개 자료를 바탕으로 만들었어요. 그림과 &lsquo;만약에&rsquo;는 학습을 위한 &lsquo;역사적 상상력 창작물&rsquo;이에요.
            </p>
          </div>
        </div>
      )}

      {screen === "chat" && (
        <div className="panel-card screen chat-screen" key="chat">
          <button className="back" onClick={home}>← 홈으로</button>
          <div className="chat-head">
            <div className="meokdol-avatar small" aria-hidden="true">
              <span className="meokdol-mascot">먹</span>
            </div>
            <div className="chat-head-text">
              <div className="chat-persona">먹돌이</div>
              <div className="chat-meta">역사 친구 · AI</div>
            </div>
          </div>
          <div className="chat-msgs" aria-live="polite">
            <div className="chat-bubble ai">
              <p>안녕! 나는 먹돌이야.</p>
              <p>어떤 역사가 궁금해? 글로 길게 써도 되고, 단어 한두 개만 알려줘도 돼.</p>
              <p>예) &ldquo;전쟁 이야기&rdquo;, &ldquo;세종대왕&rdquo;, &ldquo;신기한 발명품&rdquo;…</p>
            </div>
          </div>
          <form
            className="chat-input-row"
            onSubmit={(e) => { e.preventDefault(); chatSend(); }}
          >
            <input
              className="chat-input"
              type="text"
              placeholder="궁금한 시대나 인물을 자유롭게 말해보세요…"
              value={chatDraft}
              onChange={(e) => setChatDraft(e.target.value)}
              aria-label="채팅 입력"
              autoFocus
            />
            <button
              className="chat-send"
              type="submit"
              aria-label="보내기"
            >
              보내기 →
            </button>
          </form>
          <div className="chat-hint">
            보내기를 누르면 그 주제에 맞는 4컷 이야기가 펼쳐져요.
          </div>
        </div>
      )}

      {screen === "intro" && event && (
        <div className="panel-card screen" key="intro">
          <button className="back" onClick={home}>← 다른 이야기 고르기</button>
          <span className="badge fact">실제 역사</span>
          <p className="fact-text">{event.factCard}</p>
          <SpeakBtn text={event.factCard} speak={doSpeak} stop={doStop} speaking={speaking} />
          <div className="source">출처 · {event.source}</div>
          <div style={{ marginTop: 28 }}>
            <button className="btn btn-primary" onClick={() => setScreen("play")}>
              여기서부터 &apos;만약에&apos; 이야기 시작하기 →
            </button>
          </div>
        </div>
      )}

      {screen === "play" && node?.choices && (
        <div className="panel-card screen" key={`play-${path.length}`}>
          <button className="back" onClick={home}>← 처음으로</button>
          {path.length === 0 ? (
            <span className="badge fact">실제 역사</span>
          ) : (
            <span className="badge imagine">상상 이야기</span>
          )}
          {totalSteps > 0 && <Steps current={path.length} total={totalSteps} />}
          <p className="narr">{node.narration}</p>
          <SpeakBtn text={node.narration} speak={doSpeak} stop={doStop} speaking={speaking} />
          <div className="choices">
            {node.choices.map((c, i) => (
              <button key={i} className="btn choice" style={{ animationDelay: `${0.1 + i * 0.08}s` }} onClick={() => choose(i)}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {screen === "comic" && event && node?.panels && (
        <div className="panel-card screen" key="comic">
          <button className="back" onClick={home}>← 처음으로</button>
          <span className="badge imagine">상상 이야기 · 내가 만든 4컷</span>
          <div className="comic-grid">
            {node.panels.map((p, i) => (
              <Cut key={i} eventId={event.id} pathKey={path.join("-")} index={i} scene={p.scene} />
            ))}
          </div>
          {node.ending && <div className="ending">{node.ending}</div>}
          <SpeakBtn
            text={[
              ...(node.ending ? [node.ending] : []),
              ...node.panels.map((p, i) => `${i + 1}번 그림, ${p.scene}`),
            ].join(" ")}
            speak={doSpeak}
            stop={doStop}
            speaking={speaking}
          />
          <div className="watermark">
            이 이야기는 실제 역사 위에 상상을 더한 &apos;역사적 상상력 창작물&apos;이에요 · 출처 {event.source}
          </div>
          <div className="kidstory-wrap">
            <button
              className={"kidstory-toggle" + (kidStoryOpen ? " open" : "")}
              onClick={handleKidStoryToggle}
              aria-expanded={kidStoryOpen}
              aria-controls="kidstory-section"
            >
              진짜로는 어떻게 됐을까?
              <span className="kidstory-chevron">{kidStoryOpen ? "▲" : "▼"}</span>
            </button>
            {kidStoryOpen && (
              <div className="kidstory-section" id="kidstory-section">
                <span className="badge fact">실제 역사</span>
                {kidStoryLoading && <p className="kidstory-status">불러오는 중…</p>}
                {kidStoryError && <p className="kidstory-status">잠시 후 다시 눌러보세요.</p>}
                {kidStoryData && (
                  <>
                    <p className="kidstory-story">{kidStoryData.kidStory}</p>
                    {kidStoryData.funFacts.length > 0 && (
                      <div className="funfacts">
                        {kidStoryData.funFacts.map((f, i) => (
                          <div key={i} className="funfact-card">
                            <span className="funfact-text">{f}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="kidstory-source">
                      {kidStoryData.fromSillok && (
                        <span className="kidstory-from-sillok">이 이야기는 실제 실록 기록에서 가져왔어요.</span>
                      )}
                      {kidStoryData.sillokUrl ? (
                        <a
                          href={kidStoryData.sillokUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="sillok-link"
                        >
                          실록 원문에서 직접 확인하기 →
                        </a>
                      ) : (
                        <span>출처 · {kidStoryData.source}</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="row">
            <button className="btn btn-teal" onClick={replay}>다른 선택으로 다시 만들기</button>
            <button className="btn btn-ghost" onClick={home}>다른 이야기 고르기</button>
          </div>
        </div>
      )}
    </div>
  );
}
