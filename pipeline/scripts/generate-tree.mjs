// 역사로 MVP — 선택 트리 사전생성
// 실행: ANTHROPIC_API_KEY=sk-... node scripts/generate-tree.mjs
//
// 사건 하나당 Claude를 1회 호출해 "사실 이후의 만약에" 분기 트리를 통째로 만든다.
// 결과는 output/trees/{eventId}.json 으로 저장된다.
// 런타임에서는 이 JSON만 읽으므로 아이가 선택할 때 LLM 호출이 전혀 없다 = 즉각 반응.

import Anthropic from "@anthropic-ai/sdk";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const client = new Anthropic(); // ANTHROPIC_API_KEY 환경변수를 자동으로 읽는다

// ── 튜닝 포인트 ───────────────────────────────────────────────
const MODEL = "claude-sonnet-4-6";   // 품질을 더 높이려면 "claude-opus-4-8"
const CHOICES_PER_NODE = 2;          // 2 → 경로 8개(데모용 추천) / 3 → 경로 27개(기획 원안)
const DEPTH = 3;                     // 선택 단계 수
// ─────────────────────────────────────────────────────────────

const SYSTEM = `너는 초등학생(8-13세)을 위한 역사 인터랙티브 스토리 작가야.
조선왕조실록에 기록된 '역사적 사실'은 절대 바꾸지 않고, 사실 이후의 '만약에' 상상만 창작한다.

규칙:
- 사실 구간(사건 자체)은 고정. 모든 분기는 "만약 ~했다면?" 형태의 가정에서 출발한다.
- 모든 글은 초등학생이 읽을 수 있는 쉬운 한국어. 한 문장은 짧고 명확하게.
- 폭력적이거나 잔인하거나 정치적으로 민감한 묘사 금지. 따뜻하고 교육적인 톤.
- 실제 인물을 비하하거나 우스꽝스럽게 그리지 않는다.
- 출력은 지정된 JSON 스키마만. 설명문, 마크다운, 코드펜스 절대 금지.`;

function buildUserPrompt(event) {
  // 각 단계를 번호로 펼쳐 명시 → 모델이 깊이를 정확히 지킨다 (off-by-one 방지)
  const levels = [];
  for (let d = 1; d <= DEPTH; d++) {
    levels.push(`- ${d}단계 노드: narration(2~3문장) + choices ${CHOICES_PER_NODE}개`);
  }
  levels.push(`- ${DEPTH + 1}단계 노드(리프): choices 없이 ending(결말 2~3문장) + panels 4개`);

  return `다음 역사 사건으로 선택형 스토리 트리를 만들어줘.

[사건] ${event.title} (${event.year}년)
[출처] ${event.source}
[고증 범위 — 이 사실 안에서만] ${event.factContext}
[주인공] ${event.character.name}

중요: 아이는 이 트리에서 정확히 ${DEPTH}번 선택한 뒤 4컷 만화를 본다.
트리의 깊이를 아래대로 정확히 지켜라. 단계를 빠뜨리거나 더하지 마라.
${levels.join("\n")}

- 모든 분기는 "만약 ~했다면?" 형태의 가정에서 출발한다.
- panels는 정확히 4개. 각 panel은:
  - scene: 그 컷에서 일어나는 일 (한국어 한 문장)
  - sceneEn: 같은 장면의 짧은 영문 묘사 (이미지 생성용, 인물·배경·동작 위주)

JSON 스키마 (이 형태만, 다른 텍스트 없이). choice는 항상 {label, node} 구조다:
{
  "eventId": "${event.id}",
  "root": {                                  // 1단계
    "narration": "string",
    "choices": [
      { "label": "만약 ~했다면?", "node": { /* 2단계 노드, 같은 구조로 ${DEPTH}단계까지 */ } }
    ]
  }
}
// 마지막 ${DEPTH + 1}단계 node는 choices 대신 ending + panels 를 가진다:
// { "narration": "...", "ending": "...", "panels": [ {"scene":"...","sceneEn":"..."}, x4 ] }

오직 JSON만 출력해.`;
}

function extractJson(message) {
  const text = message.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(clean);
}

async function generateTree(event) {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 12000,
    system: SYSTEM,
    messages: [{ role: "user", content: buildUserPrompt(event) }],
  });
  return extractJson(message);
}

// 트리가 요구한 깊이/선택지 수를 지켰는지 간단 검증 (사전생성 단계에서 미리 걸러낸다)
function validateTree(tree, eventId) {
  const problems = [];
  function walk(node, depth) {
    const hasChoices = Array.isArray(node.choices);
    const isLeaf = Array.isArray(node.panels);
    if (depth < DEPTH) {
      if (!hasChoices) problems.push(`depth ${depth}: choices 없음`);
      else if (node.choices.length !== CHOICES_PER_NODE)
        problems.push(`depth ${depth}: 선택지 ${node.choices.length}개 (기대 ${CHOICES_PER_NODE})`);
      node.choices?.forEach((c) => c.node && walk(c.node, depth + 1));
    } else {
      if (!isLeaf) problems.push(`리프(depth ${depth}): panels 없음`);
      else if (node.panels.length !== 4)
        problems.push(`리프: 컷 ${node.panels.length}개 (기대 4)`);
    }
  }
  if (tree.eventId !== eventId) problems.push(`eventId 불일치: ${tree.eventId}`);
  walk(tree.root, 0);
  return problems;
}

async function main() {
  const { events } = JSON.parse(await readFile("data/events.json", "utf-8"));
  await mkdir("output/trees", { recursive: true });

  for (const event of events) {
    process.stdout.write(`생성 중: ${event.title} ... `);
    try {
      const tree = await generateTree(event);
      const problems = validateTree(tree, event.id);
      const out = path.join("output/trees", `${event.id}.json`);
      await writeFile(out, JSON.stringify(tree, null, 2), "utf-8");
      if (problems.length) {
        console.log(`저장됨 (검증 경고 ${problems.length}건)`);
        problems.forEach((p) => console.log(`   - ${p}`));
      } else {
        console.log(`완료 → ${out}`);
      }
    } catch (e) {
      console.log("실패");
      console.error(`   ${e.message}`);
    }
  }
}

main();
