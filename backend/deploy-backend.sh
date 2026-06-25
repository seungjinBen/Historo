#!/usr/bin/env bash
# 역사로 AI 백엔드 배포 — HTTP API(Lambda) + WebSocket API(스트리밍 Lambda) + Bedrock(Claude Haiku 4.5)
# 계정: glory(784486495827) · 리전: ap-northeast-2
set -euo pipefail
cd "$(dirname "$0")"

PROFILE="glory"
REGION="ap-northeast-2"
FN="history-road-ai"        # HTTP (동기)
WSFN="history-road-ws"      # WebSocket (스트리밍)
ROLE="history-road-ai-role"
ACCT="784486495827"
IMG_BUCKET="history-road-ai-images"   # 생성 이미지 저장(공개)

echo "▶ zip 패키징"
cd lambda
rm -f ../function.zip
zip -qr ../function.zip index.mjs ws.mjs prompt.mjs corpus.json events.json package.json node_modules
cd ..

# ── IAM 역할 (없으면 생성) ──
if ! aws iam get-role --role-name "$ROLE" --profile "$PROFILE" >/dev/null 2>&1; then
  echo "▶ IAM 역할 생성"
  aws iam create-role --role-name "$ROLE" --profile "$PROFILE" \
    --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}' >/dev/null
  aws iam attach-role-policy --role-name "$ROLE" --profile "$PROFILE" \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole >/dev/null
  echo "  역할 전파 대기(10s)"; sleep 10
fi
# Bedrock + WS 관리 + S3(이미지 저장) 권한 (멱등 — 매번 갱신)
aws iam put-role-policy --role-name "$ROLE" --profile "$PROFILE" \
  --policy-name bedrock-and-ws \
  --policy-document "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Action\":[\"bedrock:InvokeModel\",\"bedrock:InvokeModelWithResponseStream\",\"execute-api:ManageConnections\"],\"Resource\":\"*\"},{\"Effect\":\"Allow\",\"Action\":[\"s3:PutObject\"],\"Resource\":\"arn:aws:s3:::${IMG_BUCKET}/*\"}]}" >/dev/null
ROLE_ARN="arn:aws:iam::${ACCT}:role/${ROLE}"

# ── 두 Lambda 배포(같은 zip, 핸들러만 다름) ──
deploy_fn() {
  local name="$1" handler="$2" timeout="$3"
  if aws lambda get-function --function-name "$name" --profile "$PROFILE" --region "$REGION" >/dev/null 2>&1; then
    aws lambda update-function-code --function-name "$name" --zip-file fileb://function.zip \
      --profile "$PROFILE" --region "$REGION" >/dev/null
    echo "  ↻ $name 코드 갱신"
  else
    aws lambda create-function --function-name "$name" \
      --runtime nodejs20.x --handler "$handler" --role "$ROLE_ARN" \
      --timeout "$timeout" --memory-size 512 --zip-file fileb://function.zip \
      --profile "$PROFILE" --region "$REGION" >/dev/null
    echo "  + $name 생성"; sleep 5
  fi
}
echo "▶ Lambda 배포"
deploy_fn "$FN" "index.handler" 30
deploy_fn "$WSFN" "ws.handler" 60

# ── HTTP API (동기 — 기존) ──
API_ID=$(aws apigatewayv2 get-apis --profile "$PROFILE" --region "$REGION" \
  --query "Items[?Name=='${FN}-api'].ApiId | [0]" --output text 2>/dev/null)
if [ "$API_ID" = "None" ] || [ -z "$API_ID" ]; then
  echo "▶ HTTP API 생성"
  API_ID=$(aws apigatewayv2 create-api --name "${FN}-api" --protocol-type HTTP \
    --target "arn:aws:lambda:${REGION}:${ACCT}:function:${FN}" \
    --profile "$PROFILE" --region "$REGION" --query ApiId --output text)
fi
aws lambda add-permission --function-name "$FN" --statement-id apigw-invoke \
  --action lambda:InvokeFunction --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:${REGION}:${ACCT}:${API_ID}/*/*" \
  --profile "$PROFILE" --region "$REGION" >/dev/null 2>&1 || true

# ── WebSocket API (스트리밍) ──
WSID=$(aws apigatewayv2 get-apis --profile "$PROFILE" --region "$REGION" \
  --query "Items[?Name=='${WSFN}-api'].ApiId | [0]" --output text 2>/dev/null)
if [ "$WSID" = "None" ] || [ -z "$WSID" ]; then
  echo "▶ WebSocket API 생성"
  WSID=$(aws apigatewayv2 create-api --name "${WSFN}-api" --protocol-type WEBSOCKET \
    --route-selection-expression '$request.body.action' \
    --profile "$PROFILE" --region "$REGION" --query ApiId --output text)
  INTEG=$(aws apigatewayv2 create-integration --api-id "$WSID" --integration-type AWS_PROXY \
    --integration-uri "arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/arn:aws:lambda:${REGION}:${ACCT}:function:${WSFN}/invocations" \
    --integration-method POST --profile "$PROFILE" --region "$REGION" --query IntegrationId --output text)
  for RK in '$connect' '$disconnect' '$default'; do
    aws apigatewayv2 create-route --api-id "$WSID" --route-key "$RK" \
      --target "integrations/${INTEG}" --profile "$PROFILE" --region "$REGION" >/dev/null
  done
  aws apigatewayv2 create-stage --api-id "$WSID" --stage-name prod --auto-deploy \
    --profile "$PROFILE" --region "$REGION" >/dev/null
fi
aws lambda add-permission --function-name "$WSFN" --statement-id ws-invoke \
  --action lambda:InvokeFunction --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:${REGION}:${ACCT}:${WSID}/*/*" \
  --profile "$PROFILE" --region "$REGION" >/dev/null 2>&1 || true

echo "✓ 배포 완료"
echo "  HTTP : https://${API_ID}.execute-api.${REGION}.amazonaws.com/"
echo "  WS   : wss://${WSID}.execute-api.${REGION}.amazonaws.com/prod"
