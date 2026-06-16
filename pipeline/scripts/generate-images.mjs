// 역사로 MVP — 4컷 이미지 사전생성 (Nano Banana / Gemini 2.5 Flash Image)
// 실행: GEMINI_API_KEY=... node scripts/generate-images.mjs
//
// 전략: 사건마다 "캐릭터 앵커" 한 장을 먼저 만들고,
//        그 앵커를 reference로 넣어 모든 컷을 생성한다 → 4컷 내내 얼굴·복장 일관.
// 이미 만든 파일은 건너뛰므로(무료 한도 보호) 재실행해도 추가 비용이 없다.

import { GoogleGenAI } from "@google/genai";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ai = new GoogleGenAI({}); // GEMINI_API_KEY 환경변수를 자동으로 읽는다

// ── 튜닝 포인트 ───────────────────────────────────────────────
const MODEL = "gemini-2.5-flash-image"; // 무료 티어(하루 500장). 제출 품질용은 Nano Banana Pro로 교체
const DELAY_MS = 1500;                   // 요청 간 간격 (무료 티어 rate limit 여유)
// ─────────────────────────────────────────────────────────────

// 모든 컷에 공통으로 들어가는 화풍·고증·글자금지 규칙
const STYLE = [
  "warm children's storybook illustration, soft colors, gentle lighting",
  "historically grounded Joseon-dynasty Korea setting: traditional hanok architecture, Korean clothing (hanbok)",
  "IMPORTANT: do NOT render any readable text, letters, words, numbers, or signs with characters, and no speech bubbles. Any writing must be blank or illegible decorative marks only.",
].join(". ");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 429 처리: 분당 제한(RPM)이면 잠시 대기 후 재시도, limit:0(billing 미연결)이면 즉시 중단
async function withRetry(fn, label, maxRetries = 4) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      const msg = e?.message ?? String(e);
      const is429 = e?.status === 429 || /429|RESOURCE_EXHAUSTED/.test(msg);
      const is503 = e?.status === 503 || /503|UNAVAILABLE/.test(msg);
      if (is429 && /limit:\s*0/.test(msg)) throw new Error("BILLING_REQUIRED");
      if ((is429 || is503) && attempt < maxRetries) {
        const m = msg.match(/retry in ([\d.]+)s/i) || msg.match(/retryDelay"?:?\s*"?([\d.]+)s/i);
        const waitS = m ? Math.ceil(parseFloat(m[1])) + 1 : Math.min(2 ** attempt * 5, 60);
        console.log(`    rate limit — ${waitS}s 대기 후 재시도 (${attempt + 1}/${maxRetries}) [${label}]`);
        await sleep(waitS * 1000);
        continue;
      }
      throw e;
    }
  }
}

function anchorPrompt(character) {
  return [
    `Character reference sheet of ${character.name}: ${character.appearance}.`,
    "Full body, neutral friendly standing pose, plain soft background.",
    STYLE,
  ].join(" ");
}

function panelPrompt(character, panel, hasRef) {
  const parts = [];
  if (hasRef) {
    // 이 컷에 주인공이 등장 → 앵커로 얼굴·복장 일관성 유지
    parts.push(`Keep the main character consistent with the reference image: ${character.appearance}.`);
  }
  // 주인공이 없는 컷은 reference 없이 장면만 그린다 (주인공이 억지로 끼어드는 것 방지)
  parts.push(`Scene: ${panel.sceneEn}`);
  parts.push(STYLE);
  return parts.join(" ");
}

// generateContent 호출 → 응답에서 base64 이미지 1장 추출 (429는 withRetry가 처리)
async function generateImage(prompt, refBase64 = null, label = "") {
  return withRetry(async () => {
    const parts = [];
    if (refBase64) parts.push({ inlineData: { mimeType: "image/png", data: refBase64 } });
    parts.push({ text: prompt });

    const res = await ai.models.generateContent({ model: MODEL, contents: parts });
    const out = res.candidates?.[0]?.content?.parts ?? [];
    for (const part of out) {
      if (part.inlineData?.data) return part.inlineData.data;
    }
    throw new Error("응답에 이미지가 없음 (텍스트만 반환됐을 수 있음)");
  }, label);
}

// 트리를 순회해 모든 리프(결말)를 모은다. pathKey = 선택 인덱스를 "-"로 이은 것 (예: "0-1-0")
// 이 pathKey 규칙은 런타임(React)에서 사용자 선택과 이미지를 매칭하는 열쇠다.
function collectLeaves(node, pathIndices, leaves) {
  if (Array.isArray(node.panels)) {
    leaves.push({ pathKey: pathIndices.join("-"), panels: node.panels });
    return;
  }
  (node.choices ?? []).forEach((choice, i) => {
    if (choice.node) collectLeaves(choice.node, [...pathIndices, i], leaves);
  });
}

async function processEvent(event, tree) {
  const imgDir = path.join("output/images", event.id);
  await mkdir(imgDir, { recursive: true });

  // 1) 앵커 이미지 (없으면 생성, 있으면 재사용)
  const anchorPath = path.join(imgDir, "_anchor.png");
  let anchorBase64;
  if (existsSync(anchorPath)) {
    anchorBase64 = (await readFile(anchorPath)).toString("base64");
    console.log(`  앵커: 기존 파일 재사용`);
  } else {
    console.log(`  앵커 생성 중 (${event.character.name}) ...`);
    anchorBase64 = await generateImage(anchorPrompt(event.character), null, `${event.id} 앵커`);
    await writeFile(anchorPath, Buffer.from(anchorBase64, "base64"));
    await sleep(DELAY_MS);
  }

  // 2) 모든 경로의 4컷 생성
  const leaves = [];
  collectLeaves(tree.root, [], leaves);
  const manifest = {};
  let made = 0, skipped = 0;

  // scene(한국어)에 주인공 이름이 들어 있으면 그 컷에 주인공이 등장한다고 본다
  const heroKeyword = event.character.name.slice(0, 2); // "세종대왕"→"세종", "이순신"→"이순"

  for (const leaf of leaves) {
    const files = [];
    for (let p = 0; p < leaf.panels.length; p++) {
      const filename = `${leaf.pathKey}_panel${p + 1}.png`;
      const outPath = path.join(imgDir, filename);
      files.push(filename);
      if (existsSync(outPath)) { skipped++; continue; }
      const scene = leaf.panels[p].scene ?? "";
      const heroPresent = scene.includes(event.character.name) || scene.includes(heroKeyword);
      const ref = heroPresent ? anchorBase64 : null;
      try {
        const data = await generateImage(panelPrompt(event.character, leaf.panels[p], heroPresent), ref, filename);
        await writeFile(outPath, Buffer.from(data, "base64"));
        made++;
        await sleep(DELAY_MS);
      } catch (e) {
        console.error(`    실패 ${filename}: ${e.message}`);
      }
    }
    manifest[leaf.pathKey] = files;
  }

  await writeFile(path.join(imgDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`  완료: 새로 ${made}장, 건너뜀 ${skipped}장 → ${imgDir}`);
}

async function main() {
  const { events } = JSON.parse(await readFile("data/events.json", "utf-8"));
  try {
    for (const event of events) {
      const treePath = path.join("output/trees", `${event.id}.json`);
      if (!existsSync(treePath)) {
        console.log(`건너뜀: ${event.title} (트리 없음 — 먼저 generate-tree.mjs 실행)`);
        continue;
      }
      console.log(`이미지: ${event.title}`);
      const tree = JSON.parse(await readFile(treePath, "utf-8"));
      await processEvent(event, tree);
    }
  } catch (e) {
    if (e.message === "BILLING_REQUIRED") {
      console.error("\n[중단] 이미지 생성 무료 한도가 0입니다 (limit: 0).");
      console.error("이 프로젝트는 아직 결제 계정이 연결되지 않았습니다.");
      console.error("→ Google AI Studio / Cloud Console에서 결제 계정을 연결하면");
      console.error("  무료 한도(하루 500장)가 열립니다. 한도 안에서는 과금되지 않습니다.");
      console.error("  안내: https://ai.google.dev/gemini-api/docs/rate-limits");
      process.exit(1);
    }
    throw e;
  }
}

main();
