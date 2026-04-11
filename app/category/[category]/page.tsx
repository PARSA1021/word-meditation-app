import React from "react";
import Link from "next/link";
import { getCategoryWordsServer } from "@/lib/words-server";
import QuoteCard from "@/components/QuoteCard";

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
        {allWords.length > 0 ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between px-2">
              <p className="text-[11px] font-black text-text-muted uppercase tracking-[0.3em]">
                Found {allWords.length} Verses
              </p>
              <p className="text-[11px] font-medium text-text-muted">
                {currentPage} / {totalPages} 페이지
              </p>
            </div>

            {visibleWords.map((word) => (
              <QuoteCard key={word.id} word={word} showCategory={false} />
            ))}

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 pt-12 pb-8">
                {/* 이전 버튼 */}
                <Link
                  href={`/category/${encodeURIComponent(category)}?page=${Math.max(1, currentPage - 1)}`}
                  className={`px-6 py-3.5 rounded-2xl text-sm font-medium transition-all flex items-center gap-2 border
                    ${currentPage === 1
                      ? "bg-slate-100 text-slate-400 border-slate-200 pointer-events-none"
                      : "bg-white border-slate-200 hover:border-brand-primary hover:text-brand-primary active:scale-[0.97]"
                    }`}
                >
                  ← 이전
                </Link>

                {/* 페이지 번호 */}
                <div className="flex items-center gap-1.5 px-3">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((pageNum) => {
                      // 간단하게 현재 페이지 주변 + 처음 + 마지막만 보여주기
                      if (totalPages <= 7) return true;
                      if (pageNum === 1 || pageNum === totalPages) return true;
                      return Math.abs(pageNum - currentPage) <= 2;
                    })
                    .map((pageNum) => (
                      <Link
                        key={pageNum}
                        href={`/category/${encodeURIComponent(category)}?page=${pageNum}`}
                        className={`w-10 h-10 flex items-center justify-center rounded-2xl text-sm font-medium transition-all border
                          ${currentPage === pageNum
                            ? "bg-brand-primary text-white shadow-md border-brand-primary"
                            : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                          }`}
                      >
                        {pageNum}
                      </Link>
                    ))}
                </div>

                {/* 다음 버튼 */}
                <Link
                  href={`/category/${encodeURIComponent(category)}?page=${Math.min(totalPages, currentPage + 1)}`}
                  className={`px-6 py-3.5 rounded-2xl text-sm font-medium transition-all flex items-center gap-2 border
                    ${currentPage === totalPages
                      ? "bg-slate-100 text-slate-400 border-slate-200 pointer-events-none"
                      : "bg-white border-slate-200 hover:border-brand-primary hover:text-brand-primary active:scale-[0.97]"
                    }`}
                >
                  다음 →
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-40 animate-in fade-in duration-700">
            <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-4xl mx-auto mb-8 shadow-premium">
              🍂
            </div>
            <p className="text-brand-deep font-black tracking-tight text-lg">
              이 카테고리에는 아직 말씀이 없습니다.
            </p>
            <Link href="/category" className="btn-ghost mt-6">
              카테고리 목록으로 돌아가기
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}