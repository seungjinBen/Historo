"use client";

/* eslint-disable @next/next/no-img-element */
// MVP 뷰어: public/ 의 정적 JSON·이미지를 직접 읽는다.
// 나중에 Spring Boot로 옮길 때는 아래 fetch 경로만 백엔드 주소로 바꾸면 된다.

import { useEffect, useRef, useState } from "react";

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
  source: string;
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
      {speaking ? "⏹ 멈추기" : "🔊 읽어주기"}
    </button>
  );
}

type Screen = "home" | "intro" | "play" | "comic";

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
          {autoRead ? "🔊 자동 읽기 켬" : "🔈 자동 읽기 꺼짐"}
        </button>
      </div>

      {screen === "home" && (
        <div className="screen" key="home">
          <div className="hero">
            <p className="hero-msg">
              실록 속 그날로 들어가, 내가 직접 &lsquo;만약에&rsquo;를 골라<br />
              나만의 역사 4컷을 만들어요
            </p>
            <div className="hero-steps">
              <div className="hero-step">
                <span className="hero-step-icon">📚</span>
                <span className="hero-step-label">① 역사 사건 고르기</span>
              </div>
              <span className="hero-arrow">→</span>
              <div className="hero-step">
                <span className="hero-step-icon">🤔</span>
                <span className="hero-step-label">② &lsquo;만약에&rsquo; 선택하기</span>
              </div>
              <span className="hero-arrow">→</span>
              <div className="hero-step">
                <span className="hero-step-icon">🎨</span>
                <span className="hero-step-label">③ 나만의 4컷 완성</span>
              </div>
            </div>
          </div>
          <p className="section-label">이런 이야기를 만들 수 있어요</p>
          <div className="grid">
            {events.map((ev, i) => (
              <div key={ev.id} className="ev-card" style={{ animationDelay: `${i * 0.06}s` }} onClick={() => openEvent(ev)}>
                <div className="ev-thumb"><Thumb eventId={ev.id} /></div>
                <div className="ev-body">
                  <span className="ev-year">{ev.year}년 · {ev.king}</span>
                  <div className="ev-title">{ev.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {screen === "intro" && event && (
        <div className="panel-card screen" key="intro">
          <button className="back" onClick={home}>← 다른 이야기 고르기</button>
          <span className="badge fact">📜 실제로 있었던 일</span>
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
            <span className="badge fact">📜 실제 역사에서 출발해요</span>
          ) : (
            <span className="badge imagine">✨ 지금부터는 상상 이야기</span>
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
          <span className="badge imagine">✨ 상상 이야기 · 내가 만든 4컷</span>
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
              🔎 진짜로는 어떻게 됐을까?
              <span className="kidstory-chevron">{kidStoryOpen ? "▲" : "▼"}</span>
            </button>
            {kidStoryOpen && (
              <div className="kidstory-section" id="kidstory-section">
                <span className="badge fact">📜 실제 역사</span>
                {kidStoryLoading && <p className="kidstory-status">불러오는 중…</p>}
                {kidStoryError && <p className="kidstory-status">잠시 후 다시 눌러보세요.</p>}
                {kidStoryData && (
                  <>
                    <p className="kidstory-story">{kidStoryData.kidStory}</p>
                    {kidStoryData.funFacts.length > 0 && (
                      <div className="funfacts">
                        {kidStoryData.funFacts.map((f, i) => (
                          <div key={i} className="funfact-card">
                            <span className="funfact-icon">💡</span>
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
                          📜 실록 원문에서 직접 확인하기 ↗
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
