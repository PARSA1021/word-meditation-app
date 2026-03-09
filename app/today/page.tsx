"use client"

import { useState, useEffect } from "react"
import { getRandomWord, Word } from "@/lib/words"
import QuoteCard from "@/components/QuoteCard"

export default function TodayPage() {
  const [word, setWord] = useState<Word | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWord(getRandomWord())
  }, [])

  if (!word) return <div className="p-6">로딩 중...</div>

  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-32">
      <header className="sticky top-0 z-50 airbnb-nav border-b border-black/5 px-6 py-4">
        <div className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto">
          <h1 className="text-xl font-black text-black">오늘의 말씀</h1>
        </div>
      </header>

      <main className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-6 pt-8">
        <QuoteCard word={word} showCategory={true} />
      </main>
    </div>
  )
}