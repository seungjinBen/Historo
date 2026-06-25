export type Phase = "interest" | "event_locked" | "branching" | "plot";

export interface Cut {
  label: string;
  description: string;
}

export interface StoryChatSession {
  phase: Phase;
  eventId: string | null;
  branchCount: number;
  choicesSoFar: Cut[];
}

export const INITIAL_SESSION: StoryChatSession = {
  phase: "interest",
  eventId: null,
  branchCount: 0,
  choicesSoFar: [],
};

export interface ParsedResponse {
  clean: string;
  eventId: string | null;
  cuts: string[];
  suggestions: string[];
  chips: string[];
}

export function parseAiResponse(raw: string): ParsedResponse {
  const eventMatch = raw.match(/\[EVENT:(\w+)\]/);
  const eventId = eventMatch ? eventMatch[1] : null;

  const cuts: string[] = [];
  const cutRegex = /\[CUT\]([\s\S]*?)\[\/CUT\]/g;
  let m: RegExpExecArray | null;
  while ((m = cutRegex.exec(raw)) !== null) cuts.push(m[1].trim());

  const sugMatch = raw.match(/\[SUGGESTIONS\]([\s\S]*?)\[\/SUGGESTIONS\]/);
  const suggestions = sugMatch ? sugMatch[1].split("|").map((s) => s.trim()).filter(Boolean) : [];

  // Remove markers but keep CUT content visible
  const clean = raw
    .replace(/\[EVENT:\w+\]/g, "")
    .replace(/\[CUT\]([\s\S]*?)\[\/CUT\]/g, "$1")
    .replace(/\[SUGGESTIONS\][\s\S]*?\[\/SUGGESTIONS\]/g, "")
    .trim();

  // Parse "1. text\n2. text\n3. text" → chip labels
  const chips: string[] = [];
  const chipRegex = /^[1-3][.)]\s+(.+)$/gm;
  let c: RegExpExecArray | null;
  while ((c = chipRegex.exec(clean)) !== null) {
    const label = c[1].trim();
    if (label) chips.push(label);
  }

  return { clean, eventId, cuts, suggestions, chips: chips.length === 3 ? chips : [] };
}

// 텍스트에서 사건 키워드를 감지해 eventId 추론 (LLM이 [EVENT:id] 빠뜨렸을 때 fallback)
function inferEventId(text: string): string | null {
  if (text.includes("명량") || text.includes("이순신")) return "myeongnyang";
  if (text.includes("행주") || text.includes("권율")) return "haengju";
  if (text.includes("훈민정음") || text.includes("세종")) return "hangul";
  return null;
}

export function applyToSession(
  session: StoryChatSession,
  parsed: ParsedResponse,
  userLabel: string
): StoryChatSession {
  const next = { ...session, choicesSoFar: [...session.choicesSoFar] };

  // 1. EVENT 마커 → 또는 fallback 감지
  let detectedEventId = parsed.eventId;
  if (!detectedEventId && session.phase === "interest") {
    const text = parsed.clean;
    // "차례야"가 있으면 event_locked 응답 = 사건 확정됨
    if (text.includes("차례야") || text.includes("주인공이 될")) {
      detectedEventId = inferEventId(text);
    }
    // CUT이 있어도 사건 확정된 것
    if (!detectedEventId && parsed.cuts.length > 0) {
      detectedEventId = inferEventId(text);
    }
  }

  if (detectedEventId && !session.eventId) {
    next.eventId = detectedEventId;
    next.phase = "event_locked";
  }

  // 2. CUT → next.phase 기준으로 판단 (방금 event_locked로 전환됐을 수도 있음)
  if (parsed.cuts.length > 0 && (next.phase === "branching" || next.phase === "event_locked")) {
    for (const desc of parsed.cuts) {
      next.choicesSoFar.push({ label: userLabel, description: desc });
    }
    next.branchCount = session.branchCount + parsed.cuts.length;
    if (next.branchCount >= 3) next.phase = "plot";
  }

  // 3. event_locked → branching (첫 선택지 제시, CUT 없음)
  if (next.phase === "event_locked" && parsed.chips.length === 3 && parsed.cuts.length === 0) {
    next.phase = "branching";
  }

  return next;
}

export function parsePlotSummary(text: string): { title: string; scenes: string[] } {
  const titleMatch = text.match(/「(.+?)」/);
  const title = titleMatch ? titleMatch[1] : "나의 역사 이야기";
  const scenes: string[] = [];
  const sceneRegex = /^\d+[.)]\s*(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = sceneRegex.exec(text)) !== null) scenes.push(m[1].trim());
  return { title, scenes: scenes.length >= 2 ? scenes : [text.slice(0, 200)] };
}

export const EVENTS_META: Record<string, { title: string; people: string[] }> = {
  myeongnyang: { title: "이순신 명량해전", people: ["이순신"] },
  haengju: { title: "권율 행주대첩", people: ["권율"] },
  hangul: { title: "세종대왕 훈민정음 창제", people: ["세종대왕"] },
};

export function phaseToStep(phase: Phase, branchCount: number): number {
  if (phase === "interest") return 0;
  if (phase === "event_locked") return 1;
  if (phase === "branching") return 2;
  return 3;
}

export function calcProgress(phase: Phase, branchCount: number): number {
  if (phase === "interest") return 10;
  if (phase === "event_locked") return 28;
  if (phase === "branching") return 35 + branchCount * 20;
  return 100;
}
