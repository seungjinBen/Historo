import { REAL_HISTORY_SECTIONS } from "@/features/myeongnyang/data";
import type { HeroActionId } from "./types";

// ── 초등학생 시선 우선순위 (선택모드 박스 그리드 정렬) ─────────────────
export const KID_ORDER = [
  "yi-myeongnyang-1597",
  "sejong-hunmin-1446",
  "jangnyeongsil-jagyeokru-1434",
  "jeong-yakyong-geojunggi-1792",
  "kim-hongdo-genre-1780",
  "shin-saimdang-art-1551",
  "heojun-donguibogam-1613",
  "taejo-foundation-1392",
  "park-yeon-aak-1430",
  "gwanghaegun-junglib-1619",
];

// ── 히어로 — 세종대왕 말풍선 안의 이야기 흐름 4단계 ─────────────────
export const HERO_FLOW_STEPS: { label: string; sub: string }[] = [
  { label: "사실", sub: "실록에서 가져와요" },
  { label: "만약에", sub: "내가 골라요" },
  { label: "전개", sub: "이야기가 펼쳐져요" },
  { label: "결말", sub: "나만의 4컷 완성" },
];

// ── 히어로 — 세종대왕 아래 4개 빠른 진입 ─────────────────
export const HERO_ACTIONS: { id: HeroActionId; label: string; target: string }[] = [
  { id: "story",    label: "이야기 만들기",  target: "events-section" },
  { id: "study",    label: "역사 공부하기",  target: "study-timeline-section" },
  { id: "heritage", label: "문화재 탐방하기", target: "study-timeline-section" },
  { id: "gallery",  label: "갤러리 구경하기", target: "gallery-section" },
];

// ── 사건별 4단계 역사 콘텐츠 (실록·전기에서 어린이 눈높이로 재구성) ───────
export const HISTORY_CONTENT: Record<string, { title: string; paragraphs: string[] }[]> = {
  "yi-myeongnyang-1597": REAL_HISTORY_SECTIONS,
  "sejong-hunmin-1446": [
    {
      title: "1. 백성들의 눈물을 닦아줄 ‘마법의 문자’가 필요해!",
      paragraphs: [
        "중국 글자(한자)는 우리말과 소리가 너무 달라서, 무학 백성들이 억울한 일을 당해 관청에 가도 자기 생각을 글자로 적어 하소연할 방법이 전혀 없었단다.",
        "신라 시대 설총이 만든 ‘이두’라는 글자 대용품이 있었지만, 이것도 한자를 빌려 쓰는 거라 만 분의 일도 제대로 표현하지 못했지.",
        "백성들을 진심으로 가여워한 세종대왕님은 “글을 몰라 고통받는 백성이 없는 세상을 만들겠다!” 결심하고, 마침내 아무도 모르게 홀로 연구하여 세상에 없던 28개의 마법 같은 글자를 뚝딱 만들어 내셨어!",
      ],
    },
    {
      title: "2. 어금니 소리부터 목구멍 소리까지, 세상 모든 소리를 담다!",
      paragraphs: [
        "대왕님이 만드신 글자는 소리가 나는 사람의 발음 기관 모양을 본뜬 엄청 과학적인 글자였단다.",
        "초성(첫소리): 어금니 소리 ‘ㄱ’, 혀 소리 ‘ㄷ’, 입술 소리 ‘ㅂ’, 이 소리 ‘ㅈ’, 목구멍 소리 ‘ㅎ’ 등 기본 글자를 나란히 붙여 쓰면 더 강한 소리가 나게 만들었어.",
        "중성(가운데 소리)과 종성(끝소리): 하늘·땅·사람을 뜻하는 ‘ㆍ, ㅡ, ㅣ’ 모음을 글자 밑이나 오른쪽에 조립하고, 끝소리는 첫소리를 그대로 다시 쓰게 했지.",
        "초성, 중성, 종성을 레고 블록처럼 착착 합치면 글자 하나가 완성되는 완벽한 시스템을 설계하신 거야!",
      ],
    },
    {
      title: "3. 똑똑하면 아침나절, 어리석은 사람도 열흘이면 마스터!",
      paragraphs: [
        "이 기적 같은 글자를 본 예조 판서 정인지는 입을 다물지 못하고 감탄의 박수를 쳤단다.",
        "중국 글자는 평생을 배워도 쓰기 어렵지만, 새로 만든 이 ‘훈민정음’은 지혜로운 사람은 아침밥 먹기 전에 깨우치고, 아무리 어리석은 사람이라도 열흘만 공부하면 혼자서 글을 읽고 쓸 수 있을 정도로 쉬웠거든!",
        "이 글자만 있으면 억울한 재판을 받는 백성도 자기 속사정을 완벽하게 글로 써서 낼 수 있게 된 거지.",
      ],
    },
    {
      title: "4. 바람 소리부터 개 짖는 소리까지! 세상의 모든 소리를 적어라",
      paragraphs: [
        "정인지를 비롯한 집현전의 영웅들(최항, 박팽년, 신숙주, 성삼문, 강희안, 이개 등)은 대왕님의 명을 받아 이 글자의 사용법을 상세히 풀이한 해설서를 완성했어.",
        "이 28자만 있으면 세상에 표현 못 할 소리가 없어서, 귀를 스치는 말갛게 부는 바람 소리, 하늘을 나는 학의 울음소리, 새벽을 깨우는 닭 울음과 마당에서 짖는 개 짖는 소리까지 문자 그대로 똑같이 받아 적을 수 있었단다!",
        "하늘이 동방의 조선에 내린 성군, 세종대왕님의 깊은 사랑 덕분에 우리 민족은 마침내 눈을 번쩍 뜨고 우리만의 글자를 가질 수 있게 되었어.",
      ],
    },
  ],
};

// ── 갤러리 — 책 표지 모음 (3권) ─────────────────
export const GALLERY_BOOKS: { id: string; eyebrow: string; title: string; sub: string; targetEventId?: string }[] = [
  { id: "myn",  eyebrow: "실제 역사", title: "이순신 장군과\n명량의 기적", sub: "1597 · 정유년 가을", targetEventId: "yi-myeongnyang-1597" },
  { id: "sej",  eyebrow: "실제 역사", title: "세종대왕과\n훈민정음의 탄생", sub: "1446 · 병인년 가을", targetEventId: "sejong-hunmin-1446" },
  { id: "shin", eyebrow: "실제 역사", title: "신사임당과\n붓끝의 자연", sub: "1551 · 명종 6년" },
];

// ── 홈 "어떻게 만들어요?" 3단계 ─────────────────
export const HOW_STEPS: { num: string; title: string; desc: string }[] = [
  {
    num: "STEP 1",
    title: "AI와 대화하기",
    desc: "먹돌이가 관심사를 물어, 딱 맞는 역사 이야기를 찾아줘요.",
  },
  {
    num: "STEP 2",
    title: "‘만약에’ 답하기",
    desc: "채팅으로 답하거나, 선택지를 골라 이야기를 만들어요.",
  },
  {
    num: "STEP 3",
    title: "4컷 + 진짜 역사",
    desc: "내 이야기가 4컷으로 완성되고, 실제 역사와 비교해줘요.",
  },
];

// ── 연표 노드 미리보기 경로 (eventId → pathKey) ──────────────────────
export const NODE_PREVIEW_PATH: Record<string, string> = {
  "sejong-hunmin-1446": "0-0-0",
  "yi-myeongnyang-1597": "0-0-0",
};
