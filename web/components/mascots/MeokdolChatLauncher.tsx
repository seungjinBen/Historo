"use client";

import { useEffect, useState } from "react";

import { MeokdolMascot } from "./MeokdolMascot";

export function MeokdolChatLauncher() {
  const [open, setOpen] = useState(false);
  const [hintSeen, setHintSeen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    const t = setTimeout(() => setHintSeen(true), 6000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <div className="meokdol-fab-wrap">
        {!hintSeen && !open && (
          <span className="meokdol-fab-hint" aria-hidden="true">
            궁금한 거 있어? 물어봐!
          </span>
        )}
        <button
          type="button"
          className={"meokdol-fab" + (open ? " on" : "")}
          onClick={() => {
            setOpen(true);
            setHintSeen(true);
          }}
          aria-label="먹돌이에게 물어보기"
        >
          <span className="meokdol-fab-mascot" aria-hidden="true">
            <MeokdolMascot />
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

            <div className="meokdol-chat-body">
              <div className="meokdol-chat-bubble">
                안녕! 나는 <b>먹돌이</b>야. 이야기를 만들다가 궁금한 게 생기면
                언제든 물어봐!
              </div>
              <div className="meokdol-chat-bubble">
                예) <i>“이순신 장군은 왜 13척으로 싸웠어?”</i>
              </div>
              <div className="meokdol-chat-coming">
                채팅 기능은 곧 만나요 — 지금은 준비 중이에요.
              </div>
            </div>

            <footer className="meokdol-chat-foot">
              <div className="meokdol-chat-input" aria-disabled="true">
                <input
                  type="text"
                  placeholder="곧 채팅이 열려요!"
                  disabled
                  aria-label="먹돌이에게 보낼 메시지 (준비 중)"
                />
                <button type="button" disabled aria-label="보내기 (준비 중)">
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
