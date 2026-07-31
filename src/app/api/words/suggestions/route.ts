import { NextRequest, NextResponse } from "next/server";
export const runtime = 'nodejs';
import { loadAllWords, getWordIndex } from "@/features/search/indexing/word-repository";
import { normalizeText } from "@/features/search/engine/normalization";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const rawQuery = (searchParams.get("q") || "").trim();

  if (!rawQuery || rawQuery.length < 1) {
    return NextResponse.json({ suggestions: [] });
  }

  const normalizedQuery = normalizeText(rawQuery);
  const isChosung = /^[ㄱ-ㅎ\s]+$/.test(normalizedQuery);

  try {
    const words = await loadAllWords();
    const index = await getWordIndex();

    const suggestions: Array<{ text: string; type: "keyword" | "speaker" | "category" }> = [];
    const seen = new Set<string>();

    for (let i = 0; i < words.length; i++) {
      if (suggestions.length >= 8) break;

      const word = words[i];
      const ix = index[i];

      // 1. 카테고리 매칭
      if (word.type && normalizeText(word.type).includes(normalizedQuery)) {
        if (!seen.has(word.type)) {
          seen.add(word.type);
          suggestions.push({ text: word.type, type: "category" });
        }
      }

      // 2. 화자/출처 매칭
      if (word.speaker && normalizeText(word.speaker).includes(normalizedQuery)) {
        if (!seen.has(word.speaker)) {
          seen.add(word.speaker);
          suggestions.push({ text: word.speaker, type: "speaker" });
        }
      }

      // 3. 본문/초성 키워드 구문 매칭
      let matchIdx = -1;
      if (isChosung) {
        matchIdx = ix.textChosung.indexOf(normalizedQuery);
      } else {
        matchIdx = ix.normalizedText.indexOf(normalizedQuery);
      }

      if (matchIdx !== -1) {
        const start = Math.max(0, matchIdx - 2);
        const end = Math.min(word.text.length, matchIdx + 22);
        let snippet = word.text.substring(start, end).replace(/\s+/g, " ").trim();
        if (start > 0) snippet = "..." + snippet;
        if (end < word.text.length) snippet = snippet + "...";

        if (!seen.has(snippet)) {
          seen.add(snippet);
          suggestions.push({ text: snippet, type: "keyword" });
        }
      }
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Suggestions API Error:", error);
    return NextResponse.json({ suggestions: [] });
  }
}
