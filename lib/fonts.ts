import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google"

/**
 * 🧩 UI 기본 폰트 (앱 전체)
 * - 버튼, 네비게이션, 일반 텍스트
 * - 가독성 중심
 */
export const uiFont = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
})

/**
 * 📖 말씀 전용 폰트
 * - 본문 (QuoteCard 등)
 * - 감성 + 읽기 경험 강화
 */
export const scriptureFont = Noto_Serif_KR({
  weight: ["400", "500"],
  display: "swap",
})