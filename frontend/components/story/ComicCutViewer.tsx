"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";

type Cut = { description?: string; imageUrl?: string };

// 완성된 4컷을 한 화면에 한 컷씩 크게 보여주는 뷰어 (모든 에피소드 공용)
export function ComicCutViewer({
  cuts,
  onHome,
  onDone,
  doneLabel = "실제 역사 공부하기 →",
}: {
  cuts: Cut[];
  onHome: () => void;
  onDone: () => void;
  doneLabel?: string;
}) {
  const [i, setI] = useState(0);
  const total = cuts.length || 4;
  const cut = cuts[i];

  // 좌우 화살표로도 컷 넘김
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && i < total - 1) setI(i + 1);
      if (e.key === "ArrowLeft" && i > 0) setI(i - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [i, total]);

  return (
    <div className="cutv">
      <div className="cutv-head">
        <span className="cutv-eyebrow">내가 만든 4컷</span>
        <div className="cutv-dots" aria-hidden="true">
          {Array.from({ length: total }).map((_, k) => (
            <span key={k} className={"cutv-dot" + (k === i ? " on" : k < i ? " past" : "")} />
          ))}
        </div>
      </div>

      <figure className="cutv-stage" key={i}>
        <div className="cutv-frame">
          {cut?.imageUrl ? (
            <img className="cutv-img" src={cut.imageUrl} alt={`${i + 1}컷`} />
          ) : (
            <div className="cutv-ph">그림 준비 중</div>
          )}
        </div>
        <figcaption className="cutv-cap">
          <span className="cutv-cap-no">{i + 1}</span>
          <span className="cutv-cap-text">{cut?.description}</span>
        </figcaption>
      </figure>

      <div className="cutv-controls">
        {i > 0 ? (
          <button className="mbook-ctrl" onClick={() => setI(i - 1)}>← 이전 컷</button>
        ) : (
          <button className="mbook-ctrl" onClick={onHome}>← 다른 이야기 고르기</button>
        )}
        {i < total - 1 ? (
          <button className="mbook-ctrl primary" onClick={() => setI(i + 1)}>다음 컷 →</button>
        ) : (
          <button className="mbook-ctrl primary" onClick={onDone}>{doneLabel}</button>
        )}
      </div>
    </div>
  );
}
