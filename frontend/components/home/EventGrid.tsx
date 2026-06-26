"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { KID_ORDER } from "@/lib/home-content";
import { api, EVENT_TO_EPISODE } from "@/lib/api";
import type { EventMeta, HeritageEvent } from "@/lib/types";

// CDN 첫 번째 컷을 썸네일로 — 로드 전엔 shimmer placeholder
function EventBoxThumb({ ev, cdnUrl }: { ev: EventMeta; cdnUrl?: string }) {
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState(false);

  if (ev.status === "coming") {
    return (
      <div className="event-thumb event-thumb-locked" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
    );
  }

  if (!cdnUrl || err) {
    return (
      <div className="event-thumb event-thumb-shimmer" aria-hidden="true" />
    );
  }
  return (
    <div className="event-thumb">
      {!ok && <div className="event-thumb-shimmer" style={{ position: "absolute", inset: 0 }} aria-hidden="true" />}
      <img
        src={cdnUrl}
        alt=""
        className={ok ? "loaded" : ""}
        style={ok ? undefined : { opacity: 0, position: "absolute" }}
        onLoad={() => setOk(true)}
        onError={() => setErr(true)}
      />
    </div>
  );
}

type Props = {
  events: EventMeta[];
  heritage: Record<string, HeritageEvent> | null;
  onOpenEvent: (ev: EventMeta) => void;
};

export function EventGrid({ events, heritage, onOpenEvent }: Props) {
  const [expanded, setExpanded] = useState(false);
  // 에피소드별 CDN 첫 번째 컷 (A-1-α 스토리라인)
  const [cdnCut1, setCdnCut1] = useState<Record<string, string>>({});
  useEffect(() => {
    events
      .filter((ev) => ev.status === "ready" && EVENT_TO_EPISODE[ev.id])
      .forEach((ev) => {
        api.getComic(ev.id)
          .then((comic) => {
            const sl = comic.storylines.find((s) => s.id === "A-1-α") ?? comic.storylines[0];
            const url = sl?.cuts.sort((a, b) => a.number - b.number)[0]?.imageUrl;
            if (url) setCdnCut1((prev) => ({ ...prev, [ev.id]: url }));
          })
          .catch(() => {});
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const sorted = events
    .slice()
    .sort((a, b) => {
      const ai = KID_ORDER.indexOf(a.id);
      const bi = KID_ORDER.indexOf(b.id);
      if (ai === -1 && bi === -1) return a.year - b.year;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  const hasMore = sorted.length > 4;
  return (
    <section className="home-section" id="events-section">
      <div className="section-header" data-rv="up">
        <span className="section-header-eyebrow">사건 박스</span>
        <h2 className="section-header-title">좋아하는 이야기부터 골라봐요</h2>
        <p className="section-header-sub">관심 가는 사건의 박스를 눌러 4컷 이야기를 만들어보세요.</p>
      </div>
      <div className={"event-grid" + (!expanded ? " is-collapsed" : "")}>
        {sorted.map((ev, idx) => {
            const heritageData = ev.heritageId && heritage ? heritage[ev.heritageId] : null;
            return (
              <div
                key={ev.id}
                className={"event-box " + ev.status}
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                <EventBoxThumb ev={ev} cdnUrl={cdnCut1[ev.id]} />
                <div className="event-body">
                  <div className="event-meta">
                    <span className="event-year">{ev.year}</span>
                    <span className="event-king">{ev.king}</span>
                    <span className="event-cat">{ev.category}</span>
                  </div>
                  <div className="event-title">{ev.title}</div>
                  {ev.status !== "coming" && (
                    <p className="event-fact">{ev.factCard}</p>
                  )}
                  <div className="event-actions">
                    {ev.status === "ready" && (
                      <button
                        className="event-cta"
                        onClick={() => onOpenEvent(ev)}
                        aria-label={`${ev.title} 이야기 만들기`}
                      >
                        이야기 만들기 →
                      </button>
                    )}
                    {ev.status === "heritage" && (
                      <span className="event-note">곧 이야기로 만나요</span>
                    )}
                    {ev.status === "coming" && (
                      <span className="event-lock">곧 만나요</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
      {hasMore && (
        <div className="event-grid-toggle-wrap">
          <button
            type="button"
            className="event-grid-toggle"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
          >
            {expanded ? "접기 ▲" : `더 보기 (+${sorted.length - 4}) ▼`}
          </button>
        </div>
      )}
    </section>
  );
}
