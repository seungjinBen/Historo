"use client";

import { useEffect, useRef, useState } from "react";

import { streamAI } from "@/lib/ws";
import { MeokdolMascot } from "./MeokdolMascot";

type Msg = { role: "user" | "ai"; text: string };
type CatalogItem = { id: string; title: string; category?: string; who?: string };
type Goto = { id: string; label: string };

interface Props {
  /** 지금 읽고 있는 이야기 제목 — 답변을 그 사건에 맞게 안내하는 데 쓰임 */
  context?: string;
  /** 지금 읽고 있는 이야기 id — 같은 작품을 추천하지 않도록 제외 */
  eventId?: string;
}

const GREETING: Msg[] = [
  { role: "ai", text: "안녕! 나는 먹돌이야. 이야기를 만들다가 궁금한 게 생기면 언제든 물어봐!" },
];
// 첫 화면에서 아이가 막막하지 않게 띄워 주는 시작 질문들
const STARTERS = ["이건 무슨 이야기야?", "주인공은 누구야?", "그래서 어떻게 됐어?"];

// 갤러리 작품 목록(모든 런처 인스턴스 공유) — 다른 이야기 추천에 씀
let catalogCache: CatalogItem[] | null = null;
async function loadCatalog(): Promise<CatalogItem[]> {
  if (catalogCache) return catalogCache;
  try {
    const r = await fetch("/data/events.json");
    const d = await r.json();
    catalogCache = (d.events || [])
      .filter((e: { status?: string }) => e.status === "ready")
      .map((e: { id: string; title: string; category?: string; king?: string; character?: { name?: string } | null }) => ({
        id: e.id,
        title: e.title,
        category: e.category,
        who: e.character?.name || e.king,
      }));
  } catch {
    catalogCache = [];
  }
  return catalogCache!;
}

// AI 응답에서 제어 마커를 떼어내 본문/추천질문/이동제안으로 나눈다
function parseMarkers(raw: string): { text: string; suggestions: string[]; goto: Goto | null } {
  const sug = raw.match(/\[SUGGESTIONS\]([\s\S]*?)\[\/SUGGESTIONS\]/);
  const suggestions = sug
    ? sug[1].split("|").map((s) => s.trim()).filter(Boolean).slice(0, 3)
    : [];
  const go = raw.match(/\[GOTO:([\w-]+)\]([\s\S]*?)\[\/GOTO\]/);
  const goto = go ? { id: go[1], label: go[2].trim() } : null;
  const text = raw
    .replace(/\[SUGGESTIONS\][\s\S]*?(\[\/SUGGESTIONS\]|$)/, "")
    .replace(/\[GOTO:[\w-]+\][\s\S]*?(\[\/GOTO\]|$)/, "")
    .trim();
  return { text, suggestions, goto };
}

// 스트리밍 중에는 마커(완성·미완성)가 깜빡이지 않게 가린다
function stripForStream(raw: string): string {
  let cut = raw.length;
  for (const tok of ["[SUGGESTIONS", "[GOTO"]) {
    const i = raw.indexOf(tok);
    if (i >= 0) cut = Math.min(cut, i);
  }
  let t = raw.slice(0, cut);
  const lb = t.lastIndexOf("[");
  if (lb >= 0 && ("[SUGGESTIONS]".startsWith(t.slice(lb)) || "[GOTO".startsWith(t.slice(lb)))) {
    t = t.slice(0, lb);
  }
  return t.trim();
}

export function MeokdolChatLauncher({ context, eventId }: Props) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>(GREETING);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [streaming, setStreaming] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>(STARTERS);
  const [goto, setGoto] = useState<Goto | null>(null);
  const catalogRef = useRef<CatalogItem[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    void loadCatalog().then((c) => { catalogRef.current = c; });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // 다른 책으로 이동 — 앱의 ?e= 기반 라우팅을 popstate로 깨운다
  function navigateTo(id: string) {
    setOpen(false);
    window.history.pushState(null, "", `/?e=${id}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  // 새 메시지·스트리밍마다 맨 아래로
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, streaming, suggestions, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send(override?: string) {
    const text = (override ?? input).trim();
    if (!text || busy) return;

    const history = msgs.map((m) => ({ role: m.role, text: m.text }));
    const next: Msg[] = [...msgs, { role: "user", text }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    setStreaming("");
    setSuggestions([]);
    setGoto(null);

    // 책을 읽는 중이면 지금 사건을 컨텍스트로 살짝 얹어 그 이야기에 맞게 답하게 한다
    const sent = context ? `(지금 읽는 이야기: "${context}") ${text}` : text;
    // 지금 책을 뺀 나머지 작품 목록 — 먹돌이가 연관된 다른 이야기를 권할 수 있게
    const related = catalogRef.current.filter((c) => c.id !== eventId);

    let full = "";
    await streamAI(
      "talk",
      { text: sent, history, related },
      {
        onChunk: (t) => {
          full += t;
          setStreaming(stripForStream(full));
        },
        onDone: (d) => {
          const { text: clean, suggestions: sug, goto: g } = parseMarkers(d.text || full);
          setMsgs([...next, { role: "ai", text: clean || "음, 잘 못 들었어. 다시 한 번 물어봐 줄래?" }]);
          setSuggestions(sug);
          // 카탈로그에 있고 지금 책이 아닌 경우에만 이동 칩 노출
          setGoto(g && g.id !== eventId && catalogRef.current.some((c) => c.id === g.id) ? g : null);
          setStreaming("");
          setBusy(false);
        },
        onError: () => {
          setMsgs([...next, { role: "ai", text: "이런, 잠깐 연결이 끊겼나 봐. 조금 뒤에 다시 물어봐 줘!" }]);
          setStreaming("");
          setBusy(false);
        },
      },
      { rag: true } // 실록 근거(corpus) 주입 — 반복·환각 줄이고 책 사건에 맞게 답하게
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
              {!busy && (suggestions.length > 0 || goto) && (
                <div className="meokdol-chat-chips" role="group" aria-label="추천">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      className="meokdol-chat-chip"
                      onClick={() => send(s)}
                    >
                      {s}
                    </button>
                  ))}
                  {goto && (
                    <button
                      type="button"
                      className="meokdol-chat-chip goto"
                      onClick={() => navigateTo(goto.id)}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
                      </svg>
                      {goto.label}
                    </button>
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
                  onClick={() => send()}
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
