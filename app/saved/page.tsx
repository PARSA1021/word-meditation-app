"use client";

import React from "react";
import { useBookmarks } from "@/features/meditation/context/BookmarkContext";
import QuoteCard from "@/shared/ui/QuoteCard";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function SavedPage() {
  const { bookmarks } = useBookmarks();

  return (
    <div className="min-h-screen bg-brand-bg transition-colors duration-500 pb-24 md:pb-32">
      <div className="max-w-4xl mx-auto px-6 pt-12 md:pt-24">
        
        {/* Sanctuary Header Section */}
        <header className="mb-14 md:mb-20 text-center md:text-left relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-400/5 rounded-full blur-[100px] -z-10" />
          
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-sm bg-red-50/50 backdrop-blur-sm border border-red-100/50 text-[10px] font-black text-red-500 uppercase tracking-[0.4em] mb-6 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            Personal Collection
          </div>
          
          <h1 className="text-[40px] md:text-[64px] font-black text-brand-deep tracking-tighter leading-[1] font-serif mb-4">
            저장된 <span className="text-red-500">말씀</span>
          </h1>
          <div className="w-12 h-1 bg-red-500/20 mx-auto md:mx-0 rounded-full mb-6" />
          <p className="text-slate-500 font-medium text-base md:text-lg max-w-xl mx-auto md:mx-0 leading-relaxed break-keep">
            영혼의 양식이 되어준 소중한 말씀들을<br className="md:hidden" />
            이곳에서 언제든 다시 꺼내어 묵상해보세요.
          </p>
        </header>

        <AnimatePresence mode="popLayout">
          {bookmarks.length > 0 ? (
            <motion.div 
              layout
              className="grid gap-10 md:gap-16 pb-32"
            >
              {bookmarks.map((word, index) => (
                <motion.div
                  key={word.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <QuoteCard word={word} showCategory={true} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-24 md:py-32 text-center space-y-10 bg-white/40 backdrop-blur-xl rounded-sm border border-brand-primary/5 shadow-premium max-w-2xl mx-auto px-10"
            >
              <div className="w-24 h-24 bg-slate-50 rounded-sm shadow-inner-soft flex items-center justify-center text-5xl mx-auto group">
                <span className="group-hover:animate-bounce">💝</span>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-brand-deep tracking-tight">아직 담긴 지혜가 없습니다</h3>
                <p className="text-[15px] font-medium text-slate-400 max-w-sm mx-auto leading-relaxed break-keep">
                  묵상 중 마음에 와닿는 말씀을 발견하면<br/>
                  하트 버튼을 눌러 나만의 보물함을 채워보세요.
                </p>
              </div>
              <Link
                href="/today"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-brand-deep text-white rounded-sm text-[13px] font-black uppercase tracking-widest hover:bg-brand-primary transition-all active:scale-95 shadow-xl shadow-brand-deep/10"
              >
                📔 <span>오늘의 말씀 탐색하기</span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
