// features/search/server/search.service.ts
import "server-only"
import { SearchResult, MatchType } from "../types"
import { loadAllWords, getWordIndex } from "../indexing/word-repository"
import { normalizeText, extractChosung } from "../engine/normalization"
import { tokenize, preprocessWord, hasHangul } from "../engine/tokenizer"
import { getSynonyms } from "../engine/synonyms"
import { calculateSearchScore } from "../engine/ranking"
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

export function searchWords(
  query: string,
  mode: "text" | "source" = "text",
  type?: string
): { results: SearchResult[]; counts: Record<string, number> } {
  const rawQuery = query.trim()
  if (!rawQuery) return { results: [], counts: { all: 0 } }

  const isExactPhrase = rawQuery.startsWith('"') && rawQuery.endsWith('"')
  const cleanQuery = isExactPhrase ? rawQuery.slice(1, -1) : rawQuery
  const normalizedQuery = normalizeText(cleanQuery)
  const isChosungSearch = !isExactPhrase && /^[ㄱ-ㅎ\s]+$/.test(normalizedQuery)
  
  const queryTokens = isExactPhrase ? [normalizedQuery] : tokenize(normalizedQuery)
  const tokenMeta = queryTokens.map(token => ({
    original: token,
    processed: preprocessWord(token),
    synonyms: getSynonyms(token),
    chosung: extractChosung(token),
  }))

  const results: SearchResult[] = []
  const words = loadAllWords()
  const index = getWordIndex()

  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    const ix = index[i]
    let totalScore = 0
    let matchCount = 0
    let highlightTokens: string[] = []
    let bestMatchType: MatchType = "token"

    const targetText = mode === "text" ? ix.normalizedText : `${ix.normalizedSource} ${ix.normalizedSpeaker}`

    if (isChosungSearch) {
      const matchIdx = ix.textChosung.indexOf(normalizedQuery)
      if (matchIdx !== -1) {
        results.push({
          word,
          score: calculateSearchScore("chosung"),
          matchType: "chosung",
          explanation: `초성 검색: "${ix.normalizedText.substring(matchIdx, matchIdx + normalizedQuery.length)}"`,
          confidence: "low",
          highlightRanges: []
        })
        continue
      }
    }

    let chosungMatchText = ""
    for (const meta of tokenMeta) {
      let tokenScore = 0
      let matched = false

      const escapedToken = meta.original.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      const isKorean = hasHangul(meta.original)
      const exactRegex = new RegExp(isKorean ? escapedToken : `\\b${escapedToken}\\b`, "i")

      if (exactRegex.test(targetText)) {
        tokenScore = calculateSearchScore("exact", 1, targetText === meta.original)
        matched = true
        bestMatchType = isExactPhrase ? "phrase" : "exact"
        highlightTokens.push(meta.original)
      } else if (meta.processed !== meta.original && targetText.includes(meta.processed)) {
        tokenScore = calculateSearchScore("stem")
        matched = true
        bestMatchType = "stem"
        highlightTokens.push(meta.processed)
      } else {
        for (const syn of meta.synonyms) {
          const escapedSyn = syn.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
          const synRegex = new RegExp(hasHangul(syn.word) ? escapedSyn : `\\b${escapedSyn}\\b`, "i")
          if (synRegex.test(targetText)) {
            tokenScore = calculateSearchScore("synonym", syn.weight)
            matched = true
            bestMatchType = "synonym"
            highlightTokens.push(syn.word)
            break
          }
        }
      }

      if (!matched && meta.chosung.length >= 2) {
        const matchIdx = ix.textChosung.indexOf(meta.chosung)
        if (matchIdx !== -1) {
          tokenScore = calculateSearchScore("chosung")
          matched = true
          bestMatchType = "chosung"
          chosungMatchText = ix.normalizedText.substring(matchIdx, matchIdx + meta.chosung.length)
        }
      }

      if (matched) {
        totalScore += tokenScore
        matchCount++
      }
    }

    if (matchCount > 0 && (isExactPhrase ? matchCount === queryTokens.length : true)) {
      const finalScore = (totalScore / queryTokens.length) * (1 + Math.max(0, 1 - word.text.length / 5000) * 0.1)
      let explanation = ""
      let confidence: "high" | "medium" | "low" = "low"

      if (bestMatchType === "exact" || bestMatchType === "phrase") {
        explanation = "검색어와 정확히 일치합니다."
        confidence = "high"
      } else if (bestMatchType === "stem") {
        explanation = `"${highlightTokens[0]}" (기본형) 매칭`
        confidence = "medium"
      } else if (bestMatchType === "synonym") {
        explanation = `유사 의미 매칭`
        confidence = "medium"
      } else if (bestMatchType === "chosung") {
        explanation = chosungMatchText ? `초성 검색: "${chosungMatchText}"` : "초성 검색 결과입니다."
        confidence = "low"
      }

      results.push({
        word,
        score: finalScore,
        matchType: bestMatchType,
        explanation,
        confidence,
        highlightRanges: getHighlightRanges(word.text, highlightTokens.length > 0 ? highlightTokens : queryTokens)
      })
    }
  }

  let finalResults = deduplicateResults(results)
  const counts: Record<string, number> = { all: finalResults.length }
  
  // Calculate counts before filtering by type to show overall distribution
  for (const res of finalResults) {
    counts[res.word.type] = (counts[res.word.type] || 0) + 1
  }

  if (type) {
    const normalizedType = type.replace(/\s+/g, "")
    finalResults = finalResults.filter(
      (r) => r.word.type.replace(/\s+/g, "") === normalizedType
    )
  }

  finalResults.sort((a, b) => b.score - a.score)

  return { results: finalResults, counts }
}
