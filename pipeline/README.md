# 역사로 MVP — 빌드타임 파이프라인

아이가 선택할 때 LLM을 호출하지 않도록, 무거운 생성은 전부 미리 끝내는 구조.
이 폴더는 그 첫 단계 — **선택 트리 사전생성**이다.

## 실행

```bash
cd historo-mvp
npm init -y
npm install @anthropic-ai/sdk
export ANTHROPIC_API_KEY=sk-...   # Windows PowerShell: $env:ANTHROPIC_API_KEY="sk-..."
node scripts/generate-tree.mjs
```

성공하면 `output/trees/sejong-hunmin-1446.json` 같은 트리 파일이 생긴다.

## 무엇이 만들어지나

`data/events.json`에 적은 사건마다 Claude가 "사실 이후의 만약에" 분기 트리를 통째로 생성한다.
각 리프(마지막 선택 지점)에는 4컷 만화의 `scene`(한국어)과 `sceneEn`(영문, 이미지 생성용)이 들어 있다.

```
data/events.json  →  [generate-tree.mjs / Claude]  →  output/trees/{id}.json
```

## 튜닝 포인트 (scripts/generate-tree.mjs 상단)

- `CHOICES_PER_NODE` — 2면 경로 8개(데모용 추천), 3이면 27개(기획 원안)
- `DEPTH` — 선택 단계 수 (기본 3)
- `MODEL` — 기본 sonnet, 품질 더 원하면 opus로

> 경로 수 = `CHOICES_PER_NODE ^ DEPTH`. 이미지를 사전생성할 양이 여기서 결정되니
> 데모 완성도를 우선한다면 2부터 시작하길 권장.

## 데이터 정확성 메모

- `factCard` / `factContext`는 통설 기준 초안이다. **제출 전 국사편찬위 실록 DB
  (sillok.history.go.kr)로 표현·연도·수치를 최종 검수**할 것.
- 한문 원문을 LLM에 직접 넣지 않고 검증된 한국어 요약을 컨텍스트로 쓴다 (환각 방지).

## 다음 단계 (아직 안 만듦)

1. **이미지 사전생성 + 캐싱** — 트리의 `sceneEn` + 캐릭터 묘사로 4컷 프롬프트를 조립,
   인기 경로부터 미리 생성해 캐시에 저장. 캐시에 없으면 런타임에서 실시간 생성(하이브리드).
2. **Spring Boot 서빙 API** — 트리 JSON / 이미지 캐시 서빙 + fallback 이미지 생성 엔드포인트.
3. **React 뷰어** — 사건 카드 → 선택 → 4컷 표시. 대사는 그림 위 HTML 오버레이(한글 깨짐 방지).
