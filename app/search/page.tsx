"use client"

import { useState, useMemo } from "react"
import { searchWords } from "@/lib/words"
import Link from "next/link"
import QuoteCard from "@/components/QuoteCard"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)



  // Results filtered by text
  const textResults = useMemo(() => {
    if (query.trim().length < 2) return []
    return searchWords(query)
  }, [query])

  // Calculate counts for each category based on current text search
  const categoryCounts = useMemo(() => {
    const counts: { [key: string]: number } = {}
    textResults.forEach(w => {
      counts[w.category] = (counts[w.category] || 0) + 1
    })
    return counts
  }, [textResults])

  // Final filtered results by selected category
  const filteredResults = useMemo(() => {
    if (!selectedCategory) return textResults
    return textResults.filter(w => w.category === selectedCategory)
  }, [textResults, selectedCategory])

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      {/* Sticky Blurred Header */}
      <header className="sticky top-0 z-50 airbnb-nav border-b border-black/5 px-6 py-4">
        <div className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-black/5 text-black">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-black text-black">말씀 검색</h1>
          </div>

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
              onChange={(e) => {
                setQuery(e.target.value)
                setSelectedCategory(null) // Reset category on new search
              }}
              placeholder="검색어를 입력하세요 (최소 2자)"
              className="w-full pl-12 pr-4 py-4 bg-black/5 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-[17px] font-medium placeholder:text-slate-400"
            />
          </div>

          {/* Category Filter Scroll */}
          {query.trim().length >= 2 && Object.keys(categoryCounts).length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-6 px-6">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`flex-none px-4 py-2 rounded-full text-sm font-bold transition-all border ${selectedCategory === null
                  ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20"
                  : "bg-white border-black/5 text-slate-500"
                  }`}
              >
                전체 {textResults.length}
              </button>
              {Object.entries(categoryCounts).map(([cat, count]) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-none px-4 py-2 rounded-full text-sm font-bold transition-all border ${selectedCategory === cat
                    ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20"
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

      <main className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-6 pt-6 pb-32 space-y-4">
        {query.trim().length < 2 ? (
          <div className="py-20 text-center space-y-4 animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-white rounded-3xl mx-auto flex items-center justify-center text-3xl shadow-sm">
              ✨
            </div>
            <div className="space-y-1">
              <p className="text-[17px] font-bold text-black">궁금한 말씀을 찾아보세요</p>
              <p className="text-sm text-slate-400 font-medium">검색어를 2자 이상 입력해주세요.</p>
            </div>
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
              {selectedCategory || "전체"} 결과 {filteredResults.length}개
            </p>
            {filteredResults.map((word) => (
              <QuoteCard key={word.id} word={word} showCategory={true} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="text-5xl">🔭</div>
            <div className="space-y-1">
              <p className="text-[17px] font-bold text-black">검색 결과가 없습니다</p>
              <p className="text-sm text-slate-400 font-medium">다른 검색어로 다시 시도해보세요.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}