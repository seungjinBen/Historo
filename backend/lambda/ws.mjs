import { BedrockRuntimeClient, ConverseStreamCommand } from "@aws-sdk/client-bedrock-runtime";
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { buildPrompt, buildMessages, maxTokensFor, wantsHistory, VALID_ACTIONS } from "./prompt.mjs";

const REGION = process.env.BEDROCK_REGION || "ap-northeast-2";
const MODEL_ID = process.env.MODEL_ID || "global.anthropic.claude-haiku-4-5-20251001-v1:0";
const bedrock = new BedrockRuntimeClient({ region: REGION });
const s3 = new S3Client({ region: REGION });
const IMG_BUCKET = process.env.IMG_BUCKET;

// OpenAI gpt-image-1 생성 → S3 업로드 → 공개 URL (WS는 60s라 30s 한도 회피)
async function genAndUpload(prompt, reqId) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY 미설정");
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ model: "gpt-image-1", prompt, size: "1024x1024", quality: "low", n: 1 }),
  });
  const d = await res.json();
  if (!res.ok) throw new Error(d?.error?.message || `openai ${res.status}`);
  const b64 = d?.data?.[0]?.b64_json;
  if (!b64) throw new Error("no image");
  const objKey = `gen/${(reqId || "img") + "-" + Date.now()}.png`;
  await s3.send(new PutObjectCommand({ Bucket: IMG_BUCKET, Key: objKey, Body: Buffer.from(b64, "base64"), ContentType: "image/png" }));
  return `https://${IMG_BUCKET}.s3.${REGION}.amazonaws.com/${objKey}`;
}

function apiClient(domain, stage) {
  return new ApiGatewayManagementApiClient({ region: REGION, endpoint: `https://${domain}/${stage}` });
}
async function post(client, connId, data) {
  try {
    await client.send(new PostToConnectionCommand({ ConnectionId: connId, Data: Buffer.from(JSON.stringify(data)) }));
  } catch (e) {
    // GoneException 등 — 무시
  }
}

// WebSocket 라우팅: $connect / $disconnect / $default(메시지)
export const handler = async (event) => {
  const rc = event.requestContext || {};
  const route = rc.routeKey;
  if (route === "$connect" || route === "$disconnect") return { statusCode: 200 };

  const connId = rc.connectionId;
  const client = apiClient(rc.domainName, rc.stage);

  let body = {};
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    await post(client, connId, { type: "error", error: "bad json" });
    return { statusCode: 200 };
  }

  if (body.action === "ping") {
    await post(client, connId, { type: "pong" });
    return { statusCode: 200 };
  }

  // 이미지 생성(OpenAI) → S3 → URL
  if (body.action === "image") {
    const reqId = body.reqId || "";
    await post(client, connId, { type: "start", reqId });
    try {
      const url = await genAndUpload(body.payload?.prompt || "", reqId);
      await post(client, connId, { type: "image", url, reqId });
    } catch (e) {
      await post(client, connId, { type: "error", error: String(e?.message || e), reqId });
    }
    return { statusCode: 200 };
  }

  const action = body.action;
  const useRag = body.rag !== false;
  const reqId = body.reqId || "";
  if (!VALID_ACTIONS.includes(action)) {
    await post(client, connId, { type: "error", error: "invalid action", reqId });
    return { statusCode: 200 };
  }

  try {
    const payload = body.payload || {};
    const { system, user, chunks } = buildPrompt({ action, payload, useRag });
    const messages = wantsHistory(action) ? buildMessages(payload, user) : [{ role: "user", content: [{ text: user }] }];

    await post(client, connId, { type: "start", reqId });

    const resp = await bedrock.send(
      new ConverseStreamCommand({
        modelId: MODEL_ID,
        system: [{ text: system }],
        messages,
        inferenceConfig: { maxTokens: maxTokensFor(action), temperature: 0.6 },
      })
    );

    let full = "";
    for await (const ev of resp.stream) {
      const delta = ev.contentBlockDelta?.delta?.text;
      if (delta) {
        full += delta;
        await post(client, connId, { type: "chunk", content: delta, reqId });
      }
    }

    await post(client, connId, {
      type: "done",
      text: full.trim(),
      sources: chunks.map((c) => ({ source: c.source })),
      grounded: useRag,
      reqId,
    });
  } catch (e) {
    await post(client, connId, { type: "error", error: String(e?.message || e), reqId });
  }

  return { statusCode: 200 };
};
