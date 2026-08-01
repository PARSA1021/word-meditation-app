// features/search/server/search.service.ts
import "server-only"
import { SearchResult, MatchType } from "../types"
import { loadAllWords, getWordIndex } from "../indexing/word-repository"
import { normalizeText, extractChosung } from "../engine/normalization"
import { tokenize, preprocessWord, hasHangul, matchesAsWord, generateSubTokens } from "../engine/tokenizer"
import { getSynonyms } from "../engine/synonyms"
import { calculateSearchScore, SCORE_WEIGHTS } from "../engine/ranking"
import { getHighlightRanges } from "../engine/highlight"

function deduplicateResults(results: SearchResult[]): SearchResult[] {
  const seen = new Map<string, SearchResult>()
  for (const res of results) {
    const normalized = normalizeText(res.word.text)
    const existing = seen.get(normalized)
    if (!existing || res.score > existing.score) {
      seen.set(normalized, res)
    }
  }
  return Array.from(seen.values())
}

function matchExact(targetText: string, token: string): boolean {
  return matchesAsWord(targetText, token)
}

function matchStem(targetText: string, processed: string): boolean {
  return matchesAsWord(targetText, processed)
}

function matchPhrase(targetText: string, phrase: string): boolean {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const boundary = hasHangul(phrase)
    ? new RegExp(`(?<![가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9])${escaped}(?![가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9])`, "i")
    : new RegExp(`\\b${escaped}\\b`, "i")
  return boundary.test(targetText)
}

export async function searchWords(
  query: string,
  mode: "text" | "source" = "text",
  type?: string
): Promise<{ results: SearchResult[]; counts: Record<string, number> }> {
  const rawQuery = query.trim()
  if (!rawQuery) return { results: [], counts: { all: 0 } }

  const isExactPhrase = rawQuery.startsWith('"') && rawQuery.endsWith('"')
  const cleanQuery = isExactPhrase ? rawQuery.slice(1, -1) : rawQuery
  const normalizedQuery = normalizeText(cleanQuery)
  const isChosungSearch = !isExactPhrase && /^[ㄱ-ㅎ\s]+$/.test(normalizedQuery)

  const queryTokens = isExactPhrase ? [normalizedQuery] : tokenize(normalizedQuery)
  const subTokens = isExactPhrase ? [] : generateSubTokens(normalizedQuery)
  // Combine full phrase tokens + split tokens, filter unique
  const allSearchTerms = Array.from(new Set([
    normalizedQuery,
    ...queryTokens,
    ...subTokens
  ])).filter(Boolean)

  const results: SearchResult[] = []
  const words = await loadAllWords()
  const index = await getWordIndex()

  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    const ix = index[i]
    
    // Default search targeted strings
    const targetText = mode === "text" ? ix.normalizedText : `${ix.normalizedSpeaker} ${ix.normalizedSource}`
    const wText = normalizeText(word.text)
    const wSource = normalizeText(word.source)
    const wCategory = normalizeText(word.category)
    const wKeywords = (word as any).keywords ? ((word as any).keywords as string[]).map(normalizeText) : []
    const wTags = (word as any).tags ? ((word as any).tags as string[]).map(normalizeText) : []

    // 1. Chosung Search
    if (isChosungSearch) {
      const matchIdx = ix.textChosung.indexOf(normalizedQuery)
      if (matchIdx !== -1) {
        results.push({
          word,
          score: SCORE_WEIGHTS.PARTIAL,
          matchType: "chosung",
          explanation: `초성 검색: "${ix.normalizedText.substring(matchIdx, matchIdx + normalizedQuery.length)}"`,
          confidence: "low",
          highlightRanges: [],
        })
      }
      continue
    }

    // 2. Exact Phrase Match
    if (isExactPhrase) {
      if (matchPhrase(targetText, normalizedQuery)) {
        results.push({
          word,
          score: SCORE_WEIGHTS.EXACT,
          matchType: "phrase",
          explanation: "검색어 구문과 정확히 일치합니다.",
          confidence: "high",
          highlightRanges: getHighlightRanges(word.text, [normalizedQuery]),
        })
      }
      continue
    }

    // 3. Multi-field and Token Matching
    let totalScore = 0
    let bestExplanation = ""
    let bestMatchType: MatchType = "partial"
    let confidence: "high" | "medium" | "low" = "low"
    const highlightTokens = new Set<string>()

    for (const token of queryTokens) {
      let tokenScore = 0;
      let exp = "";
      let mt: MatchType = "partial";
      let matchedFull = false;
      
      // 검색어 원본 길이 (1글자 여부 확인)
      const isSingleChar = token.length === 1;

      // 1) 정확히 일치 (+100)
      if (wText === token) {
        tokenScore += SCORE_WEIGHTS.EXACT;
        exp = "검색어와 완전히 일치합니다.";
        mt = "exact";
        matchedFull = true;
      }
      
      // 2) 검색어가 포함된 결과 (다중 필드)
      // 문제 수정: 1글자 검색어일 경우 모든 책 이름('천성경'의 '성' 등)에 매칭되어 폭발하는 버그 방지
      // 1글자는 matchExact(단어 경계)일 때만 인정하거나, 2글자 이상만 includes 허용
      const validForTitle = !isSingleChar || matchExact(wSource, token);
      if (validForTitle && wSource.includes(token)) {
        tokenScore += SCORE_WEIGHTS.TITLE;
        if (!matchedFull) { exp = "제목에 검색어가 포함되어 있습니다."; mt = "exact"; matchedFull = true; }
      }
      
      if (wKeywords.some(k => k === token)) {
        tokenScore += SCORE_WEIGHTS.KEYWORD;
        if (!matchedFull) { exp = "키워드에 검색어가 포함되어 있습니다."; mt = "exact"; matchedFull = true; }
      }
      
      const validForCategory = !isSingleChar || matchExact(wCategory, token);
      if ((validForCategory && wCategory.includes(token)) || wTags.some(t => t === token)) {
        tokenScore += SCORE_WEIGHTS.TAG;
        if (!matchedFull) { exp = "태그/카테고리에 검색어가 포함되어 있습니다."; mt = "exact"; matchedFull = true; }
      }
      
      // 본문 포함
      if (wText.includes(token)) {
        tokenScore += SCORE_WEIGHTS.BODY;
        if (!matchedFull) { 
          exp = isSingleChar ? "본문에 검색어 단어가 포함되어 있습니다." : "본문에 검색어가 포함되어 있습니다."; 
          mt = "token"; 
          matchedFull = true; 
        }
      }

      if (matchedFull) {
        totalScore += tokenScore;
        highlightTokens.add(token);
        
        if (mt === "exact" && bestMatchType !== "exact") {
          bestMatchType = "exact"; bestExplanation = exp; confidence = "high";
        } else if (mt === "token" && bestMatchType !== "exact" && bestMatchType !== "token") {
          bestMatchType = "token"; bestExplanation = exp; confidence = "medium";
        } else if (!bestExplanation) {
          bestMatchType = mt; bestExplanation = exp; confidence = "low";
        }
      } else {
        // 3) 검색어를 분리한 단어가 포함된 결과 및 부분 일치 (최대 +20점)
        const subTokens = generateSubTokens(token);
        let subMatches = 0;
        for (const sub of subTokens) {
          if (sub === token) continue;
          
          let subMatched = false;
          // 서브토큰은 본문(Body)에서만 파악하여 책 제목 등의 과도한 가중치 인플레이션을 막습니다.
          if (wText.includes(sub)) {
            subMatched = true;
          }
          
          if (subMatched) {
            subMatches++;
            highlightTokens.add(sub);
          }
        }
        
        if (subMatches > 0) {
          // 분리된 토큰이 매칭된 경우, 요구사항에 맞춰 +20 점 부여 (더 이상 곱하지 않고 고정 가중치)
          totalScore += SCORE_WEIGHTS.PARTIAL; 
          if (!bestExplanation) {
            bestMatchType = "partial";
            bestExplanation = "연관 단어(부분 일치) 검색 결과입니다.";
            confidence = "low";
          }
        }
      }
    }

    if (totalScore > 0) {
      results.push({
        word,
        score: totalScore,
        matchType: bestMatchType,
        explanation: bestExplanation,
        confidence,
        highlightRanges: getHighlightRanges(word.text, Array.from(highlightTokens)),
      })
    }
  }

  // ── 4. Fallback / Post-processing ─────────────────────────────────────────
  let finalResults = deduplicateResults(results)

  const counts: Record<string, number> = { all: finalResults.length }
  for (const res of finalResults) {
    counts[res.word.type] = (counts[res.word.type] || 0) + 1
  }

  if (type) {
    const normalizedType = type.replace(/\s+/g, "")
    finalResults = finalResults.filter(
      r => r.word.type.replace(/\s+/g, "") === normalizedType
    )
  }

  finalResults.sort((a, b) => b.score - a.score)

  return { results: finalResults, counts }
}