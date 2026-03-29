"use client"

import { useState, useMemo, useCallback, useEffect, useRef } from "react"
import { getAllWords, searchWordsAdvanced, getSynonyms, type Word, type SearchResult } from "@/lib/words"
import Link from "next/link"
import QuoteCard from "@/components/QuoteCard"

const PAGE_SIZE = 30
const DEBOUNCE_MS = 220 // 타이핑 멈춘 뒤 220ms 후 검색

// -----------------------------
// Debounce 훅
// -----------------------------
function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

// -----------------------------
// 하이라이트 렌더러
// -----------------------------
function HighlightedByRanges({
  text,
  ranges,
}: {
  text: string
  ranges: Array<{ start: number; end: number }>
}) {
  const parts: React.ReactNode[] = []
  let cursor = 0
  for (const { start, end } of ranges) {
    if (start > cursor) parts.push(<span key={`t-${cursor}`}>{text.slice(cursor, start)}</span>)
    parts.push(
      <mark key={`h-${start}`} className="bg-yellow-200 text-yellow-900 rounded-sm px-0.5 font-semibold not-italic">
        {text.slice(start, end)}
      </mark>
    )
    cursor = end
  }
  if (cursor < text.length) parts.push(<span key={`t-end`}>{text.slice(cursor)}</span>)
  return <>{parts}</>
}

// -----------------------------
// 매칭 타입 뱃지
// -----------------------------
const MATCH_BADGE: Record<string, { label: string; className: string }> = {
  exact: { label: "정확", className: "bg-green-100 text-green-700" },
  phrase: { label: "구절", className: "bg-blue-100 text-blue-700" },
  token: { label: "포함", className: "bg-slate-100 text-slate-500" },
  stem: { label: "어근", className: "bg-orange-100 text-orange-700" },
  chosung: { label: "초성", className: "bg-purple-100 text-purple-700" },
  synonym: { label: "유사어", className: "bg-pink-100 text-pink-700" },
}

// -----------------------------
// 검색 결과 카드
// -----------------------------
function SearchResultCard({ result, query, showCategory }: {
  result: SearchResult
  query: string
  showCategory?: boolean
}) {
  const badge = MATCH_BADGE[result.matchType]
  return (
    <div className="relative">
      {result.matchType !== "token" && (
        <span className={`absolute -top-2.5 left-4 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide z-10 ${badge.className}`}>
          {badge.label}
        </span>
      )}
      <QuoteCard
        word={result.word}
        showCategory={showCategory}
        highlightQuery={query}
        highlightRanges={result.highlightRanges}
      />
    </div>
  )
}

// -----------------------------
// 유사어 제안
// -----------------------------
function SynonymSuggestions({ query, onSelect }: {
  query: string
  onSelect: (syn: string) => void
}) {
  const synonyms = useMemo(() => {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
    const all: string[] = []
    for (const t of tokens) all.push(...getSynonyms(t))
    return [...new Set(all)].slice(0, 8)
  }, [query])

  if (synonyms.length === 0) return null
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[11px] text-slate-400 font-semibold shrink-0">연관어</span>
      {synonyms.map((syn) => (
        <button
          key={syn}
          onClick={() => onSelect(syn)}
          className="px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:border-[#0099FF] hover:text-[#0099FF] transition-all"
        >
          {syn}
        </button>
      ))}
    </div>
  )
}

// -----------------------------
// 메인 페이지
// -----------------------------
export default function SearchPage() {
  const [inputValue, setInputValue] = useState("")       // 즉시 반영 (UI)
  const debouncedQuery = useDebounced(inputValue, DEBOUNCE_MS) // 실제 검색에 사용

  const [searchMode, setSearchMode] = useState<"text" | "source">("text")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [showOnlyTopMatch, setShowOnlyTopMatch] = useState(false)

  const hasQuery = debouncedQuery.trim().length >= 1
  const isTyping = inputValue !== debouncedQuery // 타이핑 중 여부

  // 🚀 debounced query로만 검색 실행
  const searchResults: SearchResult[] = useMemo(() => {
    if (!hasQuery) return []
    return searchWordsAdvanced(debouncedQuery, searchMode)
  }, [debouncedQuery, hasQuery, searchMode])

  const baseList: Word[] = useMemo(() => {
    return hasQuery ? searchResults.map((r) => r.word) : getAllWords()
  }, [searchResults, hasQuery])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    baseList.forEach((w) => { counts[w.category] = (counts[w.category] || 0) + 1 })
    return counts
  }, [baseList])

  const filteredResults: SearchResult[] = useMemo(() => {
    if (!hasQuery) {
      const words = selectedCategory
        ? getAllWords().filter((w) => w.category === selectedCategory)
        : getAllWords()
      return words.map((w) => ({ word: w, score: 0, matchType: "token" as const }))
    }
    const list = selectedCategory
      ? searchResults.filter((r) => r.word.category === selectedCategory)
      : searchResults

    if (showOnlyTopMatch && list.length > 0) {
      const threshold = list[0].score * 0.5
      return list.filter((r) => r.score >= threshold)
    }
    return list
  }, [searchResults, selectedCategory, hasQuery, showOnlyTopMatch])

  const totalPages = Math.ceil(filteredResults.length / PAGE_SIZE)

  const visibleResults = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredResults.slice(start, start + PAGE_SIZE)
  }, [filteredResults, currentPage])

  const handleCategorySelect = useCallback((cat: string) => {
    setSelectedCategory(cat); setCurrentPage(1)
  }, [])

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value)
    setSelectedCategory(null)
    setCurrentPage(1)
  }, [])

  const handleSynonymSelect = useCallback((syn: string) => {
    setInputValue(syn); setSelectedCategory(null); setCurrentPage(1)
  }, [])

  const clearQuery = () => handleInputChange("")

  const searchDescription = useMemo(() => {
    const q = debouncedQuery.trim()
    if (!q) return null
    if (/^[ㄱ-ㅎ]+$/.test(q)) return { text: `"${q}" 초성으로 검색`, icon: "🔡" }
    if (q.startsWith('"') && q.endsWith('"')) return { text: `정확한 구절 "${q.slice(1, -1)}" 검색`, icon: "💬" }
    const tokens = q.split(/\s+/).filter(Boolean)
    if (tokens.length > 1) {
      return { text: `${tokens.map((t) => `"${t}"`).join(" + ")} 모두 포함된 ${searchMode === "text" ? "본문" : "출처"}`, icon: "🔎" }
    }
    return null
  }, [debouncedQuery, searchMode])

  return (
    <div className="min-h-screen bg-[#F2F2F7]">

      {/* 헤더 */}
      <header className="sticky top-0 z-50 border-b border-black/5 px-6 py-4 bg-[#F2F2F7]/95 backdrop-blur-md">
        <div className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto space-y-3">

          <div className="flex items-center gap-3">
            <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-black tracking-tight">말씀 검색</h1>
          </div>

          {/* 검색 모드 */}
          <div className="flex gap-2">
            {(["text", "source"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => { setSearchMode(mode); setCurrentPage(1) }}
                className={`px-4 py-1.5 rounded-2xl text-sm font-semibold border transition-all
                  ${searchMode === mode
                    ? "bg-[#0099FF] text-white border-[#0099FF] shadow-sm"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                  }`}
              >
                {mode === "text" ? "말씀 본문" : "출처 · 인물"}
              </button>
            ))}
          </div>

          {/* 검색 입력창 */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              {isTyping ? "⏳" : "🔍"}
            </span>
            <input
              type="text"
              autoFocus
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={
                searchMode === "text"
                  ? '예: 사랑   또는   사랑 축복   또는   "하나님의 사랑"'
                  : '예: 타락론   또는   재림론'
              }
              className="w-full pl-12 pr-12 py-4 bg-white border border-black/5 rounded-3xl focus:border-[#0099FF] focus:ring-1 focus:ring-[#0099FF]/30 outline-none text-[17px] font-medium transition-all"
            />
            {inputValue && (
              <button
                onClick={clearQuery}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all"
              >
                ✕
              </button>
            )}
          </div>

          {/* 검색 조건 안내 */}
          {searchDescription && (
            <div className="bg-blue-50 text-blue-700 text-sm px-4 py-2.5 rounded-2xl flex items-center gap-2">
              <span>{searchDescription.icon}</span>
              <span className="font-medium">{searchDescription.text}</span>
            </div>
          )}

          {/* 유사어 제안 */}
          {hasQuery && debouncedQuery.trim().length >= 2 && (
            <SynonymSuggestions query={debouncedQuery} onSelect={handleSynonymSelect} />
          )}

          {/* 관련도 필터 */}
          {hasQuery && filteredResults.length > 5 && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setShowOnlyTopMatch(!showOnlyTopMatch); setCurrentPage(1) }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold border transition-all
                  ${showOnlyTopMatch
                    ? "bg-emerald-500 text-white border-emerald-500"
                    : "bg-white text-slate-500 border-gray-200 hover:border-gray-300"
                  }`}
              >
                <span>{showOnlyTopMatch ? "✓" : "○"}</span>
                관련도 높은 것만
              </button>
            </div>
          )}

          {/* 카테고리 탭 */}
          {Object.keys(categoryCounts).length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-1 px-1">
              <button
                onClick={() => { setSelectedCategory(null); setCurrentPage(1) }}
                className={`flex-none px-4 py-1.5 rounded-2xl text-sm font-semibold border transition-all whitespace-nowrap
                  ${selectedCategory === null
                    ? "bg-[#0099FF] text-white border-[#0099FF]"
                    : "bg-white text-slate-600 border-black/5 hover:border-black/10"
                  }`}
              >
                전체 {hasQuery ? filteredResults.length : baseList.length}
              </button>
              {Object.entries(categoryCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, count]) => (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className={`flex-none px-4 py-1.5 rounded-2xl text-sm font-semibold border transition-all whitespace-nowrap
                      ${selectedCategory === cat
                        ? "bg-[#0099FF] text-white border-[#0099FF]"
                        : "bg-white text-slate-600 border-black/5 hover:border-black/10"
                      }`}
                  >
                    {cat} {count}
                  </button>
                ))}
            </div>
          )}
        </div>
      </header>

      {/* 본문 */}
      <main className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-6 pt-8 pb-32 space-y-6">

        {/* 타이핑 중 로딩 표시 */}
        {isTyping && inputValue.trim().length >= 1 && (
          <div className="py-6 text-center text-slate-400 text-sm">검색 중...</div>
        )}

        {!isTyping && !hasQuery && !selectedCategory ? (
          <div className="py-20 text-center space-y-5">
            <div className="text-5xl">✨</div>
            <p className="text-xl font-semibold text-slate-700">궁금한 말씀을 찾아보세요</p>
            <div className="text-slate-400 space-y-1 text-sm">
              <p>여러 단어를 띄어쓰기로 입력하면 AND 검색</p>
              <p><code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">"따옴표"</code>로 묶으면 정확한 구절 검색</p>
              <p>초성(ㅅㄹ)으로도 검색 가능해요</p>
            </div>
          </div>
        ) : !isTyping && filteredResults.length > 0 ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {selectedCategory || "전체"} · {filteredResults.length}개
              </p>
              {hasQuery && (
                <p className="text-[11px] text-slate-300 font-medium">관련도순 정렬</p>
              )}
            </div>

            {visibleResults.map((result) =>
              hasQuery ? (
                <SearchResultCard key={result.word.id} result={result} query={debouncedQuery} showCategory />
              ) : (
                <QuoteCard key={result.word.id} word={result.word} showCategory highlightQuery="" />
              )
            )}

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex gap-2 mt-8 overflow-x-auto pb-4 justify-center">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="min-w-[42px] h-10 rounded-2xl border-2 text-sm font-semibold transition-all disabled:opacity-30 bg-white text-slate-500 border-gray-200 hover:border-gray-300"
                >‹</button>

                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const start = Math.max(1, Math.min(currentPage - 3, totalPages - 6))
                  return start + i
                }).filter((n) => n >= 1 && n <= totalPages).map((num) => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`min-w-[42px] h-10 rounded-2xl border-2 text-sm font-semibold transition-all
                      ${currentPage === num
                        ? "bg-[#0099FF] text-white border-[#0099FF]"
                        : "bg-white text-slate-500 border-gray-200 hover:border-gray-300"
                      }`}
                  >{num}</button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="min-w-[42px] h-10 rounded-2xl border-2 text-sm font-semibold transition-all disabled:opacity-30 bg-white text-slate-500 border-gray-200 hover:border-gray-300"
                >›</button>
              </div>
            )}
          </div>
        ) : !isTyping ? (
          <div className="py-20 text-center space-y-5">
            <div className="text-5xl">🔭</div>
            <p className="text-xl font-semibold text-slate-700">검색 결과가 없습니다</p>
            <div className="text-slate-400 text-sm space-y-1">
              <p>다른 단어나 표현으로 시도해보세요</p>
              <p>초성(예: ㅅㄹ)으로도 검색해보세요</p>
            </div>
            <SynonymSuggestions query={debouncedQuery} onSelect={handleSynonymSelect} />
          </div>
        ) : null}
      </main>
    </div>
  )
}