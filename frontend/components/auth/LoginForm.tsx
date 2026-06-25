"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SejongMascot } from "@/components/mascots/SejongMascot";
import { api, setToken, setUsername } from "@/lib/api";

type Mode = "login" | "signup";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode]         = useState<Mode>("login");
  const [username, setUsernameInput] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true); setError(null);
    try {
      const res = mode === "login"
        ? await api.login(username, password)
        : await api.signup(username, password);
      setToken(res.token);
      setUsername(username);
      router.push("/");
    } catch (err: unknown) {
      const msg = (err instanceof Error && err.message === "400")
        ? (mode === "login" ? "아이디 또는 비밀번호가 틀렸어요." : "이미 사용 중인 아이디예요.")
        : "잠시 후 다시 시도해 주세요.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
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
          <span className="login-eyebrow">
            {mode === "login" ? "다시 만나서 반가워요" : "처음 오셨군요!"}
          </span>
          <h1 className="login-title">
            {mode === "login" ? "역사로 로그인" : "역사로 회원가입"}
          </h1>
          <p className="login-sub">
            아이디로 들어와 내가 만든 4컷 이야기를 책장에 보관해요.
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-field">
              <span className="login-label">아이디</span>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="login-input"
                placeholder="아이디를 입력하세요"
                required
              />
            </label>

            <label className="login-field">
              <span className="login-label">비밀번호</span>
              <input
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
                placeholder="비밀번호"
                required
              />
            </label>

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="login-submit" disabled={submitting}>
              {submitting ? "잠깐만요…" : mode === "login" ? "로그인" : "회원가입"}
            </button>
          </form>

          <div className="login-aux">
            {mode === "login" ? (
              <button className="login-aux-link" onClick={() => { setMode("signup"); setError(null); }}>
                처음이에요 — 회원가입
              </button>
            ) : (
              <button className="login-aux-link" onClick={() => { setMode("login"); setError(null); }}>
                이미 계정이 있어요 — 로그인
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
