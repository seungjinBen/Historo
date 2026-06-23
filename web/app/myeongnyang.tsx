"use client";

/* eslint-disable @next/next/no-img-element */
// 이순신 명량해전 — 학년별(1~2 / 3~4 / 5~6) '만약에' 3선택 분기 체험.
// page.tsx 의 screen === "myeongnyang" 에서 렌더된다.
// 데이터·문구는 여기에 하드코딩되어 있고, 4컷 이미지는 기존 트리와 같은
// /images/yi-myeongnyang-1597/{a}-{b}-{c}_panelN.png 규칙을 그대로 쓴다.
// (지금은 0·1 경로 이미지만 있어, 2번 선택 경로는 '그림 준비 중'으로 보인다.)

import { useEffect, useState } from "react";

export const EVENT_ID = "yi-myeongnyang-1597";
export const SOURCE = "조선왕조실록 · 선조실록 (정유년 1597년 11월)";
const SILLOK_URL = "https://sillok.history.go.kr/id/kna_13011010_005";

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

// ── 문화재 렌즈 — 실제 4컷에 겹쳐 띄울 고증 포인트 ──────────
type HeritagePoint = {
  id: "portrait" | "panokseon" | "cannonball" | "diary";
  panelIndex: 0 | 1 | 2 | 3;
  // 4컷 패널 내부의 sparkle 위치(이미지 영역 기준 백분율)
  top: string;
  left: string;
  title: string;
  shortLabel: string;
  imageSrc: string;
  imageAlt: string;
  description: string;
  source: string;
};

const HERITAGE_POINTS: HeritagePoint[] = [
  {
    id: "portrait",
    panelIndex: 0,
    top: "30%",
    left: "28%",
    title: "이순신 장군 표준영정 (제1호)",
    shortLabel: "표준영정",
    imageSrc: "/images/heritage/portrait.jpg",
    imageAlt: "이순신 장군 표준영정",
    description:
      "방금 네가 본 멋진 장군님의 모습은 박물관에 있는 ‘표준영정’을 바탕으로 그린 거야. 나라에서 지정한 이순신 장군님의 공식 초상화란다!",
    source: "문화체육관광부 지정 표준영정 제1호 · 현충사관리소 소장",
  },
  {
    id: "panokseon",
    panelIndex: 1,
    top: "70%",
    left: "22%",
    title: "조선 수군의 핵심 — 판옥선",
    shortLabel: "판옥선",
    imageSrc: "/images/heritage/panokseon.jpg",
    imageAlt: "국립해양문화재연구소 판옥선 3D 복원 모형",
    description:
      "이 배의 진짜 이름은 ‘판옥선’이야! 2층 구조로 되어 있어서 위층에서는 군인들이 화살과 대포를 쏘고, 아래층에서는 격군들이 안전하게 노를 저을 수 있는 조선 수군의 핵심 무기였어.",
    source: "국립해양문화재연구소 · 전통군선(판옥선) 3D/2D 복원 데이터",
  },
  {
    id: "cannonball",
    panelIndex: 2,
    top: "44%",
    left: "66%",
    title: "울돌목 바다에서 건진 대포알",
    shortLabel: "조란환·총통",
    imageSrc: "/images/heritage/cannonball.jpg",
    imageAlt: "울돌목 해역 출토 조란환과 지자·현자총통",
    description:
      "실제 명량해전이 벌어졌던 울돌목 바다 깊은 곳을 조사했더니, 당시 사용했던 수많은 돌 대포알과 철 대포알(조란환)이 발견되었어! 진짜 역사의 흔적이지?",
    source: "국립해양문화재연구소 · 명량대첩 해역(울돌목) 출토 유물",
  },
  {
    id: "diary",
    panelIndex: 3,
    top: "56%",
    left: "48%",
    title: "국보 난중일기와 이충무공 장도",
    shortLabel: "난중일기·장도",
    imageSrc: "/images/heritage/diary.jpg",
    imageAlt: "국보 난중일기 원본과 이충무공 장도 실물",
    description:
      "장군님은 전쟁 중에도 매일 일기를 쓰셨는데, 그게 바로 국보 ‘난중일기’야. 그리고 장군님이 곁에 두고 보셨던 큰 칼에는 ‘바다에 맹세하니 어룡이 꿈틀거리고, 밝은 마음에 약속하니 산천이 아는구나’라는 멋진 시가 새겨져 있단다.",
    source: "현충사관리소 · 국보 난중일기 / 이충무공 장도",
  },
];

const HERITAGE_BY_PANEL: Record<number, HeritagePoint | undefined> = HERITAGE_POINTS.reduce(
  (acc, h) => {
    acc[h.panelIndex] = h;
    return acc;
  },
  {} as Record<number, HeritagePoint | undefined>,
);

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
  { key: "1-2", label: "1~2학년", emoji: "🐣" },
  { key: "3-4", label: "3~4학년", emoji: "🌱" },
  { key: "5-6", label: "5~6학년", emoji: "📚" },
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


const imgUrl = (file: string) => `/images/${EVENT_ID}/${file}`;

// ── 4컷 한 칸 ──────────────────────────────────────────
function CutImg({ pathKey, index, scene }: { pathKey: string; index: number; scene: string }) {
  const [err, setErr] = useState(false);
  const [ok, setOk] = useState(false);
  return (
    <div className="cut" style={{ animationDelay: `${index * 0.13}s` }}>
      <div className="num">{index + 1}</div>
      {err ? (
        <div className="ph">
          {scene}
          <br />
          <span style={{ opacity: 0.6 }}>(그림 준비 중)</span>
        </div>
      ) : (
        <img
          src={imgUrl(`${pathKey}_panel${index + 1}.png`)}
          alt={scene}
          className={ok ? "loaded" : ""}
          onLoad={() => setOk(true)}
          onError={() => setErr(true)}
        />
      )}
      {!err && <div className="cap">{scene}</div>}
    </div>
  );
}

// 실제 4컷용 — 4:3 이미지 + 말풍선 텍스트 오버레이
function RealCutImg({
  index,
  src,
  caption,
  bubble,
  lensOn,
  heritage,
  visited,
  onOpenHeritage,
}: {
  index: number;
  src: string;
  caption: string;
  bubble: string;
  lensOn: boolean;
  heritage?: HeritagePoint;
  visited: boolean;
  onOpenHeritage: (h: HeritagePoint) => void;
}) {
  const [err, setErr] = useState(false);
  const [ok, setOk] = useState(false);
  return (
    <div className="cut cut-real" style={{ animationDelay: `${index * 0.13}s` }}>
      <div className="num">{index + 1}</div>
      {err ? (
        <div className="ph">
          {caption}
          <br />
          <span style={{ opacity: 0.6 }}>(그림 준비 중)</span>
        </div>
      ) : (
        <img
          src={src}
          alt={bubble ? `${caption} — ${bubble}` : caption}
          className={ok ? "loaded" : ""}
          onLoad={() => setOk(true)}
          onError={() => setErr(true)}
        />
      )}
      {!err && lensOn && heritage && (
        <button
          type="button"
          className={`heritage-sparkle pos-${heritage.id} ${visited ? "visited" : "unvisited"}`}
          style={{ top: heritage.top, left: heritage.left }}
          onClick={() => onOpenHeritage(heritage)}
          aria-label={`${heritage.title}${visited ? " · 탐색 완료" : " — 실제 유물 보기"}`}
        >
          {!visited && <span className="heritage-sparkle-ring" aria-hidden="true" />}
          <span className="heritage-sparkle-core" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2.5l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.9z" />
            </svg>
          </span>
          {visited && (
            <span className="heritage-sparkle-check" aria-hidden="true">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          )}
        </button>
      )}
      {!err && <div className="cap">{caption}</div>}
    </div>
  );
}

// ── 문화재 모달 — 유물 사진 + 도슨트 텍스트 ──
function HeritageImage({ src, alt, label }: { src: string; alt: string; label: string }) {
  const [err, setErr] = useState(false);
  const [ok, setOk] = useState(false);
  if (err) {
    return (
      <div className="heritage-modal-img placeholder">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
        <span>{label} 유물 사진 준비 중</span>
      </div>
    );
  }
  return (
    <div className="heritage-modal-img">
      <img
        src={src}
        alt={alt}
        className={ok ? "loaded" : ""}
        onLoad={() => setOk(true)}
        onError={() => setErr(true)}
      />
    </div>
  );
}

function HeritageModal({
  heritage,
  onClose,
}: {
  heritage: HeritagePoint;
  onClose: () => void;
}) {
  return (
    <div
      className="heritage-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="heritage-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="heritage-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="heritage-modal-close"
          onClick={onClose}
          aria-label="닫기"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
        <span className="heritage-modal-tag">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2.5l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.9z" />
          </svg>
          실제 고증 유물
        </span>
        <HeritageImage
          src={heritage.imageSrc}
          alt={heritage.imageAlt}
          label={heritage.shortLabel}
        />
        <h3 id="heritage-modal-title" className="heritage-modal-title">
          {heritage.title}
        </h3>
        <p className="heritage-modal-desc">{heritage.description}</p>
        <div className="heritage-modal-source">출처 · {heritage.source}</div>
      </div>
    </div>
  );
}

// ── 학교 숙제용 탐구 보고서 ──────────────────────────────
type ReportInputs = { schoolName: string; studentName: string };

function ReportThumb({ src, label }: { src: string; label: string }) {
  const [err, setErr] = useState(false);
  if (err) {
    return <div className="report-heritage-thumb-ph">{label}<br />사진 준비 중</div>;
  }
  return <img src={src} alt={label} onError={() => setErr(true)} />;
}

function ReportSheet({
  inputs,
  setInputs,
  grade,
  questions,
  choices,
  realSummary,
  realSource,
  heritage,
  visited,
  imagineThumbs,
  realThumbs,
}: {
  inputs: ReportInputs;
  setInputs: (u: (prev: ReportInputs) => ReportInputs) => void;
  grade: string;
  questions: string[];
  choices: string[];
  realSummary: string;
  realSource: string;
  heritage: HeritagePoint[];
  visited: Set<string>;
  imagineThumbs: { src: string; caption: string }[];
  realThumbs: { src: string; caption: string }[];
}) {
  const visitedCount = heritage.filter((h) => visited.has(h.id)).length;
  const totalCount = heritage.length;
  const allDone = visitedCount === totalCount;
  return (
    <div className="report-sheet">
      <div className="report-stitch report-stitch-top" aria-hidden="true" />

      <header className="report-header">
        <div className="report-header-title">
          <span className="report-eyebrow">역사로 · 내가 만드는 조선 이야기</span>
          <h1 className="report-title">명량해전 지략 탐구 보고서</h1>
        </div>
        <div className="report-meta">
          <span className="report-pill">
            <span className="report-pill-label">학교</span>
            <input
              className="report-input wide"
              value={inputs.schoolName}
              onChange={(e) => setInputs((p) => ({ ...p, schoolName: e.target.value }))}
              placeholder="◯◯ 초등학교"
            />
          </span>
          <span className="report-pill">
            <span className="report-pill-label">학년</span>
            <span className="report-pill-static">{grade}</span>
          </span>
          <span className="report-pill">
            <span className="report-pill-label">이름</span>
            <input
              className="report-input"
              value={inputs.studentName}
              onChange={(e) => setInputs((p) => ({ ...p, studentName: e.target.value }))}
              placeholder="홍길동"
            />
          </span>
        </div>
      </header>

      <section className="report-grid">
        <div className="report-col report-col-imagine">
          <h3 className="report-col-title">나의 상상 역사 경로</h3>
          <div className="report-comic-mini" aria-label="상상 4컷">
            {imagineThumbs.map((t, i) => (
              <div key={i} className="report-comic-mini-cell">
                <ReportThumb src={t.src} label={`${i + 1}컷`} />
              </div>
            ))}
          </div>
          <ol className="report-path">
            {questions.map((q, i) => (
              <li key={i}>
                <span className="report-step-num">{i + 1}</span>
                <div className="report-step-body">
                  <div className="report-step-q">{q}</div>
                  <div className="report-step-a">→ {choices[i]}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="report-col report-col-real">
          <h3 className="report-col-title">조선왕조실록 리포트</h3>
          <div className="report-comic-mini" aria-label="실제 4컷">
            {realThumbs.map((t, i) => (
              <div key={i} className="report-comic-mini-cell">
                <ReportThumb src={t.src} label={`${i + 1}컷`} />
              </div>
            ))}
          </div>
          <p className="report-real-body">{realSummary}</p>
          <div className="report-source">출처 · {realSource}</div>
        </div>
      </section>

      <section className="report-heritage">
        <h3 className="report-col-title report-heritage-title">
          탐색 완료한 국가 문화재 도감
          <span className={"report-heritage-count" + (allDone ? " done" : "")}>
            {visitedCount} / {totalCount}
          </span>
        </h3>
        <div className="report-heritage-grid">
          {heritage.map((h) => {
            const isVisited = visited.has(h.id);
            return (
              <div
                key={h.id}
                className={"report-heritage-card" + (isVisited ? "" : " locked")}
              >
                <div className={"report-heritage-thumb" + (isVisited ? "" : " locked")}>
                  {isVisited ? (
                    <ReportThumb src={h.imageSrc} label={h.shortLabel} />
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  )}
                </div>
                <div className="report-heritage-meta">
                  <div className={"report-heritage-name" + (isVisited ? "" : " locked")}>
                    {isVisited ? h.title : "아직 탐색하지 않은 유물"}
                  </div>
                  <div className="report-heritage-src">
                    {isVisited ? h.source : "만화 속 반짝이를 눌러 확인해 보세요"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {!allDone && (
          <div className="report-heritage-hint">
            아직 {totalCount - visitedCount}개의 유물이 더 있어요. 만화 속 반짝이를 모두 눌러 보고서를 완성해 봐요.
          </div>
        )}
      </section>

      <footer className="report-footer">
        <h3 className="report-col-title">장군님께 배우는 나의 한 줄 다짐</h3>
        <div className="report-lines">
          <div className="report-line" />
          <div className="report-line" />
          <div className="report-line" />
        </div>
        <div className="report-watermark">
          본 보고서는 국가유산청 · 국립해양문화재연구소 등 대한민국 문화데이터 광장 Open API 고증 자료를 기반으로 출력되었습니다.
        </div>
      </footer>

      <div className="report-stitch report-stitch-bottom" aria-hidden="true" />
    </div>
  );
}

type Sub = "intro" | "play" | "comic";

type Props = {
  onHome: () => void;
  speak: (t: string) => void;
  stop: () => void;
  speaking: boolean;
};

export default function MyeongnyangExperience({ onHome, speak, stop, speaking }: Props) {
  const [grade, setGrade] = useState<GradeKey>("1-2");
  const [gradeOpen, setGradeOpen] = useState(false);
  const [sub, setSub] = useState<Sub>("intro");
  const [step, setStep] = useState(0); // 0,1,2 — 질문 단계
  const [picks, setPicks] = useState<number[]>([]);
  const [lensOn, setLensOn] = useState(true);
  const [coachShown, setCoachShown] = useState(true);
  const [activeHeritage, setActiveHeritage] = useState<HeritagePoint | null>(null);
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [reportOpen, setReportOpen] = useState(false);
  const [reportInputs, setReportInputs] = useState<ReportInputs>({ schoolName: "", studentName: "" });
  const [lastEffect, setLastEffect] = useState<string | null>(null);

  const data = DATA[grade];

  const visitedCount = HERITAGE_POINTS.filter((h) => visited.has(h.id)).length;
  const heritageTotal = HERITAGE_POINTS.length;
  const allExplored = visitedCount === heritageTotal;

  // 모달 열렸을 때 ESC로 닫기
  useEffect(() => {
    if (!activeHeritage) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveHeritage(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeHeritage]);

  // 코치마크 자동 닫기 (8초)
  useEffect(() => {
    if (!coachShown) return;
    const t = setTimeout(() => setCoachShown(false), 8000);
    return () => clearTimeout(t);
  }, [coachShown]);

  // 선택 결과 토스트 자동 닫기 (6초)
  useEffect(() => {
    if (!lastEffect) return;
    const t = setTimeout(() => setLastEffect(null), 6000);
    return () => clearTimeout(t);
  }, [lastEffect]);

  // 보고서 모달 ESC 닫기
  useEffect(() => {
    if (!reportOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setReportOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reportOpen]);

  function resetFlow(toIntro = false) {
    stop();
    setPicks([]);
    setStep(0);
    setLensOn(true);
    setCoachShown(true);
    setActiveHeritage(null);
    setVisited(new Set());
    setLastEffect(null);
    setSub(toIntro ? "intro" : "play");
  }

  function openHeritage(h: HeritagePoint) {
    stop();
    setActiveHeritage(h);
    setCoachShown(false);
    setVisited((prev) => {
      if (prev.has(h.id)) return prev;
      const next = new Set(prev);
      next.add(h.id);
      return next;
    });
  }

  function pickGrade(g: GradeKey) {
    setGrade(g);
    setGradeOpen(false);
    // 문구가 학년별로 바뀌므로 진행 중이면 첫 질문부터 다시 시작
    if (sub === "play") {
      stop();
      setPicks([]);
      setStep(0);
    }
  }

  function choose(i: number) {
    stop();
    // 다음 화면 상단에 띄울 결과 카피 — 현재 step + 선택 인덱스로 결정
    const eff = EFFECTS[picks.length]?.[i] ?? null;
    setLastEffect(eff);
    const next = [...picks, i];
    if (next.length >= 3) {
      setPicks(next);
      setSub("comic");
    } else {
      setPicks(next);
      setStep(next.length);
    }
  }

  // ── 학년 선택 드롭다운 ──
  const gradeMeta = GRADES.find((g) => g.key === grade)!;
  const GradeSelector = (
    <div className="myn-grade">
      <button
        className="myn-grade-btn"
        onClick={() => setGradeOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={gradeOpen}
      >
        <span className="myn-grade-emoji">{gradeMeta.emoji}</span>
        {gradeMeta.label}
        <span className="myn-grade-caret">{gradeOpen ? "▴" : "▾"}</span>
      </button>
      {gradeOpen && (
        <ul className="myn-grade-menu" role="listbox" aria-label="학년 선택">
          {GRADES.map((g) => (
            <li key={g.key} role="option" aria-selected={g.key === grade}>
              <button
                className={"myn-grade-item" + (g.key === grade ? " on" : "")}
                onClick={() => pickGrade(g.key)}
              >
                <span className="myn-grade-emoji">{g.emoji}</span>
                {g.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  // ── 인트로 ──
  if (sub === "intro") {
    return (
      <div className="screen myn-screen" key="myn-intro">
        <div className="panel-card myn-card">
          <div className="myn-play-top">
            <button className="back" onClick={onHome}>← 다른 이야기 고르기</button>
            {GradeSelector}
          </div>
          <div className="myn-hero">
            <div className="myn-thumb">
              <img src={imgUrl("_anchor.png")} alt="" />
              {HERITAGE_POINTS[0] && (
                <button
                  type="button"
                  className="myn-thumb-sparkle"
                  onClick={() => openHeritage(HERITAGE_POINTS[0])}
                  aria-label={`${HERITAGE_POINTS[0].title} — 실제 유물 보기`}
                >
                  <span className="heritage-sparkle-ring" aria-hidden="true" />
                  <span className="heritage-sparkle-core" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2.5l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.9z" />
                    </svg>
                  </span>
                </button>
              )}
            </div>
            <span className="myn-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              실제로 있었던 일
            </span>
            <h2 className="myn-title">이순신 장군의 명량해전</h2>
            <p className="myn-lead">{data.lead}</p>
            <button
              className={"btn-speak myn-read" + (speaking ? " playing" : "")}
              onClick={() => (speaking ? stop() : speak(data.lead))}
            >
              {speaking ? "멈추기" : "읽어줘"}
            </button>
            <div className="myn-source">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              출처 · {SOURCE}
            </div>
          </div>

          <button className="myn-cta" onClick={() => resetFlow(false)}>
            나의 &lsquo;만약에&rsquo; 시작하기
          </button>
          <button
            className="myn-ask"
            onClick={() => {
              /* 준비 중 — 지금은 아무 동작도 하지 않음 */
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" />
            </svg>
            이순신에게 직접 물어보기
          </button>
        </div>
        {activeHeritage && (
          <HeritageModal
            heritage={activeHeritage}
            onClose={() => setActiveHeritage(null)}
          />
        )}
      </div>
    );
  }

  // ── 질문 ──
  if (sub === "play") {
    const q = data.questions[step];
    return (
      <div className="screen myn-screen" key={`myn-play-${grade}-${step}`}>
        <div className={`panel-card myn-card myn-card-step-${step}`}>
          <div className="myn-play-top">
            <button className="back" onClick={() => resetFlow(true)}>← 처음으로</button>
            {GradeSelector}
          </div>

          {lastEffect && (
            <div className="myn-effect-toast" role="status" key={`fx-${step}`}>
              <span className="myn-effect-text">
                <b>지난 결정의 결과</b> · {lastEffect}
              </span>
              <button
                type="button"
                className="myn-effect-close"
                onClick={() => setLastEffect(null)}
                aria-label="알림 닫기"
              >
                ×
              </button>
            </div>
          )}

          <div className="steps myn-steps" aria-label={`3단계 중 ${step + 1}번째`}>
            {[0, 1, 2].map((i) => (
              <span key={i} className={"dot" + (i < step ? " on" : i === step ? " now" : "")} />
            ))}
          </div>
          <p className="myn-q-count">{STEP_LABELS[step]}</p>

          {/* 전황 — step별로 적 함대 수와 상황이 변함 */}
          <div className="myn-stats-bar" aria-label="현재 전황" key={`stats-${step}`}>
            <span className="myn-stat">
              <span className="myn-stat-text"><b>우리</b> {STEP_STATS[step].ours}</span>
            </span>
            <span className="myn-stat-sep" aria-hidden="true">·</span>
            <span className="myn-stat enemy">
              <span className="myn-stat-text"><b>적</b> {STEP_STATS[step].enemy}</span>
            </span>
            <span className="myn-stat-sep" aria-hidden="true">·</span>
            <span className="myn-stat phase">
              <span className="myn-stat-text">{STEP_STATS[step].phase}</span>
            </span>
          </div>

          <h2 className="myn-q-prompt">
            {q.prompt}
            <button
              className={"btn-speak myn-read inline" + (speaking ? " playing" : "")}
              onClick={() => (speaking ? stop() : speak(q.prompt))}
            >
              {speaking ? "멈추기" : "읽어줘"}
            </button>
          </h2>

          <div className={"myn-q-grid" + (q.options.some((o) => o.desc) ? " text-first" : "")}>
            {q.options.map((o, i) => {
              const hasDesc = Boolean(o.desc);
              const listenText = o.desc ? `${o.label}. ${o.desc}` : o.label;
              return (
                <div
                  key={i}
                  className={"myn-opt tone-" + o.tone + (hasDesc ? " text-first" : "")}
                  style={{ animationDelay: `${0.06 + i * 0.07}s` }}
                >
                  <button className="myn-opt-main" onClick={() => choose(i)}>
                    <span className="myn-opt-icon">
                      <Icon name={o.icon} />
                    </span>
                    <span className="myn-opt-text">
                      <span className="myn-opt-label">{o.label}</span>
                      {hasDesc && <span className="myn-opt-desc">{o.desc}</span>}
                    </span>
                  </button>
                  <button
                    className="myn-listen"
                    onClick={() => (speaking ? stop() : speak(listenText))}
                    aria-label={`${o.label} 들어보기`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M11 5 6 9H2v6h4l5 4z" />
                      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                    </svg>
                    들어보기
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── 4컷 결과 ──
  const pathKey = picks.join("-");
  const o1 = data.questions[0].options[picks[0]];
  const o2 = data.questions[1].options[picks[1]];
  const o3 = data.questions[2].options[picks[2]];
  const scenes = [o1.scene, o2.scene, data.climax, o3.scene];
  const ending = o3.ending ?? "";


  return (
    <div className="screen myn-screen" key="myn-comic">
      <div className="panel-card myn-card">
        <button className="back" onClick={() => resetFlow(true)}>← 처음으로</button>

        {lastEffect && (
          <div className="myn-effect-toast" role="status" key={`fx-comic`}>
            <span className="myn-effect-icon" aria-hidden="true">⚡</span>
            <span className="myn-effect-text">
              <b>마지막 결정의 결과</b> · {lastEffect}
            </span>
            <button
              type="button"
              className="myn-effect-close"
              onClick={() => setLastEffect(null)}
              aria-label="알림 닫기"
            >
              ×
            </button>
          </div>
        )}

        {/* ── SECTION 1 · 상상 4컷 ── */}
        <section className="story-section">
          <div className="story-section-head imagine">
            <span className="story-section-eyebrow">STEP 1 · 내가 만든 이야기</span>
            <h2 className="story-section-title">상상 4컷 — 내가 그린 명량</h2>
          </div>

          <div className="comic-grid">
            {scenes.map((s, i) => (
              <CutImg key={i} pathKey={pathKey} index={i} scene={s} />
            ))}
          </div>

          {ending && <div className="ending">{ending}</div>}

          <button
            className={"btn-speak" + (speaking ? " playing" : "")}
            onClick={() => {
              if (speaking) { stop(); return; }
              speak([ending, ...scenes.map((s, i) => `${i + 1}번 그림, ${s}`)].filter(Boolean).join(" "));
            }}
          >
            {speaking ? "멈추기" : "상상 4컷 읽어주기"}
          </button>

          <div className="watermark">
            이 이야기는 실제 역사 위에 상상을 더한 &lsquo;역사적 상상력 창작물&rsquo;이에요 · 출처 {SOURCE}
          </div>
        </section>

        {/* ── 섹션 디바이더: 상상 → 실제 ── */}
        <div className="story-divider" role="separator" aria-label="실제 역사로 이동">
          <span className="story-divider-eyebrow">진짜 역사</span>
          <h3 className="story-divider-title">그런데, 진짜로는 어떻게 됐을까?</h3>
          <p className="story-divider-sub">
            실제 4컷 속에 숨어있는 <b>{heritageTotal}개의 유물</b>을 모두 찾으면 보고서가 완성돼요
          </p>
          <span className="story-divider-arrow" aria-hidden="true">▼</span>
        </div>

        {/* ── SECTION 2 · 실제 4컷 + 문화재 렌즈 ── */}
        <section className="story-section">
          <div className="story-section-head real">
            <span className="story-section-eyebrow">STEP 2 · 진짜 역사 4컷</span>
            <h2 className="story-section-title">실제 4컷 — 1597 명량</h2>
          </div>

          <div className="heritage-lens-bar">
            <div className="heritage-lens-hint">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              반짝이는 곳을 눌러 실제 유물을 확인해 봐요
            </div>
            <div className="heritage-lens-controls">
              {coachShown && lensOn && (
                <button
                  type="button"
                  className="heritage-coach"
                  onClick={() => setCoachShown(false)}
                  aria-label="안내 닫기"
                >
                  만화 속에 반짝이는 실제 유물들이 숨어 있어요. 터치해서 확인해 보세요.
                </button>
              )}
              <button
                type="button"
                className={"heritage-lens-toggle" + (lensOn ? " on" : "")}
                onClick={() => { setLensOn((v) => !v); setCoachShown(false); }}
                aria-pressed={lensOn}
                aria-label={lensOn ? "문화재 렌즈 끄기" : "문화재 렌즈 켜기"}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2.5l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.9z" />
                </svg>
                문화재 렌즈 {lensOn ? "On" : "Off"}
              </button>
            </div>
          </div>

          <div className="comic-grid comic-grid-real">
            {REAL_PANELS.map((p, i) => (
              <RealCutImg
                key={i}
                index={i}
                src={p.src}
                caption={p.caption}
                bubble={p.bubble}
                lensOn={lensOn}
                heritage={HERITAGE_BY_PANEL[i]}
                visited={!!(HERITAGE_BY_PANEL[i] && visited.has(HERITAGE_BY_PANEL[i]!.id))}
                onOpenHeritage={openHeritage}
              />
            ))}
          </div>

          <div className="ending">{REAL_ENDING}</div>

          {/* 사용자의 Q1 선택 vs 실제 이순신의 핵심 전술(거센 물살) 비교 */}
          <div
            className={"myn-vs-comment " + (picks[0] === 0 ? "match" : "diff")}
            role="note"
          >
            {picks[0] === 0
              ? "정답이야! 실제 이순신도 거센 물살을 핵심 전술로 삼았어. 너의 직관이 빛났어."
              : `너는 '${o1.label}'을(를) 골랐지만, 실제 이순신은 거센 물살을 핵심 전술로 삼았어. 둘 다 멋진 작전이야.`}
          </div>

          <button
            className={"btn-speak" + (speaking ? " playing" : "")}
            onClick={() => {
              if (speaking) { stop(); return; }
              speak([
                REAL_ENDING,
                ...REAL_PANELS.map((p, i) => `${i + 1}번 그림, ${p.caption}. ${p.bubble}`),
              ].join(" "));
            }}
          >
            {speaking ? "멈추기" : "실제 4컷 읽어주기"}
          </button>

          <div className="watermark">
            실제 역사 기록을 바탕으로 한 4컷이에요 · 출처 {SOURCE}
          </div>
        </section>

        {/* ── SECTION 3 · 조선왕조실록 이야기 (기본 펼침) ── */}
        <section className="story-section">
          <div className="story-section-head sillok">
            <span className="story-section-eyebrow">STEP 3 · 조선왕조실록</span>
            <h2 className="story-section-title">진짜로는 어떻게 됐을까?</h2>
          </div>

          <div className="kidstory-section flat" id="myn-real-section">
            <span className="badge fact">실제 역사</span>
            {REAL_HISTORY_SECTIONS.map((s, i) => (
              <div key={i} className="myn-real-section">
                <h4 className="myn-real-title">{s.title}</h4>
                {s.paragraphs.map((p, j) => (
                  <p key={j} className="myn-real-p">{p}</p>
                ))}
              </div>
            ))}
            <div className="kidstory-source">
              <a
                href={SILLOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="sillok-link"
              >
                실록 원문에서 직접 확인하기 →
              </a>
            </div>
          </div>
        </section>

        {/* ── SECTION 4 · 보고서 내보내기 ── */}
        <section className="story-section">
          <div className="story-section-head report">
            <span className="story-section-eyebrow">STEP 4 · 탐구를 마치며</span>
            <h2 className="story-section-title">학교 숙제용 탐구 보고서 만들기</h2>
          </div>

          <button
            type="button"
            className={"btn btn-report" + (allExplored ? " complete" : "")}
            onClick={() => setReportOpen(true)}
            aria-label="역사 탐구 보고서 내보내기"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
              <path d="M9 14l2 2 4-4" />
            </svg>
            역사 탐구 보고서 내보내기
            <span className="btn-report-progress" aria-label={`유물 ${visitedCount} / ${heritageTotal} 탐색`}>
              {allExplored ? "✓ 완성" : `${visitedCount} / ${heritageTotal} 탐색`}
            </span>
          </button>
        </section>

        {/* 진행도 sticky 바 — 스크롤 중엔 viewport 바닥에 핀, 페이지 끝에선 자연스럽게 row 위로 흘러감 */}
        <div className="story-sticky-bar" role="status">
          <div className="story-sticky-progress">
            <span className="story-sticky-label">유물 탐색</span>
            <div className="story-sticky-dots" aria-label={`${visitedCount} / ${heritageTotal} 탐색 완료`}>
              {HERITAGE_POINTS.map((h) => (
                <span
                  key={h.id}
                  className={"story-sticky-dot" + (visited.has(h.id) ? " on" : "")}
                />
              ))}
            </div>
            <span className={"story-sticky-count" + (allExplored ? " done" : "")}>
              {visitedCount} / {heritageTotal}
            </span>
          </div>
          <button
            type="button"
            className={"story-sticky-cta" + (allExplored ? " complete" : "")}
            onClick={() => setReportOpen(true)}
          >
            보고서 {allExplored ? "완성" : "만들기"}
          </button>
        </div>

        <div className="row">
          <button className="btn btn-teal" onClick={() => resetFlow(false)}>다른 선택으로 다시 만들기</button>
          <button className="btn btn-ghost" onClick={onHome}>다른 이야기 고르기</button>
        </div>
      </div>
      {activeHeritage && (
        <HeritageModal
          heritage={activeHeritage}
          onClose={() => setActiveHeritage(null)}
        />
      )}
      {reportOpen && (
        <div
          className="report-modal-backdrop"
          role="presentation"
          onClick={() => setReportOpen(false)}
        >
          <div
            className="report-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-modal-heading"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="report-modal-close print-hide"
              onClick={() => setReportOpen(false)}
              aria-label="닫기"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
            <h2 id="report-modal-heading" className="report-modal-heading print-hide">
              탐구 보고서 미리보기 — 이름을 적고 인쇄·PDF 저장을 눌러요
            </h2>
            {!allExplored && (
              <div className="report-explore-banner print-hide" role="status">
                아직 <b>{heritageTotal - visitedCount}개</b>의 유물이 더 있어요! 만화로 돌아가 만화 속 반짝이를 모두 눌러야 도감이 완성됩니다.
              </div>
            )}
            {allExplored && (
              <div className="report-explore-banner complete print-hide" role="status">
                4개의 유물을 모두 탐색했어요! 보고서가 완성되었습니다.
              </div>
            )}
            <div className="report-scroll">
              <ReportSheet
                inputs={reportInputs}
                setInputs={setReportInputs}
                grade={gradeMeta.label}
                questions={data.questions.map((q) => q.prompt)}
                choices={[o1.label, o2.label, o3.label]}
                realSummary={REAL_ENDING}
                realSource={SOURCE}
                heritage={HERITAGE_POINTS}
                visited={visited}
                imagineThumbs={scenes.map((scene, i) => ({
                  src: imgUrl(`${pathKey}_panel${i + 1}.png`),
                  caption: scene,
                }))}
                realThumbs={REAL_PANELS.map((p) => ({ src: p.src, caption: p.caption }))}
              />
            </div>
            <div className="report-actions print-hide">
              <button
                type="button"
                className="btn-report-cancel"
                onClick={() => setReportOpen(false)}
              >
                닫기
              </button>
              <button
                type="button"
                className="btn-report-print"
                onClick={() => window.print()}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                PDF로 저장 · 인쇄하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
