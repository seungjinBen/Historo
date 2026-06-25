// 명량해전 — 학년별 '만약에' 데이터, 아이콘, 단계별 카피.
// 두 모드(ChatExperience / BookExperience)가 모두 import 하는 순수 데이터 모듈.

export const EVENT_ID = "yi-myeongnyang-1597";
export const SOURCE = "조선왕조실록 · 선조실록 (정유년 1597년 11월)";

export const REAL_HISTORY_SECTIONS: { title: string; paragraphs: string[] }[] = [
  {
    title: "1. 남은 배는 단 13척, 나라가 위험해요!",
    paragraphs: [
      "한산도에서 우리 수군이 크게 패한 뒤, 바다에 병사와 무기가 거의 남지 않았어요.",
      "일본군 배가 수백 척이나 밀려오자 다른 장수들은 무서워서 산속으로 도망쳤지만, 이순신 장군님은 포기하지 않았어요.",
      "장군님이 겨우겨우 모은 배는 전선 13척과 작은 정찰선 32척이 전부였단다!",
    ],
  },
  {
    title: "2. 13척으로 130척의 적을 마주하다!",
    paragraphs: [
      "해남과 진도 사이의 좁은 바다(벽파정 앞바다)에서 마침내 적의 배 130여 척이 떼를 지어 몰려왔어.",
      "장군님과 용감한 장수들은 “죽음을 무릅쓰고 힘껏 싸우자!” 외치며 당당하게 맞섰단다.",
      "적들이 우리 배를 겹겹이 에워쌌지만, 장군님이 대포를 쾅! 쾅! 쏘아 올리며 순식간에 적의 배 20여 척을 부수고 바다 깊숙이 가라앉혔어!",
    ],
  },
  {
    title: "3. 적의 대장 ‘마다시’를 물리쳐라!",
    paragraphs: [
      "한창 싸우던 중, 화려한 빨간 깃발과 천막을 두른 커다란 일본 대장선이 나타나 부하들을 지휘하기 시작했어요.",
      "이 모습을 본 우리 영웅들(송여종, 정응두 만호)이 번개처럼 달려들어 힘껏 싸웠고, 적의 배 11척을 더 깨부수며 적들의 기세를 완전히 꺾어버렸지!",
      "나중에 붙잡힌 일본 군인에게 물어보니, 그 빨간 깃발 배에 타고 있던 대장이 바로 안골포의 무시무시한 장수인 ‘마다시(구루시마)’였다고 해.",
    ],
  },
  {
    title: "4. 기적 같은 대승리, 서쪽 바다를 지켜내다!",
    paragraphs: [
      "이순신 장군님은 편지 마지막에 이렇게 적으셨어.",
      "“임금님! 우리 수군이 다행히 값진 승리를 거두어 적들의 기세를 꺾었습니다. 이제 적들은 우리 서쪽 바다(서해)로 감히 넘어오지 못할 것입니다!”",
      "이 편지를 읽은 선조 임금님과 명나라 군대도 장군님의 기적 같은 용기에 감탄하며 모두 박수를 쳤단다!",
    ],
  },
];

export const REAL_PANELS: { src: string; caption: string; bubble: string }[] = [
  {
    src: "/images/test/1-1.png",
    caption: "남은 배는 단 13척!",
    bubble: "신에게는 아직\n12척이 있나이다!",
  },
  {
    src: "/images/test/1-2.png",
    caption: "13척이 130척과 정면으로 맞서다",
    bubble: "거센 물살이\n우리를 돕는다!",
  },
  {
    src: "/images/test/1-3.png",
    caption: "적장 ‘마다시’를 무찌르다",
    bubble: "적장 마다시!\n화포를 쏘아라!",
  },
  {
    src: "/images/test/1-4.png",
    caption: "기적의 대승, 서해를 지키다",
    bubble: "우리가 마침내\n서해를 지켜냈다!",
  },
];
export const REAL_ENDING =
  "1597년 명량 — 13척으로 130여 척을 막아낸 진짜 역사. 이순신 장군의 통찰과 용기가 서해 바닷길을 지켜냈어요.";

// ── 아이콘 ─────────────────────────────────────────────
export type IconKey =
  | "hand" | "users" | "book"
  | "flag" | "shield" | "drum"
  | "star" | "spark" | "leaf";

export function Icon({ name }: { name: IconKey }) {
  const common = {
    width: 26,
    height: 26,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "hand": // 울돌목 거센 물살 — 휘몰아치는 파도
      return (
        <svg {...common}>
          <path d="M2 10c2.5 0 3-2.5 5.5-2.5S10 10 12.5 10 15 7.5 17.5 7.5 20 10 22 10" />
          <path d="M2 15c2.5 0 3-2.5 5.5-2.5S10 15 12.5 15 15 12.5 17.5 12.5 20 15 22 15" opacity=".55" />
          <path d="M9 19.5c1.4-.9 4.2-.9 5.6 0" opacity=".45" />
        </svg>
      );
    case "users": // 새벽 어둠 — 초승달 + 별
      return (
        <svg {...common}>
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          <circle cx="5.5" cy="7" r=".7" fill="currentColor" stroke="none" />
          <circle cx="17.5" cy="5.5" r=".55" fill="currentColor" stroke="none" />
          <circle cx="7.5" cy="3.5" r=".45" fill="currentColor" stroke="none" />
        </svg>
      );
    case "book": // 백성의 어선 — 돛단배 + 잔물결
      return (
        <svg {...common}>
          <path d="M3 17l1.6-4h12L18 17" />
          <path d="M10.5 13V3.5" />
          <path d="M10.5 3.5l5 8h-5z" />
          <path d="M2 20.5c2 0 3-1 5-1s3 1 5 1 3-1 5-1 3 1 5 1" opacity=".55" />
        </svg>
      );
    case "flag": // 깃발과 연막 — 군기 + 피어오르는 연기
      return (
        <svg {...common}>
          <path d="M5 21V3" />
          <path d="M5 3h11l-2 3.5 2 3.5H5" />
          <path d="M17 13.5c-.6 1 .6 1.5 0 2.5s-.6 1 0 2 .6 1 0 2.5" opacity=".55" />
          <path d="M20 15c-.6 1 .6 1.5 0 2.5s-.6 1 0 2 .6 1 0 2" opacity=".4" />
        </svg>
      );
    case "shield": // 좁은 길목 봉쇄 — 협곡 사이를 막은 한 척
      return (
        <svg {...common}>
          <path d="M3 3l6 8-6 10" />
          <path d="M21 3l-6 8 6 10" />
          <ellipse cx="12" cy="12" rx="3.2" ry="1.4" />
          <path d="M12 10.6V7.5" />
          <path d="M10.8 7.5h2.4" />
        </svg>
      );
    case "drum": // 북과 함성 — 북 + 위로 퍼지는 음파
      return (
        <svg {...common}>
          <ellipse cx="12" cy="15" rx="6" ry="2" />
          <path d="M6 15v3" />
          <path d="M18 15v3" />
          <path d="M6 18c0 1.1 2.7 2 6 2s6-.9 6-2" />
          <path d="M9 8c0-1.5 1.3-2.5 3-2.5s3 1 3 2.5" opacity=".55" />
          <path d="M7 6c0-2.5 2.2-4 5-4s5 1.5 5 4" opacity=".35" />
        </svg>
      );
    case "star": // 기적의 승리 — 큰 별 + 광채
      return (
        <svg {...common}>
          <path d="M12 3.2l2.6 5.3 5.9.85-4.3 4.18 1 5.85L12 16.6l-5.2 2.8 1-5.85L3.5 9.35l5.9-.85z" />
          <path d="M19.5 3l.5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2L17.8 4.7l1.2-.5z" opacity=".55" />
          <path d="M4.2 19l.4 1 1 .4-1 .4-.4 1-.4-1L2.8 20.4l1-.4z" opacity=".55" />
        </svg>
      );
    case "spark": // 용기가 번지는 결말 — 마음 + 동심원 파장
      return (
        <svg {...common}>
          <path d="M12 14.2s-2.3-1.3-2.3-3.2a1.6 1.6 0 0 1 2.3-1.5 1.6 1.6 0 0 1 2.3 1.5c0 1.9-2.3 3.2-2.3 3.2z" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="5" opacity=".55" />
          <circle cx="12" cy="12" r="8.5" opacity=".32" />
        </svg>
      );
    case "leaf": // 후대에 남기는 교훈 — 펼친 책 + 자라나는 새싹
      return (
        <svg {...common}>
          <path d="M3 5h7a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H3z" />
          <path d="M21 5h-7a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h7z" />
          <path d="M12 7c1-1.4 2.8-1.6 4-3-.4 1.8-1.8 2.8-4 3z" opacity=".7" />
        </svg>
      );
  }
}

// ── 데이터 ─────────────────────────────────────────────
export type Tone = "red" | "blue" | "yellow";
export type Opt = { label: string; desc?: string; scene: string; icon: IconKey; tone: Tone; ending?: string };
export type QSet = { prompt: string; options: [Opt, Opt, Opt] };
export type GradeData = { lead: string; climax: string; questions: [QSet, QSet, QSet] };

export const GRADES = [
  { key: "1-2", label: "1~2학년 · 한눈에" },
  { key: "3-4", label: "3~4학년 · 자세히" },
  { key: "5-6", label: "5~6학년 · 깊이 있게" },
] as const;
export type GradeKey = (typeof GRADES)[number]["key"];

export const DATA: Record<GradeKey, GradeData> = {
  "1-2": {
    lead:
      "1597년 가을, 좁은 바다 명량. 우리에게 남은 배는 단 13척, 적의 배는 130척이 넘어요. 장군이 너를 돌아보며 묻습니다 — 작전 참모야, 우리는 어떻게 해야 할까?",
    climax: "좁은 바다 명량에서 작은 배들이 큰 적과 맞붙어요!",
    questions: [
      {
        prompt: "만약에, 배가 더 적었다면?",
        options: [
          { label: "거센 물살을 무기로 쓴다", scene: "이순신이 거센 물살을 이용해 적의 배를 막아요.", icon: "hand", tone: "red" },
          { label: "새벽에 몰래 다가간다", scene: "새벽 어둠 속에서 배가 조용히 적에게 다가가요.", icon: "users", tone: "blue" },
          { label: "백성의 어선을 모은다", scene: "백성들이 고기잡이 배를 모아 함께 힘을 보태요.", icon: "book", tone: "yellow" },
        ],
      },
      {
        prompt: "적이 코앞까지 왔어요. 어떻게 할까?",
        options: [
          { label: "깃발로 수를 부풀린다", scene: "깃발을 잔뜩 세워 배가 많아 보이게 해요.", icon: "flag", tone: "red" },
          { label: "좁은 길목을 지킨다", scene: "좁은 바닷길을 딱 막고 굳게 지켜요.", icon: "shield", tone: "blue" },
          { label: "북을 올려 사기를 높인다", scene: "둥둥 북을 울려 군사들의 용기를 북돋아요.", icon: "drum", tone: "yellow" },
        ],
      },
      {
        prompt: "이야기의 끝은 어떻게 될까?",
        options: [
          { label: "기적의 승리", scene: "적의 큰 배들이 물러가고 이순신이 크게 이겨요!", icon: "star", tone: "red",
            ending: "적은 배로 큰 적을 물리친 기적 같은 승리! 이순신의 지혜와 용기가 바다를 지켰어요." },
          { label: "용기가 번지는 결말", scene: "백성과 군사들이 손을 맞잡고 함께 기뻐해요.", icon: "spark", tone: "blue",
            ending: "한 사람의 용기가 모두에게 번졌어요. 함께 힘을 모으면 어떤 어려움도 이겨 낼 수 있답니다." },
          { label: "교훈이 남는 결말", scene: "아이들이 이순신의 이야기를 들으며 고개를 끄덕여요.", icon: "leaf", tone: "yellow",
            ending: "포기하지 않는 마음이 큰 일을 해냈어요. 이순신의 이야기는 오래오래 기억에 남았답니다." },
        ],
      },
    ],
  },
  "3-4": {
    lead:
      "1597년 가을. 칠천량 해전의 큰 패배로 조선 수군의 배는 13척밖에 남지 않았다. 그래도 이순신 장군은 물러서지 않고 물살 빠른 명량 해협으로 향한다. 너는 그의 작전 참모 — 장군이 결단을 내리기 전, 너의 의견을 묻는다.",
    climax: "물살 빠른 명량 해협, 12척이 수백 척의 적과 정면으로 맞섭니다!",
    questions: [
      {
        prompt: "남은 배는 단 12척. 이순신은 무엇을 믿었을까?",
        options: [
          {
            label: "거센 물살을 무기로 삼는다",
            desc: "울돌목의 거센 조류를 우리 편으로 만들어, 적의 큰 배가 제 속도를 내지 못하도록 막아낸다.",
            scene: "이순신이 울돌목의 거센 물살을 이용해 적의 진격을 막아요.",
            icon: "hand",
            tone: "red",
          },
          {
            label: "새벽 어둠을 틈타 다가간다",
            desc: "동트기 전 어둠과 안개를 이용해, 적이 눈치채기 전에 가까이 다가가 기습한다.",
            scene: "새벽 어둠을 틈타 적이 눈치채지 못하게 배를 움직여요.",
            icon: "users",
            tone: "blue",
          },
          {
            label: "백성의 어선을 함께 모은다",
            desc: "백성들의 어선까지 모아 함대를 더 크게 꾸리고, 적이 우리를 강해 보이게 만든다.",
            scene: "백성들의 어선까지 모아 함대를 더 크게 꾸려요.",
            icon: "book",
            tone: "yellow",
          },
        ],
      },
      {
        prompt: "수백 척의 적이 좁은 바다로 들어와요. 어떤 작전을 펼칠까?",
        options: [
          {
            label: "깃발을 늘려 수를 부풀린다",
            desc: "깃발을 잔뜩 세우고 연막을 피워, 적이 우리 배가 훨씬 많다고 착각하게 만든다.",
            scene: "깃발을 잔뜩 세워 우리 배가 많아 보이도록 위장해요.",
            icon: "flag",
            tone: "red",
          },
          {
            label: "좁은 길목을 단단히 지킨다",
            desc: "좁은 수로를 봉쇄하고 적의 배를 한 척씩만 끌어들여, 한 번에 한 척씩 정면으로 상대한다.",
            scene: "좁은 길목을 막아 적을 한 척씩 상대해요.",
            icon: "shield",
            tone: "blue",
          },
          {
            label: "북을 울려 사기를 높인다",
            desc: "북을 크게 울리고 함성을 질러, 두려움에 흔들리던 군사들의 사기를 다시 끌어올린다.",
            scene: "북을 울리고 함성을 질러 군사들의 사기를 끌어올려요.",
            icon: "drum",
            tone: "yellow",
          },
        ],
      },
      {
        prompt: "명량의 이야기를 어떤 결말로 맺을까?",
        options: [
          {
            label: "기적 같은 대승",
            desc: "12척으로 수백 척을 무찌른 기적의 승리로 마무리한다. 적은 더 이상 서해로 넘어오지 못한다.",
            scene: "적의 함대가 무너지고 이순신이 큰 승리를 거둬요.",
            icon: "star",
            tone: "red",
            ending: "12척으로 수백 척을 물리친 기적 같은 대승! 불리함 속에서도 지혜와 용기를 잃지 않은 결과였어요.",
          },
          {
            label: "용기가 번지는 결말",
            desc: "두려움에 떨던 군사와 백성이 장군의 용기에 응답해, 모두 하나가 되어 환호하는 장면으로 끝맺는다.",
            scene: "두려워하던 군사와 백성이 용기를 되찾고 함께 환호해요.",
            icon: "spark",
            tone: "blue",
            ending: "한 사람의 용기가 모두에게 번졌어요. 명량의 승리는 함께할 때 더 강해진다는 것을 보여 주었지요.",
          },
          {
            label: "교훈이 남는 결말",
            desc: "사람들이 오래도록 이야기로 전하며, 어려울수록 지혜와 용기가 필요하다는 교훈을 새기는 결말이다.",
            scene: "사람들이 이순신의 선택을 오래도록 이야기로 전해요.",
            icon: "leaf",
            tone: "yellow",
            ending: "끝까지 포기하지 않은 이순신의 마음은 큰 교훈으로 남았어요. 어려울수록 지혜와 용기가 필요하다는 것을요.",
          },
        ],
      },
    ],
  },
  "5-6": {
    lead:
      "1597년 정유재란. 칠천량의 참패로 조선 수군에는 13척만이 남았다. 이순신은 ‘신에게는 아직 열두 척의 배가 있사옵니다’라며 130여 척의 일본 함대와 명량 해협에서 맞설 것을 택한다. 그의 곁에서 작전을 짜는 너 — 참모로서, 승부를 어떻게 가를 것인가?",
    climax: "조류가 휘몰아치는 명량 해협, 13척이 130여 척의 적과 운명을 건 결전을 벌입니다!",
    questions: [
      {
        prompt: "13척으로 130여 척을 상대해야 합니다. 승부를 가를 열쇠는?",
        options: [
          {
            label: "울돌목의 물살을 전술로 활용한다",
            desc: "좁은 수로와 시간마다 바뀌는 거센 조류를 정확히 읽어, 적 함대의 대형이 스스로 무너지는 결정적 순간을 노린다. 지형은 가장 강한 무기다.",
            scene: "이순신이 울돌목의 거센 조류를 읽어 적의 대형을 무너뜨려요.",
            icon: "hand",
            tone: "red",
          },
          {
            label: "새벽의 어둠을 이용해 기습한다",
            desc: "여명 직전의 짙은 어둠과 조용한 바다를 활용해, 적의 허를 찌르는 기습을 준비한다. 기습은 수적 열세를 단숨에 뒤집을 가장 빠른 길이다.",
            scene: "여명 전 어둠을 틈타 적의 허를 찌르는 기습을 준비해요.",
            icon: "users",
            tone: "blue",
          },
          {
            label: "백성의 어선으로 함대를 위장한다",
            desc: "백성의 어선을 후방에 길게 배치해 대규모 함대처럼 보이도록 위장한다. 적의 두려움을 부풀려 사기를 꺾는 심리전이다.",
            scene: "백성의 어선을 후방에 배치해 대규모 함대처럼 위장해요.",
            icon: "book",
            tone: "yellow",
          },
        ],
      },
      {
        prompt: "일본 함대가 좁은 명량 해협으로 진입합니다. 어떤 전략을 택할까?",
        options: [
          {
            label: "깃발과 연막으로 병력을 과장한다",
            desc: "깃발과 연기, 함성으로 아군 규모를 실제보다 훨씬 크게 보이도록 위장해, 적이 함부로 다가서지 못하도록 만든다.",
            scene: "깃발과 연기로 아군의 규모를 실제보다 크게 보이도록 만들어요.",
            icon: "flag",
            tone: "red",
          },
          {
            label: "좁은 길목을 봉쇄해 각개격파한다",
            desc: "좁은 수로를 봉쇄하고 적의 대형을 흩뜨려, 고립된 적을 한 척씩 차례로 격파한다. 적이 가진 다수의 이점을 무력화한다.",
            scene: "좁은 수로를 봉쇄해 적을 한 척씩 고립시켜 격파해요.",
            icon: "shield",
            tone: "blue",
          },
          {
            label: "북과 함성으로 전군의 사기를 끌어올린다",
            desc: "북소리와 함성, 지휘관의 결단으로 공포에 짓눌렸던 전군의 사기를 단번에 일으켜 세운다. 사기는 곧 전력이다.",
            scene: "북소리와 함성으로 흔들리던 전군의 사기를 다시 일으켜요.",
            icon: "drum",
            tone: "yellow",
          },
        ],
      },
      {
        prompt: "당신이 완성한 명량해전, 어떤 메시지로 마무리할까?",
        options: [
          {
            label: "불리함을 뒤집은 기적의 승리",
            desc: "압도적 열세를 전술로 뒤집은 명량대첩으로 마무리한다. 불리한 조건마저 무기로 바꾼 이순신의 통찰이 전세를 결정짓는다.",
            scene: "압도적 열세를 뒤집고 이순신이 명량의 대승을 이끌어요.",
            icon: "star",
            tone: "red",
            ending: "13척으로 130여 척을 막아낸 명량대첩. 불리한 조건마저 전술로 바꾼 이순신의 통찰이 전세를 뒤집었습니다.",
          },
          {
            label: "용기가 번지는 결말",
            desc: "공포에 짓눌렸던 군사들이 지휘관의 용기에 응답해 하나가 된다. 명량의 승리는 결국 신뢰와 결속이 만들어낸 결과였다.",
            scene: "공포에 짓눌렸던 군사들이 지휘관의 용기에 응답해 하나가 돼요.",
            icon: "spark",
            tone: "blue",
            ending: "지휘관 한 사람의 결단이 전군의 용기로 번졌습니다. 명량의 승리는 신뢰와 결속이 만든 결과였지요.",
          },
          {
            label: "후대에 교훈을 남기는 결말",
            desc: "준비와 지형, 그리고 끝까지 포기하지 않는 의지의 가치를 후대에 남긴다. 명량의 교훈은 오늘까지 이어지는 무거운 유산이다.",
            scene: "후대의 사람들이 명량의 교훈을 기록하고 되새겨요.",
            icon: "leaf",
            tone: "yellow",
            ending: "명량해전은 준비와 지형, 그리고 포기하지 않는 의지의 가치를 남겼습니다. 그 교훈은 오늘까지 이어집니다.",
          },
        ],
      },
    ],
  },
};

// ── 몰입형 카피 — 단계별 전황 ──────
export const STEP_LABELS = [
  "장군의 첫 번째 질문",
  "장군의 두 번째 질문",
  "장군의 마지막 결정",
] as const;

// step마다 적 함대 수와 상황이 변하며 전투 진행을 직관적으로 보여줌
// (우리 13척은 그대로 — 실제 명량해전에서도 조선 함선은 한 척도 잃지 않았다)
export const STEP_STATS = [
  { ours: "13척",  enemy: "130척",      phase: "출항 직전" },
  { ours: "13척",  enemy: "약 110척",   phase: "교전 시작" },
  { ours: "13척",  enemy: "약 70척",    phase: "결전의 순간" },
] as const;

// 선택 직후 다음 화면 상단에 1줄 토스트로 띄울 "내 선택의 결과" 카피
// 인덱스: EFFECTS[step][optionIndex] — 모든 학년 공통 (개념이 같음)
export const EFFECTS: readonly (readonly string[])[] = [
  [
    "거센 물살이 적 함대의 진격을 막아낸다",
    "어둠 속에서 우리 배가 적의 허를 찌른다",
    "백성의 어선이 합류해 함대가 두 배로 커 보인다",
  ],
  [
    "적이 우리 함대 규모에 놀라 진격이 주춤한다",
    "좁은 수로에서 적 배가 한 척씩 발이 묶인다",
    "북소리에 두려움이 사라지고 군사들의 사기가 치솟는다",
  ],
  [
    "압도적 열세를 뒤집고 기적의 대승이 펼쳐진다",
    "장군의 용기가 군과 백성 모두에게 번진다",
    "포기하지 않은 마음이 후대의 교훈으로 새겨진다",
  ],
];
