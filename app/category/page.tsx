import React from "react"
import { getWordStatsServer } from "@/lib/words-server"
import { WordStats } from "@/lib/types/word"
import Link from "next/link"
import { CATEGORY_GROUPS } from "@/lib/constants"

export default function CategoryPage() {
  const stats: WordStats = getWordStatsServer()
  const allCategories = Object.keys(stats.byCategory)
  
  // 이미 그룹에 할당된 카테고리 기록
  const assignedCategories = new Set<string>()
  CATEGORY_GROUPS.forEach(g => g.categories.forEach(c => assignedCategories.add(c)))

  const otherCategories = allCategories.filter(c => !assignedCategories.has(c))

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

      <main className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-6 pt-10 pb-32 space-y-16">
        {/* Hierarchical Sections */}
        {CATEGORY_GROUPS.map((group) => {
          // 실제로 존재하는 카테고리만 필터링
          const visibleCategories = group.categories.filter(c => allCategories.includes(c));
          if (visibleCategories.length === 0) return null;

          return (
            <section key={group.id} className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-center gap-4 px-2">
                <div className={`w-12 h-12 rounded-2xl ${group.color} flex items-center justify-center text-2xl shadow-sm border border-black/5`}>
                  {group.icon}
                </div>
                <div>
                  <h2 className="text-xl font-black text-brand-deep tracking-tight">{group.title}</h2>
                  <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest">{group.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {visibleCategories.map((c) => (
                  <Link
                    key={c}
                    href={`/category/${encodeURIComponent(c)}`}
                    className="premium-card premium-card-hover p-6 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="text-left space-y-0.5">
                        <h4 className="text-[17px] font-black text-brand-deep group-hover:text-brand-primary transition-colors duration-300">
                          {c}
                        </h4>
                        <p className="text-[12px] text-text-muted font-bold">{stats.byCategory[c]} Verses</p>
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
            </section>
          );
        })}

        {/* 기타 카테고리 (Others) */}
        {otherCategories.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-4 px-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center text-2xl border border-slate-100">
                📁
              </div>
              <div>
                <h2 className="text-xl font-black text-brand-deep tracking-tight">기타 카테고리</h2>
                <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest">미처 분류되지 않은 나머지 주제들</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {otherCategories.map((c) => (
                <Link
                  key={c}
                  href={`/category/${encodeURIComponent(c)}`}
                  className="premium-card premium-card-hover p-6 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-5">
                    <div className="text-left space-y-0.5">
                      <h4 className="text-[17px] font-black text-brand-deep group-hover:text-brand-primary transition-colors duration-300">
                        {c}
                      </h4>
                      <p className="text-[12px] text-text-muted font-bold">{stats.byCategory[c]} Verses</p>
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
          </section>
        )}
      </main>
    </div>
  )
}