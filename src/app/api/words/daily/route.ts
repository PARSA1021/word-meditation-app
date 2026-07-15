// app/api/words/daily/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const revalidate = 3600; // 1시간 캐싱

export async function GET() {
  try {
    // 1. 날짜 기반 해시 계산
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      hash = (hash << 5) - hash + dateString.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);

    // 2. 카운트 기반 폴백 쿼리 (메모리 절약)
    let whereClause: any = { type: "CheonIlGuk_ddeutgil" };
    let count = await prisma.words.count({ where: whereClause });

    if (count === 0) {
      whereClause = { type: "general" };
      count = await prisma.words.count({ where: whereClause });
    }

    if (count === 0) {
      whereClause = {};
      count = await prisma.words.count();
    }

    if (count === 0) {
      return NextResponse.json(
        { error: "No words found in the database" },
        { status: 404 }
      );
    }

    // 3. 정확히 1개의 말씀만 가져오기
    const index = absHash % count;
    const word = await prisma.words.findFirst({
      where: whereClause,
      skip: index,
    });

    return NextResponse.json(word);
  } catch (error) {
    console.error("Error fetching daily word:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}