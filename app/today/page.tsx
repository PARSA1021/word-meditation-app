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

  // 키보드 방향키 단축키 지원
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setDirection(1);
        refreshWord(word?.id);
      } else if (e.key === "ArrowLeft") {
        setDirection(-1);
        refreshWord(word?.id);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [refreshWord, word?.id]);

  // Framer Motion 스와이프 지원
  const handleDragEnd = (_e: unknown, { offset }: { offset: { x: number } }) => {
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
    enter: (dir: number) => ({ x: dir > 0 ? 50 : -50, opacity: 0, filter: "blur(4px)" }),
    center: { x: 0, opacity: 1, filter: "blur(0px)" },
    exit: (dir: number) => ({ x: dir < 0 ? 50 : -50, opacity: 0, filter: "blur(4px)" }),
  };

  if (!word && isLoading) {
    return (
      <div className="min-h-[100dvh] bg-[#F8F9FA] pb-20 transition-colors duration-500 flex flex-col">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-100 px-6 py-5">
          <div className="max-w-4xl mx-auto h-12 flex items-center">
            <Skeleton className="w-32 h-6" />
          </div>
        </header>
        <main className="flex-1 w-full max-w-4xl mx-auto px-6 pt-10 flex flex-col justify-center pb-24">
          <QuoteSkeleton />
        </main>
      </div>
    );
  }

  if (!word) {
    return (
      <div className="min-h-[100dvh] bg-[#F8F9FA] flex items-center justify-center p-6">
        <p className="text-slate-400 font-medium">말씀을 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-[100dvh] flex flex-col relative overflow-x-hidden transition-colors duration-500 bg-[#F8F9FA] ${
        textSize === "large" ? "text-size-large" : ""
      }`}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-white/50 shadow-sm px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-2">
            {/* 왼쪽: 뒤로가기 + 타이틀 */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <Link
                href="/"
                className="w-10 h-10 shrink-0 flex items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 hover:border-slate-300 hover:shadow-md active:scale-95 transition-all duration-300 group"
              >
                <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div className="min-w-0">
                <h1 className="text-[17px] sm:text-xl font-black tracking-tight text-slate-800 truncate">
                  오늘의 말씀
                </h1>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#0099FF] mt-0.5">
                  DAILY INSPIRATION
                </p>
              </div>
            </div>

            {/* 오른쪽: 액션 버튼들 */}
            <div className="flex items-center gap-2 shrink-0">
              {/* 알림 구독 버튼 */}
              <PushSubscriber />

              {/* 글자 크기 토글 */}
              <button
                onClick={() => setTextSize((s) => (s === "normal" ? "large" : "normal"))}
                className={`w-10 h-10 flex items-center justify-center rounded-2xl font-black text-sm transition-all duration-300 ${
                  textSize === "large"
                    ? "bg-[#0099FF] text-white shadow-md shadow-blue-500/20 scale-105"
                    : "bg-white text-slate-400 border border-slate-100 hover:text-slate-700 hover:border-slate-300 shadow-sm active:scale-95"
                }`}
                aria-label="글자 크기 조절"
                title="글자 크기 조절"
              >
                <span className={textSize === "large" ? "text-[15px]" : "text-[13px]"}>T</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center relative min-h-[60vh]">
        {/* Desktop Navigation Arrows (Visible only on lg screens) */}
        <div className="hidden lg:flex absolute left-[-60px] top-1/2 -translate-y-1/2">
           <button
            onClick={() => { setDirection(-1); refreshWord(word?.id); }}
            className="w-14 h-14 rounded-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#0099FF] hover:scale-110 hover:shadow-[0_8px_30px_rgba(0,153,255,0.15)] active:scale-95 transition-all duration-300"
            aria-label="이전 말씀"
          >
            <svg className="w-6 h-6 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
          </button>
        </div>
        
        <div className="hidden lg:flex absolute right-[-60px] top-1/2 -translate-y-1/2">
           <button
            onClick={() => { setDirection(1); refreshWord(word?.id); }}
            className="w-14 h-14 rounded-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#0099FF] hover:scale-110 hover:shadow-[0_8px_30px_rgba(0,153,255,0.15)] active:scale-95 transition-all duration-300"
            aria-label="다음 말씀"
          >
            <svg className="w-6 h-6 -mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.article
            key={word.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            layout
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.3}
            onDragEnd={handleDragEnd}
            className="w-full cursor-grab active:cursor-grabbing touch-pan-y z-10"
            aria-live="polite"
          >
            <QuoteCard word={word} showCategory={true} />
          </motion.article>
        </AnimatePresence>

        <div className="mt-12 text-center opacity-60 pb-24 lg:pb-0">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest hidden lg:block">
            키워드 방향키(←, →)로 넘기기
          </p>
          <p className="text-[12px] font-medium text-slate-500 lg:hidden">
            좌우로 스와이프하여 새로운 말씀 읽기
          </p>
        </div>
      </main>

      {/* 모바일/태블릿 Floating Bottom Navigation (Premium Pill Style) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden pb-[calc(env(safe-area-inset-bottom)+1.5rem)] px-6 pointer-events-none flex justify-center">
        <nav className="pointer-events-auto flex items-center gap-2 bg-white/90 backdrop-blur-2xl border border-slate-200/60 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)] p-2 rounded-[2rem]">
          <button
            onClick={() => {
              setDirection(-1);
              refreshWord(word?.id);
            }}
            className="flex items-center gap-1.5 px-4 sm:px-6 py-3 text-[13px] font-black text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-full active:scale-95 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
            <span className="hidden sm:inline">이전</span>
          </button>
          
          <button
            onClick={() => {
              setDirection(1);
              refreshWord(word?.id);
            }}
            disabled={isValidating}
            aria-label="새로운 말씀 보기"
            className={`flex items-center justify-center w-12 h-12 rounded-full shadow-md transition-all ${
              isValidating
                ? "bg-slate-100 text-slate-400 shadow-none"
                : "bg-gradient-to-tr from-[#0099FF] to-[#00bfff] text-white hover:shadow-lg hover:shadow-blue-500/30 active:scale-90"
            }`}
          >
            <svg
              className={`w-5 h-5 ${isValidating ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          
          <button
            onClick={() => {
              setDirection(1);
              refreshWord(word?.id);
            }}
            className="flex items-center gap-1.5 px-4 sm:px-6 py-3 text-[13px] font-black text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-full active:scale-95 transition-all"
          >
            <span className="hidden sm:inline">다음</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
          </button>
        </nav>
      </div>

      {/* PC 로딩 오버레이 */}
      {isValidating && word && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm z-30 hidden lg:flex items-center justify-center pointer-events-none transition-colors duration-500">
          <div className="flex flex-col items-center bg-white p-5 rounded-3xl shadow-xl shadow-black/5 border border-slate-100/50">
            <div className="w-8 h-8 border-[3.5px] border-[#0099FF] border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      )}
    </div>
  );
}