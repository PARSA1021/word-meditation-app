"use client";

import React from "react";
import { useBookmarks } from "@/features/meditation/context/BookmarkContext";
import QuoteCard from "@/shared/ui/QuoteCard";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function SavedPage() {
  const { bookmarks } = useBookmarks();

  return (
    <div className="min-h-screen bg-brand-bg transition-colors duration-500 pb-20 md:pb-32 selection:bg-red-500/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 md:pt-24">
        
        {/* 상단 타이틀 섹션 */}
        <header className="mb-10 sm:mb-14 md:mb-20 text-center md:text-left relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 bg-red-400/5 rounded-full blur-[80px] md:blur-[100px] -z-10" />
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-red-50/60 backdrop-blur-sm border border-red-100/50 text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-widest mb-4 sm:mb-6 shadow-sm">
            <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-red-500"></span>
            </span>
            참사랑 말씀 훈독함
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-[64px] font-bold text-brand-deep tracking-tight md:tracking-tighter leading-none font-serif mb-3 sm:mb-4">
            참사랑의 <span className="text-red-500 font-serif">말씀</span>
          </h1>
          <div className="w-8 sm:w-12 h-0.5 sm:h-1 bg-red-500/20 mx-auto md:mx-0 rounded-full mb-4 sm:mb-6" />
          <p className="text-slate-500 font-medium text-xs sm:text-sm md:text-lg max-w-xl mx-auto md:mx-0 leading-relaxed break-keep">
            하늘부모님과 참부모님의 심정과 은사가 가득한 생명의 말씀입니다.
          </p>
        </header>

        {/* 말씀 리스트 영역 */}
        <AnimatePresence mode="popLayout">
          {bookmarks.length > 0 ? (
            <motion.div 
              layout
              className="grid gap-6 sm:gap-10 md:gap-14 pb-20 sm:pb-32"
            >
              {bookmarks.map((word, index) => (
                <motion.div
                  key={word.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.2) }}
                >
                  <QuoteCard word={word} showCategory={true} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* 빈 화면 영역 (명조/개조식 문구 적용) */
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-16 sm:py-24 md:py-32 text-center space-y-8 sm:space-y-10 bg-white border border-slate-100 rounded-2xl shadow-premium max-w-2xl mx-auto px-6 sm:px-10 backdrop-blur-md"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 mx-auto border border-slate-200/40 shadow-inner">
                <svg className="w-7 h-7 sm:w-9 sm:h-9 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-brand-deep tracking-tight">정성으로 담은 말씀 없음</h3>
                <p className="text-xs sm:text-sm font-medium text-slate-400 max-w-sm mx-auto leading-relaxed break-keep px-4">
                  훈독 중 영인체에 감동을 준 구절을 하트 버튼으로 보관할 수 있습니다.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/today"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:px-8 sm:py-4 bg-brand-deep text-white rounded-xl text-xs sm:text-sm font-bold tracking-wider hover:bg-brand-primary active:scale-95 transition-all shadow-lg shadow-brand-deep/10 w-full sm:w-auto"
                >
                  <span>오늘의 생명 말씀 훈독</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}