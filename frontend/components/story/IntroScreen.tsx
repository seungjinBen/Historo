"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { SpeakBtn } from "@/components/common/SpeakBtn";
import { api, EVENT_TO_EPISODE } from "@/lib/api";
import type { EventMeta } from "@/lib/types";

type Props = {
  event: EventMeta;
  onBack: () => void;
  onStart: () => void;
  speak: (t: string) => void;
  stop: () => void;
  speaking: boolean;
};

export function IntroScreen({ event, onBack, onStart, speak, stop, speaking }: Props) {
  const [heroSrc, setHeroSrc] = useState<string | null>(`/images/${event.id}/_anchor.png`);
  const [anchorFailed, setAnchorFailed] = useState(false);

  useEffect(() => {
    if (!anchorFailed) return;
    const kr = EVENT_TO_EPISODE[event.id];
    if (!kr) return;
    api.getComic(kr)
      .then((comic) => {
        const sl = comic.storylines.find((s) => s.id === "A-1-α");
        const url = sl?.cuts?.[0]?.imageUrl ?? null;
        setHeroSrc(url);
      })
      .catch(() => setHeroSrc(null));
  }, [anchorFailed, event.id]);

  return (
    <div className="panel-card screen" key="intro">
      <button className="back" onClick={onBack}>← 다른 이야기 고르기</button>

      {heroSrc && (
        <div className="intro-hero">
          <img
            src={heroSrc}
            alt={event.title}
            onError={() => {
              if (!anchorFailed) { setAnchorFailed(true); }
              else { setHeroSrc(null); }
            }}
          />
        </div>
      )}

      <span className="badge fact">실제 역사</span>
      <p className="fact-text">{event.factCard}</p>
      <SpeakBtn text={event.factCard} speak={speak} stop={stop} speaking={speaking} />
      <div className="source">출처 · {event.source}</div>
      <div style={{ marginTop: 28 }}>
        <button className="btn btn-primary" onClick={onStart}>
          여기서부터 &apos;만약에&apos; 이야기 시작하기 →
        </button>
      </div>
    </div>
  );
}
