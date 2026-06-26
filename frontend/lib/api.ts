import { getIdToken } from "./cognito";

// 책장만 Lambda 호출 - 나머지는 정적 JSON
const AUTH_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://ti5h7b2bs2.execute-api.ap-northeast-2.amazonaws.com/prod";

const CF_CDN = "https://d3382886jvvuzm.cloudfront.net";

export function toCdnUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  const nfc = imagePath.normalize("NFC");
  const encoded = nfc.split("/").map((seg) => seg ? encodeURIComponent(seg) : "").join("/");
  return `${CF_CDN}/${encoded}`;
}

// ─── Lambda 호출 (책장 - Cognito 토큰 자동 첨부) ─────────────────────────────────

async function authFetch<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = await getIdToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${AUTH_BASE}${path}`, { ...opts, headers });
  if (!res.ok) {
    console.error(`authFetch ${path} → ${res.status}`, token ? "token present" : "NO TOKEN");
    if (res.status === 401) throw new Error("401: 로그아웃 후 다시 로그인해 주세요.");
    throw new Error(`${res.status}`);
  }
  return res.json();
}

// ─── 타입 ─────────────────────────────────────────────────────────────────────────

export type ApiComicCut = { number: number; camera?: string; description: string; imageUrl: string };
export type ApiComicQuestions = { Q1: string; Q2: string; Q3: string };

export type ApiComicStoryline = {
  id: string; q1: string; q2: string; q3: string;
  pathText: string; cuts: ApiComicCut[];
};
export type ApiComic = { id: string; title: string; questions?: ApiComicQuestions; storylines: ApiComicStoryline[] };

export type ApiGalleryPanel = { number: number; description: string; imageUrl: string };
export type ApiGalleryItem  = {
  episodeId: string; title: string; storylineId: string; pathText: string;
  panels: ApiGalleryPanel[];
};

export type ApiBookshelfItem = {
  id: string; eventId: string; title: string; picks: number[];
  pathText: string; thumbnailUrl: string | null; createdAt: string;
};
export type ApiBookshelfSaveReq = {
  eventId: string; title: string; picks: number[]; pathText: string; thumbnailUrl?: string;
};

// ─── 정적 데이터 로더 ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseCut(c: any): ApiComicCut {
  return {
    number:      c.number,
    camera:      c.camera,
    description: c.description,
    imageUrl:    toCdnUrl(c.image_path ?? c.imageUrl).replace(/\.png($|\?)/, '.webp$1'),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseStoryline(sl: any): ApiComicStoryline {
  return {
    id:       sl.id,
    q1:       sl.q1,
    q2:       sl.q2,
    q3:       sl.q3,
    pathText: sl.path_text ?? sl.pathText ?? "",
    cuts:     (sl.cuts ?? []).map(parseCut),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseComic(data: any): ApiComic {
  return {
    id:         data.id,
    title:      data.title,
    questions:  data.questions,
    storylines: (data.storylines ?? []).map(parseStoryline),
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  // 'force-cache': 브라우저 HTTP 캐시 우선 사용 → 재방문 시 네트워크 요청 0
  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) throw new Error(`fetch ${url}: ${res.status}`);
  return res.json();
}

// 모듈 레벨 캐시 — 같은 에피소드를 여러 컴포넌트에서 중복 요청하지 않도록
const _comicCache = new Map<string, Promise<ApiComic>>();

// eventId(영문) → 에피소드명(한글) 매핑
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

/**
 * JSON fetch 없이 A-1-α 첫 번째 컷 CDN URL을 즉시 계산.
 * 모든 에피소드가 {한글명}/A/1/α/컷{n}.png 패턴을 따름.
 * EventGrid / Timeline 썸네일의 "2-round-trip" 지연을 제거한다.
 */
export function getInstantCutUrl(eventId: string, cutNo = 1): string {
  const kr = EVENT_TO_EPISODE[eventId];
  if (!kr) return "";
  const path = `${kr}/A/1/α/컷${cutNo}.png`; // α, 컷
  return toCdnUrl(path).replace(/\.png($|\?)/, ".webp$1");
}

export const api = {
  // ── 정적 데이터 ──────────────────────────────────────────────────────────────
  getComic: (episodeId: string): Promise<ApiComic> => {
    if (_comicCache.has(episodeId)) return _comicCache.get(episodeId)!;
    const korName = EVENT_TO_EPISODE[episodeId] ?? episodeId;
    const p = fetchJson<unknown>(`/data/comics/${encodeURIComponent(korName)}.json`)
      .then(parseComic);
    _comicCache.set(episodeId, p);
    return p;
  },

  getGallery: async (): Promise<ApiGalleryItem[]> => {
    const names = Object.values(EVENT_TO_EPISODE);
    const episodeIds = Object.keys(EVENT_TO_EPISODE);
    const items: ApiGalleryItem[] = [];
    await Promise.all(
      names.map(async (korName, i) => {
        try {
          const data = await fetchJson<unknown>(`/data/comics/${encodeURIComponent(korName)}.json`);
          const comic = parseComic(data);
          for (const sl of comic.storylines) {
            if (sl.cuts.length === 0) continue;
            items.push({
              episodeId:   episodeIds[i],
              title:       comic.title,
              storylineId: sl.id,
              pathText:    sl.pathText,
              panels:      sl.cuts.map((c) => ({ number: c.number, description: c.description, imageUrl: c.imageUrl })),
            });
          }
        } catch { /* 파일 없으면 skip */ }
      })
    );
    return items;
  },

  // ── 책장 (Lambda) ─────────────────────────────────────────────────────────────
  getBookshelf:    ()                         => authFetch<ApiBookshelfItem[]>("/api/bookshelf"),
  saveBookshelf:   (req: ApiBookshelfSaveReq) =>
    authFetch<ApiBookshelfItem>("/api/bookshelf", { method: "POST", body: JSON.stringify(req) }),
  deleteBookshelf: (id: string)               =>
    authFetch<unknown>(`/api/bookshelf/${id}`, { method: "DELETE" }),
};
