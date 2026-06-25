import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import { buildPrompt, buildMessages, maxTokensFor, wantsHistory, VALID_ACTIONS } from "./prompt.mjs";

const REGION = process.env.BEDROCK_REGION || "ap-northeast-2";
const MODEL_ID = process.env.MODEL_ID || "global.anthropic.claude-haiku-4-5-20251001-v1:0";
const bedrock = new BedrockRuntimeClient({ region: REGION });

const ALLOWED_ORIGINS = ["https://d6a53spc1xryh.cloudfront.net", "http://localhost:3000"];

async function generate({ action, payload, useRag }) {
  const { system, user, chunks } = buildPrompt({ action, payload, useRag });
  const messages = wantsHistory(action) ? buildMessages(payload, user) : [{ role: "user", content: [{ text: user }] }];
  const res = await bedrock.send(
    new ConverseCommand({
      modelId: MODEL_ID,
      system: [{ text: system }],
      messages,
      inferenceConfig: { maxTokens: maxTokensFor(action), temperature: 0.6 },
    })
  );
  const text = res.output?.message?.content?.[0]?.text?.trim() || "";
  return { text, grounded: useRag, sources: chunks.map((c) => action === "story" ? { source: c.source, text: c.text } : { source: c.source }), usage: res.usage };
}

// OpenAI 이미지 생성 (gpt-image-1) — 키는 Lambda 환경변수에만(클라 비노출)
async function genImage(prompt) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY 미설정");
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ model: "gpt-image-1", prompt, size: "1024x1024", n: 1 }),
  });
  const d = await res.json();
  if (!res.ok) throw new Error(d?.error?.message || `openai ${res.status}`);
  const b64 = d?.data?.[0]?.b64_json;
  if (!b64) throw new Error("no image");
  return `data:image/png;base64,${b64}`;
}

function cors(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Content-Type": "application/json",
  };
}

export const handler = async (event) => {
  const origin = event?.headers?.origin || event?.headers?.Origin || "";
  const method = event?.requestContext?.http?.method || "POST";
  const headers = cors(origin);

  if (method === "OPTIONS") return { statusCode: 204, headers, body: "" };

  try {
    const body = JSON.parse(event.body || "{}");
    const action = body.action;
    if (action === "image") {
      const image = await genImage(body.payload?.prompt || "");
      return { statusCode: 200, headers, body: JSON.stringify({ image }) };
    }
    const useRag = body.rag !== false;
    if (!VALID_ACTIONS.includes(action)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "invalid action" }) };
    }
    const out = await generate({ action, payload: body.payload || {}, useRag });
    return { statusCode: 200, headers, body: JSON.stringify(out) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: String(e?.message || e) }) };
  }
};
