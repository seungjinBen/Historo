"use client";

import { Fragment } from "react";
import { GALLERY_BOOKS } from "@/lib/home-content";
import type { EventMeta } from "@/lib/types";

type Props = {
  events: EventMeta[];
  onOpenEvent: (ev: EventMeta) => void;
};

export function Gallery({ events, onOpenEvent }: Props) {
  return (
    <section className="home-section gallery-section" id="gallery-section">
      <div className="section-header">
        <span className="section-header-eyebrow">갤러리 구경</span>
        <h2 className="section-header-title">지금까지 펼쳐진 이야기책</h2>
        <p className="section-header-sub">
          친구들이 만든 4컷 그림책의 표지를 둘러봐요.
          <br />표지를 누르면 해당 사건의 이야기를 곧바로 펼칠 수 있어요.
        </p>
      </div>
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
                    <Fragment key={li}>
                      {li > 0 && <br />}
                      {line}
                    </Fragment>
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
    </section>
  );
}
