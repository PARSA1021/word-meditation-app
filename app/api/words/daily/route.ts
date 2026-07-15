// app/api/words/daily/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Cheon Il Guk 뜻길 말씀만 가져오기
    const ddeutgilWords = await prisma.words.findMany({
      where: {
        type: "CheonIlGuk_ddeutgil"
      }
    });

    if (ddeutgilWords.length === 0) {
      return NextResponse.json(
        { error: "No words found for the specified category" },
        { status: 404 }
      );
    }

    // 현재 날짜를 기반으로 인덱스 계산 (매일 바뀜)
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    
    // 단순 해시 함수 (지정된 날짜에는 항상 같은 말씀 노출)
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      hash = (hash << 5) - hash + dateString.charCodeAt(i);
      hash |= 0;
    }
    
    const index = Math.abs(hash) % ddeutgilWords.length;
    return NextResponse.json(ddeutgilWords[index]);
  } catch (error) {
    console.error("Error fetching daily word:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}