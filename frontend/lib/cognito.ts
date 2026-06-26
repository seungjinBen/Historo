import {
  CognitoUserPool,
  CognitoUser,
  CognitoUserSession,
  CognitoIdToken,
  CognitoAccessToken,
  CognitoRefreshToken,
  AuthenticationDetails,
  CognitoUserAttribute,
  type IAuthenticationCallback,
} from "amazon-cognito-identity-js";

const REGION    = "ap-northeast-2";
const POOL_ID   = process.env.NEXT_PUBLIC_COGNITO_POOL_ID   ?? "ap-northeast-2_5IeZz4RJA";
const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? "1on185telkssmkrg3b2ngoocc2";
const DOMAIN    = process.env.NEXT_PUBLIC_COGNITO_DOMAIN    ?? "historo-auth.auth.ap-northeast-2.amazoncognito.com";

const pool = new CognitoUserPool({ UserPoolId: POOL_ID, ClientId: CLIENT_ID });

// ─── 현재 세션 토큰 가져오기 ─────────────────────────────────────────────────────

export function getIdToken(): Promise<string | null> {
  return new Promise((resolve) => {
    const user = pool.getCurrentUser();
    if (!user) return resolve(null);
    user.getSession((err: Error | null, session: { isValid: () => boolean; getIdToken: () => { getJwtToken: () => string } } | null) => {
      if (err || !session?.isValid()) return resolve(null);
      resolve(session.getIdToken().getJwtToken());
    });
  });
}

export function signOut() {
  pool.getCurrentUser()?.signOut();
}

// ─── 이메일/비밀번호 회원가입 ───────────────────────────────────────────────────

export function signUp(email: string, password: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const attrs = [new CognitoUserAttribute({ Name: "email", Value: email })];
    pool.signUp(email, password, attrs, [], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

// ─── 이메일 인증 코드 확인 ───────────────────────────────────────────────────────

export function confirmSignUp(email: string, code: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: pool });
    user.confirmRegistration(code, true, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

// ─── 로그인 ─────────────────────────────────────────────────────────────────────

export function signIn(email: string, password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const user    = new CognitoUser({ Username: email, Pool: pool });
    const details = new AuthenticationDetails({ Username: email, Password: password });
    const callbacks: IAuthenticationCallback = {
      onSuccess: (session) => resolve(session.getIdToken().getJwtToken()),
      onFailure: reject,
      newPasswordRequired: () => reject(new Error("비밀번호 변경이 필요합니다")),
    };
    user.authenticateUser(details, callbacks);
  });
}

// ─── Google OAuth (Hosted UI 리다이렉트) ─────────────────────────────────────────

export function signInWithGoogle(redirectUri: string) {
  const params = new URLSearchParams({
    client_id:     CLIENT_ID,
    response_type: "code",
    scope:         "email openid profile",
    redirect_uri:  redirectUri,
    identity_provider: "Google",
  });
  window.location.href = `https://${DOMAIN}/oauth2/authorize?${params}`;
}

// ─── Hosted UI 콜백 처리 (code → tokens) ─────────────────────────────────────────

export async function handleOAuthCallback(code: string, redirectUri: string): Promise<string> {
  const res = await fetch(`https://${DOMAIN}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type:   "authorization_code",
      client_id:    CLIENT_ID,
      code,
      redirect_uri: redirectUri,
    }),
  });
  if (!res.ok) throw new Error("토큰 교환 실패");
  const data = await res.json();
  if (!data.id_token) throw new Error("토큰 교환 실패");

  // 받은 토큰을 Cognito 로컬 세션으로 저장 → getCurrentUser()/getIdToken()이 인식
  const idToken      = new CognitoIdToken({ IdToken: data.id_token });
  const accessToken  = new CognitoAccessToken({ AccessToken: data.access_token });
  const refreshToken = new CognitoRefreshToken({ RefreshToken: data.refresh_token ?? "" });
  const session = new CognitoUserSession({ IdToken: idToken, AccessToken: accessToken, RefreshToken: refreshToken });

  const payload  = idToken.decodePayload();
  const username = (payload["cognito:username"] as string) || (payload.sub as string);
  const user = new CognitoUser({ Username: username, Pool: pool });
  user.setSignInUserSession(session);

  return data.id_token as string;
}

// ─── 현재 로그인 사용자 이메일 ────────────────────────────────────────────────────

export async function getCurrentEmail(): Promise<string | null> {
  const token = await getIdToken();
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload + "==".slice((payload.length % 4) || 4)));
    return decoded.email || decoded["cognito:username"] || null;
  } catch {
    return null;
  }
}

export async function isSignedIn(): Promise<boolean> {
  return (await getIdToken()) !== null;
}

export { REGION, POOL_ID, CLIENT_ID, DOMAIN };
