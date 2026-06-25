"use client";

// MVP 뷰어: public/ 의 정적 JSON·이미지를 직접 읽는다.
// 나중에 Spring Boot로 옮길 때는 아래 fetch 경로만 백엔드 주소로 바꾸면 된다.

import { useEffect, useState } from "react";

import { AboutScreen } from "@/components/about/AboutScreen";
import { GlossaryProvider } from "@/components/common/Glossary";
import { SiteFooter } from "@/components/common/SiteFooter";
import { EventGrid } from "@/components/home/EventGrid";
import { Gallery } from "@/components/home/Gallery";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { SillokPillars } from "@/components/home/SillokPillars";
import { Timeline } from "@/components/home/Timeline";
import { TopBar } from "@/components/home/TopBar";
import { ComicScreen } from "@/components/story/ComicScreen";
import { IntroScreen } from "@/components/story/IntroScreen";
import { PlayScreen } from "@/components/story/PlayScreen";
import BookExperience from "@/features/myeongnyang/BookExperience";
import { useTTS } from "@/lib/use-tts";
import { treeDepth } from "@/lib/tree";
import type {
  EventMeta,
  HeritageEvent,
  Screen,
  StoryNode,
  Tree,
} from "@/lib/types";

export default function Page() {
  const [screen, setScreen] = useState<Screen>("home");
  const [events, setEvents] = useState<EventMeta[] | null>(null);
  const [event, setEvent] = useState<EventMeta | null>(null);
  const [tree, setTree] = useState<Tree | null>(null);
  const [node, setNode] = useState<StoryNode | null>(null);
  const [path, setPath] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { speak, stop, speaking } = useTTS();

  const [previewEventId, setPreviewEventId] = useState<string | null>(null);
  const [heritagePreviewEventId, setHeritagePreviewEventId] = useState<string | null>(null);
  const [heritage, setHeritage] = useState<Record<string, HeritageEvent> | null>(null);

  useEffect(() => {
    fetch("/data/events.json")
      .then((r) => r.json())
      .then((d) => setEvents(d.events))
      .catch(() => setError("data/events.json 을 불러오지 못했어요. public/data/ 에 복사했는지 확인해 주세요."));
  }, []);

  useEffect(() => {
    fetch("/heritage.json")
      .then((r) => r.json())
      .then((d: { events: HeritageEvent[] }) => {
        const map: Record<string, HeritageEvent> = {};
        d.events.forEach((e) => { map[e.id] = e; });
        setHeritage(map);
      })
      .catch(() => {});
  }, []);

  // ESC 키로 연표 펼침 패널(역사/유물) 닫기
  useEffect(() => {
    if (!previewEventId && !heritagePreviewEventId) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setPreviewEventId(null);
      setHeritagePreviewEventId(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [previewEventId, heritagePreviewEventId]);

  // 화면 전환 시 이전 발화 중단
  useEffect(() => {
    return () => { stop(); };
  }, [screen, stop]);

  async function openEvent(ev: EventMeta) {
    // 명량해전은 동화책 모드(전용 체험)로 바로 진입
    if (ev.id === "yi-myeongnyang-1597") {
      setEvent(ev);
      setScreen("myeongnyang");
      return;
    }
    try {
      const t: Tree = await fetch(`/trees/${ev.id}.json`).then((r) => r.json());
      setEvent(ev);
      setTree(t);
      setNode(t.root);
      setPath([]);
      setScreen("intro");
    } catch {
      setError(`트리를 불러오지 못했어요: /trees/${ev.id}.json`);
    }
  }

  function scrollToTarget(id: string) {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function choose(i: number) {
    if (!node?.choices) return;
    const next = node.choices[i].node;
    setPath([...path, i]);
    setNode(next);
    setScreen(Array.isArray(next.panels) ? "comic" : "play");
  }

  const replay = () => {
    if (!tree) return;
    setNode(tree.root);
    setPath([]);
    setScreen("play");
  };
  const home = () => {
    setScreen("home");
    setEvent(null);
    setTree(null);
    setNode(null);
    setPath([]);
    setPreviewEventId(null);
    setHeritagePreviewEventId(null);
  };

  if (error) return <div className="wrap"><div className="panel-card center">{error}</div></div>;
  if (!events) return <div className="wrap"><div className="center">불러오는 중…</div></div>;

  const totalSteps = tree ? treeDepth(tree.root) : 0;

  return (
    <GlossaryProvider>
    <div className="wrap">
      <TopBar
        onHome={home}
        onAbout={() => setScreen("about")}
      />

      {screen === "home" && (
        <div className="screen" key="home">
          <HeroSection scrollToTarget={scrollToTarget} />
          <HowItWorks />
          <EventGrid events={events} heritage={heritage} onOpenEvent={openEvent} />
          <Timeline
            events={events}
            heritage={heritage}
            previewEventId={previewEventId}
            setPreviewEventId={setPreviewEventId}
            heritagePreviewEventId={heritagePreviewEventId}
            setHeritagePreviewEventId={setHeritagePreviewEventId}
            onOpenEvent={openEvent}
          />
          <Gallery events={events} onOpenEvent={openEvent} />
          <SillokPillars />
          <SiteFooter />
        </div>
      )}

      {screen === "myeongnyang" && (
        <BookExperience
          key="myeongnyang"
          onHome={home}
          speak={speak}
          stop={stop}
          speaking={speaking}
        />
      )}

      {screen === "about" && <AboutScreen onBack={home} />}

      {screen === "intro" && event && (
        <IntroScreen
          event={event}
          onBack={home}
          onStart={() => setScreen("play")}
          speak={speak}
          stop={stop}
          speaking={speaking}
        />
      )}

      {screen === "play" && node?.choices && (
        <PlayScreen
          node={node}
          path={path}
          totalSteps={totalSteps}
          onBack={home}
          onChoose={choose}
          speak={speak}
          stop={stop}
          speaking={speaking}
        />
      )}

      {screen === "comic" && event && node?.panels && (
        <ComicScreen
          event={event}
          node={node}
          path={path}
          onBack={home}
          onReplay={replay}
          speak={speak}
          stop={stop}
          speaking={speaking}
        />
      )}
    </div>
    </GlossaryProvider>
  );
}
