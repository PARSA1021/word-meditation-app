"use client"

import { useState, useEffect, useCallback } from "react"
import { Word } from "@/lib/words"
import QuoteCard from "@/components/QuoteCard"
import Link from "next/link"

export default function TodayPage() {
  const [word, setWord] = useState<Word | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchRandomWord = useCallback(async (exceptId?: number) => {
    setLoading(true)
    try {
      const url = exceptId ? `/api/words/random?except=${exceptId}` : '/api/words/random'
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setWord(data)
      }
    } catch (error) {
      console.error("Failed to fetch random word:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRandomWord()
  }, [fetchRandomWord])

  if (!word && loading) return (
    <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center p-6 text-center space-y-4">
      <div className="w-10 h-10 border-4 border-[#0099FF] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm font-bold text-slate-400">말씀을 준비하는 중...</p>
    </div>
  )

  if (!word) return <div className="p-6">말씀을 불러오는 중입니다...</div>

  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-32 relative">
      <header className="sticky top-0 z-50 airbnb-nav border-b border-black/5 px-6 py-4 bg-white/80 backdrop-blur-md">
        <div className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto">
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 active:scale-95 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-black text-black">오늘의 말씀</h1>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Daily Inspiration</p>
              </div>
            </div>

            <button
              onClick={() => fetchRandomWord(word.id)}
              disabled={loading}
              className={`w-10 h-10 rounded-full bg-black/5 hover:text-[#0099ff] hover:bg-blue-50 active:scale-95 transition flex items-center justify-center ${loading ? 'opacity-30' : ''}`}
            >
              <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </button>

          </div>
        </div>
      </header>

      <main className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-6 pt-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <QuoteCard word={word} showCategory={true} />
        
        <div className="mt-12 text-center opacity-30">
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#0099FF] mb-2">Meditation Time</p>
          <p className="text-sm font-medium text-slate-600 break-keep">잠시 눈을 감고 이 말씀을 마음속에 새겨보세요.</p>
        </div>
      </main>

      {/* Loading overlay for refresh */}
      {loading && word && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-[1px] z-40" />
      )}
    </div>
  )
}