"use client"

import { useState, useEffect } from "react"
import { getRandomWordExcept, Word } from "@/lib/words"
import QuoteCard from "@/components/QuoteCard"
import Link from "next/link"

export default function TodayPage() {
  const [word, setWord] = useState<Word | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWord(getRandomWordExcept(null))
  }, [])

  if (!word) return <div className="p-6">로딩 중...</div>

  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-32">
      <header className="sticky top-0 z-50 airbnb-nav border-b border-black/5 px-6 py-4">
        <div className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-black/5 text-black active:scale-95 transition-transform"
                aria-label="홈으로"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div className="leading-tight">
                <h1 className="text-xl font-black text-black tracking-tight">오늘의 말씀</h1>
                <p className="text-[12px] font-bold text-slate-400 tracking-tight">TruePath</p>
              </div>
            </div>

            <button
              onClick={() => setWord(getRandomWordExcept(word.id))}
              className="w-10 h-10 rounded-full bg-black/5 text-slate-700 hover:text-[#0099ff] active:scale-95 transition-all flex items-center justify-center"
              aria-label="새 말씀 뽑기"
              title="새 말씀 뽑기"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-6 pt-8">
        <QuoteCard word={word} showCategory={true} />
      </main>
    </div>
  )
}