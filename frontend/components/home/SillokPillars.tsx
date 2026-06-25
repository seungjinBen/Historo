export function SillokPillars() {
  return (
    <section className="home-section home-section-pillars">
      <div className="sillok-pillars" aria-label="실록이 만든 이야기">
        <div className="sillok-pillars-head">
          <span className="sillok-pillars-eyebrow">실록이 만든 이야기</span>
          <h2 className="sillok-pillars-title">
            조선왕조실록 <em>6,400만 자</em>가<br/>AI의 고증 엔진이 됩니다
          </h2>
          <p className="sillok-pillars-sub">데이터가 곧 창작의 재료예요.</p>
        </div>
        <div className="sillok-pillars-grid">
          <div className="sillok-pillar">
            <div className="sillok-pillar-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </div>
            <div className="sillok-pillar-title">역사 왜곡 걱정 없이</div>
            <p className="sillok-pillar-desc">
              사실 구간과 &lsquo;만약에&rsquo; 상상 구간을 분리하고, 모든 결과물에 창작물 표시와 출처를 남겨요.
            </p>
          </div>
          <div className="sillok-pillar">
            <div className="sillok-pillar-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <div className="sillok-pillar-title">누구나 2~3분이면</div>
            <p className="sillok-pillar-desc">
              읽기가 어려워도, 글을 못 써도 괜찮아요. 선택만으로 나만의 역사 창작물이 완성돼요.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
