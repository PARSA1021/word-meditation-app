// app/api/words/daily/route.ts
import { NextResponse } from "next/server";
import { loadAllWords } from "@/features/search/indexing/word-repository";

export const runtime = "nodejs";
export const revalidate = 3600; // 1시간 캐싱

export async function GET() {
  try {
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      hash = (hash << 5) - hash + dateString.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);

    const words = await loadAllWords();
    if (!words || words.length === 0) {
      return NextResponse.json(
        { error: "No words found" },
        { status: 404 }
      );
    }

    let targetWords = words.filter(w => w.type === "CheonIlGuk_ddeutgil" || w.type === "cheonseong");
    if (targetWords.length === 0) targetWords = words;

    const index = absHash % targetWords.length;
    const word = targetWords[index];

    return NextResponse.json(word, {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error fetching daily word:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}