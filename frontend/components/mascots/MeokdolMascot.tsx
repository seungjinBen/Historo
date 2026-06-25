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
        <radialGradient id="meokHalo" cx="50%" cy="48%" r="58%">
          <stop offset="0%" stopColor="#FFE6A8" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#FFE6A8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="meokBody" cx="34%" cy="26%" r="88%">
          <stop offset="0%" stopColor="#ED6F62" />
          <stop offset="55%" stopColor="#C8453B" />
          <stop offset="100%" stopColor="#7E2218" />
        </radialGradient>
        <radialGradient id="meokShine" cx="34%" cy="22%" r="30%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="meokLimb" cx="40%" cy="34%" r="80%">
          <stop offset="0%" stopColor="#D24E44" />
          <stop offset="100%" stopColor="#6B1C13" />
        </radialGradient>
      </defs>

      {/* 후광 */}
      <circle cx="120" cy="150" r="118" fill="url(#meokHalo)" />

      {/* 별 장식 */}
      <g>
        <path
          d="M 36 96 L 39 104 L 47 106 L 39 108 L 36 116 L 33 108 L 25 106 L 33 104 Z"
          fill="#FBC15A"
          opacity="0.9"
        />
        <circle cx="208" cy="120" r="3" fill="#FBC15A" opacity="0.85" />
        <circle cx="200" cy="178" r="2.4" fill="#FBC15A" opacity="0.7" />
        <circle cx="46" cy="186" r="2" fill="#FBC15A" opacity="0.7" />
      </g>

      {/* 머리 위 — 작은 붓 상투 */}
      <g transform="translate(120 66)">
        {/* 띠 */}
        <ellipse cx="0" cy="0" rx="20" ry="6" fill="#5B3A1F" />
        <ellipse cx="0" cy="-1.5" rx="16" ry="3" fill="#7A4F2A" />
        {/* 붓 자루 */}
        <rect x="-4" y="-30" width="8" height="30" rx="3" fill="#8B5A2B" />
        <rect x="-4" y="-30" width="3" height="30" rx="1.5" fill="#A6703A" opacity="0.7" />
        {/* 붓털 — 위로 솟은 모양 */}
        <path d="M -8 -30 Q 0 -56 8 -30 Z" fill="#1A1612" />
        <path d="M -3 -34 Q 0 -50 3 -34 Z" fill="#3A2A22" opacity="0.85" />
        {/* 끝 황금 점 */}
        <circle cx="0" cy="-54" r="2.6" fill="#FBC15A" />
      </g>

      {/* 본체 — 살짝 통통한 둥근 사각 */}
      <path
        d="M 120 70
           C 178 70 206 110 206 152
           C 206 200 172 234 120 234
           C 68 234 34 200 34 152
           C 34 110 62 70 120 70 Z"
        fill="url(#meokBody)"
      />
      <path
        d="M 120 70
           C 178 70 206 110 206 152
           C 206 200 172 234 120 234
           C 68 234 34 200 34 152
           C 34 110 62 70 120 70 Z"
        fill="url(#meokShine)"
      />

      {/* 그림자 */}
      <ellipse cx="120" cy="242" rx="72" ry="9" fill="#1A1612" opacity="0.2" />

      {/* 작은 팔 */}
      <g>
        <ellipse
          cx="32"
          cy="172"
          rx="11"
          ry="9"
          fill="url(#meokLimb)"
          transform="rotate(-22 32 172)"
        />
        <ellipse
          cx="208"
          cy="172"
          rx="11"
          ry="9"
          fill="url(#meokLimb)"
          transform="rotate(22 208 172)"
        />
      </g>

      {/* 발 */}
      <g>
        <ellipse cx="96" cy="230" rx="15" ry="6.5" fill="url(#meokLimb)" />
        <ellipse cx="144" cy="230" rx="15" ry="6.5" fill="url(#meokLimb)" />
      </g>

      {/* 눈 — 큰 동글 반짝 */}
      <g>
        {/* 왼눈 */}
        <ellipse cx="92" cy="152" rx="12" ry="14" fill="#0F0907" />
        <circle cx="96" cy="147" r="4" fill="#fff" />
        <circle cx="89" cy="156" r="1.8" fill="#fff" opacity="0.9" />
        {/* 오른눈 */}
        <ellipse cx="148" cy="152" rx="12" ry="14" fill="#0F0907" />
        <circle cx="152" cy="147" r="4" fill="#fff" />
        <circle cx="145" cy="156" r="1.8" fill="#fff" opacity="0.9" />
      </g>

      {/* 볼터치 — 또렷한 분홍 */}
      <ellipse cx="72" cy="182" rx="13" ry="7.5" fill="#F0817B" opacity="0.85" />
      <ellipse cx="168" cy="182" rx="13" ry="7.5" fill="#F0817B" opacity="0.85" />

      {/* 입 — 작고 귀여운 미소 */}
      <path
        d="M 110 188 Q 120 200 130 188"
        stroke="#1A1612"
        strokeWidth="3.6"
        fill="#5C2018"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 혀 살짝 */}
      <path
        d="M 116 195 Q 120 199 124 195 Q 122 199 120 200 Q 118 199 116 195 Z"
        fill="#F5A6A0"
        opacity="0.85"
      />

      {/* 큰 반짝이 */}
      <g transform="translate(200 80)">
        <path
          d="M 0 -11 L 2.5 -2.5 L 11 0 L 2.5 2.5 L 0 11 L -2.5 2.5 L -11 0 L -2.5 -2.5 Z"
          fill="#FBE5A4"
        />
      </g>
    </svg>
  );
}
