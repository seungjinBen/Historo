// 페이지 맨 밑 — 데이터 출처 표기.
const SOURCES = [
  { label: "조선왕조실록", url: "https://sillok.history.go.kr" },
  { label: "국가유산청", url: "https://www.khs.go.kr" },
  { label: "한국민족문화대백과사전", url: "https://encykorea.aks.ac.kr" },
  { label: "국립중앙박물관", url: "https://www.museum.go.kr" },
  { label: "한국학중앙연구원", url: "https://www.aks.ac.kr" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer" aria-label="데이터 출처">
      <div className="site-footer-eyebrow">데이터 출처</div>
      <ul className="site-footer-sources">
        {SOURCES.map((s, i) => (
          <li key={s.label} className="site-footer-source">
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              {s.label}
            </a>
            {i < SOURCES.length - 1 && <span className="site-footer-sep" aria-hidden="true">·</span>}
          </li>
        ))}
      </ul>
      <p className="site-footer-note">
        본 사이트는 위 기관이 공개한 공공 데이터를 기반으로, 어린이 눈높이에 맞춰 재구성한 학습용 콘텐츠를 제공합니다.
        그림과 &lsquo;만약에&rsquo; 이야기는 학습을 위한 &lsquo;역사적 상상력 창작물&rsquo;입니다.
      </p>
    </footer>
  );
}
