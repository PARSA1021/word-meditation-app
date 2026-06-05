// features/search/server/search.service.ts
import "server-only"
import { SearchResult, MatchType } from "../types"
import { loadAllWords, getWordIndex } from "../indexing/word-repository"
import { normalizeText, extractChosung } from "../engine/normalization"
import { tokenize, preprocessWord, hasHangul, matchesAsWord } from "../engine/tokenizer"
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

/**
 * 단어 경계 기반 정확 매칭 (한국어/영어 모두 경계 적용)
 *
 * 핵심 수정: 한국어도 \b 처럼 동작하는 lookbehind/lookahead 패턴 사용
 * → "기적" 검색 시 "이기적"이 매칭되지 않음
 */
function matchExact(targetText: string, token: string): boolean {
  return matchesAsWord(targetText, token)
}

/**
 * Stem 매칭도 단어 경계 적용
 * 기존 targetText.includes(processed) 는 substring 매칭이라 오매칭 발생
 */
function matchStem(targetText: string, processed: string): boolean {
  return matchesAsWord(targetText, processed)
}

/**
 * 구문(phrase) 전체 매칭: 공백 포함 연속 토큰들이 텍스트에 등장하는지 확인
 */
function matchPhrase(targetText: string, phrase: string): boolean {
  // 구문 내 각 단어도 경계 체크가 필요하나 구문 자체가 연속 단위이므로
  // 앞뒤 경계만 확인
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const boundary = hasHangul(phrase)
    ? new RegExp(`(?<![가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9])${escaped}(?![가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9])`, "i")
    : new RegExp(`\\b${escaped}\\b`, "i")
  return boundary.test(targetText)
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

    const targetText =
      mode === "text"
        ? ix.normalizedText
        : `${ix.normalizedSpeaker} ${ix.normalizedSource}`

    // ── 초성 전체 검색 ────────────────────────────────────────────────────────
    if (isChosungSearch) {
      const matchIdx = ix.textChosung.indexOf(normalizedQuery)
      if (matchIdx !== -1) {
        results.push({
          word,
          score: calculateSearchScore("chosung"),
          matchType: "chosung",
          explanation: `초성 검색: "${ix.normalizedText.substring(matchIdx, matchIdx + normalizedQuery.length)}"`,
          confidence: "low",
          highlightRanges: [],
        })
      }
      continue
    }

    // ── 구문(exact phrase) 검색 ───────────────────────────────────────────────
    if (isExactPhrase) {
      if (matchPhrase(targetText, normalizedQuery)) {
        const score = calculateSearchScore("phrase", 1, true)
        results.push({
          word,
          score,
          matchType: "phrase",
          explanation: "검색어와 정확히 일치합니다.",
          confidence: "high",
          highlightRanges: getHighlightRanges(word.text, [normalizedQuery]),
        })
      }
      continue
    }

    // ── 일반 토큰 검색 ────────────────────────────────────────────────────────
    let chosungMatchText = ""

    for (const meta of tokenMeta) {
      let tokenScore = 0
      let matched = false

      // 1) 정확 매칭 (단어 경계 적용 — "기적" ≠ "이기적")
      if (matchExact(targetText, meta.original)) {
        const isFullMatch = targetText === meta.original
        tokenScore = calculateSearchScore("exact", 1, isFullMatch)
        matched = true
        bestMatchType = "exact"
        highlightTokens.push(meta.original)
      }
      // 2) 형태소 스템 매칭 (단어 경계 적용)
      else if (
        meta.processed !== meta.original &&
        matchStem(targetText, meta.processed)
      ) {
        tokenScore = calculateSearchScore("stem")
        matched = true
        bestMatchType = "stem"
        highlightTokens.push(meta.processed)
      }
      // 3) 유의어 매칭 (단어 경계 적용)
      else {
        for (const syn of meta.synonyms) {
          if (matchesAsWord(targetText, syn.word)) {
            tokenScore = calculateSearchScore("synonym", syn.weight)
            matched = true
            bestMatchType = "synonym"
            highlightTokens.push(syn.word)
            break
          }
        }
      }

      // 4) 부분 일치 (단어 경계 없이 포함 여부 확인, 2글자 이상)
      if (!matched && meta.original.length >= 2) {
        if (targetText.includes(meta.original)) {
          tokenScore = calculateSearchScore("partial")
          matched = true
          bestMatchType = "partial"
          highlightTokens.push(meta.original)
        }
      }

      // 5) 초성 부분 매칭 (2글자 이상만)
      if (!matched && meta.chosung.length >= 2) {
        const matchIdx = ix.textChosung.indexOf(meta.chosung)
        if (matchIdx !== -1) {
          tokenScore = calculateSearchScore("chosung")
          matched = true
          bestMatchType = "chosung"
          chosungMatchText = ix.normalizedText.substring(
            matchIdx,
            matchIdx + meta.chosung.length
          )
        }
      }

      if (matched) {
        totalScore += tokenScore
        matchCount++
      }
    }

    // ── 결과 조합 ─────────────────────────────────────────────────────────────
    if (matchCount > 0) {
      // 멀티 토큰 쿼리에서 일부만 매칭된 경우 점수 패널티
      const coverageRatio = matchCount / queryTokens.length
      const lengthBonus = Math.max(0, 1 - word.text.length / 5000) * 0.1
      const finalScore =
        (totalScore / queryTokens.length) * (1 + lengthBonus) * coverageRatio

      let explanation = ""
      let confidence: "high" | "medium" | "low" = "low"

      if (bestMatchType === "exact") {
        explanation = "검색어와 정확히 일치합니다."
        confidence = "high"
      } else if (bestMatchType === "stem") {
        explanation = `"${highlightTokens[0]}" (기본형) 매칭`
        confidence = "medium"
      } else if (bestMatchType === "synonym") {
        explanation = "유사 의미 매칭"
        confidence = "medium"
      } else if (bestMatchType === "partial") {
        explanation = "부분 일치 매칭"
        confidence = "low"
      } else if (bestMatchType === "chosung") {
        explanation = chosungMatchText
          ? `초성 검색: "${chosungMatchText}"`
          : "초성 검색 결과입니다."
        confidence = "low"
      }

      results.push({
        word,
        score: finalScore,
        matchType: bestMatchType,
        explanation,
        confidence,
        highlightRanges: getHighlightRanges(
          word.text,
          highlightTokens.length > 0 ? highlightTokens : queryTokens
        ),
      })
    }
  }

  // ── 후처리 ────────────────────────────────────────────────────────────────
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