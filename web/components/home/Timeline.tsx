"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { GlossText } from "@/components/common/Glossary";
import { HeritageIcon } from "@/components/common/HeritageIcon";
import { HISTORY_CONTENT, NODE_PREVIEW_PATH } from "@/lib/home-content";
import { imgUrl } from "@/lib/images";
import type { EventMeta, HeritageEvent, HeritageItem } from "@/lib/types";

function MiniPanel({ eventId, pathKey, n }: { eventId: string; pathKey: string; n: number }) {
  const [err, setErr] = useState(false);
  const [ok, setOk] = useState(false);
  return (
    <div className="mini-panel">
      {err ? (
        <div className="mini-ph">{n}</div>
      ) : (
        <img
          src={imgUrl(eventId, `${pathKey}_panel${n}.png`)}
          alt={`${n}번 컷`}
          className={ok ? "loaded" : ""}
          onLoad={() => setOk(true)}
          onError={() => setErr(true)}
        />
      )}
    </div>
  );
}

function HeritageItemCard({ item }: { item: HeritageItem }) {
  const [err, setErr] = useState(false);
  const [ok, setOk] = useState(false);
  return (
    <div className="heritage-item">
      <div className="heritage-thumb">
        {err ? (
          <div className="heritage-thumb-ph">유물 이미지 준비 중</div>
        ) : (
          <img
            src={item.imagePath}
            alt={item.name}
            className={ok ? "loaded" : ""}
            onLoad={() => setOk(true)}
            onError={() => setErr(true)}
          />
        )}
      </div>
      <div className="heritage-body">
        <div className="heritage-name">{item.name}</div>
        <p className="heritage-docent">{item.docentText}</p>
        <a
          className="heritage-source"
          href={item.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          출처 · {item.source} →
        </a>
      </div>
    </div>
  );
}

// 펼친 영역 하단의 "이야기 만들기" CTA — ready 면 진입, 아니면 안내.
function MakeStoryCta({ ev, onOpenEvent }: { ev: EventMeta; onOpenEvent: (ev: EventMeta) => void }) {
  if (ev.status === "ready") {
    return (
      <button
        type="button"
        className="peek-cta"
        onClick={(e) => { e.stopPropagation(); onOpenEvent(ev); }}
        aria-label={`${ev.title} 이야기 만들기`}
      >
        이야기 만들기 →
      </button>
    );
  }
  return (
    <div className="peek-cta-pending" role="status">
      곧 이야기로 만나요
    </div>
  );
}

type Props = {
  events: EventMeta[];
  heritage: Record<string, HeritageEvent> | null;
  previewEventId: string | null;
  setPreviewEventId: (updater: (id: string | null) => string | null) => void;
  heritagePreviewEventId: string | null;
  setHeritagePreviewEventId: (updater: (id: string | null) => string | null) => void;
  onOpenEvent: (ev: EventMeta) => void;
};

export function Timeline({
  events,
  heritage,
  previewEventId,
  setPreviewEventId,
  heritagePreviewEventId,
  setHeritagePreviewEventId,
  onOpenEvent,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const ERAS = ["조선 초기", "조선 중기", "조선 후기"] as const;
  const flatIndex = new Map<string, number>();
  const eraMinIndex: Record<string, number> = {};
  let counter = 0;
  ERAS.forEach((era) => {
    events
      .filter((ev) => ev.era === era)
      .sort((a, b) => a.year - b.year)
      .forEach((ev) => {
        if (!(era in eraMinIndex)) eraMinIndex[era] = counter;
        flatIndex.set(ev.id, counter);
        counter += 1;
      });
  });
  const totalEvents = counter;
  const hasMore = totalEvents > 4;
  return (
    <section className="home-section" id="study-timeline-section">
      <div className="section-header">
        <span className="section-header-eyebrow" id="study-timeline">역사의 길</span>
        <h2 className="section-header-title">조선 1392 — 1897</h2>
        <p className="section-header-sub">
          <span className="timeline-sub-long">
            시대 순으로 사건을 펼쳐봐요. 점을 누르면 무슨 일이 있었는지 들여다보고,
            <br />
            <HeritageIcon size={15} className="section-header-icon" /> 표시가 있는 사건은 그 시대의 실제 유물까지 함께 만날 수 있어요.
          </span>
          <span className="timeline-sub-short">
            점을 눌러 사건과 <HeritageIcon size={13} className="section-header-icon" />유물을 살펴봐요.
          </span>
        </p>
      </div>
      <div className={"timeline" + (expanded ? "" : " is-collapsed")}>
        {ERAS.map((era) => {
          const eraEvents = events
            .filter((ev) => ev.era === era)
            .sort((a, b) => a.year - b.year);
          if (eraEvents.length === 0) return null;
          const eraStart = eraMinIndex[era] ?? Infinity;
          const eraHidden = eraStart >= 4;
          return (
            <div
              key={era}
              className="tl-era"
              data-era-hidden={eraHidden ? "true" : "false"}
            >
              <div className="tl-era-label">{era}</div>
              <div className="tl-list">
                {eraEvents.map((ev, idx) => {
                  const flat = flatIndex.get(ev.id) ?? 0;
                  const flatHidden = flat >= 4;
                  const heritageData = ev.heritageId && heritage ? heritage[ev.heritageId] : null;
                  const historySections = HISTORY_CONTENT[ev.id] ?? null;
                  const isHistoryOpen = previewEventId === ev.id;
                  const isHeritageOpen = heritagePreviewEventId === ev.id;
                  const hasHeritage = Boolean(heritageData);

                  if (ev.status === "coming") {
                    return (
                      <div
                        key={ev.id}
                        className="tl-item"
                        data-flat-hidden={flatHidden ? "true" : "false"}
                      >
                        <div className="tl-dot" />
                        <div
                          className="tl-card coming"
                          aria-label={`${ev.year}년 ${ev.title} — 곧 만나요`}
                        >
                          <div className="tl-inner">
                            <div className="tl-mini" aria-hidden="true">
                              <div className="mini-locked">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                              </div>
                            </div>
                            <div className="tl-content">
                              <div className="tl-meta">
                                <span className="tl-year">{ev.year}</span>
                                <span className="tl-king">{ev.king}</span>
                                <span className="tl-cat">{ev.category}</span>
                              </div>
                              <div className="tl-title">{ev.title}</div>
                              <span className="tl-lock">곧 만나요</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  const toggleHistory = () => setPreviewEventId((id) => id === ev.id ? null : ev.id);
                  const toggleHeritage = () => setHeritagePreviewEventId((id) => id === ev.id ? null : ev.id);
                  const cardClass =
                    "tl-card " + ev.status +
                    " clickable" +
                    (isHistoryOpen || isHeritageOpen ? " peek-open" : "");

                  return (
                    <div
                      key={ev.id}
                      className="tl-item"
                      data-flat-hidden={flatHidden ? "true" : "false"}
                    >
                      <div className={"tl-dot " + ev.status} />
                      <div
                        className={cardClass}
                        style={{ animationDelay: `${idx * 0.07}s` }}
                        role="button"
                        tabIndex={0}
                        aria-expanded={isHistoryOpen}
                        aria-controls={`peek-${ev.id}`}
                        aria-label={`${ev.title} — 무슨 일이 있었을까?`}
                        onClick={toggleHistory}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggleHistory();
                          }
                        }}
                      >
                        <div className="tl-inner">
                          {ev.status === "ready" && (
                            <div className="tl-mini" aria-hidden="true">
                              <div className="mini-comic">
                                {[1, 2, 3, 4].map((n) => (
                                  <MiniPanel
                                    key={n}
                                    eventId={ev.id}
                                    pathKey={NODE_PREVIEW_PATH[ev.id] ?? "0-0-0"}
                                    n={n}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="tl-content">
                            <div className="tl-meta">
                              <span className="tl-year">{ev.year}</span>
                              <span className="tl-king">{ev.king}</span>
                              <span className="tl-cat">{ev.category}</span>
                            </div>
                            <div className="tl-title">{ev.title}</div>
                            <div className="tl-peek-hint">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                              </svg>
                              <span className="tl-peek-hint-text-full">무슨 일이 있었을까?</span>
                              <span className="tl-peek-hint-text-short">역사</span>
                              <span className="tl-peek-chev" aria-hidden="true">{isHistoryOpen ? "▲" : "▼"}</span>
                            </div>
                          </div>
                          {hasHeritage && (
                            <button
                              type="button"
                              className={"tl-heritage-btn" + (isHeritageOpen ? " on" : "")}
                              onClick={(e) => { e.stopPropagation(); toggleHeritage(); }}
                              onKeyDown={(e) => e.stopPropagation()}
                              aria-expanded={isHeritageOpen}
                              aria-controls={`peek-heritage-${ev.id}`}
                              aria-label={`${ev.title} 관련 유물 ${isHeritageOpen ? "닫기" : "보기"}`}
                            >
                              <HeritageIcon size={18} />
                              <span className="tl-heritage-btn-label tl-heritage-btn-label-full">관련 유물</span>
                              <span className="tl-heritage-btn-label tl-heritage-btn-label-short">유물</span>
                              <span className="tl-heritage-btn-chev" aria-hidden="true">{isHeritageOpen ? "▲" : "▼"}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {isHistoryOpen && (
                        <div
                          className="tl-peek tl-peek-history"
                          id={`peek-${ev.id}`}
                          role="region"
                          aria-label={`${ev.title} 역사 살펴보기`}
                        >
                          <div className="peek-col-head">
                            <span className="peek-col-eyebrow">조선왕조실록 · 역사</span>
                          </div>
                          {historySections ? (
                            <div className="peek-history">
                              {historySections.map((sec, si) => (
                                <section key={si} className="peek-history-section">
                                  <h3 className="peek-history-title">{sec.title}</h3>
                                  {sec.paragraphs.map((p, pi) => (
                                    <p key={pi} className="peek-history-p"><GlossText text={p} /></p>
                                  ))}
                                </section>
                              ))}
                            </div>
                          ) : (
                            <p className="peek-text">{ev.factCard}</p>
                          )}
                          <div className="peek-source">출처 · {ev.source}</div>
                          {ev.sillokUrl && (
                            <a
                              href={ev.sillokUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="peek-sillok"
                              onClick={(e) => e.stopPropagation()}
                            >
                              원문 보기 →
                            </a>
                          )}
                          <MakeStoryCta ev={ev} onOpenEvent={onOpenEvent} />
                        </div>
                      )}

                      {isHeritageOpen && heritageData && (
                        <aside
                          className="tl-peek tl-peek-heritage"
                          id={`peek-heritage-${ev.id}`}
                          aria-label={`${ev.title} 관련 유물`}
                        >
                          <div className="peek-col-head">
                            <span className="peek-col-eyebrow peek-col-eyebrow-heritage">
                              <HeritageIcon size={14} /> 관련 유물 · {heritageData.heritageItems.length}점
                            </span>
                            <span className="peek-col-sub">{heritageData.title}</span>
                          </div>
                          <div className="heritage-grid heritage-grid-peek">
                            {heritageData.heritageItems.map((item) => (
                              <HeritageItemCard key={item.id} item={item} />
                            ))}
                          </div>
                          <MakeStoryCta ev={ev} onOpenEvent={onOpenEvent} />
                        </aside>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {hasMore && (
        <div className="timeline-toggle-wrap">
          <button
            type="button"
            className="timeline-toggle"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
          >
            {expanded ? "접기 ▲" : `더 보기 (+${totalEvents - 4}) ▼`}
          </button>
        </div>
      )}
    </section>
  );
}
