"use client";

import Link from "next/link";
import { useState } from "react";
import { SejongMascot } from "@/components/mascots/SejongMascot";

export function LoginForm() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    // 실제 인증 연동은 추후 작업. 지금은 폼 UI만.
    console.log("[login] submit", { id, password });
    setTimeout(() => setSubmitting(false), 600);
  }

  return (
    <div className="login-shell">
      <Link href="/" className="brand brand-link login-brand" aria-label="역사로 — 홈으로">
        역사로<span className="hanja">歷史路</span>
      </Link>

      <div className="login-card">
        <div className="login-mascot" aria-hidden="true">
          <SejongMascot />
        </div>

        <div className="login-body">
          <span className="login-eyebrow">다시 만나서 반가워요</span>
          <h1 className="login-title">역사로 로그인</h1>
          <p className="login-sub">
            아이디로 들어와 내가 만든 4컷 이야기를 책장에 보관해요.
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-field">
              <span className="login-label">아이디 또는 이메일</span>
              <input
                type="text"
                name="id"
                autoComplete="username"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="login-input"
                placeholder="예: sejong@historo.kr"
                required
              />
            </label>

            <label className="login-field">
              <span className="login-label">비밀번호</span>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
                placeholder="비밀번호"
                required
              />
            </label>

            <button
              type="submit"
              className="login-submit"
              disabled={submitting}
            >
              {submitting ? "들어가는 중…" : "로그인"}
            </button>
          </form>

          <div className="login-aux">
            <a className="login-aux-link" href="#" onClick={(e) => e.preventDefault()}>
              비밀번호를 잊었어요
            </a>
            <span className="login-aux-sep" aria-hidden="true">·</span>
            <a className="login-aux-link" href="#" onClick={(e) => e.preventDefault()}>
              회원가입
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
