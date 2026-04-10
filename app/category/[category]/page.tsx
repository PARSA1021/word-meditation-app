import React from "react";
import Link from "next/link";
import { getCategoryWordsServer } from "@/lib/words-server";
import QuoteCard from "@/components/QuoteCard";

const PAGE_SIZE = 50; 

export default async function CategoryDetailPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params;
  const category = decodeURIComponent(resolvedParams.category);
  
  const words = getCategoryWordsServer(category || "");
  const visibleWords = words.slice(0, PAGE_SIZE);

  return (
    <div className="min-h-screen bg-brand-bg">
      <header className="sticky top-0 z-50 glass-header px-6 py-5">
        <div className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto flex items-center gap-4">
          <Link
            href="/category"
            className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/80 border border-slate-100 text-brand-deep hover:bg-brand-primary hover:text-white transition-all active:scale-95 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-black text-brand-deep tracking-tight">
              {category}
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary mt-0.5">Explore Topic</p>
          </div>
        </div>
      </header>

      <main className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-6 pt-10 pb-32 space-y-8">
        {words.length > 0 ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between px-2">
              <p className="text-[11px] font-black text-text-muted uppercase tracking-[0.3em]">
                Found {words.length} Verses
              </p>
            </div>
            {visibleWords.map((word) => (
              <QuoteCard key={word.id} word={word} showCategory={false} />
            ))}

            {words.length > PAGE_SIZE && (
              <div className="py-20 text-center">
                <p className="text-sm text-text-muted font-medium">검색 기능을 이용하시면 더 많은 말씀을 찾으실 수 있습니다.</p>
                <Link href="/search" className="btn-ghost inline-flex mt-6 group">
                  지혜의 탐색 시작하기 <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-40 animate-in fade-in duration-700">
             <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-4xl mx-auto mb-8 shadow-premium">
                🍂
              </div>
            <p className="text-brand-deep font-black tracking-tight text-lg">이 카테고리에는 아직 말씀이 없습니다.</p>
            <Link href="/category" className="btn-ghost mt-6">
              카테고리 목록으로 돌아가기
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
