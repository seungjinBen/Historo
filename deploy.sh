#!/bin/bash
set -e

MSG="${1:-update}"

cd "$(dirname "$0")"

echo "📦 Next.js 정적 빌드 중..."
cd web
NEXT_PUBLIC_API_BASE=https://historo-backend.onrender.com npm run build
cd ..

echo "☁️  S3 업로드 중..."
# HTML — no-cache
aws s3 sync web/out/ s3://history-road-web/ \
  --profile glory \
  --region ap-northeast-2 \
  --delete \
  --cache-control "no-cache" \
  --include "*.html" \
  --exclude "*" \
  --include "*.html"

# 정적 assets — 장기 캐시
aws s3 sync web/out/ s3://history-road-web/ \
  --profile glory \
  --region ap-northeast-2 \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude "*.html"

echo "🔄 CloudFront 캐시 무효화 중..."
aws cloudfront create-invalidation \
  --distribution-id E1997PVTGR6Y33 \
  --profile glory \
  --paths "/*" \
  --query "Invalidation.{Id:Id,Status:Status}" \
  --output table

# 백엔드 CORS 변경사항 git push
git add -A
git commit -m "$MSG" --allow-empty
git push origin main

echo ""
echo "✅ 배포 완료 → https://d6a53spc1xryh.cloudfront.net"
