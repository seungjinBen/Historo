export function MeokdolMascot() {
  return (
    <svg
      className="meokdol-svg"
      viewBox="0 0 240 260"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="귀여운 먹돌이 마스코트"
    >
      <defs>
        <radialGradient id="meokHalo" cx="50%" cy="44%" r="55%">
          <stop offset="0%" stopColor="#FBE5A4" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FBE5A4" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="meokBody" cx="34%" cy="28%" r="85%">
          <stop offset="0%" stopColor="#E36057" />
          <stop offset="55%" stopColor="#C8453B" />
          <stop offset="100%" stopColor="#8A2A22" />
        </radialGradient>
        <radialGradient id="meokShine" cx="35%" cy="22%" r="32%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 후광 */}
      <circle cx="120" cy="140" r="115" fill="url(#meokHalo)" />

      {/* 붓 — 머리 뒤 */}
      <g transform="translate(160 25) rotate(18)">
        <rect x="-4" y="0" width="8" height="62" rx="2" fill="#8B5A2B" />
        <path d="M -7 0 L 7 0 L 5 -14 L -5 -14 Z" fill="#1A1612" />
        <path d="M -5 -14 Q 0 -26 5 -14 Z" fill="#1A1612" />
        <ellipse cx="0" cy="62" rx="6" ry="4" fill="#C9882A" />
      </g>

      {/* 본체 — 동글한 먹덩이 */}
      <ellipse cx="120" cy="148" rx="90" ry="92" fill="url(#meokBody)" />
      <ellipse cx="120" cy="148" rx="90" ry="92" fill="url(#meokShine)" />

      {/* 아래 그림자 */}
      <ellipse cx="120" cy="232" rx="64" ry="10" fill="#1A1612" opacity="0.18" />

      {/* 눈 — 큰 호 모양 (행복) */}
      <path
        d="M 86 128 Q 98 116 110 128"
        stroke="#1A1612"
        strokeWidth="4.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 130 128 Q 142 116 154 128"
        stroke="#1A1612"
        strokeWidth="4.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* 볼터치 */}
      <ellipse cx="76" cy="160" rx="10" ry="6" fill="#FBE5A4" opacity="0.55" />
      <ellipse cx="164" cy="160" rx="10" ry="6" fill="#FBE5A4" opacity="0.55" />

      {/* 입 — 큰 미소 */}
      <path
        d="M 100 168 Q 120 188 140 168"
        stroke="#1A1612"
        strokeWidth="3.8"
        fill="#5C2018"
        strokeLinecap="round"
      />
      {/* 혀 살짝 */}
      <path d="M 115 178 Q 120 183 125 178 Q 122 183 120 184 Q 118 183 115 178 Z" fill="#F5A6A0" opacity="0.85" />

      {/* "먹" 글자 — 가슴 부분 */}
      <text
        x="120"
        y="220"
        textAnchor="middle"
        fill="#FBE5A4"
        fontSize="24"
        fontFamily="'Black Han Sans', sans-serif"
        opacity="0.9"
      >
        먹
      </text>

      {/* 반짝이 */}
      <g transform="translate(202 78)">
        <path
          d="M 0 -11 L 2.5 -2.5 L 11 0 L 2.5 2.5 L 0 11 L -2.5 2.5 L -11 0 L -2.5 -2.5 Z"
          fill="#FBE5A4"
        />
      </g>
      <circle cx="44" cy="100" r="3" fill="#FBE5A4" opacity="0.7" />
    </svg>
  );
}
