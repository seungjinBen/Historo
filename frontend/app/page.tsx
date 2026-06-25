"use client";

import { useEffect, useState } from "react";

import { AboutScreen } from "@/components/about/AboutScreen";
import { BookshelfScreen } from "@/components/BookshelfScreen";
import MeokdolChat from "@/components/MeokdolChat";
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

  async function openEvent(ev: EventMeta) {
    if (ev.id === "yi-myeongnyang-1597") {
      setEvent(ev); setScreen("myeongnyang"); return;
    }
    try {
      const t: Tree = await fetch(`/data/trees/${ev.id}.json`).then((r) => r.json());
      setEvent(ev); setTree(t); setNode(t.root); setPath([]); setScreen("intro");
    } catch {
      setError(`트리를 불러오지 못했어요: /trees/${ev.id}.json`);
    }
  }

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

  const home = () => {
    setScreen("home"); setEvent(null); setTree(null); setNode(null); setPath([]);
    setPreviewEventId(null); setHeritagePreviewEventId(null);
  };

  if (error)   return <div className="wrap"><div className="panel-card center">{error}</div></div>;
  if (!events) return <div className="wrap"><div className="center">불러오는 중…</div></div>;

  const totalSteps  = tree ? treeDepth(tree.root) : 0;
  const episodeKr   = event ? (EVENT_TO_EPISODE[event.id] ?? event.title) : "";
  const storylineId = path.length === 3 ? pathToStorylineId(path) : "";
  const pathText    = path.join(" → ");

  return (
    <GlossaryProvider>
    <div className="wrap">
      <TopBar
        onHome={home}
        onAbout={() => setScreen("about")}
        onBookshelf={() => setScreen("bookshelf")}
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
