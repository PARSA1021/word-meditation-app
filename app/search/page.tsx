"use client"

import { useState, useMemo } from "react"
import { getAllWords, searchWords, Word } from "@/lib/words"
import Link from "next/link"
import QuoteCard from "@/components/QuoteCard"

const PAGE_SIZE = 30 // 한 페이지에 보여줄 단어 수

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // query로 필터링된 결과
  const textResults = useMemo(() => {
    if (query.trim().length < 2) return []
    return searchWords(query)
  }, [query])

  // 카테고리별 개수 계산
  const categoryCounts = useMemo(() => {
    const counts: { [key: string]: number } = {}
    const baseList = query.trim().length >= 2 ? textResults : getAllWords()
    baseList.forEach((w) => {
      counts[w.category] = (counts[w.category] || 0) + 1
    })
    return counts
  }, [textResults, query])

  // 카테고리 선택 시 필터링
  const filteredResults = useMemo(() => {
    const baseList = query.trim().length >= 2 ? textResults : getAllWords()
    if (!selectedCategory) return baseList
    return baseList.filter((w) => w.category === selectedCategory)
  }, [textResults, selectedCategory, query])

  // 현재 페이지에 보여줄 단어
  const totalPages = Math.ceil(filteredResults.length / PAGE_SIZE)
  const visibleWords = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    const end = start + PAGE_SIZE
    return filteredResults.slice(start, end)
  }, [filteredResults, currentPage])

  // 카테고리 선택 시 페이지 초기화
  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat)
    setCurrentPage(1)
  }

  // 검색어 변경 시 카테고리 초기화
  const handleQueryChange = (value: string) => {
    setQuery(value)
    setSelectedCategory(null)
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 airbnb-nav border-b border-black/5 px-6 py-4 bg-[#F2F2F7]">
        <div className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-black/5 text-black">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-black text-black">말씀 검색</h1>
          </div>

          {/* 검색 input */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="검색어를 입력하세요 (최소 2자)"
              className="w-full pl-12 pr-4 py-4 bg-black/5 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#0099FF]/20 outline-none transition-all text-[17px] font-medium placeholder:text-slate-400"
            />
          </div>

          {/* 카테고리 필터 스크롤 */}
          {Object.keys(categoryCounts).length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-6 px-6">
              <button
                onClick={() => { setSelectedCategory(null); setCurrentPage(1) }}
                className={`flex-none px-4 py-2 rounded-full text-sm font-bold transition-all border ${selectedCategory === null
                  ? "bg-[#0099FF] border-[#0099FF] text-white shadow-lg shadow-[#0099FF]/20"
                  : "bg-white border-black/5 text-slate-500"
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
                    className={`flex-none px-4 py-2 rounded-full text-sm font-bold transition-all border ${selectedCategory === cat
                      ? "bg-[#0099FF] border-[#0099FF] text-white shadow-lg shadow-[#0099FF]/20"
                      : "bg-white border-black/5 text-slate-500"
                    }`}
                  >
                    {cat} {count}
                  </button>
                ))}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-6 pt-6 pb-32 space-y-6">
        {query.trim().length < 2 && !selectedCategory ? (
          <div className="py-20 text-center space-y-4 animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-white rounded-3xl mx-auto flex items-center justify-center text-3xl shadow-sm">✨</div>
            <p className="text-[17px] font-bold text-black">궁금한 말씀을 찾아보세요</p>
            <p className="text-sm text-slate-400 font-medium">검색어를 2자 이상 입력해주세요.</p>
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
              {selectedCategory || "전체"} 결과 {filteredResults.length}개
            </p>
            {visibleWords.map((word: Word) => (
              <QuoteCard key={word.id} word={word} showCategory={true} />
            ))}

            {/* 페이지 번호 버튼 - 스타일 업그레이드 */}
            {totalPages > 1 && (
              <div className="flex gap-2 mt-6 overflow-x-auto pb-2 no-scrollbar">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`
                      min-w-[38px] h-10 flex items-center justify-center
                      rounded-full border-2 font-semibold text-sm transition-all
                      ${currentPage === num
                        ? "bg-[#0099FF] text-white border-[#0099FF] shadow-lg"
                        : "bg-white text-slate-500 border-gray-200 hover:bg-[#E6F0FF] hover:text-[#0099FF]"
                      }
                      active:scale-95
                    `}
                  >
                    {num}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="text-5xl">🔭</div>
            <p className="text-[17px] font-bold text-black">검색 결과가 없습니다</p>
            <p className="text-sm text-slate-400 font-medium">다른 검색어로 다시 시도해보세요.</p>
          </div>
        )}
      </main>
    </div>
  )
}