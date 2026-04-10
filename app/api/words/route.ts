// app/api/words/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAllWordsServer } from "@/lib/words-server";
import { Word, WordType } from "@/lib/words";

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const type = searchParams.get("type") as WordType | null
  const query = searchParams.get("q") || ""
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")

  let filtered: Word[] = getAllWordsServer()

  if (type) filtered = filtered.filter((w: Word) => w.type === type)

  if (query) {
    const lowerQuery = query.toLowerCase()
    filtered = filtered.filter(
      (w: Word) =>
        w.text.toLowerCase().includes(lowerQuery) ||
        w.source.toLowerCase().includes(lowerQuery)
    )
  }

  const start = (page - 1) * limit
  const paginated = filtered.slice(start, start + limit)

  return NextResponse.json({
    total: filtered.length,
    page,
    limit,
    data: paginated,
  })
}