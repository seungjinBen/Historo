#!/bin/bash
# Spring Boot REST API → Lambda 재배포 스크립트
set -euo pipefail
cd "$(dirname "$0")/backend/spring"

PROFILE="glory"
REGION="ap-northeast-2"
FUNCTION="historo-backend"
BUCKET="history-road-web"

echo "🔨 JAR 빌드 중..."
./gradlew bootJar -x test -q

echo "📦 ZIP 패키징..."
cp build/libs/historo-backend-0.0.1-SNAPSHOT.jar /tmp/historo-backend-0.0.1-SNAPSHOT.jar
cd /tmp
cat > bootstrap << 'BOOT'
#!/bin/bash
exec java -jar /var/task/historo-backend-0.0.1-SNAPSHOT.jar
BOOT
chmod +x bootstrap
zip -qj historo-backend-lambda.zip bootstrap historo-backend-0.0.1-SNAPSHOT.jar

echo "☁️  S3 업로드..."
aws s3 cp historo-backend-lambda.zip \
  s3://$BUCKET/lambda/historo-backend-lambda.zip \
  --profile $PROFILE --region $REGION

echo "🚀 Lambda 배포..."
aws lambda update-function-code \
  --function-name $FUNCTION \
  --profile $PROFILE --region $REGION \
  --s3-bucket $BUCKET --s3-key lambda/historo-backend-lambda.zip \
  --query "LastUpdateStatus" --output text

echo ""
echo "✅ 배포 완료"
echo "   API: https://ti5h7b2bs2.execute-api.ap-northeast-2.amazonaws.com/prod"
