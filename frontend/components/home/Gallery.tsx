"use client";

/* eslint-disable @next/next/no-img-element */

import { Fragment, useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted]           = useState(false);

  useEffect(() => {
    api.getGallery().then((items) => {
      setGalleryItems(items);
      // 카드 썸네일 + 첫 번째 컷 프리로드
      items.forEach((item) => {
        item.panels.forEach((p) => {
          if (p.imageUrl) {
            const img = new window.Image();
            img.src = p.imageUrl;
          }
        });
      });
    }).catch(() => {});
    setMounted(true);
  }, []);

  // Esc 키로 닫기
  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setModal(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal]);

  // eventId → 한글 인물명
  const ID_TO_KR: Record<string, string> = {
    "taejo-foundation-1392": "태조", "park-yeon-aak-1430": "박연",
    "jangnyeongsil-jagyeokru-1434": "장영실", "sejong-hunmin-1446": "세종대왕",
    "shin-saimdang-art-1551": "신사임당", "yi-myeongnyang-1597": "이순신",
    "heojun-donguibogam-1613": "허준", "gwanghaegun-junglib-1619": "광해군",
    "kim-hongdo-genre-1780": "김홍도", "jeong-yakyong-geojunggi-1792": "정약용",
  };

  // episodeId(한글) → eventId(영문) 역매핑
  const episodeToEvent: Record<string, EventMeta> = {};
  events.forEach((ev) => {
    const kr = ID_TO_KR[ev.id];
    if (kr) episodeToEvent[kr] = ev;
  });

  const [cutIdx, setCutIdx] = useState(0);

  // 모달 열릴 때 첫 컷으로 초기화 + 전체 패널 이미지 프리로드
  useEffect(() => {
    setCutIdx(0);
    if (!modal) return;
    modal.panels.forEach((p) => {
      if (p.imageUrl) {
        const img = new window.Image();
        img.src = p.imageUrl;
      }
    });
  }, [modal]);

  const modalEl = modal && mounted ? createPortal(
    <div
      className="gallery-modal-overlay"
      onClick={() => setModal(null)}
      role="dialog"
      aria-modal="true"
      aria-label="4컷 이야기 보기"
    >
      <div className="gallery-modal" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="gallery-modal-header">
          <span className="badge imagine">{ID_TO_KR[modal.episodeId] ?? modal.episodeId}</span>
          <p className="gallery-modal-path">{modal.pathText}</p>
          <button className="gallery-modal-close" onClick={() => setModal(null)} aria-label="닫기">✕</button>
        </div>

        {/* 슬라이드 이미지 — 전체 패널을 DOM에 유지, CSS로 show/hide → 재로딩 없음 */}
        <div className="gallery-modal-slide">
          {modal.panels.map((panel, i) => (
            panel.imageUrl ? (
              <img
                key={panel.imageUrl}
                src={panel.imageUrl}
                alt={panel.description}
                className="gallery-modal-img"
                style={{ display: i === cutIdx ? "block" : "none" }}
              />
            ) : null
          ))}
        </div>

        {/* 설명 */}
        <p className="gallery-modal-desc">{modal.panels[cutIdx]?.description}</p>

        {/* 컷 탐색 */}
        <div className="gallery-modal-nav">
          <button
            className="gallery-modal-arrow"
            onClick={() => setCutIdx((i) => Math.max(0, i - 1))}
            disabled={cutIdx === 0}
            aria-label="이전 컷"
          >←</button>
          <div className="gallery-modal-dots">
            {modal.panels.map((_, i) => (
              <button
                key={i}
                className={"gallery-modal-dot" + (i === cutIdx ? " active" : "")}
                onClick={() => setCutIdx(i)}
                aria-label={`${i + 1}컷`}
              />
            ))}
          </div>
          <button
            className="gallery-modal-arrow"
            onClick={() => setCutIdx((i) => Math.min(modal.panels.length - 1, i + 1))}
            disabled={cutIdx === modal.panels.length - 1}
            aria-label="다음 컷"
          >→</button>
        </div>

        {/* 이야기 만들기 버튼 */}
        {episodeToEvent[modal.episodeId] && (
          <button
            className="btn btn-teal gallery-modal-cta"
            onClick={() => { setModal(null); onOpenEvent(episodeToEvent[modal.episodeId]); }}
          >
            이 이야기 직접 만들어보기 →
          </button>
        )}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <section className="home-section gallery-section" id="gallery-section">
        <div className="section-header" data-rv="up">
          <span className="section-header-eyebrow">갤러리 구경</span>
          <h2 className="section-header-title">지금까지 펼쳐진 이야기책</h2>
          <p className="section-header-sub">
            표지를 누르면 4컷 그림책을 바로 펼칠 수 있어요.
          </p>
        </div>

        {galleryItems.length > 0 ? (
          <div className="gallery-card-grid">
            {(() => {
              const seen = new Set<string>();
              return galleryItems.filter(item => {
                if (seen.has(item.episodeId)) return false;
                seen.add(item.episodeId);
                return true;
              }).slice(0, 12);
            })().map((item, i) => {
              const krName = ID_TO_KR[item.episodeId] ?? item.episodeId;
              return (
                <button
                  key={`${item.episodeId}-${item.storylineId}`}
                  className="gc-card"
                  style={{ animationDelay: `${i * 0.05}s` }}
                  onClick={() => setModal(item)}
                  aria-label={`${krName} — ${item.title} 이야기 보기`}
                >
                  {/* 이미지 영역 */}
                  <div className="gc-img-wrap">
                    {item.panels[0]?.imageUrl ? (
                      <img src={item.panels[0].imageUrl} alt={item.title} className="gc-img" />
                    ) : (
                      <div className="gc-img-ph">{krName}</div>
                    )}
                    {/* 호버 시 오버레이 */}
                    <div className="gc-hover-overlay">
                      <span className="gc-hover-label">4컷 보기 →</span>
                    </div>
                  </div>
                  {/* 텍스트 정보 */}
                  <div className="gc-info">
                    <span className="gc-name">{krName}</span>
                    <p className="gc-title">{item.title}</p>
                    <p className="gc-path">{item.pathText}</p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="gallery-grid">  {/* 기존 book 스타일 fallback */}
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

      {modalEl}
    </>
  );
}
