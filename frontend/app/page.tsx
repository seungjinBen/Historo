"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { AboutScreen } from "@/components/about/AboutScreen";
import { BookshelfScreen } from "@/components/BookshelfScreen";
import MeokdolChat from "@/components/MeokdolChat";
import { GlossaryProvider } from "@/components/common/Glossary";
import { ScrollReveal } from "@/components/common/ScrollReveal";
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
import GenericBookExperience from "@/components/story/GenericBookExperience";
import { EVENT_TO_EPISODE } from "@/lib/api";
import { getCurrentEmail, signOut as cognitoSignOut } from "@/lib/cognito";
import { useTTS } from "@/lib/use-tts";
import { treeDepth, pathToStorylineId } from "@/lib/tree";
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
  const [event, setEvent]   = useState<EventMeta | null>(null);
  const [tree, setTree]     = useState<Tree | null>(null);
  const [node, setNode]     = useState<StoryNode | null>(null);
  const [path, setPath]     = useState<number[]>([]);
  const [error, setError]   = useState<string | null>(null);

  const { speak, stop, speaking } = useTTS();
  const fromPop = useRef(false);

  const [previewEventId, setPreviewEventId]                 = useState<string | null>(null);
  const [heritagePreviewEventId, setHeritagePreviewEventId] = useState<string | null>(null);
  const [heritage, setHeritage] = useState<Record<string, HeritageEvent> | null>(null);

  const [token, setTokenState]       = useState<string | null>(null);
  const [username, setUsernameState] = useState<string | null>(null);

  useEffect(() => {
    getCurrentEmail().then((email) => {
      if (email) { setTokenState("ok"); setUsernameState(email); }
    });
  }, []);

  useEffect(() => {
    fetch("/data/events.json")
      .then((r) => r.json())
      .then((d) => setEvents(d.events))
      .catch(() => setError("data/events.json 을 불러오지 못했어요."));
  }, []);

  useEffect(() => {
    fetch("/data/heritage.json")
      .then((r) => r.json())
      .then((d: { events: HeritageEvent[] }) => {
        const map: Record<string, HeritageEvent> = {};
        d.events.forEach((e) => { map[e.id] = e; });
        setHeritage(map);
      })
      .catch(() => {});
  }, []);

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

  useEffect(() => { return () => { stop(); }; }, [screen, stop]);

  function handleLogout() {
    cognitoSignOut();
    setTokenState(null);
    setUsernameState(null);
  }

  const home = useCallback(() => {
    if (!fromPop.current) window.history.pushState(null, "", "/");
    stop();
    setScreen("home"); setEvent(null); setTree(null); setNode(null); setPath([]);
    setPreviewEventId(null); setHeritagePreviewEventId(null);
  }, [stop]);

  const openEvent = useCallback((ev: EventMeta) => {
    if (!fromPop.current) window.history.pushState(null, "", `/?e=${ev.id}`);
    if (ev.id === "yi-myeongnyang-1597") {
      setEvent(ev); setScreen("myeongnyang"); return;
    }
    setEvent(ev); setScreen("tree-book");
  }, []);

  // 초기 URL 파싱 — events 로드 직후 한 번만 실행
  useEffect(() => {
    if (!events) return;
    const params = new URLSearchParams(window.location.search);
    const e = params.get("e");
    const s = params.get("s");
    fromPop.current = true;
    if (e) {
      const ev = events.find((ev) => ev.id === e);
      if (ev) openEvent(ev);
    } else if (s === "about") {
      setScreen("about");
    } else if (s === "bookshelf") {
      setScreen("bookshelf");
    } else {
      // 홈이면 초기 히스토리 엔트리 확보
      window.history.replaceState(null, "", "/");
    }
    fromPop.current = false;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);

  // 브라우저 뒤로/앞으로 처리
  useEffect(() => {
    if (!events) return;
    const onPop = () => {
      fromPop.current = true;
      stop();
      const params = new URLSearchParams(window.location.search);
      const e = params.get("e");
      const s = params.get("s");
      if (e) {
        const ev = events.find((ev) => ev.id === e);
        if (ev) openEvent(ev);
      } else if (s === "about") {
        setScreen("about"); setEvent(null);
      } else if (s === "bookshelf") {
        setScreen("bookshelf"); setEvent(null);
      } else {
        setScreen("home"); setEvent(null); setTree(null); setNode(null); setPath([]);
        setPreviewEventId(null); setHeritagePreviewEventId(null);
      }
      fromPop.current = false;
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [events, openEvent, stop]);

  function scrollToTarget(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    setNode(tree.root); setPath([]); setScreen("play");
  };

  if (error)   return <div className="wrap"><div className="panel-card center">{error}</div></div>;
  if (!events) return <div className="wrap"><div className="center">불러오는 중…</div></div>;

  const totalSteps  = tree ? treeDepth(tree.root) : 0;
  const episodeKr   = event ? (EVENT_TO_EPISODE[event.id] ?? event.title) : "";
  const storylineId = path.length === 3 ? pathToStorylineId(path) : "";
  const pathText    = path.join(" → ");

  return (
    <GlossaryProvider>
    <ScrollReveal />
    <div className="wrap">
      <TopBar
        onHome={home}
        onAbout={() => { window.history.pushState(null, "", "/?s=about"); setScreen("about"); }}
        onBookshelf={() => { window.history.pushState(null, "", "/?s=bookshelf"); setScreen("bookshelf"); }}
        token={token}
        username={username}
        onLogout={handleLogout}
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
        <BookExperience key="myeongnyang" onHome={home} speak={speak} stop={stop} speaking={speaking} />
      )}

      {screen === "tree-book" && event && (
        <GenericBookExperience
          key={event.id}
          event={event}
          onHome={home}
          speak={speak}
          stop={stop}
          speaking={speaking}
        />
      )}

      {screen === "about"     && <AboutScreen onBack={home} />}
      {screen === "chat"      && <MeokdolChat key="chat" onBack={home} />}
      {screen === "bookshelf" && <BookshelfScreen onBack={home} />}

      {screen === "intro" && event && (
        <IntroScreen
          event={event} onBack={home} onStart={() => setScreen("play")}
          speak={speak} stop={stop} speaking={speaking}
        />
      )}

      {screen === "play" && node?.choices && (
        <PlayScreen
          node={node} path={path} totalSteps={totalSteps} onBack={home} onChoose={choose}
          speak={speak} stop={stop} speaking={speaking}
        />
      )}

      {screen === "comic" && event && node?.panels && (
        <ComicScreen
          event={event}
          node={node}
          path={path}
          episodeKr={episodeKr}
          storylineId={storylineId}
          pathText={pathText}
          onBack={home}
          onReplay={replay}
          onBookshelfSaved={() => {}}
          speak={speak}
          stop={stop}
          speaking={speaking}
        />
      )}
    </div>
    </GlossaryProvider>
  );
}
