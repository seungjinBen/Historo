import type { Metadata } from "next";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import "./globals.css";

const BASE_URL = "https://www.historo.kr";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "역사로 — 나만의 역사 그림책",
    template: "%s | 역사로",
  },
  description: "조선왕조실록을 바탕으로 초등학생이 직접 만드는 역사 4컷 이야기. 내가 선택하는 이야기의 흐름으로 나만의 그림책을 완성해요.",
  keywords: ["역사로", "조선왕조", "초등학생", "역사 교육", "4컷만화", "이순신", "세종대왕", "한국사"],
  authors: [{ name: "역사로 팀" }],
  creator: "역사로",

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },

  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: BASE_URL,
    siteName: "역사로",
    title: "역사로 — 나만의 역사 그림책",
    description: "조선왕조실록을 바탕으로 초등학생이 직접 만드는 역사 4컷 이야기",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "역사로 — 나만의 역사 그림책",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "역사로 — 나만의 역사 그림책",
    description: "조선왕조실록을 바탕으로 초등학생이 직접 만드는 역사 4컷 이야기",
    images: ["/og-image.png"],
  },

  manifest: "/manifest.json",

  other: {
    "naver-site-verification": "",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        {children}
        <ScrollToTop />
      </body>
    </html>
  );
}
