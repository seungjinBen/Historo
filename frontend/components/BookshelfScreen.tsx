"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, toCdnUrl, type ApiBookshelfItem } from "@/lib/api";
import { getIdToken } from "@/lib/cognito";

type Props = { onBack: () => void };

const cover = (p: string) => toCdnUrl(p).replace(/\.png($|\?)/, ".webp$1");

// 비로그인 화면에 보여줄 "이렇게 쌓여요" 예시 표지
const SAMPLE = [
  { title: "이순신 — 명량 해전", path: "물살 유인 → 일자진 → 추격", img: cover("이순신/A/1/α/컷1.png") },
  { title: "세종대왕 — 훈민정음 창제", path: "비밀 연구 → 반포", img: cover("세종대왕/A/1/α/컷1.png") },
  { title: "정약용 — 거중기 설계", path: "서양 기술 → 화성 축조", img: cover("정약용/A/1/α/컷1.png") },
];

const BENEFITS = [
  { t: "저장돼요", d: "공들여 만든 이야기를 잃어버리지 않아요." },
  { t: "다시 펼쳐요", d: "언제든 책장에서 꺼내 보며 역사를 되새겨요." },
  { t: "한 권씩 모여요", d: "위인별로 나만의 그림책이 차곡차곡 쌓여요." },
];

export function BookshelfScreen({ onBack }: Props) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [items, setItems]   = useState<ApiBookshelfItem[] | null>(null);
  const [error, setError]   = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    getIdToken().then((token) => {
      setAuthed(!!token);
      if (token) {
        api.getBookshelf().then(setItems).catch(() => setError("책장을 불러오지 못했어요. 잠시 후 다시 시도해 주세요."));
      }
    });
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
    <div className="panel-card screen shelf" key="bookshelf">
      <button className="back" onClick={onBack}>← 홈으로</button>

      <header className="shelf-head">
        <h2 className="bookshelf-title">내 책장</h2>
        <p className="bookshelf-sub">
          완성한 4컷 그림책을 모아두는 공간이에요. 언제든 다시 펼쳐 보고, 복습하거나 친구에게 보여줄 수 있어요.
        </p>
      </header>

      {authed === null && <p className="kidstory-status">불러오는 중…</p>}

      {/* 비로그인 — 가치 안내 + 예시 목업 */}
      {authed === false && (
        <div className="shelf-locked">
          <div className="shelf-locked-msg">
            <h3 className="shelf-locked-title">로그인하면, 내가 만든 이야기가 여기 쌓여요</h3>
            <p className="shelf-locked-sub">
              지금은 비어 있지만, 로그인 후 이야기를 완성하면 그림책이 한 권씩 책장에 꽂혀요.
            </p>
          </div>

          <div className="shelf-benefits">
            {BENEFITS.map((b) => (
              <div className="shelf-benefit" key={b.t}>
                <span className="shelf-benefit-t">{b.t}</span>
                <span className="shelf-benefit-d">{b.d}</span>
              </div>
            ))}
          </div>

          <p className="shelf-mockup-label">이렇게 쌓여요 — 예시</p>
          <div className="bookshelf-grid shelf-preview">
            {SAMPLE.map((s) => (
              <div className="bookshelf-card" key={s.title}>
                <div className="bookshelf-thumb">
                  <img src={s.img} alt="" loading="lazy" />
                </div>
                <div className="bookshelf-info">
                  <span className="bookshelf-event">{s.title}</span>
                  <span className="bookshelf-path">{s.path}</span>
                  <span className="shelf-sample-tag">예시</span>
                </div>
              </div>
            ))}
          </div>

          <div className="shelf-cta-row">
            <Link href="/login" className="shelf-cta">로그인하고 내 책장 만들기 →</Link>
            <button className="shelf-cta-ghost" onClick={onBack}>먼저 이야기부터 둘러보기</button>
          </div>
        </div>
      )}

      {/* 로그인 — 에러 */}
      {authed && error && <p className="kidstory-status">{error}</p>}

      {/* 로그인 — 로딩 */}
      {authed && !error && !items && <p className="kidstory-status">불러오는 중…</p>}

      {/* 로그인 — 비어 있음 */}
      {authed && items && items.length === 0 && (
        <div className="shelf-empty">
          <p className="shelf-empty-title">아직 책장이 비어 있어요</p>
          <p className="shelf-empty-sub">첫 이야기를 만들어 책장에 꽂아볼까요?</p>
          <button className="shelf-cta" onClick={onBack}>이야기 만들러 가기 →</button>
        </div>
      )}

      {/* 로그인 — 내 이야기 목록 */}
      {authed && items && items.length > 0 && (
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
