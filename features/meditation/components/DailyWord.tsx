"use client"

import { useState, useEffect, useCallback } from "react"
import { Word } from "@/shared/types/word"
import QuoteCard from "@/shared/ui/QuoteCard"
import { RefreshCw } from "lucide-react"

export default function DailyWord() {
  const [word, setWord] = useState<Word | null>(null)
  const [loading, setLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

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
    setIsMounted(true)
    fetchRandomWord()
  }, [fetchRandomWord])

  // 1. 스켈레톤 (로딩) 상태 반응형 레이아웃
  if (!isMounted || (!word && loading)) {
    return (
      <div className="premium-card p-5 sm:p-6 md:p-8 min-h-[180px] sm:min-h-[220px] md:min-h-[260px] animate-pulse flex flex-col justify-center gap-4 bg-white w-full mb-6 lg:mb-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-200"></div>
            <div className="h-3 bg-slate-200 rounded-full w-20"></div>
          </div>
          <div className="w-6 h-6 bg-slate-100 rounded-lg"></div>
        </div>
        <div className="space-y-2 flex-1 flex flex-col justify-center">
          <div className="h-4 bg-slate-100 rounded-full w-full"></div>
          <div className="h-4 bg-slate-100 rounded-full w-11/12"></div>
        </div>
        <div className="h-3 bg-slate-50 rounded-full w-28 mt-4"></div>
      </div>
    )
  }

  if (!word) {
    return (
      <div className="premium-card p-6 text-center text-text-muted text-xs font-semibold bg-white w-full mb-6 lg:mb-0">
        오늘의 말씀을 불러올 수 없습니다.
      </div>
    )
  }

  return (
    /* 
      [💡 하단 탭바 겹침 현상 해결의 핵심 패치]
      - 내부를 억지로 밀어내던 불안정한 빈 div 스페이서(pb-safe-offset-20)를 완전히 제거했습니다.
      - 대신 카드 자체의 외곽 하단 마진인 'mb-8 lg:mb-0'을 부여했습니다.
      - 이렇게 하면 모바일 환경에서 카드 자체가 내비게이션 바 위로 확실히 붕 떠서 배치되며,
        대화면(lg) 이상으로 가면 마진이 자동으로 해제되어 레이아웃이 꽉 맞물리게 됩니다.
    */
    <div className="premium-card p-5 sm:p-6 md:p-8 bg-white relative overflow-hidden flex flex-col justify-between h-full w-full group transition-all duration-300 shadow-sm hover:shadow-md border border-slate-200/60 mb-8 lg:mb-0">
      
      {/* 데이터 동기화 리프레시 백드롭 레이어 */}
      {loading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[1.5px] z-20 flex items-center justify-center transition-all duration-300">
          <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* 2. 상단 메타 헤더 영역 */}
      <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary/40 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary shadow-[0_0_8px_rgba(0,136,238,0.4)]"></span>
          </span>
          <span className="text-xs sm:text-sm font-bold text-brand-primary tracking-tight">
            오늘의 말씀
          </span>
        </div>
        
        <button
          onClick={() => fetchRandomWord(word.id)}
          disabled={loading}
          className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-brand-primary hover:bg-brand-primary/5 transition-all active:scale-90 disabled:opacity-30 shrink-0"
          title="다른 말씀 보기"
        >
          <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 3. 말씀 본문 영역 (QuoteCard 가변 확장 반응형 바인딩) */}
      <div className="flex-1 flex flex-col justify-center text-left w-full overflow-hidden">
        <div className="text-sm sm:text-base md:text-lg lg:text-xl font-medium text-brand-deep leading-relaxed tracking-wide break-keep">
          <QuoteCard word={word} />
        </div>
      </div>
      
    </div>
  )
}