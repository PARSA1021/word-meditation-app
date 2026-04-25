import React from "react";
import Link from "next/link";
import { getCategoryWordsServer } from "@/lib/words-server";
import CategoryDetailClient from "@/components/category/CategoryDetailClient";

const PAGE_SIZE = 30;

export default async function CategoryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const category = decodeURIComponent(resolvedParams.category);
  const currentPage = Math.max(1, parseInt(resolvedSearchParams.page || "1", 10));

  const allWords = getCategoryWordsServer(category || "");
  const totalPages = Math.ceil(allWords.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleWords = allWords.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="min-h-screen bg-brand-bg">
      <header className="sticky top-0 z-50 glass-header px-6 py-5">
        <div className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto flex items-center gap-4">
          <Link
            href="/library"
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

      {allWords.length > 0 ? (
        <CategoryDetailClient 
          category={category}
          visibleWords={visibleWords}
          currentPage={currentPage}
          totalPages={totalPages}
        />
      ) : (
        <div className="text-center py-40 animate-in fade-in duration-700">
          <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-4xl mx-auto mb-8 shadow-premium">
            🍂
          </div>
          <p className="text-brand-deep font-black tracking-tight text-lg">
            이 카테고리에는 아직 말씀이 없습니다.
          </p>
          <Link href="/library" className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:border-primary transition-all inline-block mt-4">
            라이브러리로 돌아가기
          </Link>
        </div>
      )}
    </div>
  );
}