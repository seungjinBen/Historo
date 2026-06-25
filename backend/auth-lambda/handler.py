import json
import boto3
import time
import uuid
from decimal import Decimal

dynamodb = boto3.resource("dynamodb", region_name="ap-northeast-2")
stories_table = dynamodb.Table("historo-user-stories")

CORS = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
}

def ok(body, status=200):
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"},
            "body": json.dumps(body, ensure_ascii=False, default=_decimal)}

def err(msg, status=400):
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"},
            "body": json.dumps({"message": msg})}

def _decimal(obj):
    if isinstance(obj, Decimal):
        return int(obj) if obj == int(obj) else float(obj)
    raise TypeError

def get_email(event):
    # API Gateway JWT Authorizer가 이미 검증 완료 → claims에서 직접 읽기
    claims = (event.get("requestContext") or {}).get("authorizer", {}).get("jwt", {}).get("claims", {})
    return claims.get("email") or claims.get("cognito:username") or claims.get("sub")

def lambda_handler(event, context):
    method = event.get("httpMethod", "GET")
    path   = event.get("path", "/")

    # 스테이지 prefix 제거
    for stage in ("/prod", "/dev", "/staging"):
        if path.startswith(stage + "/"):
            path = path[len(stage):]
            break

    if method == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            return err("잘못된 JSON 요청")

    email = get_email(event)
    if not email:
        return err("인증 정보가 없습니다", 401)

    try:
        if path == "/api/bookshelf" and method == "GET":
            resp = stories_table.query(
                KeyConditionExpression=boto3.dynamodb.conditions.Key("username").eq(email)
            )
            items = sorted(resp.get("Items", []), key=lambda x: x.get("createdAt", ""), reverse=True)
            return ok(json.loads(json.dumps(items, default=_decimal)))

        if path == "/api/bookshelf" and method == "POST":
            item = {
                "username":     email,
                "id":           str(uuid.uuid4()),
                "eventId":      body.get("eventId", ""),
                "title":        body.get("title", ""),
                "picks":        body.get("picks", []),
                "pathText":     body.get("pathText", ""),
                "thumbnailUrl": body.get("thumbnailUrl"),
                "createdAt":    time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            }
            stories_table.put_item(Item=item)
            return ok(item, 201)

        if path.startswith("/api/bookshelf/") and method == "DELETE":
            story_id = path.split("/api/bookshelf/", 1)[1]
            existing = stories_table.get_item(Key={"username": email, "id": story_id}).get("Item")
            if not existing:
                return err("스토리를 찾을 수 없습니다", 404)
            stories_table.delete_item(Key={"username": email, "id": story_id})
            return ok({"deleted": True})

        return err("Not Found", 404)
    except Exception as e:
        print(f"ERROR: {e}")
        return err("서버 오류", 500)
