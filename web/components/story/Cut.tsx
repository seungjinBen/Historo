"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { imgUrl } from "@/lib/images";

type Props = {
  eventId: string;
  pathKey: string;
  index: number;
  scene: string;
  imageUrl?: string; // S3 URL from API (우선 사용)
};

export function Cut({ eventId, pathKey, index, scene, imageUrl }: Props) {
  const [err, setErr] = useState(false);
  const [ok, setOk] = useState(false);

  const src = imageUrl || imgUrl(eventId, `${pathKey}_panel${index + 1}.png`);

  return (
    <div className="cut" style={{ animationDelay: `${index * 0.13}s` }}>
      {err ? (
        <div className="ph">
          {scene}
          <br />
          <span style={{ opacity: 0.6 }}>(그림 준비 중)</span>
        </div>
      ) : (
        <img
          src={src}
          alt={scene}
          className={ok ? "loaded" : ""}
          onLoad={() => setOk(true)}
          onError={() => setErr(true)}
        />
      )}
      {!err && (
        <div className="cap">
          <div className="num">{index + 1}</div>
          <span>{scene}</span>
        </div>
      )}
    </div>
  );
}
