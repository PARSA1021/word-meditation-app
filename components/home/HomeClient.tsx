"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import DailyWord from "@/components/DailyWord";
import { WordStats } from "@/lib/words";
import CategoryCard from "@/components/CategoryCard";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.2, 0.8, 0.2, 1] as const } },
};

interface HomeClientProps {
  stats: WordStats;
}

export default function HomeClient({ stats }: HomeClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const sortedCategories = Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg pb-20 sm:pb-32 overflow-x-hidden relative selection:bg-brand-primary/20">
      {/* Background ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute top-60 right-0 w-[400px] h-[400px] bg-[#00adef]/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto px-6"
      >
        {/* 1. PREMIUM HERO - Refined for Clarity */}
        <header className="pt-16 md:pt-32 pb-10 md:pb-20 text-center flex flex-col items-center">
          <motion.div variants={itemVariants} className="space-y-8 md:space-y-12 max-w-4xl mx-auto w-full">
            <div className="flex flex-col items-center space-y-4 md:space-y-6">
              <div className="inline-flex items-center gap-2 px-4 md:px-5 py-1.5 md:py-2 rounded-full bg-white/60 backdrop-blur-md border border-white/80 shadow-sm text-[10px] md:text-[11px] font-black text-brand-primary uppercase tracking-[0.25em]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
                </span>
                TruePath Meditation
              </div>

              <div className="space-y-3 md:space-y-6">
                <h1 className="text-[52px] sm:text-[64px] md:text-[96px] lg:text-[110px] font-black tracking-tighter text-brand-deep leading-[1] group">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-primary via-[#00adef] to-brand-primary animate-gradient-x">True</span>Path
                </h1>
                <p className="text-[15px] sm:text-[17px] md:text-[20px] text-text-secondary font-medium tracking-tight max-w-xs sm:max-w-xl mx-auto leading-relaxed break-keep">
                  복잡한 일상 속에서 잠시 멈추고,<br className="hidden sm:block" />
                  당신의 영혼을 깨우는 참된 말씀과 조우하세요.
                </p>
              </div>
            </div>
            
            {/* Main Search Experience */}
            <div className="w-full max-w-2xl mx-auto space-y-6 px-2 sm:px-0">
              <form onSubmit={handleSearch} className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-brand-primary/20 via-[#00adef]/20 to-brand-primary/20 rounded-[36px] blur-xl opacity-0 group-focus-within:opacity-100 transition duration-1000"></div>
                <div className="relative flex items-center bg-white/95 backdrop-blur-2xl rounded-[30px] border border-white shadow-premium p-1.5 transition-all group-focus-within:bg-white group-focus-within:shadow-2xl">
                  <div className="flex-1 flex items-center px-5 md:px-7">
                    <span className="text-xl md:text-2xl mr-4 opacity-40">🔍</span>
                    <input 
                      type="text" 
                      placeholder="고민이 있거나 위로가 필요할 때 키워드를 입력해보세요" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 w-full bg-transparent border-none outline-none text-base md:text-lg font-bold placeholder:text-text-muted/50 text-brand-deep"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="bg-brand-primary text-white px-6 md:px-8 py-3.5 md:py-4 rounded-[24px] font-black text-sm md:text-base hover:bg-brand-deep hover:shadow-lg transition-all duration-300 active:scale-95"
                  >
                    검색하기
                  </button>
                </div>
              </form>

              {/* Trending/Suggested Keywords to guide users */}
              <div className="flex flex-wrap justify-center gap-2 md:gap-3 opacity-70">
                <span className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest py-1.5">인기 검색어:</span>
                {["사랑", "평화", "하나님", "위로", "지혜"].map(tag => (
                  <button
                    key={tag}
                    onClick={() => { setSearchQuery(tag); router.push(`/search?q=${encodeURIComponent(tag)}`); }}
                    className="text-[11px] md:text-[12px] font-bold text-slate-500 hover:text-brand-primary transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Quick Service Modules */}
            <div className="w-full flex justify-center max-w-3xl mx-auto px-2 sm:px-0 pt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
                {[
                  { href: "/today", icon: "✨", label: "오늘의 묵상", desc: "매일 새로운 영감", color: "bg-brand-primary/5" },
                  { href: "/library", icon: "📚", label: "주제별 라이브러리", desc: "지혜의 체계적 탐색", color: "bg-indigo-50/50" },
                  { href: "/quiz", icon: "🎯", label: "말씀 퀴즈", desc: "마음에 새기는 훈련", color: "bg-amber-50/50" },
                  { href: "/donate", icon: "🤍", label: "사역 후원", desc: "나눔의 가치", color: "bg-red-50/50" }
                ].map(action => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex flex-col items-center justify-center gap-3 p-5 md:p-6 rounded-[28px] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group"
                  >
                    <div className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-2xl ${action.color} text-2xl md:text-3xl group-hover:scale-110 transition-transform duration-500`}>
                      {action.icon}
                    </div>
                    <div className="text-center">
                      <p className="text-brand-deep font-black text-[13px] md:text-[15px]">{action.label}</p>
                      <p className="text-[10px] md:text-[11px] font-medium text-slate-400 mt-0.5">{action.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </header>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-2 md:my-4" />

        {/* 2. HYBRID CONTENT GRID (Daily Word + Library) */}
        <div className="grid md:grid-cols-12 gap-8 md:gap-16 pt-10 md:pt-24 pb-16 md:pb-20">
          
          {/* Left Column: Daily Word Focus */}
          <motion.section 
            variants={itemVariants}
            className="md:col-span-7 flex flex-col space-y-6 md:space-y-8"
          >
            <div className="flex items-center gap-4">
              <h3 className="text-[12px] md:text-[13px] font-black text-brand-primary uppercase tracking-[0.4em] bg-brand-primary/10 px-4 py-2 rounded-xl">
                Daily Inspiration
              </h3>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>
            
            <div className="w-full relative group">
              <div className="absolute -inset-4 bg-white/40 rounded-[48px] blur-xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
              <div className="relative">
                <DailyWord />
              </div>
            </div>

            {/* Space Filler & Engagement Card (Quiz) */}
            <div className="pt-4 md:pt-2 flex-1 flex flex-col justify-end">
              <Link href="/quiz" className="relative overflow-hidden rounded-[32px] md:rounded-[40px] bg-gradient-to-br from-indigo-500 via-[#00adef] to-brand-primary p-6 md:p-10 text-white shadow-premium hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group border border-white/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-brand-deep/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3 md:space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-[9px] md:text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10 w-fit">
                      Daily Challenge
                    </div>
                    <div>
                      <h4 className="text-xl sm:text-2xl md:text-3xl font-black mb-1.5 md:mb-2 tracking-tight drop-shadow-sm">말씀 퀴즈 도전하기</h4>
                      <p className="text-white/90 font-medium text-[13px] sm:text-sm md:text-base max-w-[240px] break-keep leading-relaxed">
                        오늘 읽은 말씀을 얼마나 기억하시나요? 퀴즈를 통해 진리를 마음에 새겨보세요.
                      </p>
                    </div>
                  </div>
                  
                  <div className="inline-flex items-center justify-center gap-2 text-[13px] md:text-sm font-black bg-white text-brand-deep px-5 md:px-6 py-3.5 md:py-4 rounded-xl md:rounded-2xl group-hover:bg-brand-bg transition-colors shadow-lg w-full md:w-auto shrink-0">
                    시작하기 <span className="text-lg leading-none group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
                
                <div className="absolute -bottom-6 -right-4 text-[90px] md:text-[120px] opacity-20 transform -rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-700 pointer-events-none">
                  🎯
                </div>
              </Link>
            </div>
          </motion.section>

          {/* Right Column: Library Exploration */}
          <motion.section 
            variants={itemVariants}
            className="md:col-span-5 flex flex-col space-y-6 md:space-y-8"
          >
            <div className="flex items-center gap-4">
              <h3 className="text-[12px] md:text-[13px] font-black text-text-muted uppercase tracking-[0.4em]">
                Curated Library
              </h3>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>

            <div className="bg-white/70 backdrop-blur-2xl rounded-[32px] md:rounded-[40px] p-6 sm:p-8 md:p-10 border border-white shadow-premium hover:shadow-2xl transition-shadow duration-500">
              <div className="mb-8 md:mb-10 flex justify-between items-end">
                <div>
                  <h4 className="text-xl sm:text-2xl md:text-3xl font-black text-brand-deep tracking-tight">주제별 탐색</h4>
                  <p className="text-[13px] md:text-sm font-bold text-text-muted mt-1.5 md:mt-2">상황에 맞는 말씀을 찾아보세요</p>
                </div>
                <div className="text-right bg-brand-bg/50 px-3 md:px-4 py-1.5 md:py-2 rounded-[14px] md:rounded-2xl border border-white">
                  <span className="text-xl md:text-2xl font-black text-brand-primary tracking-tighter block">{stats.total.toLocaleString()}</span>
                  <p className="text-[8px] md:text-[9px] text-text-muted font-black uppercase tracking-widest mt-0.5 md:mt-1">Total</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-5">
                {sortedCategories.slice(0, 6).map(([category, count]) => (
                  <CategoryCard
                    key={category}
                    name={category}
                    count={count as number}
                    href={`/library`}
                  />
                ))}
              </div>

              <div className="mt-8 md:mt-10 pt-5 md:pt-6 border-t border-slate-100/80">
                <Link href="/library" className="flex items-center justify-between group p-4 md:p-5 rounded-[20px] md:rounded-[24px] hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-100">
                  <span className="text-[13px] md:text-sm font-black text-brand-deep group-hover:text-brand-primary transition-colors">전체 라이브러리 열기</span>
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-50 border border-slate-100 shadow-sm flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all duration-300 group-hover:scale-110">
                    →
                  </div>
                </Link>
              </div>
            </div>
          </motion.section>

        </div>

        {/* 3. PREMIUM FOOTER CTA */}
        <motion.section 
          variants={itemVariants}
          viewport={{ once: true, margin: "-50px" }}
          className="mt-6 md:mt-12 overflow-hidden rounded-[32px] md:rounded-[48px] bg-brand-deep p-8 md:p-16 text-center relative group"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-primary/30 blur-[100px] rounded-full group-hover:bg-brand-primary/40 transition-colors duration-1000"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#00adef]/20 blur-[100px] rounded-full group-hover:bg-[#00adef]/30 transition-colors duration-1000"></div>
          
          <div className="relative z-10 space-y-8 md:space-y-10 max-w-xl mx-auto">
             <div className="space-y-3 md:space-y-4">
                <div className="inline-flex items-center gap-2 px-4 md:px-5 py-1.5 md:py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[9px] md:text-[10px] font-black text-white uppercase tracking-[0.3em]">
                  The Journey Within
                </div>
                <h3 className="text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tight leading-tight break-keep drop-shadow-lg">
                  세상의 소음을 끄고,<br/>진리에 귀를 기울일 시간
                </h3>
             </div>
             
             <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 pt-2 md:pt-4">
               <Link
                href="/today"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 md:px-10 py-4 md:py-5 bg-brand-primary text-white rounded-full font-black text-base md:text-lg hover:bg-white hover:text-brand-deep transition-all active:scale-95 shadow-xl"
              >
                오늘의 묵상 시작하기
                <span className="text-xl">✨</span>
               </Link>
               <Link
                href="/donate"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 md:px-10 py-4 md:py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-black text-base md:text-lg hover:bg-white/20 transition-all active:scale-95"
              >
                사역 후원하기
                <span className="text-xl">🤍</span>
               </Link>
             </div>
          </div>
        </motion.section>
      </motion.div>

    </div>
  );
}
