// app/api/words/daily/route.ts
import { NextResponse } from "next/server";
import { allWords } from "@/lib/words-server";

export const runtime = "nodejs";

// Cheon Il Guk 뜻길 말씀만 필터링
const ddeutgilWords = allWords.filter(
  (w) => w.type === "CheonIlGuk_ddeutgil"
);

// 매일 같은 말씀을 주기 위한 간단한 해싱 함수
function getDailyWordIndex(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0; // 32bit 정수로 변환
  }
  return Math.abs(hash) % ddeutgilWords.length;
}

export async function GET() {
  try {
    if (ddeutgilWords.length === 0) {
      return NextResponse.json(
        { error: "No ddeutgil words found" },
        { status: 404 }
      );
    }

    // 오늘 날짜 기준으로 매일 같은 말씀 반환
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const index = getDailyWordIndex(today);
    const word = ddeutgilWords[index];

    // SideNav가 기대하는 형태로 반환 (중요!)
    return NextResponse.json({
      word: {
        text: word.text,
        source: word.source,
        speaker: word.speaker || null,
      },
    });
  } catch (error) {
    console.error("Daily Word API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}