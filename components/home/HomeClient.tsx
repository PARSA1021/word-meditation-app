"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import DailyWord from "@/components/DailyWord";
import { WordStats } from "@/lib/words";
import CategoryCard from "@/components/CategoryCard";
import QuickActionBtn from "@/components/QuickActionBtn";
import React from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] } },
};

interface HomeClientProps {
  stats: WordStats;
}

export default function HomeClient({ stats }: HomeClientProps) {
  const sortedCategories = Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1]);

  return (
    <div className="min-h-screen bg-brand-bg pb-32 overflow-x-hidden">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-6"
      >
        {/* 1. HERO & BRANDING */}
        <header className="pt-20 pb-12">
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/5 border border-brand-primary/10 text-[10px] font-black text-brand-primary uppercase tracking-[0.25em]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
              </span>
              TruePath Calm Edition
            </div>

            <div className="space-y-4">
              <h1 className="text-[56px] md:text-[64px] font-black tracking-tight text-brand-deep leading-[0.9] group">
                True<span className="text-brand-primary transition-all duration-500 group-hover:drop-shadow-[0_0_20px_rgba(0,136,238,0.3)]">Path</span>
              </h1>
              <p className="text-[17px] text-text-secondary font-medium tracking-tight max-w-[360px] leading-relaxed break-keep">
                매일 말씀으로 삶의 방향을 찾고,<br/>
                오늘 하루를 진리 위에 단단하게 세웁니다.
              </p>
            </div>
          </motion.div>
        </header>

        {/* 2. SEARCH HERO */}
        <motion.section variants={itemVariants} className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary/20 to-blue-600/10 blur-2xl opacity-40 group-hover:opacity-100 transition-opacity duration-1000"></div>
          <Link
            href="/search"
            className="relative flex h-28 bg-white border border-slate-100 rounded-[36px] items-center px-8 justify-between shadow-premium hover:shadow-active hover:border-brand-primary/20 transition-all duration-700 active:scale-[0.98]"
          >
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-brand-primary rounded-[20px] flex items-center justify-center text-white text-2xl shadow-lg shadow-brand-primary/25">
                🔍
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[20px] font-black text-brand-deep tracking-tight">지혜의 말씀 검색</span>
                <span className="text-[12px] text-text-muted font-bold uppercase tracking-wider">Search thousands of verses</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all duration-500 shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </motion.section>

        {/* 3. LIBRARY GRID */}
        <motion.section variants={itemVariants} className="pt-20 space-y-10">
          <div className="flex justify-between items-end px-2">
            <div className="space-y-2">
              <p className="text-[11px] font-black text-brand-primary uppercase tracking-[0.3em]">Curated Library</p>
              <h2 className="heading-lg">주제별 탐색</h2>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-brand-deep tracking-tighter block">{stats.total.toLocaleString()}</span>
              <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-1">Total Verses</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            {sortedCategories.slice(0, 6).map(([category, count]) => (
              <CategoryCard
                key={category}
                name={category}
                count={count as number}
                href={`/category/${encodeURIComponent(category)}`}
              />
            ))}
          </div>

          <div className="text-center pt-2">
            <Link href="/category" className="text-sm font-black text-text-secondary hover:text-brand-primary transition-all flex items-center justify-center gap-2 group">
              전체 카테고리 보기 <span className="group-hover:translate-x-1.5 transition-transform duration-300">→</span>
            </Link>
          </div>
        </motion.section>

        {/* 4. DAILY WORD SECTION */}
        <motion.section variants={itemVariants} className="pt-24 space-y-8">
          <div className="flex items-center gap-6 px-4">
            <div className="h-px bg-slate-100 flex-1"></div>
            <h3 className="text-[11px] font-black text-text-muted uppercase tracking-[0.4em]">Daily Inspiration</h3>
            <div className="h-px bg-slate-100 flex-1"></div>
          </div>
          <div className="mx-auto max-w-[600px]">
            <DailyWord />
            <p className="text-center text-[12px] text-text-muted font-bold mt-8 italic px-10 leading-relaxed">
              "평온한 마음으로 말씀을 묵상하며 하루를 단단하게 매듭지으세요."
            </p>
          </div>
        </motion.section>

        {/* 5. QUICK ACTIONS */}
        <motion.section variants={itemVariants} className="pt-20 pb-10">
           <div className="flex justify-center gap-8 md:gap-12 flex-wrap">
            <QuickActionBtn href="/search" icon="🔭" text="검색" />
            <QuickActionBtn href="/category" icon="📁" text="주제별" />
            <QuickActionBtn href="/quiz" icon="✨" text="퀴즈" />
            <QuickActionBtn href="/donate" icon="🤍" text="후원" />
            <QuickActionBtn href="/today" icon="🌅" text="묵상" />
          </div>
        </motion.section>

        {/* 6. FINAL CTA CARD */}
        <motion.section variants={itemVariants} className="mt-10 overflow-hidden rounded-[40px] bg-white p-10 md:p-14 text-center border border-slate-100 shadow-premium relative group">
           <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-primary/5 blur-[80px] rounded-full group-hover:bg-brand-primary/10 transition-colors duration-1000"></div>
           <div className="relative z-10 space-y-8 max-w-sm mx-auto">
             <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/5 text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">
                  The Journey Within
                </div>
                <h3 className="text-2xl font-black text-brand-deep tracking-tight leading-tight break-keep">
                  말씀과 함께하는<br/>흔들리지 않는 삶
                </h3>
             </div>
             
             <Link
              href="/today"
              className="btn-primary inline-flex items-center gap-3 w-full justify-center group/btn shadow-xl shadow-brand-primary/20"
            >
              오늘의 묵상 시작하기
              <span className="text-xl group-hover/btn:-translate-y-1 transition-transform">✨</span>
            </Link>
            
            <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.5em]">TruePath Essentials</p>
           </div>
        </motion.section>
      </motion.div>
    </div>
  );
}
