import React from "react"
import { getWordStatsServer } from "@/lib/words-server"
import { WordStats } from "@/lib/words"
import Link from "next/link"

export default function CategoryPage() {
  const stats: WordStats = getWordStatsServer()

  const sortedCategories =
    Object.entries(stats.byCategory)
      .sort((a, b) => b[1] - a[1])
  
  const categories = sortedCategories.map(([c]) => c)

  return (
    <div className="min-h-screen bg-brand-bg">
      <header className="sticky top-0 z-50 glass-header px-6 py-5">
        <div className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto flex items-center gap-4">
          <Link 
            href="/" 
            className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/80 border border-slate-100 text-brand-deep hover:bg-brand-primary hover:text-white transition-all active:scale-95 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-black text-brand-deep tracking-tight">주제별 검색</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary mt-0.5">Library</p>
          </div>
        </div>
      </header>

      <main className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-6 pt-10 pb-32 space-y-10">
        <div className="grid grid-cols-1 gap-5 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-center justify-between px-2">
            <p className="text-[11px] font-black text-text-muted uppercase tracking-[0.3em]">
              Total {categories.length} Topics
            </p>
          </div>

          {categories.map((c, index) => (
            <Link
              key={c}
              href={`/category/${encodeURIComponent(c)}`}
              className="premium-card premium-card-hover p-6 flex items-center justify-between group"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl group-hover:bg-brand-primary/10 transition-colors duration-500">
                  📁
                </div>
                <div className="text-left space-y-1">
                  <div className="flex items-center gap-3">
                    <h4 className="text-[18px] font-black text-brand-deep group-hover:text-brand-primary transition-colors duration-300">{c}</h4>
                    {index < 3 && (
                      <span className="px-2 py-0.5 rounded-lg bg-brand-primary/5 text-brand-primary text-[10px] font-black tracking-widest border border-brand-primary/10">
                        ESSENTIAL
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-text-muted font-bold">{stats.byCategory[c]}개의 말씀</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-200 group-hover:bg-brand-primary/5 group-hover:text-brand-primary transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}