"use client";

import React from "react";
import { useBookmarks } from "@/context/BookmarkContext";
import QuoteCard from "@/components/QuoteCard";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function SavedPage() {
  const { bookmarks } = useBookmarks();

  return (
    <div className="min-h-screen bg-brand-bg pb-32">
      <div className="max-w-4xl mx-auto px-6 pt-12 md:pt-20">
        <header className="mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            Personal Collection
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-brand-deep tracking-tight">저장된 말씀</h1>
          <p className="text-slate-500 font-medium mt-3 text-sm md:text-base">
            마음에 새기고 싶은 소중한 말씀들을 한곳에 모았습니다.
          </p>
        </header>

        <AnimatePresence mode="popLayout">
          {bookmarks.length > 0 ? (
            <motion.div 
              layout
              className="grid gap-6 md:gap-8"
            >
              {bookmarks.map((word) => (
                <QuoteCard key={word.id} word={word} showCategory={true} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-20 text-center space-y-8 bg-white/50 backdrop-blur-xl rounded-[40px] border border-white shadow-premium"
            >
              <div className="w-24 h-24 bg-white rounded-[32px] shadow-sm flex items-center justify-center text-5xl mx-auto opacity-50">
                🤍
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-black text-brand-deep">아직 저장된 말씀이 없어요</h3>
                <p className="text-sm font-medium text-slate-400 px-10 break-keep leading-relaxed">
                  묵상 중 마음에 와닿는 말씀을 발견하면<br/>
                  하트 버튼을 눌러 이곳에 저장해보세요.
                </p>
              </div>
              <Link
                href="/today"
                className="inline-flex items-center justify-center px-8 py-4 bg-brand-primary text-white rounded-2xl font-black text-sm hover:bg-brand-deep transition-all active:scale-95 shadow-lg shadow-brand-primary/20"
              >
                오늘의 말씀 보러가기
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
