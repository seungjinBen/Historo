// 역사로 MVP — 실록 원문 → 아이 눈높이 '진짜 이야기' 변환 (빌드타임 1회)
// 실행: ANTHROPIC_API_KEY=... node scripts/generate-kidstory.mjs
//
// 사건마다 실록 원문(sillokUrl)을 fetch해 Claude가 초등 눈높이로 풀어준다.
// 결과는 output/kidstory/{eventId}.json 으로 저장되고, 런타임(뷰어)은 이걸 읽기만 한다.
// → 아이가 눌러도 LLM 호출 0, 비용 0, 즉시 표시. (트리·이미지와 같은 패턴)

import Anthropic from "@anthropic-ai/sdk";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const client = new Anthropic(); // ANTHROPIC_API_KEY 자동 사용
const MODEL = "claude-sonnet-4-6"; // 품질 더 원하면 "claude-opus-4-8"

// HTML에서 사람이 읽는 텍스트만 거칠게 추출 (의존성 없이)
function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchSillok(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; historo-mvp/1.0)" },
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    // 토큰 절약: 앞부분 위주로 자른다 (기사 본문이 앞에 있음)
    return htmlToText(html).slice(0, 6000);
  } finally {
    clearTimeout(timer);
  }
}

const SYSTEM = `너는 초등학생(8-13세)에게 역사를 들려주는 친절한 이야기꾼이야.

가장 중요한 규칙 — 절대 어기지 마:
- 주어진 실록 기록(또는 사실 요약)에 실제로 있는 내용만 말한다. 절대 지어내지 않는다.
- 기록에 없거나 불확실한 건 포함하지 않는다. 추측·과장·미화 금지.
- 쉬운 한국어와 짧은 문장. 어려운 한자어는 풀어서 설명한다.
- 출력은 지정된 JSON만. 설명문·마크다운·코드펜스 절대 금지.`;

function buildUserPrompt(event, sourceText, fromSillok) {
  const sourceLabel = fromSillok
    ? "다음은 조선왕조실록 원문과 국역이 섞인 기록이야 (글자 설명 나열 부분은 무시해도 돼)"
    : "다음은 이 사건의 검증된 사실 요약이야";
  return `'${event.title}'에 대한 자료야.

${sourceLabel}:
"""
${sourceText}
"""

이 자료를 바탕으로, 4컷 만화를 다 만든 아이에게 "그런데 진짜로는 어떻게 됐을까?"를
들려주는 내용을 만들어줘.

JSON 형식 (이것만 출력):
{
  "kidStory": "3~4문장. 이 사건이 실제로 어떻게 됐는지 쉽고 따뜻하게 들려줘. 자료에 있는 사실만.",
  "funFacts": [
    "깜짝 사실 1 — 한 문장. 아이가 '오!' 할 만한, 자료/역사적 사실 범위 안의 내용.",
    "깜짝 사실 2 — 한 문장."
  ]
}`;
}

function extractJson(message) {
  const text = message.content.filter((b) => b.type === "text").map((b) => b.text).join("\n");
  return JSON.parse(text.replace(/```json/g, "").replace(/```/g, "").trim());
}

async function main() {
  const { events } = JSON.parse(await readFile("data/events.json", "utf-8"));
  await mkdir("output/kidstory", { recursive: true });

  for (const event of events) {
    process.stdout.write(`변환 중: ${event.title} ... `);

    // 1) 원문 확보: sillokUrl 있으면 실록에서, 없거나 실패하면 factContext로 폴백
    let sourceText = "";
    let fromSillok = false;
    if (event.sillokUrl) {
      try {
        sourceText = await fetchSillok(event.sillokUrl);
        fromSillok = sourceText.length > 100;
      } catch (e) {
        console.log(`(원문 fetch 실패: ${e.message} → 요약 사용)`);
      }
    }
    if (!fromSillok) sourceText = event.factContext;

    // 2) Claude로 아이 눈높이 변환
    try {
      const msg = await client.messages.create({
        model: MODEL,
        max_tokens: 1500,
        system: SYSTEM,
        messages: [{ role: "user", content: buildUserPrompt(event, sourceText, fromSillok) }],
      });
      const data = extractJson(msg);
      const out = {
        eventId: event.id,
        source: event.source,
        sillokUrl: event.sillokUrl ?? null,
        fromSillok, // 실록 원문에서 변환했는지(true) 요약 폴백인지(false)
        kidStory: data.kidStory,
        funFacts: data.funFacts ?? [],
      };
      await writeFile(
        path.join("output/kidstory", `${event.id}.json`),
        JSON.stringify(out, null, 2),
        "utf-8"
      );
      console.log(`완료 ${fromSillok ? "(실록 원문 기반)" : "(요약 기반)"}`);
    } catch (e) {
      console.log("실패");
      console.error(`   ${e.message}`);
    }
  }
}

main();
