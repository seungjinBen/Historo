# 역사로 (歷史路) — 내가 만드는 조선 이야기

> 조선왕조실록을 바탕으로, 초등학생이 직접 '만약에' 선택을 하며
> 역사 고증 기반 4컷 이야기를 만드는 인터랙티브 플랫폼
>
> *제4회 문화체육관광 인공지능·데이터 활용 공모전 출품작 (MVP)*

---

## 핵심 아이디어

기존의 공공 문화데이터 활용은 "데이터를 **읽는** 것"에 머물렀습니다.
역사로는 방향을 뒤집어, **실록을 아이들의 창작 재료로** 씁니다.

- 실제 역사(반포·해전 같은 사실)는 **고정**하고,
- 그 이후의 "만약에"만 아이가 선택해 이야기를 분기시키며,
- 선택 결과를 **고증된 화풍의 4컷 만화**로 완성합니다.

사실 구간과 상상 구간은 화면에서 색과 배지로 명확히 구분해, 역사 왜곡을 막습니다.

## 아키텍처 — 빌드타임 / 런타임 분리

아이가 선택할 때마다 LLM을 호출하면 매번 느려집니다.
그래서 **무거운 생성은 전부 미리(빌드타임) 끝내고**, 런타임은 정적 파일만 읽습니다.

```
[ 빌드타임 · pipeline/ ]            [ 런타임 · web/ ]
검증된 사실 요약                     사건 카드 선택
   │                                  │
Claude API → 선택 트리 생성          선택 1 → 2 → 3   (LLM 호출 없음, 즉시 반응)
   │                                  │
Gemini → 4컷 이미지 생성             4컷 표시 (대사는 HTML 오버레이)
   │                                  │
trees/*.json + images/*.png  ──────▶  정적 서빙
```

## 기술 스택

| 영역 | 사용 기술 |
| --- | --- |
| 스토리 생성 | Node.js, Claude API (선택 트리) |
| 이미지 생성 | Google Gemini 2.5 Flash Image (Nano Banana) |
| 프론트엔드 | Next.js (App Router), TypeScript |
| 데이터 | 조선왕조실록 (사실 컨텍스트), 검증된 한국어 요약 |

## 프로젝트 구조

```
historo/
├── pipeline/                  # 콘텐츠 생성 (빌드타임)
│   ├── data/events.json       #   사건 메타 + 검증된 사실 요약 + 캐릭터 묘사
│   ├── scripts/
│   │   ├── generate-tree.mjs  #   Claude로 선택 트리 생성
│   │   └── generate-images.mjs#   Gemini로 4컷 생성 (캐릭터 앵커 reference)
│   └── output/
│       ├── trees/             #   생성된 스토리 트리 (커밋됨)
│       └── images/            #   생성된 4컷 (용량 문제로 gitignore)
└── web/                       # Next.js 뷰어 (런타임)
    └── app/                   #   단일 클라이언트 컴포넌트 뷰어
```

## 실행 방법

### 1. 콘텐츠 생성 (pipeline)

```bash
cd pipeline
npm install @anthropic-ai/sdk @google/genai

# 스토리 트리 생성 (Claude)
set ANTHROPIC_API_KEY=...        # macOS/Linux: export
node scripts/generate-tree.mjs

# 4컷 이미지 생성 (Gemini) — billing 연결된 키 필요
set GEMINI_API_KEY=...
node scripts/generate-images.mjs
```

### 2. 뷰어 실행 (web)

```bash
# pipeline 결과물을 web/public 으로 복사
xcopy pipeline\output\trees web\public\trees\ /E /I
xcopy pipeline\output\images web\public\images\ /E /I
copy pipeline\data\events.json web\public\data\

cd web
npm install
npm run dev          # http://localhost:3000
```

## 설계 결정과 트레이드오프

이 MVP에서 의식적으로 내린 결정들:

- **RAG/벡터DB 대신 검증된 요약 주입.** 사건이 10개 규모일 때 벡터DB는 과합니다.
  또한 한문 원문을 LLM에 직접 넣으면 고어 해석에서 환각이 늘어, 검증된 한국어 요약을 컨텍스트로 씁니다.
- **빌드타임 사전생성.** 선택 트리와 이미지를 미리 만들어, 런타임에는 LLM 호출이 0입니다.
- **캐릭터 일관성 = 앵커 reference.** 사건마다 캐릭터 기준 이미지 1장을 만들고,
  그 컷에 주인공이 등장할 때만 reference로 주입해 4컷 내내 얼굴·복장을 일관되게 유지합니다.
- **이미지 내 글자 금지.** 이미지 모델이 한글을 깨뜨리므로, 대사는 그림 위 HTML 오버레이로 처리합니다.
- **이미지 모델 선택.** 기획 원안의 DALL-E 3 대신 Gemini를 썼습니다 — 캐릭터 일관성과 비용 면에서 유리합니다.

## MVP 범위와 한계 (솔직하게)

- 완성도를 위해 **사건 2개(세종·이순신)**에 집중했습니다. 확장은 `events.json`에 추가하고 스크립트를 재실행하면 됩니다.
- 선택 깊이 3 / 분기 2개 → 결말 경로 8개.
- 조선 관모 등 일부 고증은 이미지 모델의 한계로 완벽하지 않습니다.
- 정적 서빙 MVP입니다. 사용자 저장·갤러리·런타임 fallback 생성은 아직 미구현입니다.

## 향후 계획

사건 확장(실록 전 기간 자동화) · Spring Boot 백엔드 연동 · 창작물 갤러리/저장 · 교사용 수업 모드
