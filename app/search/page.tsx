"use client"

import { useState, useMemo } from "react"
import { getAllWords, Word } from "@/lib/words"
import Link from "next/link"
import QuoteCard from "@/components/QuoteCard"

const PAGE_SIZE = 30

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [searchMode, setSearchMode] = useState<"text" | "source">("text")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const hasQuery = query.trim().length >= 2

  // 멀티 워드 AND 검색 + 정확한 구문 검색
  const textResults = useMemo(() => {
    if (!hasQuery) return []

    const rawQuery = query.trim()
    const isExactPhrase = rawQuery.startsWith('"') && rawQuery.endsWith('"')

    if (isExactPhrase) {
      const phrase = rawQuery.slice(1, -1).toLowerCase().trim()
      return getAllWords().filter((word) => {
        const target = searchMode === "text"
          ? word.text.toLowerCase()
          : (word.source + " " + (word.speaker || "")).toLowerCase()
        return target.includes(phrase)
      })
    }

    const tokens = rawQuery.toLowerCase().split(/\s+/).filter(Boolean)
    if (tokens.length === 0) return []

    return getAllWords().filter((word) => {
      const textLower = word.text.toLowerCase()
      const sourceLower = word.source.toLowerCase()
      const speakerLower = (word.speaker || "").toLowerCase()

      if (searchMode === "text") {
        return tokens.every(token => textLower.includes(token))
      } else {
        return tokens.every(token =>
          sourceLower.includes(token) || speakerLower.includes(token)
        )
      }
    })
  }, [query, hasQuery, searchMode])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    const baseList = hasQuery ? textResults : getAllWords()
    baseList.forEach((w) => {
      counts[w.category] = (counts[w.category] || 0) + 1
    })
    return counts
  }, [textResults, hasQuery])

  const filteredResults = useMemo(() => {
    const baseList = hasQuery ? textResults : getAllWords()
    if (!selectedCategory) return baseList
    return baseList.filter((w) => w.category === selectedCategory)
  }, [textResults, selectedCategory, hasQuery])

  const totalPages = Math.ceil(filteredResults.length / PAGE_SIZE)

  const visibleWords = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredResults.slice(start, start + PAGE_SIZE)
  }, [filteredResults, currentPage])

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat)
    setCurrentPage(1)
  }

  const handleQueryChange = (value: string) => {
    setQuery(value)
    setSelectedCategory(null)
    setCurrentPage(1)
  }

  const clearQuery = () => setQuery("")

  const searchDescription = useMemo(() => {
    if (!hasQuery) return ""
    const tokens = query.trim().split(/\s+/).filter(Boolean)
    if (tokens.length <= 1) return ""

    const modeText = searchMode === "text" ? "본문" : "출처"
    return `${tokens.map(t => `“${t}”`).join(" · ")} 이(가) 모두 포함된 ${modeText}`
  }, [query, searchMode, hasQuery])

  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-20">

      {/* 컴팩트한 고정 헤더 */}
      <header className="sticky top-0 z-50 bg-[#F2F2F7]/95 backdrop-blur-md border-b border-black/5 px-5 py-4">

        <div className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto">

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="w-9 h-9 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-xl font-black tracking-tight">말씀 검색</h1>
            </div>

            {/* 검색 모드 - 더 컴팩트하게 */}
            <div className="flex gap-1 bg-white rounded-2xl p-1 border border-gray-100">
              <button
                onClick={() => setSearchMode("text")}
                className={`px-4 py-1 text-xs font-semibold rounded-xl transition-all ${searchMode === "text"
                  ? "bg-[#0099FF] text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-50"
                  }`}
              >
                본문
              </button>
              <button
                onClick={() => setSearchMode("source")}
                className={`px-4 py-1 text-xs font-semibold rounded-xl transition-all ${searchMode === "source"
                  ? "bg-[#0099FF] text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-50"
                  }`}
              >
                출처
              </button>
            </div>
          </div>

          {/* 검색 입력창 */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder={
                searchMode === "text"
                  ? "사랑 축복 또는 \"하나님의 사랑\""
                  : "잠언 또는 \"사도 바울\""
              }
              className="w-full pl-12 pr-12 py-3.5 bg-white border border-black/5 rounded-3xl focus:border-[#0099FF] focus:ring-1 focus:ring-[#0099FF]/30 outline-none text-[17px] font-medium"
            />
            {query && (
              <button
                onClick={clearQuery}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xl leading-none"
              >
                ✕
              </button>
            )}
          </div>

          {/* 검색 조건 안내 */}
          {searchDescription && (
            <div className="mt-3 bg-blue-50 text-blue-700 text-sm px-4 py-2.5 rounded-2xl flex items-center gap-2">
              <span>🔎</span>
              <span>{searchDescription}</span>
            </div>
          )}
        </div>
      </header>

      {/* 카테고리 필터 - 스크롤 시에도 잘 보이게 */}
      {Object.keys(categoryCounts).length > 0 && (
        <div className="sticky top-[118px] z-40 bg-[#F2F2F7]/95 backdrop-blur-md border-b border-black/5 px-5 py-3 overflow-x-auto no-scrollbar">
          <div className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto flex gap-2">
            <button
              onClick={() => { setSelectedCategory(null); setCurrentPage(1) }}
              className={`flex-none px-5 py-2 rounded-2xl text-sm font-semibold border transition-all whitespace-nowrap
                ${selectedCategory === null
                  ? "bg-[#0099FF] text-white border-[#0099FF]"
                  : "bg-white text-slate-600 border-black/5 hover:border-black/10"
                }`}
            >
              전체 {filteredResults.length}
            </button>

            {Object.entries(categoryCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, count]) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`flex-none px-5 py-2 rounded-2xl text-sm font-semibold border transition-all whitespace-nowrap
                    ${selectedCategory === cat
                      ? "bg-[#0099FF] text-white border-[#0099FF]"
                      : "bg-white text-slate-600 border-black/5 hover:border-black/10"
                    }`}
                >
                  {cat} {count}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* 본문 */}
      <main className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-5 pt-6 pb-20 space-y-6">

        {!hasQuery && !selectedCategory ? (
          <div className="py-20 text-center space-y-5">
            <div className="text-5xl">✨</div>
            <p className="text-xl font-semibold text-slate-700">궁금한 말씀을 찾아보세요</p>
            <p className="text-slate-400">여러 단어를 띄어쓰기로 입력하면<br />모두 포함된 결과가 나와요</p>
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="space-y-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
              {selectedCategory || "전체"} · {filteredResults.length}개
            </p>

            {visibleWords.map((word: Word) => (
              <QuoteCard
                key={word.id}
                word={word}
                showCategory={true}
                highlightQuery={query}
              />
            ))}

            {totalPages > 1 && (
              <div className="flex gap-2 mt-10 overflow-x-auto pb-6 justify-center">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`min-w-[42px] h-10 rounded-2xl border-2 text-sm font-semibold transition-all
                      ${currentPage === num
                        ? "bg-[#0099FF] text-white border-[#0099FF]"
                        : "bg-white text-slate-500 border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="py-20 text-center space-y-5">
            <div className="text-5xl">🔭</div>
            <p className="text-xl font-semibold text-slate-700">검색 결과가 없습니다</p>
            <p className="text-slate-400">다른 단어나 표현으로 시도해보세요</p>
          </div>
        )}
      </main>
    </div>
  )
}