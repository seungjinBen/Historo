"use client";

const WS_URL =
  process.env.NEXT_PUBLIC_HISTORY_AI_WS ||
  "wss://8zbp8627ej.execute-api.ap-northeast-2.amazonaws.com/prod";

let socket: WebSocket | null = null;
let ready: Promise<WebSocket> | null = null;

function connect(): Promise<WebSocket> {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) && ready) {
    return ready;
  }
  socket = new WebSocket(WS_URL);
  ready = new Promise((resolve, reject) => {
    const s = socket!;
    const to = setTimeout(() => reject(new Error("ws timeout")), 8000);
    s.onopen = () => { clearTimeout(to); resolve(s); };
    s.onerror = () => { clearTimeout(to); reject(new Error("ws error")); };
    s.onclose = () => { socket = null; ready = null; };
  });
  return ready;
}

export type StreamHandlers = {
  onChunk?: (t: string) => void;
  onDone?: (d: { text: string }) => void;
  onError?: (e: string) => void;
};

export async function generateImage(prompt: string): Promise<string | null> {
  let s: WebSocket;
  try { s = await connect(); } catch { return null; }
  const reqId = Math.random().toString(36).slice(2);
  return new Promise((resolve) => {
    const onMsg = (e: MessageEvent) => {
      let d: { type: string; url?: string; reqId?: string; error?: string };
      try { d = JSON.parse(e.data); } catch { return; }
      if (d.reqId && d.reqId !== reqId) return;
      if (d.type === "image") { s.removeEventListener("message", onMsg); resolve(d.url || null); }
      else if (d.type === "error") { s.removeEventListener("message", onMsg); resolve(null); }
    };
    s.addEventListener("message", onMsg);
    try { s.send(JSON.stringify({ action: "image", reqId, payload: { prompt } })); }
    catch { resolve(null); }
  });
}

export async function streamAI(
  action: string,
  payload: Record<string, unknown>,
  handlers: StreamHandlers,
  opts: { rag?: boolean } = {}
): Promise<{ text: string } | null> {
  let s: WebSocket;
  try { s = await connect(); } catch { handlers.onError?.("connect failed"); return null; }

  const reqId = Math.random().toString(36).slice(2);
  return new Promise((resolve) => {
    const done = (val: { text: string } | null) => {
      s.removeEventListener("message", onMsg);
      resolve(val);
    };
    const onMsg = (e: MessageEvent) => {
      let d: { type: string; content?: string; text?: string; error?: string; reqId?: string };
      try { d = JSON.parse(e.data); } catch { return; }
      if (d.reqId && d.reqId !== reqId) return;
      if (d.type === "chunk") handlers.onChunk?.(d.content || "");
      else if (d.type === "done") {
        const out = { text: (d.text || "").trim() };
        handlers.onDone?.(out);
        done(out);
      } else if (d.type === "error") {
        handlers.onError?.(d.error || "error");
        done(null);
      }
    };
    s.addEventListener("message", onMsg);
    try {
      s.send(JSON.stringify({ action, rag: opts.rag === true, reqId, payload }));
    } catch { done(null); }
  });
}
