"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { getCategoryWords, Word } from "@/lib/words";
import QuoteCard from "@/components/QuoteCard";

const PAGE_SIZE = 50; // 한 페이지에 보여줄 단어 수

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  // params를 React.use()로 해결 (Next.js 15+ 대응)
  const resolvedParams = React.use(params);
  const category = decodeURIComponent(resolvedParams.category);
  // 페이지 상태
  const [currentPage, setCurrentPage] = useState(1);

  // 카테고리 단어 가져오기
  const words: Word[] = useMemo(() => getCategoryWords(category || ""), [category]);

  // 페이지 계산
  const totalPages = Math.ceil(words.length / PAGE_SIZE);
  const visibleWords = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return words.slice(start, end);
  }, [words, currentPage]);

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      {/* Sticky Header (Consistent with main category page) */}
      <header className="sticky top-0 z-50 airbnb-nav border-b border-black/5 px-6 py-4 bg-[#F2F2F7]">
        <div className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto flex items-center gap-3">
          <Link
            href="/"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/5 text-black active:scale-95 transition-transform"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-black text-black">
            {category}
          </h1>
        </div>
      </header>

      <main className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-6 pt-6 pb-32 space-y-6">
        {words.length > 0 ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
              &apos;{category}&apos; 결과 {words.length}개
            </p>
            {visibleWords.map((word) => (
              <QuoteCard key={word.id} word={word} showCategory={true} />
            ))}

            {/* 페이지 번호 버튼 */}
            {totalPages > 1 && (
              <div className="flex gap-2 mt-6 overflow-x-auto pb-2 no-scrollbar">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      setCurrentPage(num);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`
                      min-w-[38px] h-10 flex items-center justify-center
                      rounded-full border-2 font-semibold text-sm transition-all
                      ${currentPage === num
                        ? "bg-[#0099FF] text-white border-[#0099FF] shadow-lg"
                        : "bg-white text-slate-500 border-gray-200 hover:bg-[#E6F0FF] hover:text-[#0099FF]"
                      }
                      active:scale-95
                    `}
                  >
                    {num}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-[#717171] mt-12 animate-in fade-in duration-500">
            <p>이 카테고리에는 아직 말씀이 없습니다.</p>
            <Link href="/" className="inline-block mt-4 text-[#0099FF] font-black hover:underline">
              홈으로 돌아가기
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
