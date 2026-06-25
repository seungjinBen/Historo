"use client";

import { SpeakBtn } from "@/components/common/SpeakBtn";
import { Steps } from "./Steps";
import type { StoryNode } from "@/lib/types";

type Props = {
  node: StoryNode;
  path: number[];
  totalSteps: number;
  onBack: () => void;
  onChoose: (i: number) => void;
  speak: (t: string) => void;
  stop: () => void;
  speaking: boolean;
};

export function PlayScreen({ node, path, totalSteps, onBack, onChoose, speak, stop, speaking }: Props) {
  if (!node.choices) return null;
  return (
    <div className="panel-card screen" key={`play-${path.length}`}>
      <button className="back" onClick={onBack}>← 처음으로</button>
      {path.length === 0 ? (
        <span className="badge fact">실제 역사</span>
      ) : (
        <span className="badge imagine">상상 이야기</span>
      )}
      {totalSteps > 0 && <Steps current={path.length} total={totalSteps} />}
      <p className="narr">{node.narration}</p>
      <SpeakBtn text={node.narration} speak={speak} stop={stop} speaking={speaking} />
      <div className="choices">
        {node.choices.map((c, i) => (
          <button key={i} className="btn choice" style={{ animationDelay: `${0.1 + i * 0.08}s` }} onClick={() => onChoose(i)}>
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
