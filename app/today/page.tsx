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
      const url = exceptId
        ? `/api/words/random?except=${exceptId}`
        : '/api/words/random'

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

  // 초기 로딩 화면
  if (!word && loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-center p-6">
        <div className="w-11 h-11 border-4 border-[#0099FF] border-t-transparent rounded-full animate-spin mb-6" />
        <p className="text-sm font-semibold text-slate-400">오늘의 말씀을 준비하고 있습니다...</p>
      </div>
    )
  }

  if (!word) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center p-6">
        <p className="text-slate-400">말씀을 불러오는 중입니다...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-20 relative overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-6 py-5">
        <div className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <Link
                href="/"
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all duration-200"
              >
                <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
                </svg>
              </Link>

              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">오늘의 말씀</h1>
                <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#0099FF] mt-0.5">DAILY VERSE</p>
              </div>
            </div>

            {/* 새로고침 버튼 */}
            <button
              onClick={() => fetchRandomWord(word?.id)}
              disabled={loading}
              className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-300
                ${loading
                  ? 'bg-slate-100 text-slate-400'
                  : 'bg-white shadow-sm border border-slate-100 hover:border-[#0099FF] hover:text-[#0099FF] active:scale-95'
                }`}
              aria-label="새로운 말씀 보기"
            >
              <svg
                className={`w-5 h-5 transition-transform ${loading ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-6 pt-10">
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <QuoteCard word={word} showCategory={true} />
        </div>

        {/* Meditation Guide */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/70 rounded-3xl border border-slate-100 mb-4">
            <span className="text-lg">🌿</span>
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Meditation Time</p>
          </div>

          <p className="text-slate-600 text-[15px] leading-relaxed max-w-[280px] mx-auto break-keep">
            잠시 눈을 감고,<br />
            이 말씀을 마음 깊이 새겨보세요.
          </p>
        </div>
      </main>

      {/* Refresh Overlay */}
      {loading && word && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-[#0099FF] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xs font-medium text-slate-500">새로운 말씀을 가져오는 중...</p>
          </div>
        </div>
      )}
    </div>
  )
}