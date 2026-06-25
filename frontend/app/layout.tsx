import type { Metadata } from "next";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import "./globals.css";

export const metadata: Metadata = {
  title: "역사로 — 내가 만드는 조선 이야기",
  description: "조선왕조실록을 바탕으로 초등학생이 직접 만드는 역사 4컷 이야기",
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
