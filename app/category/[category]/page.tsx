"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { getCategoryWords, Word } from "@/lib/words";
import QuoteCard from "@/components/QuoteCard";

const PAGE_SIZE = 30; // 한 페이지에 보여줄 단어 수

interface CategoryPageProps {
  category?: string; // URL param이 없는 경우 대비
}

export default function CategoryPage({ category }: CategoryPageProps) {
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
    <div className="min-h-screen bg-[#F7F7F7] p-6">
      <div className="max-w-xl mx-auto space-y-6">

        {/* 헤더 */}
        <header className="flex flex-col gap-2 mb-6">
          <h1 className="text-3xl font-extrabold text-[#222222]">{category || "카테고리"}</h1>
          <Link
            href="/category"
            className="text-[14px] text-[#0099FF] font-bold hover:underline"
          >
            ← 전체 카테고리 보기
          </Link>
        </header>

        {/* 말씀 리스트 */}
        {words.length > 0 ? (
          <>
            <div className="space-y-4">
              {visibleWords.map((word) => (
                <QuoteCard key={word.id} word={word} showCategory={true} />
              ))}
            </div>

            {/* 페이지 번호 버튼 */}
            {totalPages > 1 && (
              <div className="flex gap-2 mt-6 overflow-x-auto pb-2 no-scrollbar">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
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
          </>
        ) : (
          <div className="text-center text-[#717171] mt-12">
            <p>이 카테고리에는 아직 말씀이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}