"use client";

import { useState, useEffect } from "react";
import { useRandomWord } from "@/shared/hooks/useRandomWord";
import { Skeleton, QuoteSkeleton } from "@/shared/ui/Skeleton";
import QuoteCard from "@/shared/ui/QuoteCard";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import PushSubscriber from "@/shared/components/PushSubscriber";

export default function TodayPage() {
  const { data: word, isLoading, isValidating, refreshWord } = useRandomWord();
  const [direction, setDirection] = useState(0);
  const [textSize, setTextSize] = useState<"normal" | "large">("normal");

  // 키보드 방향키 단축키 지원 (인터랙션 요구사항)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setDirection(1);
        refreshWord(word?.id);
      } else if (e.key === 'ArrowLeft') {
        setDirection(-1);
        refreshWord(word?.id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [refreshWord, word?.id]);

  // Framer Motion 스와이프 지원
  const handleDragEnd = (e: any, { offset }: any) => {
    const swipeThreshold = 50;
    if (offset.x < -swipeThreshold) {
      setDirection(1);
      refreshWord(word?.id);
    } else if (offset.x > swipeThreshold) {
      setDirection(-1);
      refreshWord(word?.id);
    }
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 50 : -50, opacity: 0, filter: 'blur(4px)' }),
    center: { x: 0, opacity: 1, filter: 'blur(0px)' },
    exit: (dir: number) => ({ x: dir < 0 ? 50 : -50, opacity: 0, filter: 'blur(4px)' }),
  };

  if (!word && isLoading) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] pb-20 transition-colors duration-500">
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-6 py-5">
           <div className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto h-12 flex items-center">
             <Skeleton className="w-32 h-6" />
           </div>
        </header>
        <main className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-6 pt-10">
          <QuoteSkeleton />
        </main>
      </div>
    );
  }

  if (!word) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center p-6">
        <p className="text-slate-400">말씀을 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-[100dvh] pb-20 relative overflow-hidden transition-colors duration-500 bg-[#F2F2F7] ${textSize === 'large' ? 'text-size-large' : ''}`}>
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

            <div className="flex items-center gap-1.5 md:gap-2">
              {/* PWA: 푸시 알림 구독 버튼 (데스크톱에서는 크게, 태블릿에서는 숨기거나 아이콘화 가능. 현재는 lg이상에서만 보이도록 조정) */}
              <div className="hidden xl:block mr-2">
                <PushSubscriber />
              </div>
              
              {/* 접근성: 글자 크기 토글 */}
              <button
                onClick={() => setTextSize(s => s === 'normal' ? 'large' : 'normal')}
                className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${textSize === 'large' ? 'bg-[#0099FF] text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                aria-label="글자 크기 조절"
                title="글자 크기 조절"
              >
                T
              </button>
              
              {/* 데스크탑에서만 보이는 새로고침 (모바일은 Bottom Nav) */}
              <button
                onClick={() => { setDirection(1); refreshWord(word?.id); }}
                disabled={isValidating}
                className={`hidden md:flex w-10 h-10 items-center justify-center rounded-xl transition-all duration-300
                  ${isValidating
                    ? 'bg-slate-100 text-slate-400'
                    : 'bg-white shadow-sm border border-slate-100 hover:border-[#0099FF] hover:text-[#0099FF] active:scale-95'
                  }`}
                aria-label="새로운 말씀 보기"
              >
                <svg className={`w-4 h-4 transition-transform ${isValidating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content (적응형 레이아웃: PC max-width, 모바일 Full Screen) */}
      <main className="w-full max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-6 pt-10 pb-16 flex flex-col items-center">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.article
            key={word.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 280, damping: 25 }}
            layout
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="w-full cursor-grab active:cursor-grabbing touch-pan-y"
            aria-live="polite"
          >
            <QuoteCard word={word} showCategory={true} />
          </motion.article>
        </AnimatePresence>

        <div className="mt-14 mb-8 text-center opacity-80">
          <p className="text-sm font-medium text-slate-500 mb-6">
            좌우로 스와이프하거나 방향키로 넘기세요
          </p>
          {/* 모바일 및 태블릿용 알림 버튼 (xl 미만에서 모두 표시) */}
          <div className="xl:hidden flex justify-center px-4 w-full">
             <PushSubscriber />
          </div>
        </div>
      </main>

      {/* 모바일 Bottom Navigation (모바일에서 한 손 조작) */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-xl border-t border-slate-200 md:hidden flex justify-between items-center px-6 z-40 transition-colors duration-500">
        <button 
          onClick={() => { setDirection(-1); refreshWord(word?.id); }} 
          className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg active:scale-95 transition-all"
        >
          ← 이전
        </button>
        <button 
          onClick={() => { setDirection(1); refreshWord(word?.id); }} 
          disabled={isValidating}
          className={`p-3 rounded-full shadow-sm transition-all ${isValidating ? 'bg-slate-100 text-slate-400 animate-spin' : 'bg-[#0099FF] text-white active:scale-95'}`}
        >
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
           </svg>
        </button>
        <button 
          onClick={() => { setDirection(1); refreshWord(word?.id); }} 
          className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg active:scale-95 transition-all"
        >
          다음 →
        </button>
      </nav>

      {/* Refresh Overlay for PC */}
      {isValidating && word && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm z-30 flex items-center justify-center hidden md:flex pointer-events-none transition-colors duration-500">
          <div className="flex flex-col items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-6 h-6 border-3 border-[#0099FF] border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      )}
    </div>
  );
}