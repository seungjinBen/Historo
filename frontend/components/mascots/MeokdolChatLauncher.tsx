"use client";

import { useEffect, useRef, useState } from "react";

import { streamAI } from "@/lib/ws";
import { MeokdolMascot } from "./MeokdolMascot";

type Msg = { role: "user" | "ai"; text: string };

interface Props {
  /** 지금 읽고 있는 이야기 제목 — 답변을 그 사건에 맞게 안내하는 데 쓰임 */
  context?: string;
}

const GREETING: Msg[] = [
  { role: "ai", text: "안녕! 나는 먹돌이야. 이야기를 만들다가 궁금한 게 생기면 언제든 물어봐!" },
];

export function MeokdolChatLauncher({ context }: Props) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>(GREETING);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [streaming, setStreaming] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // 새 메시지·스트리밍마다 맨 아래로
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, streaming, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;

    const history = msgs.map((m) => ({ role: m.role, text: m.text }));
    const next: Msg[] = [...msgs, { role: "user", text }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    setStreaming("");

    // 책을 읽는 중이면 지금 사건을 컨텍스트로 살짝 얹어 그 이야기에 맞게 답하게 한다
    const sent = context ? `(지금 읽는 이야기: "${context}") ${text}` : text;

    let full = "";
    await streamAI(
      "talk",
      { text: sent, history },
      {
        onChunk: (t) => {
          full += t;
          setStreaming(full);
        },
        onDone: (d) => {
          const out = (d.text || full).trim();
          setMsgs([...next, { role: "ai", text: out || "음, 잘 못 들었어. 다시 한 번 물어봐 줄래?" }]);
          setStreaming("");
          setBusy(false);
        },
        onError: () => {
          setMsgs([...next, { role: "ai", text: "이런, 잠깐 연결이 끊겼나 봐. 조금 뒤에 다시 물어봐 줘!" }]);
          setStreaming("");
          setBusy(false);
        },
      }
    );
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      <div className="meokdol-fab-wrap">
        <button
          type="button"
          className={"meokdol-fab" + (open ? " on" : "")}
          onClick={() => setOpen(true)}
          aria-label="먹돌이에게 물어보기"
        >
          <span className="meokdol-fab-avatar" aria-hidden="true">
            <MeokdolMascot />
          </span>
          <span className="meokdol-fab-text" aria-hidden="true">
            <span className="meokdol-fab-name">먹돌이</span>
            <span className="meokdol-fab-sub">역사 궁금증 물어봐!</span>
          </span>
          <span className="meokdol-fab-pulse" aria-hidden="true" />
        </button>
      </div>

      {open && (
        <div
          className="meokdol-chat-backdrop"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            className="meokdol-chat-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="meokdol-chat-heading"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="meokdol-chat-head">
              <span className="meokdol-chat-avatar" aria-hidden="true">
                <MeokdolMascot />
              </span>
              <div className="meokdol-chat-headtext">
                <h2 id="meokdol-chat-heading" className="meokdol-chat-title">
                  먹돌이
                </h2>
                <p className="meokdol-chat-subtitle">
                  뭐든 물어봐! 같이 이야기 만들어 보자
                </p>
              </div>
              <button
                type="button"
                className="meokdol-chat-close"
                onClick={() => setOpen(false)}
                aria-label="닫기"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </header>

            <div className="meokdol-chat-body" ref={bodyRef}>
              {msgs.map((m, i) => (
                <div
                  key={i}
                  className={"meokdol-chat-bubble" + (m.role === "user" ? " user" : "")}
                >
                  {m.text}
                </div>
              ))}
              {busy && (
                <div className="meokdol-chat-bubble">
                  {streaming ? (
                    <>
                      {streaming}
                      <span className="meokdol-chat-caret" aria-hidden="true" />
                    </>
                  ) : (
                    <span className="meokdol-chat-typing" aria-label="먹돌이가 생각하고 있어요">
                      <span />
                      <span />
                      <span />
                    </span>
                  )}
                </div>
              )}
            </div>

            <footer className="meokdol-chat-foot">
              <div className={"meokdol-chat-input" + (busy ? " busy" : "")}>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={busy ? "먹돌이가 답하고 있어…" : "궁금한 걸 물어봐!"}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  disabled={busy}
                  aria-label="먹돌이에게 보낼 메시지"
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={busy || !input.trim()}
                  aria-label="보내기"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M22 2 11 13" />
                    <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
                  </svg>
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
