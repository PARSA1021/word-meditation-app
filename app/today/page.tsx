"use client"

import { useState, useEffect } from "react"
import { getRandomWordExcept, Word } from "@/lib/words"
import QuoteCard from "@/components/QuoteCard"
import Link from "next/link"

export default function TodayPage() {
  const [word, setWord] = useState<Word | null>(null)

  useEffect(() => {
    setWord(getRandomWordExcept()) // ✅ FIX
  }, [])

  if (!word) return <div className="p-6">로딩 중...</div>

  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-32">
      <header className="sticky top-0 z-50 airbnb-nav border-b border-black/5 px-6 py-4">
        <div className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto">
          <div className="flex items-center justify-between">

            {/* 왼쪽 */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-black/5 active:scale-95 transition"
              >
                ←
              </Link>
              <div>
                <h1 className="text-xl font-black">오늘의 말씀</h1>
                <p className="text-xs text-slate-400">TruePath</p>
              </div>
            </div>

            {/* 새로고침 */}
            <button
              onClick={() => setWord(getRandomWordExcept([word.id]))}
              className="w-10 h-10 rounded-full bg-black/5 hover:text-[#0099ff] active:scale-95 transition flex items-center justify-center"
            >
              🔄
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