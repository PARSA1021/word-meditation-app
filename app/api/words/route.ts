// app/api/words/route.ts
import { NextRequest, NextResponse } from "next/server";
import { searchWords } from "@/features/search/server/search.service";
import { WordType } from "@/shared/types/word";

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const type = searchParams.get("type") as WordType | null
  const query = searchParams.get("q") || ""
  const mode = (searchParams.get("mode") as "text" | "source") || "text"
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")

  // Use the advanced search engine
  const { results } = await searchWords(query, mode as "text" | "source", type || undefined);

  // Pagination
  const total = results.length
  const start = (page - 1) * limit
  const paginated = results.slice(start, start + limit)

  return NextResponse.json({
    total,
    page,
    limit,
    data: paginated.map(r => ({
      ...r.word,
      searchMeta: {
        score: r.score,
        matchType: r.matchType,
        explanation: r.explanation,
        highlightRanges: r.highlightRanges
      }
    })),
  })
}