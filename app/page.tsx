import Link from "next/link"
import DailyWord from "@/components/DailyWord"
import { getWordStats } from "@/lib/words"
import NotificationSetup from "@/components/NotificationSetup"
import StepCard from "@/components/StepCard"
import CategoryCard from "@/components/CategoryCard"
import QuickActionBtn from "@/components/QuickActionBtn"

export default function Home() {

  const stats = getWordStats()

  const sortedCategories =
    Object.entries(stats.byCategory)
      .sort((a, b) => b[1] - a[1])

  return (

    <div className="min-h-screen bg-[#F7F7F7] pb-32 font-sans selection:bg-[#0099FF]/10 overflow-x-hidden">

      {/* 1. HERO & BRANDING (Premium Header) */}
      <header className="px-6 pt-16 pb-10">
        <div className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0099FF]/5 border border-[#0099FF]/10 text-[10px] font-black text-[#0099FF] uppercase tracking-widest animate-in fade-in slide-in-from-top-4 duration-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0099FF] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0099FF]"></span>
              </span>
              Welcome to TruePath
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="space-y-2">
                <h1 className="text-[48px] md:text-[56px] font-black tracking-tighter text-black leading-none group transition-all duration-500">
                  True<span className="text-[#0099FF] group-hover:drop-shadow-[0_0_15px_rgba(0,153,255,0.4)] transition-all">Path</span>
                </h1>
                <p className="text-[16px] text-[#717171] font-bold tracking-tight max-w-[340px] leading-relaxed break-keep">
                  매일 말씀으로 방향을 찾고, <br className="hidden sm:block" />
                  삶을 단단하게 만드는 공간
                </p>
              </div>
              <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-right-4 duration-1000">
                {["말씀", "묵상", "학습", "성장"].map((item) => (
                  <span
                    key={item}
                    className="text-[11px] bg-white border border-[#EBEBEB] px-3.5 py-2 rounded-full text-[#717171] font-black shadow-sm hover:border-[#0099FF]/20 hover:text-black transition-all cursor-default"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>


      <main className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-6 space-y-16">

        <NotificationSetup />

        {/* 2. USAGE FLOW (Subtle Support Guide) */}
        <section className="space-y-4 animate-in fade-in duration-700 opacity-90 transition-opacity">
          <div className="flex items-center gap-2 text-[#CCC] font-black text-[11px] uppercase tracking-widest px-1">
            HOW IT WORKS
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StepCard
              step={1}
              icon="🔍"
              title="검색하기"
              desc="상황에 맞는 키워드 검색"
              compact={true}
            />
            <StepCard
              step={2}
              icon="📖"
              title="묵상하기"
              desc="진심을 다해 말씀 읽기"
              compact={true}
            />
            <StepCard
              step={3}
              icon="🧠"
              title="퀴즈풀기"
              desc="말씀을 퀴즈로 풀어보기"
              compact={true}
            />
          </div>
        </section>

        {/* 3. SEARCH HERO (Scaled for balance & positioned below steps) */}
        <section className="relative group animate-in zoom-in-95 duration-700 delay-150">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#0099FF]/10 to-blue-600/10 blur-2xl opacity-40 group-hover:opacity-100 transition-opacity duration-1000"></div>
          <Link
            href="/search"
            className="relative flex h-24 md:h-26 bg-white border-2 border-[#0099FF]/10 rounded-[36px] items-center px-8 justify-between shadow-xl shadow-blue-500/5 group-hover:shadow-blue-500/10 hover:border-[#0099FF]/30 transition-all duration-700 active:scale-[0.98]"
          >
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-[#0099FF] rounded-[20px] flex items-center justify-center text-white text-2xl shadow-lg shadow-[#0099FF]/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                🔍
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[19px] md:text-[21px] font-black text-black tracking-tight leading-none">말씀 검색하기</span>
                <span className="text-[13px] text-[#A0A0A0] font-bold">궁금한 상황이나 키워드를 입력하세요</span>
              </div>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#0099FF]/5 flex items-center justify-center text-[#0099FF] group-hover:bg-[#0099FF] group-hover:text-white transition-all duration-500">
              <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
            </div>
          </Link>
        </section>

        {/* 4. LIBRARY (Refined Grid) */}
        <section className="space-y-8 animate-in fade-in duration-1000">
          <div className="flex justify-between items-end px-2">
            <div className="space-y-2">
              <p className="text-[11px] font-black text-[#0099FF] uppercase tracking-[0.25em]">BEYOND THE WORD</p>
              <h2 className="text-[28px] font-black text-[#222222] tracking-tight">진리의 보물창고</h2>
            </div>
            <div className="text-right group cursor-default">
              <span className="text-[34px] font-black text-[#0099FF] tracking-tighter leading-none block group-hover:scale-110 transition-transform">
                {stats.total.toLocaleString()}
              </span>
              <p className="text-[12px] text-[#A0A0A0] font-black uppercase tracking-widest mt-1">Total Verse</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {sortedCategories.slice(0, 6).map(([category, count]) => (
              <CategoryCard
                key={category}
                name={category}
                count={count}
                href={`/category/${encodeURIComponent(category)}`}
              />
            ))}
          </div>

          <div className="text-center pt-2">
            <Link href="/category" className="text-[13px] font-black text-[#717171] hover:text-[#0099FF] transition-all flex items-center justify-center gap-2 group">
              모든 카테고리 보기 <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </section>

        {/* 5. TODAY'S WORD (Focal Center) */}
        <section className="space-y-6 animate-in slide-in-from-bottom-8 duration-1000 delay-300">
          <div className="flex justify-between items-center px-4">
            <div className="h-px bg-gradient-to-r from-transparent via-[#EBEBEB] to-transparent flex-1 mr-6"></div>
            <h3 className="text-[14px] font-black text-[#AAA] uppercase tracking-[0.2em] whitespace-nowrap">Daily Inspiration</h3>
            <div className="h-px bg-gradient-to-r from-transparent via-[#EBEBEB] to-transparent flex-1 ml-6"></div>
          </div>
          <div className="mx-auto max-w-[580px]">
            <DailyWord />
            <p className="text-center text-[12px] text-[#BBB] font-bold mt-6 italic">
              오늘의 말씀을 통해 평온한 하루의 마침표를 찍으세요
            </p>
          </div>
        </section>

        {/* 6. QUICK ACTIONS (Sleek Mini Buttons) */}
        <section className="space-y-8 pt-10">
          <div className="flex justify-center gap-8 flex-wrap">
            <QuickActionBtn href="/search" icon="🔍" text="빠른검색" />
            <QuickActionBtn href="/category" icon="📂" text="주제별" />
            <QuickActionBtn href="/quiz" icon="🧠" text="기억하기" />
            <QuickActionBtn href="/today" icon="🌅" text="새말씀" />
          </div>
        </section>

        {/* FINAL CTA (Scaled down for subtle presence) */}
        <section className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-[#060606] via-[#111111] to-[#060606] p-10 text-center shadow-2xl border border-white/5 group mt-10">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#0099FF]/10 blur-[80px] rounded-full"></div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-600/5 blur-[80px] rounded-full"></div>

          <div className="relative z-10 space-y-6">
            <div className="space-y-3 max-w-sm mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-[#0099FF] uppercase tracking-widest">
                진리의 여정
              </div>
              <h3 className="text-[24px] sm:text-[26px] font-black tracking-tighter text-white leading-[1.2] break-keep">
                말씀이 삶의 중심이 되는 <br className="hidden sm:block" />
                <span className="text-white/80">단단한 하루를 시작하세요</span>
              </h3>
              <p className="text-[13px] text-white/40 font-medium leading-relaxed px-4 break-keep">
                하루의 마지막과 시작을 말씀과 함께하며, <br className="hidden sm:block" />
                흔들리지 않는 삶의 궤적을 만들어보세요.
              </p>
            </div>

            <Link
              href="/today"
              className="relative z-10 inline-flex items-center gap-3 bg-[#0099FF] text-white font-black px-10 py-4 rounded-[20px] hover:bg-white hover:text-black hover:scale-105 active:scale-95 transition-all duration-500 shadow-xl shadow-[#0099FF]/20 group/btn"
            >
              <span>오늘의 말씀 묵상하기</span>
              <span className="text-lg group-hover/btn:rotate-12 transition-transform duration-500">✨</span>
            </Link>

            <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] pt-2">Guided by TruePath</p>
          </div>
        </section>

      </main>

    </div>
  )
}
