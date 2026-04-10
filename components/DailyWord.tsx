"use client"

import { useState, useEffect, useCallback } from "react"
import { Word } from "@/lib/words"
import QuoteCard from "@/components/QuoteCard"

export default function DailyWord() {
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

  if (!word && loading) {
    return (
      <div className="airbnb-card border-none h-40 animate-pulse flex flex-col justify-center gap-3">
        <div className="h-3 bg-slate-100 rounded-full w-24"></div>
        <div className="h-4 bg-slate-100 rounded-full w-full"></div>
        <div className="h-4 bg-slate-100 rounded-full w-4/5"></div>
      </div>
    )
  }

  if (!word) return null

  return (
    <div className="airbnb-card border-none group bg-white relative overflow-hidden">
      {/* Loading overlay for refresh */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-[#0099ff] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#0099ff] shadow-[0_0_8px_rgba(0,153,255,0.5)]"></div>
          <span className="label-tertiary">오늘의 말씀</span>
        </div>
        <button
          onClick={() => fetchRandomWord(word.id)}
          disabled={loading}
          className="text-slate-300 hover:text-[#0099ff] transition-colors disabled:opacity-30"
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </button>
      </div>

      <div className="mt-4">
        <QuoteCard word={word} />
      </div>
    </div>
  )
}
