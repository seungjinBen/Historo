"use client";

import { useEffect, useRef, useState } from "react";
import {
  INITIAL_SESSION,
  StoryChatSession,
  applyToSession,
  calcProgress,
  parseAiResponse,
  parsePlotSummary,
} from "@/lib/storyChat";
import { streamAI, generateImage } from "@/lib/ws";

type Msg = { role: "user" | "ai"; text: string };
type PlotSummary = { title: string; scenes: string[] };

interface Props {
  onBack: () => void;
}

function toHistory(msgs: Msg[]): { role: "user" | "assistant"; content: string }[] {
  return msgs.map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text }));
}

const STEP_LABELS = ["관심사", "사건 선택", "만약에 ×3", "이야기 완성"];

export default function MeokdolChat({ onBack }: Props) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [session, setSession] = useState<StoryChatSession>(INITIAL_SESSION);
  const [chips, setChips] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [plotSummary, setPlotSummary] = useState<PlotSummary | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const [plotReady, setPlotReady] = useState(false);
  const [comicUrls, setComicUrls] = useState<(string | null)[]>([]);
  const [genBusy, setGenBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 먹돌이가 먼저 말 건다
  useEffect(() => {
    sendToLLM("안녕!", INITIAL_SESSION, "안녕!");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, streamingText, chips]);

  const step = session.phase === "interest" ? 0
    : session.phase === "event_locked" ? 1
    : session.phase === "branching" ? 2
    : 3;
  const progress = calcProgress(session.phase, session.branchCount);

  async function sendToLLM(userText: string, currentSession: StoryChatSession, userLabel: string) {
    setBusy(true);
    setChips([]);
    setSuggestions([]);
    setStreamingText("");

    const prevMsgs = msgs.slice();
    let accumulated = "";

    const result = await streamAI(
      "story_chat",
      { text: userText, session: currentSession, history: toHistory(prevMsgs) },
      {
        onChunk: (t) => {
          accumulated += t;
          setStreamingText(accumulated);
        },
        onDone: () => setStreamingText(""),
        onError: () => setStreamingText(""),
      }
    );

    if (!result) {
      setBusy(false);
      setMsgs((prev) => [...prev, { role: "ai", text: "잠깐, 연결이 끊어진 것 같아. 다시 시도해볼게!" }]);
      return;
    }

    const parsed = parseAiResponse(result.text);
    const nextSession = applyToSession(currentSession, parsed, userLabel);

    setMsgs((prev) => [...prev, { role: "ai", text: parsed.clean }]);
    setSession(nextSession);

    if (nextSession.phase === "plot") {
      const ps = parsePlotSummary(parsed.clean);
      setPlotSummary(ps);
      if (parsed.suggestions.length > 0) setSuggestions(parsed.suggestions);
      setPlotReady(true);
    } else if (nextSession.branchCount >= 3) {
      setPlotReady(true);
    } else {
      if (parsed.chips.length === 3) setChips(parsed.chips);
      else if (parsed.suggestions.length > 0) setSuggestions(parsed.suggestions);
    }

    setBusy(false);
    setTimeout(() => inputRef.current?.focus(), 80);
  }

  async function generateComic() {
    if (!plotSummary || genBusy) return;
    setGenBusy(true);
    setComicUrls(new Array(plotSummary.scenes.length).fill(null));

    // 조선 역사 만화 스타일 마스터 프롬프트 — 이미지 모델 일관성 확보
    const master = "Korean historical comic style, ink and watercolor illustration, joseon dynasty setting, clean speech bubbles in Korean, cinematic composition, detailed background, no text except speech bubbles";

    const results: (string | null)[] = [];
    for (let i = 0; i < plotSummary.scenes.length; i++) {
      const prompt = `${master}. Scene ${i + 1} of 4: ${plotSummary.scenes[i]}. Title: ${plotSummary.title}`;
      const url = await generateImage(prompt);
      results.push(url);
      setComicUrls([...results, ...new Array(plotSummary.scenes.length - results.length).fill(null)]);
    }
    setGenBusy(false);
  }

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setInput("");
    setMsgs((prev) => [...prev, { role: "user", text: trimmed }]);
    sendToLLM(trimmed, session, trimmed);
  }

  function pickChip(chip: string) {
    if (busy) return;
    setChips([]);
    setSuggestions([]);
    setMsgs((prev) => [...prev, { role: "user", text: chip }]);
    sendToLLM(chip, session, chip);
  }

  function triggerPlot() {
    if (busy) return;
    const text = "이야기를 완성해줘!";
    setMsgs((prev) => [...prev, { role: "user", text }]);
    sendToLLM(text, session, text);
  }

  return (
    <div className="screen" style={{ paddingBottom: 24 }}>

      {/* ── 뒤로 버튼 + 단계 표시 ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <button className="back" onClick={onBack} style={{ margin: 0, flexShrink: 0 }}>
          ← 홈으로
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* 단계 breadcrumb */}
          <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "nowrap", overflow: "hidden" }}>
            {STEP_LABELS.map((label, i) => (
              <span key={i} style={{
                fontFamily: "'Jua', sans-serif",
                fontSize: 12,
                color: i === step ? "var(--imagine-deep)" : i < step ? "var(--ink-soft)" : "var(--ink-faint)",
                fontWeight: i === step ? 700 : 400,
                whiteSpace: "nowrap",
              }}>
                {i > 0 && <span style={{ color: "var(--border-muted)", margin: "0 3px" }}>›</span>}
                {label}
              </span>
            ))}
          </div>
          {/* 진행 바 */}
          <div style={{ height: 3, background: "var(--bg-muted)", borderRadius: 2, marginTop: 5 }}>
            <div style={{
              height: "100%", background: "var(--imagine)", borderRadius: 2,
              width: `${progress}%`, transition: "width .5s cubic-bezier(.4,0,.2,1)",
            }} />
          </div>
        </div>
      </div>

      {/* ── 먹돌이 헤더 ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "12px 16px", marginBottom: 16,
        background: "var(--imagine-soft)",
        border: "1.5px solid var(--imagine)",
        borderRadius: 14,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: "var(--imagine)", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20,
        }}>
          🪨
        </div>
        <div>
          <div style={{ fontFamily: "'Jua', sans-serif", fontSize: 15, color: "var(--imagine-deep)" }}>먹돌이</div>
          <div style={{ fontFamily: "'Gowun Dodum', sans-serif", fontSize: 12, color: "var(--ink-faint)" }}>
            조선 역사 이야기 친구 · AI
          </div>
        </div>
      </div>

      {/* ── 채팅 말풍선 영역 ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>

        {msgs.map((m, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            alignItems: "flex-start", gap: 8,
          }}>
            {m.role === "ai" && (
              <div style={{
                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                background: "var(--imagine)", marginTop: 2,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14,
              }}>
                🪨
              </div>
            )}
            <div style={{
              maxWidth: "80%",
              background: m.role === "ai" ? "var(--bg)" : "var(--imagine)",
              color: m.role === "ai" ? "var(--ink)" : "#fff",
              border: m.role === "ai" ? "1px solid var(--border-muted)" : "none",
              borderRadius: m.role === "ai" ? "4px 14px 14px 14px" : "14px 14px 4px 14px",
              padding: "12px 16px",
              fontFamily: "'Gowun Dodum', sans-serif",
              fontSize: 16, lineHeight: 1.75,
              boxShadow: "var(--shadow-xs)",
              whiteSpace: "pre-wrap", wordBreak: "break-word",
            }}>
              {m.text}
            </div>
          </div>
        ))}

        {/* 스트리밍 중 */}
        {busy && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
              background: "var(--imagine)", marginTop: 2,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
            }}>
              🪨
            </div>
            <div style={{
              maxWidth: "80%", background: "var(--bg)",
              border: "1px solid var(--border-muted)",
              borderRadius: "4px 14px 14px 14px",
              padding: "12px 16px",
              fontFamily: "'Gowun Dodum', sans-serif",
              fontSize: 16, lineHeight: 1.75,
              boxShadow: "var(--shadow-xs)", color: "var(--ink)",
              whiteSpace: "pre-wrap", wordBreak: "break-word",
            }}>
              {streamingText || (
                <span style={{ display: "flex", gap: 5, alignItems: "center", padding: "4px 0" }}>
                  {[0, 1, 2].map((i) => (
                    <span key={i} style={{
                      width: 7, height: 7, borderRadius: "50%",
                      background: "var(--imagine)",
                      display: "inline-block",
                      animation: `chatDot .9s ${i * 0.2}s ease-in-out infinite`,
                    }} />
                  ))}
                </span>
              )}
            </div>
          </div>
        )}

        {/* 선택지 칩 */}
        {!busy && chips.length > 0 && (
          <div className="choices">
            {chips.map((chip, i) => (
              <button key={i} className="choice" style={{ animationDelay: `${i * 0.07}s` }} onClick={() => pickChip(chip)}>
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* 이야기 완성 버튼 */}
        {!busy && plotReady && session.phase !== "plot" && (
          <button className="btn btn-primary" onClick={triggerPlot} style={{ marginTop: 4 }}>
            이야기 완성하기
          </button>
        )}

        {/* 줄거리 완성 표시 + 4컷 만화 생성 */}
        {!busy && session.phase === "plot" && plotSummary && (
          <div className="ending">
            <div style={{ fontFamily: "'Jua', sans-serif", fontSize: 17, marginBottom: 10 }}>
              「{plotSummary.title}」
            </div>
            {plotSummary.scenes.map((s, i) => (
              <p key={i} style={{ margin: "4px 0", fontFamily: "'Gowun Dodum', sans-serif", fontSize: 15, lineHeight: 1.75 }}>
                {i + 1}. {s}
              </p>
            ))}

            {/* 4컷 만화 생성 버튼 */}
            {comicUrls.length === 0 && (
              <button
                onClick={generateComic}
                disabled={genBusy}
                style={{
                  marginTop: 16, width: "100%",
                  background: "var(--red)", color: "#fff",
                  border: "none", borderRadius: 12,
                  fontFamily: "'Jua', sans-serif", fontSize: 15,
                  padding: "13px 0", cursor: "pointer",
                  opacity: genBusy ? .65 : 1,
                }}
              >
                {genBusy ? "4컷 만화 그리는 중…" : "✦ 4컷 만화로 만들기"}
              </button>
            )}

            {/* 생성 중 / 완료 이미지 그리드 */}
            {comicUrls.length > 0 && (
              <div style={{
                marginTop: 16,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}>
                {comicUrls.map((url, i) => (
                  <div key={i} style={{
                    aspectRatio: "3/2",
                    borderRadius: 10,
                    overflow: "hidden",
                    background: "#EFE7D6",
                    border: "1px solid var(--border)",
                    boxShadow: "0 4px 12px rgba(61,26,8,.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative",
                  }}>
                    {url ? (
                      <>
                        <img src={url} alt={`${i + 1}컷`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <span style={{
                          position: "absolute", top: 6, left: 6,
                          width: 20, height: 20, borderRadius: "50%",
                          background: "rgba(26,22,18,.6)", color: "#fff",
                          fontSize: 11, fontFamily: "'Jua',sans-serif",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>{i + 1}</span>
                      </>
                    ) : (
                      <div style={{ textAlign: "center", color: "var(--mbook-ink-soft)" }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: .5, animation: "spin 1.2s linear infinite" }}>
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        <div style={{ fontSize: 11, marginTop: 6, fontFamily: "'Gowun Dodum',sans-serif" }}>{i + 1}컷 그리는 중</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 후속 제안 칩 */}
        {!busy && suggestions.length > 0 && session.phase === "plot" && (
          <div className="choices" style={{ marginTop: 4 }}>
            {suggestions.map((s, i) => (
              <button key={i} className="choice" onClick={() => pickChip(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── 입력창 ── */}
      <div style={{
        position: "sticky", bottom: 16,
        display: "flex", gap: 10, alignItems: "center",
        background: "var(--bg-subtle)",
        border: "1.5px solid var(--border)",
        borderRadius: 14, padding: "8px 12px",
        boxShadow: "var(--shadow)",
        zIndex: 5,
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage(input))}
          placeholder={busy ? "먹돌이가 생각 중..." : "직접 입력하거나 위 선택지를 골라봐!"}
          disabled={busy}
          style={{
            flex: 1, border: "none", background: "transparent",
            fontFamily: "'Gowun Dodum', sans-serif", fontSize: 15,
            color: "var(--ink)", outline: "none",
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={busy || !input.trim()}
          style={{
            flexShrink: 0, width: 34, height: 34, borderRadius: "50%",
            background: busy || !input.trim() ? "var(--bg-muted)" : "var(--imagine)",
            border: "none", cursor: busy || !input.trim() ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 18, lineHeight: 1,
            transition: "background .15s",
          }}
        >
          ›
        </button>
      </div>

      <style>{`
        @keyframes chatDot {
          0%, 80%, 100% { transform: scale(.55); opacity: .35; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
