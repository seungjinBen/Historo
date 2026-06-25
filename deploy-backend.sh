#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/backend/auth-lambda"

PROFILE="glory"
REGION="ap-northeast-2"
FUNCTION="historo-backend"

echo "📦 Python Lambda 패키징..."
zip -q handler.zip handler.py

echo "🚀 Lambda 배포..."
aws lambda update-function-code \
  --function-name $FUNCTION \
  --profile $PROFILE --region $REGION \
  --zip-file fileb://handler.zip \
  --query "LastUpdateStatus" --output text

rm -f handler.zip

echo ""
echo "✅ 백엔드 배포 완료"
echo "   API: https://ti5h7b2bs2.execute-api.ap-northeast-2.amazonaws.com/prod"
