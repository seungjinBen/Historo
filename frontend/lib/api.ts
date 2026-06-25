// 백엔드 직접 호출 (CORS는 백엔드 WebConfig에서 허용)
const BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "https://historo-backend.onrender.com";

// 백엔드 S3 URL(NFD 인코딩) → glory CloudFront URL(NFC 인코딩)로 교체
const OLD_S3 = "https://historo-images.s3.ap-northeast-2.amazonaws.com";
const CF_CDN = "https://d3382886jvvuzm.cloudfront.net";
export function toCdnUrl(url: string): string {
  if (!url.startsWith(OLD_S3)) return url;
  // 백엔드 URL은 NFD(macOS 분해형), 우리 S3는 NFC(합성형)로 저장 → 정규화
  const path = url.slice(OLD_S3.length);
  try {
    const nfcPath = decodeURIComponent(path).normalize("NFC");
    const reencoded = nfcPath.split("/").map((seg) => seg ? encodeURIComponent(seg) : "").join("/");
    return CF_CDN + reencoded;
  } catch {
    return CF_CDN + path;
  }
}
const TOKEN_KEY = "historo_token";
const USER_KEY  = "historo_username";

export const getToken    = () => typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
export const setToken    = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken  = () => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); };
export const getUsername = () => typeof window !== "undefined" ? localStorage.getItem(USER_KEY) : null;
export const setUsername = (u: string) => localStorage.setItem(USER_KEY, u);

async function apiFetch<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

// -- API Response Types --
export type ApiComicCut = { number: number; description: string; imageUrl: string };
export type ApiComicStoryline = {
  id: string; q1: string; q2: string; q3: string;
  pathText: string; cuts: ApiComicCut[];
};
export type ApiComic = { id: string; title: string; storylines: ApiComicStoryline[] };

export type ApiGalleryPanel = { number: number; description: string; imageUrl: string };
export type ApiGalleryItem  = {
  episodeId: string; title: string; storylineId: string; pathText: string;
  panels: ApiGalleryPanel[];
};

export type ApiBookshelfItem = {
  id: number; eventId: string; title: string; picks: number[];
  pathText: string; thumbnailUrl: string | null; createdAt: string;
};
export type ApiBookshelfSaveReq = {
  eventId: string; title: string; picks: number[]; pathText: string; thumbnailUrl?: string;
};

export const api = {
  login:  (username: string, password: string) =>
    apiFetch<{ token: string }>("/api/auth/login",  { method: "POST", body: JSON.stringify({ username, password }) }),
  signup: (username: string, password: string) =>
    apiFetch<{ token: string }>("/api/auth/signup", { method: "POST", body: JSON.stringify({ username, password }) }),

  getComic: (episodeId: string) =>
    apiFetch<ApiComic>(`/api/comics/${encodeURIComponent(episodeId)}`).then((comic) => ({
      ...comic,
      storylines: comic.storylines.map((sl) => ({
        ...sl,
        cuts: sl.cuts.map((c) => ({ ...c, imageUrl: toCdnUrl(c.imageUrl) })),
      })),
    })),
  getGallery: () =>
    apiFetch<ApiGalleryItem[]>("/api/gallery").then((items) =>
      items.map((item) => ({
        ...item,
        panels: item.panels.map((p) => ({ ...p, imageUrl: toCdnUrl(p.imageUrl) })),
      }))
    ),

  getBookshelf:    ()                         => apiFetch<ApiBookshelfItem[]>("/api/bookshelf"),
  saveBookshelf:   (req: ApiBookshelfSaveReq) =>
    apiFetch<ApiBookshelfItem>("/api/bookshelf", { method: "POST", body: JSON.stringify(req) }),
  deleteBookshelf: (id: number)               => apiFetch<unknown>(`/api/bookshelf/${id}`, { method: "DELETE" }),
};

// eventId(영문) → 백엔드 에피소드명(한글) 매핑
export const EVENT_TO_EPISODE: Record<string, string> = {
  "taejo-foundation-1392":          "태조",
  "park-yeon-aak-1430":             "박연",
  "jangnyeongsil-jagyeokru-1434":   "장영실",
  "sejong-hunmin-1446":             "세종대왕",
  "shin-saimdang-art-1551":         "신사임당",
  "yi-myeongnyang-1597":            "이순신",
  "heojun-donguibogam-1613":        "허준",
  "gwanghaegun-junglib-1619":       "광해군",
  "kim-hongdo-genre-1780":          "김홍도",
  "jeong-yakyong-geojunggi-1792":   "정약용",
};
