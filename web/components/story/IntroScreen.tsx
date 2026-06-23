"use client";

import { SpeakBtn } from "@/components/common/SpeakBtn";
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
  return (
    <div className="panel-card screen" key="intro">
      <button className="back" onClick={onBack}>← 다른 이야기 고르기</button>
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
