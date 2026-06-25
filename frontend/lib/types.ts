// 사이트 전반에서 공유하는 도메인 타입.

export type Panel = { scene: string; sceneEn: string };

export type StoryNode = {
  narration: string;
  choices?: { label: string; node: StoryNode }[];
  ending?: string;
  panels?: Panel[];
};

export type Tree = { eventId: string; root: StoryNode };

export type EventMeta = {
  id: string;
  heritageId?: string;
  title: string;
  year: number;
  king: string;
  era: string;
  category: string;
  status: "ready" | "coming" | "heritage";
  source: string;
  sillokUrl?: string | null;
  factCard: string;
  character?: { name: string; appearance?: string } | null;
};

export type HeritageItem = {
  id: string;
  name: string;
  imagePath: string;
  docentText: string;
  source: string;
  sourceUrl: string;
};

export type HeritageEvent = {
  id: string;
  title: string;
  year: string;
  heritageItems: HeritageItem[];
};

export type KidStory = {
  eventId: string;
  source: string;
  sillokUrl: string | null;
  fromSillok: boolean;
  kidStory: string;
  funFacts: string[];
};

export type Screen = "home" | "intro" | "play" | "comic" | "myeongnyang" | "tree-book" | "chat" | "about" | "bookshelf";

export type HeroActionId = "story" | "study" | "heritage" | "gallery";
