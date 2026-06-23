"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { imgUrl } from "@/lib/images";

export function Cut({ eventId, pathKey, index, scene }: { eventId: string; pathKey: string; index: number; scene: string }) {
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
          src={imgUrl(eventId, `${pathKey}_panel${index + 1}.png`)}
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
