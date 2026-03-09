"use client"

import { useState, useMemo } from "react"
import { getAllWords, getWordStats } from "@/lib/words"
import Link from "next/link"
import QuoteCard from "@/components/QuoteCard"

export default function CategoryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const allWords = useMemo(() => getAllWords(), [])
  const stats = useMemo(() => getWordStats(), [])

  const categories = Object.keys(stats.byCategory)

  const filteredWords = selectedCategory
    ? allWords.filter(w => w.category === selectedCategory)
    : []

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      {/* Sticky Blurred Header */}
      <header className="sticky top-0 z-50 airbnb-nav border-b border-black/5 px-6 py-4">
        <div className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto flex items-center gap-3">
          {selectedCategory ? (
            <button
              onClick={() => setSelectedCategory(null)}
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
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className="airbnb-card bg-white flex items-center justify-between group hover:border-[#0099ff] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-xl">
                    📁
                  </div>
                  <div className="text-left">
                    <h4 className="text-[17px] font-bold text-black group-hover:text-blue-600 transition-colors">{c}</h4>
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
            {filteredWords.map((word) => (
              <QuoteCard key={word.id} word={word} showCategory={true} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}