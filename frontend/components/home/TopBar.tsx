"use client";

import Link from "next/link";

type Props = {
  onHome: () => void;
  onAbout: () => void;
  onBookshelf: () => void;
  token: string | null;
  username: string | null;
  onLogout: () => void;
};

export function TopBar({ onHome, onAbout, onBookshelf, token, username, onLogout }: Props) {
  return (
    <div className="top">
      <button className="brand brand-link" onClick={onHome} aria-label="역사로 — 홈으로">
        역사로<span className="hanja">歷史路</span>
      </button>
      <div className="top-actions">
        {token ? (
          <>
            <button className="top-btn" onClick={onBookshelf} aria-label="내 책장">
              📚 {username ? `${username}의 책장` : "내 책장"}
            </button>
            <button className="top-btn" onClick={onAbout}>역사로</button>
            <button className="top-btn top-btn-login" onClick={onLogout}>로그아웃</button>
          </>
        ) : (
          <>
            <button className="top-btn" onClick={onBookshelf} aria-label="책장">책장</button>
            <button className="top-btn" onClick={onAbout}>역사로</button>
            <Link href="/login" className="top-btn top-btn-login">로그인</Link>
          </>
        )}
      </div>
    </div>
  );
}
