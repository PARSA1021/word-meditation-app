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

  // 🔥 검색 (텍스트 / 소스 분리)
  const textResults = useMemo(() => {
    if (!hasQuery) return []

    const normalized = query.toLowerCase().trim()

    return getAllWords().filter((word) => {
      if (searchMode === "text") {
        return word.text.toLowerCase().includes(normalized)
      }

      if (searchMode === "source") {
        return word.source.toLowerCase().includes(normalized)
      }

      return false
    })
  }, [query, hasQuery, searchMode])

  // 🔥 카테고리 통계
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    const baseList = hasQuery ? textResults : getAllWords()

    baseList.forEach((w) => {
      counts[w.category] = (counts[w.category] || 0) + 1
    })

    return counts
  }, [textResults, hasQuery])

  // 🔥 카테고리 필터
  const filteredResults = useMemo(() => {
    const baseList = hasQuery ? textResults : getAllWords()
    if (!selectedCategory) return baseList
    return baseList.filter((w) => w.category === selectedCategory)
  }, [textResults, selectedCategory, hasQuery])

  // 🔥 페이지네이션
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

  return (
    <div className="min-h-screen bg-[#F2F2F7]">

      {/* 헤더 */}
      <header className="sticky top-0 z-50 airbnb-nav border-b border-black/5 px-6 py-4 bg-[#F2F2F7] backdrop-blur">

        <div className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto space-y-4">

          {/* 상단 */}
          <div className="flex items-center gap-3">
            <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-black">말씀 검색</h1>
          </div>

          {/* 🔥 검색 모드 선택 */}
          <div className="flex gap-2">
            <button
              onClick={() => setSearchMode("text")}
              className={`px-3 py-1 rounded-full text-sm font-semibold border transition
                ${searchMode === "text"
                  ? "bg-[#0099FF] text-white border-[#0099FF]"
                  : "bg-white text-gray-500 border-gray-200"
                }`}
            >
              텍스트
            </button>

            <button
              onClick={() => setSearchMode("source")}
              className={`px-3 py-1 rounded-full text-sm font-semibold border transition
                ${searchMode === "source"
                  ? "bg-[#0099FF] text-white border-[#0099FF]"
                  : "bg-white text-gray-500 border-gray-200"
                }`}
            >
              소스
            </button>
          </div>

          {/* 검색 */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              🔍
            </span>
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder={
                searchMode === "text"
                  ? "말씀 내용을 검색하세요 (최소 2자)"
                  : "출처(소스)를 검색하세요 (최소 2자)"
              }
              className="w-full pl-12 pr-4 py-4 bg-black/5 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#0099FF]/20 outline-none transition text-[17px] font-medium"
            />
          </div>

          {/* 카테고리 */}
          {Object.keys(categoryCounts).length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-6 px-6">

              <button
                onClick={() => { setSelectedCategory(null); setCurrentPage(1) }}
                className={`flex-none px-4 py-2 rounded-full text-sm font-bold border transition
                  ${selectedCategory === null
                    ? "bg-[#0099FF] text-white border-[#0099FF]"
                    : "bg-white text-slate-500 border-black/5"
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
                    className={`flex-none px-4 py-2 rounded-full text-sm font-bold border transition
                      ${selectedCategory === cat
                        ? "bg-[#0099FF] text-white border-[#0099FF]"
                        : "bg-white text-slate-500 border-black/5"
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
      <main className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-6 pt-6 pb-32 space-y-6">

        {!hasQuery && !selectedCategory ? (
          <div className="py-20 text-center space-y-4">
            <div className="text-4xl">✨</div>
            <p className="font-bold">궁금한 말씀을 찾아보세요</p>
            <p className="text-sm text-slate-400">검색어를 2자 이상 입력해주세요.</p>
          </div>

        ) : filteredResults.length > 0 ? (

          <div className="space-y-4">

            <p className="text-xs font-black text-slate-400 uppercase px-1">
              {selectedCategory || "전체"} 결과 {filteredResults.length}개
            </p>

            {visibleWords.map((word: Word) => (
              <QuoteCard
                key={word.id}
                word={word}
                showCategory={true}
                highlightQuery={query}
              />
            ))}

            {/* 페이지 */}
            {totalPages > 1 && (
              <div className="flex gap-2 mt-6 overflow-x-auto pb-2">

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`min-w-[38px] h-10 rounded-full border-2 text-sm font-semibold transition
                      ${currentPage === num
                        ? "bg-[#0099FF] text-white border-[#0099FF]"
                        : "bg-white text-slate-500 border-gray-200"
                      }`}
                  >
                    {num}
                  </button>
                ))}

              </div>
            )}

          </div>

        ) : (

          <div className="py-20 text-center space-y-4">
            <div className="text-4xl">🔭</div>
            <p className="font-bold">검색 결과가 없습니다</p>
            <p className="text-sm text-slate-400">다른 검색어로 시도해보세요.</p>
          </div>

        )}
      </main>
    </div>
  )
}