"use client";

import { useState } from "react";
import { SpeakBtn } from "@/components/common/SpeakBtn";
import { Cut } from "./Cut";
import type { EventMeta, KidStory, StoryNode } from "@/lib/types";

type Props = {
  event: EventMeta;
  node: StoryNode;
  path: number[];
  onBack: () => void;
  onReplay: () => void;
  speak: (t: string) => void;
  stop: () => void;
  speaking: boolean;
};

// 컴포넌트가 마운트되는 동안만 kidStory 데이터를 캐싱.
// 화면 전환으로 ComicScreen이 언마운트되면 자연스럽게 초기화된다.
export function ComicScreen({ event, node, path, onBack, onReplay, speak, stop, speaking }: Props) {
  const [kidStoryOpen, setKidStoryOpen] = useState(false);
  const [kidStoryData, setKidStoryData] = useState<KidStory | null>(null);
  const [kidStoryLoading, setKidStoryLoading] = useState(false);
  const [kidStoryError, setKidStoryError] = useState(false);

  if (!node.panels) return null;
  const panels = node.panels;

  function handleKidStoryToggle() {
    const next = !kidStoryOpen;
    setKidStoryOpen(next);
    if (next && !kidStoryData && !kidStoryLoading) {
      setKidStoryLoading(true);
      setKidStoryError(false);
      fetch(`/kidstory/${event.id}.json`)
        .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
        .then((d: KidStory) => { setKidStoryData(d); setKidStoryLoading(false); })
        .catch(() => { setKidStoryLoading(false); setKidStoryError(true); });
    }
  }

  return (
    <div className="panel-card screen" key="comic">
      <button className="back" onClick={onBack}>← 처음으로</button>
      <span className="badge imagine">상상 이야기 · 내가 만든 4컷</span>
      <div className="comic-grid">
        {panels.map((p, i) => (
          <Cut key={i} eventId={event.id} pathKey={path.join("-")} index={i} scene={p.scene} />
        ))}
      </div>
      {node.ending && <div className="ending">{node.ending}</div>}
      <SpeakBtn
        text={[
          ...(node.ending ? [node.ending] : []),
          ...panels.map((p, i) => `${i + 1}번 그림, ${p.scene}`),
        ].join(" ")}
        speak={speak}
        stop={stop}
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
        <button className="btn btn-teal" onClick={onReplay}>다른 선택으로 다시 만들기</button>
        <button className="btn btn-ghost" onClick={onBack}>다른 이야기 고르기</button>
      </div>
    </div>
  );
}
