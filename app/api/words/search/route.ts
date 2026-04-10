import { NextRequest, NextResponse } from "next/server";
export const runtime = 'nodejs';
import { searchWordsServer } from "@/lib/words-server";
import { WordType } from "@/lib/words";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get("q") || "";
  const mode = (searchParams.get("mode") as "text" | "source") || "text";
  const type = searchParams.get("type") as WordType | undefined;
  
  // 페이지네이션 파라미터
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");

  try {
    const { results: allResults, counts } = searchWordsServer(query, mode, type);
    const total = allResults.length;
    
    // 페이징 처리
    const start = (page - 1) * limit;
    const paginatedResults = allResults.slice(start, start + limit);

    return NextResponse.json({
      data: paginatedResults,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        counts, // 범주별 집계 데이터 추가
      },
    });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
