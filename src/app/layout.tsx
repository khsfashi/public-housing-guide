import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rental Home Finder - LH · SH · 민간임대 세부 조건 비교기",
  description: "LH, SH, 민간임대 공고문의 복잡한 주택형 정보를 분류하여 세부 임대조건(보증금, 월세, 평수) 및 상호전환 모의 계산을 한눈에 보고 비교할 수 있는 서비스입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  );
}
