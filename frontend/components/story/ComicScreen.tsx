"use client";

import { useEffect, useRef, useState } from "react";
import { SpeakBtn } from "@/components/common/SpeakBtn";
import { Cut } from "./Cut";
import { api, getToken, type ApiComicCut } from "@/lib/api";
import { streamAI } from "@/lib/ws";
import type { EventMeta, KidStory, StoryNode } from "@/lib/types";

type Props = {
  event: EventMeta;
  node: StoryNode;
  path: number[];
  episodeKr: string;      // 한글 에피소드명 (API용)
  storylineId: string;    // 예: "A-1-α"
  pathText: string;       // 예: "전략 ➔ 군사 ➔ 전진"
  onBack: () => void;
  onReplay: () => void;
  onBookshelfSaved?: () => void;
  speak: (t: string) => void;
  stop: () => void;
  speaking: boolean;
};

type ChatMsg = { role: "ai" | "user"; text: string };

export function ComicScreen({
  event, node, path, episodeKr, storylineId, pathText,
  onBack, onReplay, onBookshelfSaved, speak, stop, speaking,
}: Props) {
  const [kidStoryOpen, setKidStoryOpen]   = useState(false);
  const [kidStoryData, setKidStoryData]   = useState<KidStory | null>(null);
  const [kidStoryLoading, setKidStoryLoading] = useState(false);
  const [kidStoryError, setKidStoryError] = useState(false);

  // S3 이미지 URL (백엔드 API)
  const [apiCuts, setApiCuts] = useState<ApiComicCut[] | null>(null);

  // 책장 저장
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // 퀴즈 채팅
  const [chatMsgs, setChatMsgs]   = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  if (!node.panels) return null;
  const panels = node.panels;

  // 백엔드에서 S3 이미지 URL 가져오기
  useEffect(() => {
    api.getComic(episodeKr)
      .then((comic) => {
        const sl = comic.storylines.find((s) => s.id === storylineId);
        if (sl) setApiCuts(sl.cuts);
      })
      .catch(() => {}); // 실패 시 로컬 이미지 fallback
  }, [episodeKr, storylineId]);

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

  async function handleSave() {
    if (!getToken()) { setSaveError("로그인 후 저장할 수 있어요."); return; }
    setSaving(true); setSaveError(null);
    try {
      const thumbnailUrl = apiCuts?.[0]?.imageUrl ?? null;
      await api.saveBookshelf({
        eventId: event.id,
        title: event.title,
        picks: path,
        pathText,
        ...(thumbnailUrl ? { thumbnailUrl } : {}),
      });
      setSaved(true);
      onBookshelfSaved?.();
    } catch {
      setSaveError("저장에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  }

  // 퀴즈 시작 (먹돌이가 첫 질문 던짐)
  async function startQuiz() {
    setChatStarted(true);
    setChatLoading(true);
    const aiMsg: ChatMsg = { role: "ai", text: "" };
    setChatMsgs([aiMsg]);
    let full = "";
    await streamAI(
      "chat",
      {
        eventId: event.id,
        eventTitle: event.title,
        context: `선택 경로: ${pathText}. 장면: ${panels.map((p, i) => `${i+1}컷: ${p.scene}`).join(", ")}`,
        message: `지금 막 이 역사 이야기의 4컷을 만든 초등학생에게 역사 상식 퀴즈를 딱 한 문제만 내줘.
짧고 쉽게, 말풍선 스타일로. 끝에 "(힌트: ...)" 형태로 힌트도 살짝 줘.`,
        history: [],
      },
      {
        onChunk: (t) => {
          full += t;
          setChatMsgs([{ role: "ai", text: full }]);
        },
        onDone: () => setChatLoading(false),
        onError: () => { setChatLoading(false); setChatMsgs([{ role: "ai", text: "잠시 후 다시 눌러봐요!" }]); },
      }
    );
  }

  async function sendAnswer() {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg: ChatMsg = { role: "user", text: chatInput };
    const next = [...chatMsgs, userMsg];
    setChatMsgs(next); setChatInput(""); setChatLoading(true);
    const aiMsg: ChatMsg = { role: "ai", text: "" };
    setChatMsgs([...next, aiMsg]);
    let full = "";
    await streamAI(
      "chat",
      {
        eventId: event.id,
        eventTitle: event.title,
        context: `선택 경로: ${pathText}`,
        message: chatInput,
        history: next.slice(0, -1).map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text })),
        isQuizReply: true,
        afterQuiz: `답변에 피드백을 주고, 마지막에 "이런 이야기도 있어요:" 라는 문구로
${event.title} 관련 다른 선택지 2가지를 짧게 추천해줘.`,
      },
      {
        onChunk: (t) => {
          full += t;
          setChatMsgs([...next, { role: "ai", text: full }]);
        },
        onDone: () => setChatLoading(false),
        onError: () => setChatLoading(false),
      }
    );
    setTimeout(() => chatRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  return (
    <div className="panel-card screen" key="comic">
      <button className="back" onClick={onBack}>← 처음으로</button>
      <span className="badge imagine">상상 이야기 · 내가 만든 4컷</span>

      {/* 네컷 이미지 */}
      <div className="comic-grid">
        {panels.map((p, i) => (
          <Cut
            key={i}
            eventId={event.id}
            pathKey={path.join("-")}
            index={i}
            scene={p.scene}
            imageUrl={apiCuts?.[i]?.imageUrl}
          />
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

      {/* 책장 저장 */}
      <div className="bookshelf-save-row">
        {saved ? (
          <span className="save-done">✓ 책장에 저장됐어요!</span>
        ) : (
          <button className="btn btn-teal" onClick={handleSave} disabled={saving}>
            {saving ? "저장 중…" : "📚 내 책장에 저장하기"}
          </button>
        )}
        {saveError && <span className="save-error">{saveError}</span>}
      </div>

      {/* 진짜 역사 섹션 */}
      <div className="kidstory-wrap">
        <button
          className={"kidstory-toggle" + (kidStoryOpen ? " open" : "")}
          onClick={handleKidStoryToggle}
          aria-expanded={kidStoryOpen}
        >
          진짜로는 어떻게 됐을까?
          <span className="kidstory-chevron">{kidStoryOpen ? "▲" : "▼"}</span>
        </button>
        {kidStoryOpen && (
          <div className="kidstory-section">
            <span className="badge fact">실제 역사</span>
            {kidStoryLoading && <p className="kidstory-status">불러오는 중…</p>}
            {kidStoryError   && <p className="kidstory-status">잠시 후 다시 눌러보세요.</p>}
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
                    <a href={kidStoryData.sillokUrl} target="_blank" rel="noopener noreferrer" className="sillok-link">
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

      {/* 먹돌이 역사 퀴즈 */}
      <div className="comic-quiz-wrap">
        <div className="comic-quiz-header">
          <span className="meokdol-emoji">🖌️</span>
          <strong>먹돌이 역사 퀴즈</strong>
        </div>
        {!chatStarted ? (
          <button className="btn btn-ghost quiz-start-btn" onClick={startQuiz}>
            먹돌이에게 퀴즈 받기 →
          </button>
        ) : (
          <div className="comic-chat">
            {chatMsgs.map((m, i) => (
              <div key={i} className={`chat-bubble chat-bubble-${m.role}`}>
                {m.role === "ai" && <span className="chat-avatar">🖌️</span>}
                <span className="chat-text">{m.text || "…"}</span>
              </div>
            ))}
            {chatMsgs.length > 0 && chatMsgs[chatMsgs.length - 1].role === "ai" && !chatLoading && (
              <div className="chat-input-row">
                <input
                  className="chat-input"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendAnswer()}
                  placeholder="답을 입력해봐요…"
                />
                <button className="btn btn-teal chat-send" onClick={sendAnswer}>전송</button>
              </div>
            )}
            <div ref={chatRef} />
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
