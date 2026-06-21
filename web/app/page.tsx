"use client";

/* eslint-disable @next/next/no-img-element */
// MVP 뷰어: public/ 의 정적 JSON·이미지를 직접 읽는다.
// 나중에 Spring Boot로 옮길 때는 아래 fetch 경로만 백엔드 주소로 바꾸면 된다.

import { useEffect, useRef, useState } from "react";
import MyeongnyangExperience from "./myeongnyang";

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
  title: string;
  year: number;
  king: string;
  era: string;
  category: string;
  status: "ready" | "coming";
  source: string;
  sillokUrl?: string | null;
  factCard: string;
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

type Screen = "home" | "intro" | "play" | "comic" | "myeongnyang";

export default function Page() {
  const [screen, setScreen] = useState<Screen>("home");
  const [events, setEvents] = useState<EventMeta[] | null>(null);
  const [event, setEvent] = useState<EventMeta | null>(null);
  const [tree, setTree] = useState<Tree | null>(null);
  const [node, setNode] = useState<StoryNode | null>(null);
  const [path, setPath] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  // TTS 상태
  const [speaking, setSpeaking] = useState(false);
  const [autoRead, setAutoRead] = useState(false);
  const koVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  const [previewEventId, setPreviewEventId] = useState<string | null>(null);

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

  // ESC 키로 사건 미리보기 패널 닫기
  useEffect(() => {
    if (!previewEventId) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewEventId(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [previewEventId]);

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
  };

  if (error) return <div className="wrap"><div className="panel-card center">{error}</div></div>;
  if (!events) return <div className="wrap"><div className="center">불러오는 중…</div></div>;

  const totalSteps = tree ? treeDepth(tree.root) : 0;

  return (
    <div className="wrap">
      <div className="top">
        <div className="brand">역사로<span className="hanja">歷史路</span></div>
        <div className="tagline">내가 만드는 조선 이야기</div>
        <button
          className={"btn-auto-read" + (autoRead ? " on" : "")}
          onClick={() => setAutoRead((r) => !r)}
          aria-pressed={autoRead}
          aria-label={autoRead ? "자동 읽어주기 끄기" : "자동 읽어주기 켜기"}
        >
          {autoRead ? "자동 읽기 켬" : "자동 읽기"}
        </button>
      </div>

      {screen === "home" && (
        <div className="screen" key="home">
          <div className="hero">
            <p className="hero-msg">
              700년 전 역사 속으로, 나만의 이야기를 만들어봐요
            </p>
          </div>
          {/* ── 핵심 기능 3가지 ── */}
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

          {/* ── 이순신 명량해전 — 추천 체험 ── */}
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

          <p className="section-label">역사의 길 · 조선 1392–1897</p>
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
                    {eraEvents.map((ev, idx) => (
                      <div key={ev.id} className="tl-item">
                        <div className={"tl-dot" + (ev.status === "ready" ? " ready" : "")} />
                        {ev.status === "ready" ? (
                          <>
                            <div
                              className={"tl-card ready" + (previewEventId === ev.id ? " peek-open" : "")}
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
                                  </div>
                                </div>
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
                                <button className="peek-cta" onClick={() => openEvent(ev)}>
                                  이제 내 이야기 만들기 →
                                </button>
                              </div>
                            )}
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
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
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
