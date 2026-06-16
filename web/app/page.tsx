"use client";

/* eslint-disable @next/next/no-img-element */
// MVP 뷰어: public/ 의 정적 JSON·이미지를 직접 읽는다.
// 나중에 Spring Boot로 옮길 때는 아래 fetch 경로만 백엔드 주소로 바꾸면 된다.

import { useEffect, useState } from "react";

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

const imgUrl = (eventId: string, file: string) => `/images/${eventId}/${file}`;

function Thumb({ eventId }: { eventId: string }) {
  const [err, setErr] = useState(false);
  if (err) return <div className="ph">그림 준비 중</div>;
  return <img src={imgUrl(eventId, "_anchor.png")} alt="" onError={() => setErr(true)} />;
}

function Cut({ eventId, pathKey, index, scene }: { eventId: string; pathKey: string; index: number; scene: string }) {
  const [err, setErr] = useState(false);
  return (
    <div className="cut">
      <div className="num">{index + 1}</div>
      {err ? (
        <div className="ph">
          {scene}
          <br />
          <span style={{ opacity: 0.6 }}>(그림 준비 중)</span>
        </div>
      ) : (
        <img src={imgUrl(eventId, `${pathKey}_panel${index + 1}.png`)} alt={scene} onError={() => setErr(true)} />
      )}
      {!err && <div className="cap">{scene}</div>}
    </div>
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

  useEffect(() => {
    fetch("/data/events.json")
      .then((r) => r.json())
      .then((d) => setEvents(d.events))
      .catch(() => setError("data/events.json 을 불러오지 못했어요. public/data/ 에 복사했는지 확인해 주세요."));
  }, []);

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

  return (
    <div className="wrap">
      <div className="top">
        <div className="brand">역사로<span className="hanja">歷史路</span></div>
        <div className="tagline">내가 만드는 조선 이야기</div>
      </div>

      {screen === "home" && (
        <div className="grid">
          {events.map((ev) => (
            <div key={ev.id} className="ev-card" onClick={() => openEvent(ev)}>
              <div className="ev-thumb"><Thumb eventId={ev.id} /></div>
              <div className="ev-body">
                <span className="ev-year">{ev.year}년 · {ev.king}</span>
                <div className="ev-title">{ev.title}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {screen === "intro" && event && (
        <div className="panel-card">
          <button className="back" onClick={home}>← 다른 이야기 고르기</button>
          <span className="badge fact">📜 실제로 있었던 일</span>
          <p className="fact-text">{event.factCard}</p>
          <div className="source">출처 · {event.source}</div>
          <div style={{ marginTop: 28 }}>
            <button className="btn btn-primary" onClick={() => setScreen("play")}>
              여기서부터 ‘만약에’ 이야기 시작하기 →
            </button>
          </div>
        </div>
      )}

      {screen === "play" && node?.choices && (
        <div className="panel-card">
          <button className="back" onClick={home}>← 처음으로</button>
          {path.length === 0 ? (
            <span className="badge fact">📜 실제 역사에서 출발해요</span>
          ) : (
            <span className="badge imagine">✨ 지금부터는 상상 이야기</span>
          )}
          <div className="progress">{path.length + 1}번째 갈림길</div>
          <p className="narr">{node.narration}</p>
          <div className="choices">
            {node.choices.map((c, i) => (
              <button key={i} className="btn choice" onClick={() => choose(i)}>{c.label}</button>
            ))}
          </div>
        </div>
      )}

      {screen === "comic" && event && node?.panels && (
        <div className="panel-card">
          <button className="back" onClick={home}>← 처음으로</button>
          <span className="badge imagine">✨ 상상 이야기 · 내가 만든 4컷</span>
          <div className="comic-grid">
            {node.panels.map((p, i) => (
              <Cut key={i} eventId={event.id} pathKey={path.join("-")} index={i} scene={p.scene} />
            ))}
          </div>
          {node.ending && <div className="ending">{node.ending}</div>}
          <div className="watermark">
            이 이야기는 실제 역사 위에 상상을 더한 ‘역사적 상상력 창작물’이에요 · 출처 {event.source}
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
