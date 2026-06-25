"use client";

/* eslint-disable @next/next/no-img-element */

import { Fragment, useEffect, useState } from "react";
import { GALLERY_BOOKS } from "@/lib/home-content";
import { api, type ApiGalleryItem } from "@/lib/api";
import type { EventMeta } from "@/lib/types";

type Props = {
  events: EventMeta[];
  onOpenEvent: (ev: EventMeta) => void;
};

export function Gallery({ events, onOpenEvent }: Props) {
  const [galleryItems, setGalleryItems] = useState<ApiGalleryItem[]>([]);
  const [modal, setModal]               = useState<ApiGalleryItem | null>(null);

  useEffect(() => {
    api.getGallery().then(setGalleryItems).catch(() => {});
  }, []);

  // episodeId(한글) → eventId(영문) 역매핑
  const episodeToEvent: Record<string, EventMeta> = {};
  events.forEach((ev) => {
    const kr = {
      "taejo-foundation-1392": "태조", "park-yeon-aak-1430": "박연",
      "jangnyeongsil-jagyeokru-1434": "장영실", "sejong-hunmin-1446": "세종대왕",
      "shin-saimdang-art-1551": "신사임당", "yi-myeongnyang-1597": "이순신",
      "heojun-donguibogam-1613": "허준", "gwanghaegun-junglib-1619": "광해군",
      "kim-hongdo-genre-1780": "김홍도", "jeong-yakyong-geojunggi-1792": "정약용",
    }[ev.id];
    if (kr) episodeToEvent[kr] = ev;
  });

  return (
    <>
      <section className="home-section gallery-section" id="gallery-section">
        <div className="section-header">
          <span className="section-header-eyebrow">갤러리 구경</span>
          <h2 className="section-header-title">지금까지 펼쳐진 이야기책</h2>
          <p className="section-header-sub">
            표지를 누르면 4컷 그림책을 바로 펼칠 수 있어요.
          </p>
        </div>

        {/* API에서 받은 실제 스토리라인 갤러리 — 에피소드별 1개씩 */}
        {galleryItems.length > 0 ? (
          <div className="gallery-grid">
            {(() => {
              const seen = new Set<string>();
              return galleryItems.filter(item => {
                if (seen.has(item.episodeId)) return false;
                seen.add(item.episodeId);
                return true;
              }).slice(0, 12);
            })().map((item, i) => (
              <button
                key={`${item.episodeId}-${item.storylineId}`}
                className="gallery-book clickable"
                style={{ animationDelay: `${i * 0.06}s` }}
                onClick={() => setModal(item)}
                aria-label={`${item.title} — ${item.pathText} 이야기 보기`}
              >
                <div className="gallery-book-cover" aria-hidden="true">
                  {item.panels[0]?.imageUrl ? (
                    <img
                      src={item.panels[0].imageUrl}
                      alt="표지"
                      className="gallery-cover-img"
                    />
                  ) : (
                    <>
                      <span className="gallery-book-eyebrow">{item.episodeId}</span>
                      <h3 className="gallery-book-title">{item.title.split("—")[0]?.trim()}</h3>
                      <p className="gallery-book-sub">{item.pathText}</p>
                      <span className="gallery-book-orn">✦  ◆  ✦</span>
                    </>
                  )}
                  <span className="gallery-book-spine" />
                </div>
                <div className="gallery-book-caption">4컷 보기 →</div>
              </button>
            ))}
          </div>
        ) : (
          // 백엔드 미응답 시 기존 정적 갤러리 fallback
          <div className="gallery-grid">
            {GALLERY_BOOKS.map((book, i) => {
              const targetEv = book.targetEventId ? events.find((e) => e.id === book.targetEventId) : null;
              const clickable = targetEv && targetEv.status === "ready";
              const onClick = clickable && targetEv ? () => onOpenEvent(targetEv) : undefined;
              const Tag = clickable ? "button" : "div";
              return (
                <Tag
                  key={book.id}
                  className={"gallery-book" + (clickable ? " clickable" : "")}
                  {...(clickable
                    ? { type: "button" as const, onClick, "aria-label": `${book.title.replace(/\n/g, " ")} 이야기 열기` }
                    : { "aria-label": `${book.title.replace(/\n/g, " ")} — 준비 중인 책` })}
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="gallery-book-cover" aria-hidden="true">
                    <span className="gallery-book-eyebrow">{book.eyebrow}</span>
                    <h3 className="gallery-book-title">
                      {book.title.split("\n").map((line, li) => (
                        <Fragment key={li}>{li > 0 && <br />}{line}</Fragment>
                      ))}
                    </h3>
                    <p className="gallery-book-sub">{book.sub}</p>
                    <span className="gallery-book-orn">✦  ◆  ✦</span>
                    <span className="gallery-book-spine" />
                  </div>
                  <div className="gallery-book-caption">
                    {clickable ? "표지를 눌러 책 열기 →" : "곧 만나요"}
                  </div>
                </Tag>
              );
            })}
          </div>
        )}
      </section>

      {/* 4컷 모달 */}
      {modal && (
        <div
          className="gallery-modal-overlay"
          onClick={() => setModal(null)}
          role="dialog"
          aria-modal="true"
          aria-label="4컷 이야기 보기"
        >
          <div className="gallery-modal" onClick={(e) => e.stopPropagation()}>
            <button className="gallery-modal-close" onClick={() => setModal(null)}>✕</button>
            <div className="gallery-modal-header">
              <span className="badge imagine">{modal.episodeId}</span>
              <p className="gallery-modal-path">{modal.pathText}</p>
            </div>
            <div className="comic-grid">
              {modal.panels.map((p, i) => (
                <div key={i} className="cut">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.description} className="loaded" />
                  ) : (
                    <div className="ph">{p.description}</div>
                  )}
                  <div className="cap">
                    <div className="num">{i + 1}</div>
                    <span>{p.description}</span>
                  </div>
                </div>
              ))}
            </div>
            {episodeToEvent[modal.episodeId] && (
              <button
                className="btn btn-teal"
                style={{ marginTop: "1rem" }}
                onClick={() => { setModal(null); onOpenEvent(episodeToEvent[modal.episodeId]); }}
              >
                이 이야기 직접 만들어보기 →
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
