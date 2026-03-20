"use client"

import { useState, useMemo } from "react"
import { getAllWords, getWordStats, Word } from "@/lib/words"
import Link from "next/link"
import QuoteCard from "@/components/QuoteCard"

const PAGE_SIZE = 30 // 한 페이지에 보여줄 단어 수

export default function CategoryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const allWords = useMemo(() => getAllWords(), [])
  const stats = useMemo(() => getWordStats(), [])

  const sortedCategories = useMemo(
    () => Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1]),
    [stats]
  )
  const categories = useMemo(() => sortedCategories.map(([c]) => c), [sortedCategories])

  // 선택된 카테고리 단어
  const filteredWords = useMemo(() => {
    if (!selectedCategory) return []
    return allWords.filter((w) => w.category === selectedCategory)
  }, [allWords, selectedCategory])

  // 페이지 계산
  const totalPages = Math.ceil(filteredWords.length / PAGE_SIZE)
  const visibleWords = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    const end = start + PAGE_SIZE
    return filteredWords.slice(start, end)
  }, [filteredWords, currentPage])

  // 카테고리 선택 시 페이지 초기화
  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat)
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 airbnb-nav border-b border-black/5 px-6 py-4 bg-[#F2F2F7]">
        <div className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto flex items-center gap-3">
          {selectedCategory ? (
            <button
              onClick={() => { setSelectedCategory(null); setCurrentPage(1) }}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-black/5 text-black active:scale-95 transition-transform"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-black/5 text-black">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          )}
          <h1 className="text-xl font-black text-black">
            {selectedCategory ? selectedCategory : "주제별 탐색"}
          </h1>
        </div>
      </header>

      <main className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-6 pt-6 pb-32 space-y-6">
        {!selectedCategory ? (
          <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">전체 {categories.length}개 카테고리</p>
            {categories.map((c, index) => (
              <button
                key={c}
                onClick={() => handleCategorySelect(c)}
                className="airbnb-card bg-white flex items-center justify-between group hover:border-[#0099ff] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-xl">
                    📁
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h4 className="text-[17px] font-bold text-black group-hover:text-blue-600 transition-colors">{c}</h4>
                      {index < 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-black tracking-tight">
                          TOP
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 font-medium">{stats.byCategory[c]}개의 말씀</p>
                  </div>
                </div>
                <div className="text-slate-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
              &apos;{selectedCategory}&apos; 결과 {filteredWords.length}개
            </p>
            {visibleWords.map((word: Word) => (
              <QuoteCard key={word.id} word={word} showCategory={true} />
            ))}

            {/* 페이지 번호 버튼 */}
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
        )}
      </main>
    </div>
  )
}