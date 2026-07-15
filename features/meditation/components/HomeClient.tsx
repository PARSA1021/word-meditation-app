"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import DailyWord from "@/features/meditation/components/DailyWord";
import { WordStats } from "@/shared/types/word";
import CategoryCard from "@/shared/ui/CategoryCard";
import React, { useState, useEffect } from "react"; // ✅ useEffect 추가
import { useRouter } from "next/navigation";
import { 
  Search, 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  Heart, 
  User, 
  Leaf, 
  Lightbulb, 
  Home, 
  Anchor, 
  ArrowRight
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

interface HomeClientProps {
  stats: WordStats;
}

export default function HomeClient({ stats }: HomeClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const categoryIcons: Record<string, React.ReactNode> = {
    "사랑": <Heart className="w-4 h-4 text-rose-500 shrink-0" />,
    "평화": <Anchor className="w-4 h-4 text-sky-500 shrink-0" />,
    "하나님": <Anchor className="w-4 h-4 text-brand-primary shrink-0" />,
    "위로": <Leaf className="w-4 h-4 text-emerald-500 shrink-0" />,
    "지혜": <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />,
    "가정": <Home className="w-4 h-4 text-indigo-500 shrink-0" />,
    "믿음": <User className="w-4 h-4 text-violet-500 shrink-0" />,
    "소망": <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
  };

  const sortedCategories = Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleTagClick = (tag: string) => {
    router.push(`/search?q=${encodeURIComponent(tag)}`);
  };

  return (
    <div className="min-h-screen bg-brand-bg pb-24 sm:pb-28 lg:pb-20 overflow-x-hidden relative selection:bg-brand-primary/20">
      
      {/* 앰비언트 소프트 광원 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] max-w-[1000px] h-[300px] md:h-[450px] bg-brand-primary/3 rounded-full blur-[100px] md:blur-[150px] -z-10 pointer-events-none" />
      <div className="absolute bottom-20 right-0 w-[30%] max-w-[400px] h-[400px] bg-sky-400/2 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 w-full space-y-10 sm:space-y-14 md:space-y-16"
      >
        {/* 1. HERO HEADER AREA */}
        <header className="pt-10 sm:pt-16 md:pt-20 text-center flex flex-col items-center">
          <div className="space-y-5 md:space-y-6 max-w-2xl mx-auto w-full">
            <div className="flex flex-col items-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/60 shadow-2xs text-[10px] font-bold text-brand-primary tracking-widest uppercase">
                TruePath Meditation
              </div>
              <p className="text-xs sm:text-sm font-semibold text-brand-primary/80 tracking-tight">
                참부모님·천일국 말씀 디지털 라이브러리
              </p>
            </div>

            <div className="space-y-2">
              <h1 className="text-[48px] sm:text-[68px] md:text-[84px] font-black tracking-tighter text-brand-deep leading-none">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-[#00adef]">True</span>Path
              </h1>
              <p className="text-sm sm:text-base text-text-secondary font-medium tracking-tight max-w-xs sm:max-w-md mx-auto leading-relaxed break-keep">
                복잡한 일상 속 한 줄기 빛,<br />
                당신의 영혼을 깨우는 참된 묵상 고리
              </p>
            </div>
            
            <div className="w-full space-y-4 pt-2">
              <form onSubmit={handleSearch} className="relative group max-w-xl mx-auto">
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary/10 to-[#00adef]/10 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition duration-300"></div>
                <div className="relative flex items-center bg-white rounded-2xl border border-slate-200 shadow-premium p-1.5 transition-all group-focus-within:border-brand-primary/30">
                  <div className="flex-1 flex items-center px-3 sm:px-4">
                    <Search className="w-4 h-4 sm:w-5 h-5 text-slate-400 mr-2 shrink-0" />
                    <input 
                      type="text" 
                      placeholder="키워드로 말씀 찾기 (예: 사랑, 평화, 기도)" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 w-full bg-transparent border-none outline-none text-sm sm:text-base font-bold placeholder:text-text-muted/50 text-brand-deep py-2"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="bg-brand-primary text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-brand-deep transition-colors active:scale-97 whitespace-nowrap"
                  >
                    검색
                  </button>
                </div>
              </form>

              <div className="flex flex-wrap justify-center gap-1.5 text-xs">
                {["사랑", "가정", "평화", "기도"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className="inline-flex items-center text-slate-500 hover:text-brand-primary hover:bg-brand-primary/5 bg-white/60 px-2.5 py-1 rounded-lg border border-slate-200/60 transition-all font-medium"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 4분할 핵심 메뉴 */}
            <div className="w-full max-w-2xl mx-auto pt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
                {[
                  { href: "/today", icon: <Sparkles className="w-5 h-5 text-brand-primary" />, label: "오늘의 묵상", desc: "매일 새로운 영감", color: "bg-brand-primary/5" },
                  { href: "/library", icon: <BookOpen className="w-5 h-5 text-indigo-500" />, label: "라이브러리", desc: "체계적인 탐색", color: "bg-indigo-50" },
                  { href: "/quiz", icon: <HelpCircle className="w-5 h-5 text-amber-500" />, label: "말씀 퀴즈", desc: "기억 심화 훈련", color: "bg-amber-50" },
                  { href: "/saved", icon: <Heart className="w-5 h-5 text-rose-500" />, label: "북마크", desc: "저장한 말씀 확인", color: "bg-rose-50" }
                ].map((action, i) => (
                  <Link
                    key={i}
                    href={action.href}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white/90 border border-slate-200/50 shadow-2xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 group"
                  >
                    <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${action.color} group-hover:scale-105 transition-transform`}>
                      {action.icon}
                    </div>
                    <div className="text-center">
                      <p className="text-brand-deep font-bold text-xs sm:text-sm">{action.label}</p>
                      <p className="text-[10px] font-medium text-slate-400 mt-0.5">{action.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* 2. HYBRID CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 xl:gap-12 items-stretch">
          
          {/* Left Column */}
          <section className="lg:col-span-7 flex flex-col space-y-5">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider bg-brand-primary/5 px-2.5 py-1 rounded-md">
                Inspiration
              </span>
              <div className="h-px bg-slate-200/70 flex-1"></div>
            </div>
            
            <div className="w-full flex-1 flex flex-col">
              <DailyWord />
            </div>

            <div className="w-full">
              <Link 
                href="/quiz" 
                className="relative block overflow-hidden rounded-2xl bg-white p-5 sm:p-6 text-brand-deep shadow-sm border border-slate-200/70 hover:border-brand-primary/20 transition-all duration-300 group"
              >
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-left space-y-1">
                    <div className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                      QUIZ
                    </div>
                    <h4 className="text-base sm:text-lg font-black tracking-tight text-brand-deep">
                      오늘의 말씀 피드백
                    </h4>
                    <p className="text-text-secondary font-medium text-xs sm:text-sm">
                      간단한 말씀 퀴즈로 오늘의 은혜를 깊이 새겨보세요.
                    </p>
                  </div>
                  
                  <div className="inline-flex items-center justify-center gap-1 text-xs font-bold bg-brand-primary text-white px-4 py-2.5 rounded-xl group-hover:bg-brand-deep transition-colors shrink-0 w-full sm:w-auto">
                    <span>도전하기</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            </div>
          </section>

          {/* Right Column */}
          <section className="lg:col-span-5 flex flex-col space-y-5">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-md">
                Discovery
              </span>
              <div className="h-px bg-slate-200/70 flex-1"></div>
            </div>

            <div className="bg-white rounded-2xl p-5 sm:p-6 md:p-7 border border-slate-200/70 shadow-sm flex flex-col justify-between h-full flex-1">
              <div>
                <div className="mb-5 flex justify-between items-center">
                  <div className="space-y-0.5">
                    <h4 className="text-base sm:text-lg font-black text-brand-deep tracking-tight">주제별 탐색</h4>
                    <p className="text-xs font-semibold text-text-muted">에센셜 카테고리</p>
                  </div>
                  <div className="text-right bg-brand-primary/5 px-2.5 py-1 rounded-lg border border-brand-primary/10">
                    <span className="text-sm font-black text-brand-primary leading-none block">{stats.total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2">
                  {sortedCategories.slice(0, 6).map(([category, count]) => (
                    <div 
                      key={category}
                      className="group/card rounded-xl border border-slate-100 bg-slate-50/50 p-0.5 hover:border-brand-primary/15 hover:bg-white transition-all duration-300"
                    >
                      <CategoryCard
                        name={
                          (
                            <span className="flex items-center gap-2 py-0.5 px-0.5 text-slate-600 group-hover/card:text-brand-primary transition-colors">
                              <span className="w-7 h-7 rounded-md bg-white flex items-center justify-center border border-slate-100 group-hover/card:bg-brand-primary/5 transition-colors">
                                {categoryIcons[category] || <BookOpen className="w-3.5 h-3.5 text-slate-400" />}
                              </span>
                              <span className="font-bold text-xs sm:text-sm tracking-tight">{category}</span>
                            </span>
                          ) as any
                        }
                        count={count as number}
                        href={`/library`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100">
                <Link href="/library" className="flex items-center justify-between group p-1.5 rounded-lg text-xs font-bold text-brand-deep hover:text-brand-primary transition-colors">
                  <span>라이브러리 전체보기</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* 3. PREMIUM FOOTER CTA SECTION */}
        <section className="overflow-hidden rounded-2xl bg-white p-6 sm:p-8 md:p-10 text-center relative border border-slate-200/70 shadow-sm">
          <div className="relative z-10 space-y-5 max-w-md mx-auto">
             <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-black text-brand-deep tracking-tight break-keep">
                  소음에서 벗어나 진리에 머무는 시간
                </h3>
                <p className="text-text-secondary text-xs sm:text-sm font-medium leading-relaxed break-keep">
                  TruePath는 매일 깨끗한 말씀 문화를 지향하며 후원자분들의 자발적 선의로 함께 운영됩니다.
                </p>
             </div>
             
             <div className="flex flex-col sm:flex-row items-center justify-center gap-2 w-full max-w-xs sm:max-w-none mx-auto">
               <Link
                href="/today"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-3 bg-brand-primary text-white rounded-xl font-bold text-xs hover:bg-brand-deep transition-colors"
               >
                <span>묵상 시작하기</span>
                <Sparkles className="w-3.5 h-3.5" />
               </Link>
               <Link
                href="/donate"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-3 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs hover:bg-slate-100 transition-colors"
               >
                <span>사역 후원하기</span>
                <Heart className="w-3.5 h-3.5 text-rose-500" />
               </Link>
             </div>
          </div>
        </section>

        {/* 4. BOTTOM NAV SAFE AREA SPACER */}
        {/* ✅ [안정성 개정]: 빌드 오류를 뿜던 인라인 calc 연산을 제거하고 globals.css에 안전하게 매핑된 클래스 바인딩 */}
        <div className="pb-safe-offset-20 lg:hidden" />
        
      </motion.div>
    </div>
  );
}