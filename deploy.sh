#!/bin/bash
set -e

MSG="${1:-update}"

cd "$(dirname "$0")"

git add -A
git commit -m "$MSG" --allow-empty
git push origin main

echo "✅ 배포 완료 → https://historo.vercel.app"
