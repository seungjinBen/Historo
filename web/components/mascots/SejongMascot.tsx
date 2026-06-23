export function SejongMascot() {
  return (
    <svg
      className="sejong-svg"
      viewBox="0 0 240 260"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="귀여운 세종대왕 마스코트"
    >
      <defs>
        <radialGradient id="haloGrad" cx="50%" cy="42%" r="55%">
          <stop offset="0%" stopColor="#FBE5A4" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FBE5A4" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="robeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D65249" />
          <stop offset="100%" stopColor="#A0352C" />
        </linearGradient>
        <linearGradient id="faceGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE7C8" />
          <stop offset="100%" stopColor="#F5C99F" />
        </linearGradient>
      </defs>

      {/* 후광 */}
      <circle cx="120" cy="125" r="115" fill="url(#haloGrad)" />

      {/* 곤룡포 — 본체 */}
      <path
        d="M 55 235 L 55 200 Q 55 168 80 158 L 160 158 Q 185 168 185 200 L 185 235 Z"
        fill="url(#robeGrad)"
      />
      {/* 곤룡포 — 깃 V */}
      <path d="M 95 158 L 120 195 L 145 158 Z" fill="#FFF8EC" />
      <path
        d="M 92 159 L 120 200 L 148 159"
        stroke="#C9882A"
        strokeWidth="2.5"
        fill="none"
        strokeLinejoin="round"
      />
      {/* 용 문양 (단순화) */}
      <circle cx="120" cy="215" r="13" fill="#FBE5A4" stroke="#C9882A" strokeWidth="2" />
      <path d="M 113 215 Q 120 208 127 215 Q 120 222 113 215 Z" fill="#C8453B" />
      <circle cx="120" cy="215" r="2" fill="#1A1612" />
      {/* 소매 */}
      <ellipse cx="58" cy="200" rx="14" ry="24" fill="url(#robeGrad)" />
      <ellipse cx="182" cy="200" rx="14" ry="24" fill="url(#robeGrad)" />
      <ellipse cx="58" cy="222" rx="11" ry="6" fill="#FFF8EC" />
      <ellipse cx="182" cy="222" rx="11" ry="6" fill="#FFF8EC" />

      {/* 귀 */}
      <ellipse cx="74" cy="118" rx="6" ry="9" fill="url(#faceGrad)" />
      <ellipse cx="166" cy="118" rx="6" ry="9" fill="url(#faceGrad)" />

      {/* 얼굴 */}
      <ellipse cx="120" cy="122" rx="47" ry="52" fill="url(#faceGrad)" />

      {/* 익선관 — 양옆 날개(사모) */}
      <ellipse cx="63" cy="83" rx="23" ry="9" fill="#1A1612" transform="rotate(-10 63 83)" />
      <ellipse cx="177" cy="83" rx="23" ry="9" fill="#1A1612" transform="rotate(10 177 83)" />
      <circle cx="52" cy="80" r="2.6" fill="#C9882A" />
      <circle cx="188" cy="80" r="2.6" fill="#C9882A" />

      {/* 익선관 — 본체 */}
      <path
        d="M 70 88 Q 66 50 120 42 Q 174 50 170 88 L 170 96 Q 120 108 70 96 Z"
        fill="#1A1612"
      />
      {/* 익선관 — 상단 구슬 */}
      <ellipse cx="120" cy="42" rx="7" ry="3" fill="#1A1612" />
      <circle cx="120" cy="36" r="4.5" fill="#C9882A" />
      <circle cx="119" cy="35" r="1.5" fill="#FBE5A4" />

      {/* 눈썹 */}
      <path
        d="M 90 108 Q 99 104 108 108"
        stroke="#2B221A"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 132 108 Q 141 104 150 108"
        stroke="#2B221A"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* 눈 — 행복한 곡선 */}
      <path
        d="M 92 121 Q 99 115 106 121"
        stroke="#1A1612"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 134 121 Q 141 115 148 121"
        stroke="#1A1612"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* 볼터치 */}
      <ellipse cx="84" cy="140" rx="7" ry="4.5" fill="#F5A6A0" opacity="0.6" />
      <ellipse cx="156" cy="140" rx="7" ry="4.5" fill="#F5A6A0" opacity="0.6" />

      {/* 입 */}
      <path
        d="M 110 146 Q 120 154 130 146"
        stroke="#1A1612"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* 수염 */}
      <path
        d="M 102 160 Q 120 174 138 160 Q 130 168 120 169 Q 110 168 102 160 Z"
        fill="#8B7E70"
        opacity="0.5"
      />
    </svg>
  );
}
