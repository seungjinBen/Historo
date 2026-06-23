"use client";

export function AboutScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="panel-card screen about-screen" key="about">
      <button className="back" onClick={onBack}>← 홈으로</button>
      <div className="about-head">
        <div className="about-logo">역사로<span className="hanja">歷史路</span></div>
        <p className="about-sub">
          역사를 외우지 마세요. 역사 속에 들어가 직접 이야기를 만들어봐요.
        </p>
      </div>
      <div className="about-section">
        <h2 className="about-h">이렇게 만들어요</h2>
        <ol className="about-list">
          <li>
            <b>사건 보기.</b> 700년 전 실록 기록을 AI가 아이 눈높이로 풀어줘요.
          </li>
          <li>
            <b>만약에 고르기.</b> 채팅으로 답하거나 준비된 &lsquo;만약에&rsquo;를 골라요.
          </li>
          <li>
            <b>4컷 이야기 완성.</b> 내가 만든 &lsquo;만약에&rsquo;가 4컷 그림 이야기로 펼쳐져요.
          </li>
        </ol>
      </div>
      <div className="about-section">
        <h2 className="about-h">이 사이트는</h2>
        <p className="about-p">
          조선왕조실록, 한국민족문화대백과사전, 국립중앙박물관 등 공개 자료를 바탕으로 만들었어요. 그림과 &lsquo;만약에&rsquo;는 학습을 위한 &lsquo;역사적 상상력 창작물&rsquo;이에요.
        </p>
      </div>
    </div>
  );
}
