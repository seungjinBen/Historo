"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { api, type ApiBookshelfItem } from "@/lib/api";

type Props = { onBack: () => void };

export function BookshelfScreen({ onBack }: Props) {
  const [items, setItems]     = useState<ApiBookshelfItem[] | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    api.getBookshelf()
      .then(setItems)
      .catch(() => setError("책장을 불러오지 못했어요. 로그인 상태를 확인해 주세요."));
  }, []);

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await api.deleteBookshelf(id);
      setItems((prev) => prev?.filter((it) => it.id !== id) ?? null);
    } catch {
      alert("삭제에 실패했어요.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="panel-card screen" key="bookshelf">
      <button className="back" onClick={onBack}>← 홈으로</button>
      <h2 className="bookshelf-title">📚 내 책장</h2>
      <p className="bookshelf-sub">내가 만든 4컷 이야기들이에요.</p>

      {error && <p className="kidstory-status">{error}</p>}
      {!error && !items && <p className="kidstory-status">불러오는 중…</p>}
      {items && items.length === 0 && (
        <p className="kidstory-status">아직 저장된 이야기가 없어요. 이야기를 만들고 책장에 넣어봐요!</p>
      )}

      {items && items.length > 0 && (
        <div className="bookshelf-grid">
          {items.map((item) => (
            <div key={item.id} className="bookshelf-card">
              {item.thumbnailUrl && (
                <div className="bookshelf-thumb">
                  <img src={item.thumbnailUrl} alt="표지" />
                </div>
              )}
              <div className="bookshelf-info">
                <span className="bookshelf-event">{item.title}</span>
                <span className="bookshelf-path">{item.pathText}</span>
                <span className="bookshelf-date">
                  {new Date(item.createdAt).toLocaleDateString("ko-KR", {
                    year: "numeric", month: "short", day: "numeric",
                  })}
                </span>
              </div>
              <button
                className="bookshelf-delete"
                onClick={() => handleDelete(item.id)}
                disabled={deleting === item.id}
                aria-label="삭제"
              >
                {deleting === item.id ? "…" : "✕"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
