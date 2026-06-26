"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SejongMascot } from "@/components/mascots/SejongMascot";
import {
  signIn, signUp, confirmSignUp, signInWithGoogle, handleOAuthCallback,
} from "@/lib/cognito";

type Step = "login" | "signup" | "verify";

const CF_URL    = typeof window !== "undefined" ? window.location.origin : "https://d6a53spc1xryh.cloudfront.net";
const LOGIN_URL = `${CF_URL}/login/`;

export function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep]         = useState<Step>("login");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode]         = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [info, setInfo]         = useState<string | null>(null);

  // Google OAuth 콜백 처리
  useEffect(() => {
    // 에러 콜백 처리 (Cognito가 error_description을 붙여 돌려보내는 경우)
    const errDesc = searchParams?.get("error_description");
    const errCode = searchParams?.get("error");
    if (errCode || errDesc) {
      // 디버깅용: 실제 에러 코드 표시
      setError(`[${errCode ?? "?"}] ${errDesc ?? ""}`);
      return;
    }

    const oauthCode = searchParams?.get("code");
    if (!oauthCode) return;
    setSubmitting(true);
    setInfo("Google 로그인 처리 중…");
    handleOAuthCallback(oauthCode, LOGIN_URL)
      .then(() => router.replace("/"))
      .catch((e: unknown) => {
        console.error("OAuth callback error:", e);
        setError("Google 로그인에 실패했어요. 다시 시도해 주세요.");
        setSubmitting(false);
        setInfo(null);
      });
  }, [searchParams, router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true); setError(null);
    try {
      await signIn(email, password);
      router.replace("/");
    } catch (err: unknown) {
      const code = (err as { name?: string; code?: string })?.name ?? (err as { name?: string; code?: string })?.code ?? "";
      const msg  = err instanceof Error ? err.message : "";
      const any  = code + msg;
      if (any.includes("NotAuthorizedException") || any.includes("UserNotFoundException")) {
        setError("이메일 또는 비밀번호가 올바르지 않아요.");
      } else if (any.includes("UserNotConfirmedException")) {
        setError(null);
        setStep("verify");
        setInfo("이메일 인증이 필요해요. 받은 코드를 입력해 주세요.");
      } else {
        setError("잠시 후 다시 시도해 주세요.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true); setError(null);
    try {
      await signUp(email, password);
      setStep("verify");
      setInfo(`${email} 로 인증 코드를 보냈어요.`);
    } catch (err: unknown) {
      const code = (err as { name?: string; code?: string })?.name ?? (err as { name?: string; code?: string })?.code ?? "";
      const msg  = err instanceof Error ? err.message : "";
      const any  = code + msg;
      if (any.includes("UsernameExistsException")) {
        setError("이미 사용 중인 이메일이에요. 로그인을 시도해 보세요.");
      } else if (any.includes("InvalidPasswordException")) {
        setError("비밀번호는 8자 이상이어야 해요.");
      } else if (any.includes("InvalidParameterException") && any.includes("email")) {
        setError("올바른 이메일 형식을 입력해 주세요.");
      } else if (any.includes("TooManyRequestsException") || any.includes("LimitExceeded")) {
        setError("요청이 너무 많아요. 잠시 후 다시 시도해 주세요.");
      } else {
        setError("잠시 후 다시 시도해 주세요.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true); setError(null);
    try {
      await confirmSignUp(email, code);
      setInfo("인증 완료! 이제 로그인하세요.");
      setStep("login");
      setCode("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("CodeMismatchException")) {
        setError("인증 코드가 틀렸어요.");
      } else if (msg.includes("ExpiredCodeException")) {
        setError("코드가 만료됐어요. 다시 회원가입해 주세요.");
      } else {
        setError("잠시 후 다시 시도해 주세요.");
      }
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
        <Link href="/" className="login-back" aria-label="홈으로 돌아가기">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          <span>홈으로</span>
        </Link>
        <div className="login-mascot" aria-hidden="true">
          <SejongMascot />
        </div>

        <div className="login-body">
          {step === "login" && <>
            <span className="login-eyebrow">다시 만나서 반가워요</span>
            <h1 className="login-title">역사로 로그인</h1>
            <p className="login-sub">이야기를 책장에 보관하려면 로그인하세요.</p>

            <form className="login-form" onSubmit={handleLogin}>
              <label className="login-field">
                <span className="login-label">이메일</span>
                <input type="email" autoComplete="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="login-input" placeholder="example@email.com" required />
              </label>
              <label className="login-field">
                <span className="login-label">비밀번호</span>
                <input type="password" autoComplete="current-password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input" placeholder="비밀번호 (8자 이상)" required />
              </label>
              {info  && <p className="login-info">{info}</p>}
              {error && <p className="login-error">{error}</p>}
              <button type="submit" className="login-submit" disabled={submitting}>
                {submitting ? "로그인 중…" : "로그인"}
              </button>
            </form>

            <div className="login-divider"><span>또는</span></div>

            <button className="login-google" onClick={() => signInWithGoogle(LOGIN_URL)} type="button">
              <GoogleIcon /> Google로 계속하기
            </button>

            <div className="login-aux">
              <span>처음이신가요?</span>
              <button className="login-aux-link" onClick={() => { setStep("signup"); setError(null); setInfo(null); }}>
                회원가입
              </button>
            </div>
          </>}

          {step === "signup" && <>
            <span className="login-eyebrow">처음 오셨군요!</span>
            <h1 className="login-title">역사로 회원가입</h1>
            <p className="login-sub">가입 후 이메일 인증을 완료해 주세요.</p>

            <form className="login-form" onSubmit={handleSignup}>
              <label className="login-field">
                <span className="login-label">이메일</span>
                <input type="email" autoComplete="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="login-input" placeholder="example@email.com" required />
              </label>
              <label className="login-field">
                <span className="login-label">비밀번호</span>
                <input type="password" autoComplete="new-password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input" placeholder="8자 이상" required minLength={8} />
              </label>
              {error && <p className="login-error">{error}</p>}
              <button type="submit" className="login-submit" disabled={submitting}>
                {submitting ? "처리 중…" : "회원가입"}
              </button>
            </form>

            <div className="login-divider"><span>또는</span></div>

            <button className="login-google" onClick={() => signInWithGoogle(LOGIN_URL)} type="button">
              <GoogleIcon /> Google로 계속하기
            </button>

            <div className="login-aux">
              <span>이미 계정이 있으신가요?</span>
              <button className="login-aux-link" onClick={() => { setStep("login"); setError(null); setInfo(null); }}>
                로그인
              </button>
            </div>
          </>}

          {step === "verify" && <>
            <span className="login-eyebrow">이메일 인증</span>
            <h1 className="login-title">인증 코드 입력</h1>
            {info && <p className="login-sub">{info}</p>}

            <form className="login-form" onSubmit={handleVerify}>
              <label className="login-field">
                <span className="login-label">인증 코드</span>
                <input type="text" inputMode="numeric" value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="login-input" placeholder="6자리 코드" maxLength={6} required />
              </label>
              {error && <p className="login-error">{error}</p>}
              <button type="submit" className="login-submit" disabled={submitting}>
                {submitting ? "확인 중…" : "인증 완료"}
              </button>
            </form>

            <div className="login-aux">
              <span>코드를 못 받으셨나요?</span>
              <button className="login-aux-link" onClick={() => { setStep("signup"); setError(null); setInfo(null); }}>
                다시 시도
              </button>
            </div>
          </>}
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}
