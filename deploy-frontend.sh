#!/bin/bash
set -e
MSG="${1:-update}"
cd "$(dirname "$0")"

echo "📦 Next.js 정적 빌드 중..."
cd frontend
NEXT_PUBLIC_API_BASE=https://ti5h7b2bs2.execute-api.ap-northeast-2.amazonaws.com/prod npm run build
cd ..

echo "☁️  S3 업로드 중..."
aws s3 sync frontend/out/ s3://history-road-web/ \
  --profile glory --region ap-northeast-2 --delete \
  --cache-control "no-cache" --include "*.html" --exclude "*" --include "*.html"

aws s3 sync frontend/out/ s3://history-road-web/ \
  --profile glory --region ap-northeast-2 \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude "*.html"

echo "🔄 CloudFront 캐시 무효화..."
aws cloudfront create-invalidation \
  --distribution-id E1997PVTGR6Y33 \
  --profile glory --paths "/*" \
  --query "Invalidation.{Id:Id,Status:Status}" --output table

git add -A
git commit -m "$MSG" --allow-empty
git push origin main

echo ""
echo "✅ 프론트 배포 완료 → https://d6a53spc1xryh.cloudfront.net"
