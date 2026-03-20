"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getCategoryWords, Word } from "@/lib/words";

export default function CategoryPage() {
  const params = useParams();
  const rawCategory = params.category;
  const category = Array.isArray(rawCategory) ? rawCategory[0] : rawCategory || "";

  // 해당 카테고리 말씀만 가져오기
  const words: Word[] = getCategoryWords(category);

  return (
    <div className="min-h-screen bg-[#F7F7F7] p-6">
      <div className="max-w-xl mx-auto space-y-6">

        {/* 헤더 */}
        <header className="flex flex-col gap-2 mb-6">
          <h1 className="text-3xl font-extrabold text-[#222222]">{category}</h1>
          <Link
            href="/"
            className="text-[14px] text-[#0099FF] font-bold hover:underline"
          >
            ← 홈으로 돌아가기
          </Link>
        </header>

        {/* 말씀 리스트 */}
        {words.length > 0 ? (
          <ul className="space-y-4">
            {words.map((word) => (
              <li
                key={word.id}
                className="bg-white border border-[#EBEBEB] rounded-2xl p-4 shadow-sm"
              >
                <p className="text-[14px] font-bold text-[#222222]">{word.text}</p>
                {word.source && (
                  <p className="text-[12px] text-[#717171] mt-1">{word.source}</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-[#717171] mt-12">
            <p>이 카테고리에는 아직 말씀이 없습니다.</p>
          </div>
        )}

      </div>
    </div>
  );
}