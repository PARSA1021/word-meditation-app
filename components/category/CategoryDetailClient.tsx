"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Word } from "@/lib/types/word";
import QuoteCard from "@/components/QuoteCard";
import SimpleTOC, { TOCItem } from "@/components/category/SimpleTOC";
import { parseSource } from "@/lib/toc";
import Link from "next/link";

interface CategoryDetailClientProps {
  category: string;
  visibleWords: Word[];
  currentPage: number;
  totalPages: number;
}

export default function CategoryDetailClient({
  category,
  visibleWords,
  currentPage,
  totalPages,
}: CategoryDetailClientProps) {
  const [activeId, setActiveId] = useState<string>("");
  const contentRef = useRef<HTMLDivElement>(null);

  // 1. 말씀 데이터를 기반으로 목차 아이템 생성 (Part, Chapter, Section 기준)
  const tocItems = useMemo(() => {
    const items: TOCItem[] = [];
    const seen = new Set<string>();

    visibleWords.forEach((word, index) => {
      const parsed = parseSource(word.source, word.category);
      
      // 편, 장, 절 순서대로 목차 추가 (중복 방지)
      const levels = [
        { title: parsed.part, level: 1 },
        { title: parsed.chapter, level: 2 },
        { title: parsed.section, level: 3 },
      ];

      levels.forEach((l) => {
        if (l.title && !seen.has(l.title)) {
          const id = `toc-${index}-${l.level}`;
          items.push({ id, title: l.title, level: l.level });
          seen.add(l.title);
          
          // 말씀 객체에 ID 연결 (첫 번째 말씀에만 ID 부여)
          (word as any)._tocId = id; 
        }
      });
    });

    return items;
  }, [visibleWords]);

  // 2. Scrollspy 로직: 현재 어떤 섹션을 읽고 있는지 감지
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-10% 0% -80% 0%" } // 화면 상단 10%~20% 지점에 들어오면 활성
    );

    const elements = document.querySelectorAll("[data-toc-id]");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [visibleWords]);

  const handleScrollTo = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // 헤더 높이 고려
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  }, []);

  return (
    <div className="relative">
      {/* 📚 Simple TOC Component */}
      <SimpleTOC 
        items={tocItems} 
        activeId={activeId} 
        onItemClick={handleScrollTo} 
      />

      <main className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-6 pt-10 pb-32 space-y-8">
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-center justify-between px-2">
            <p className="text-[11px] font-black text-text-muted uppercase tracking-[0.3em]">
               {category} — {visibleWords.length} Verses
            </p>
            <p className="text-[11px] font-medium text-text-muted">
              {currentPage} / {totalPages} 페이지
            </p>
          </div>

          <div ref={contentRef} className="space-y-6">
            {visibleWords.map((word, idx) => (
              <QuoteCard 
                key={word.id} 
                word={word} 
                showCategory={false} 
                id={(word as any)._tocId}
              />
            ))}
          </div>

          {/* 페이지네이션 (기존 로직 유지) */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 pt-12 pb-8">
              <Link
                href={`/category/${encodeURIComponent(category)}?page=${Math.max(1, currentPage - 1)}`}
                className={`px-6 py-3.5 rounded-2xl text-sm font-medium transition-all flex items-center gap-2 border
                  ${currentPage === 1 ? "bg-slate-100 text-slate-400 border-slate-200 pointer-events-none" : "bg-white border-slate-200 hover:border-brand-primary active:scale-[0.97]"}`}
              >
                ← 이전
              </Link>
              <div className="flex items-center gap-1.5 px-3 uppercase text-[10px] font-black tracking-widest text-slate-400">
                Page {currentPage} of {totalPages}
              </div>
              <Link
                href={`/category/${encodeURIComponent(category)}?page=${Math.min(totalPages, currentPage + 1)}`}
                className={`px-6 py-3.5 rounded-2xl text-sm font-medium transition-all flex items-center gap-2 border
                  ${currentPage === totalPages ? "bg-slate-100 text-slate-400 border-slate-200 pointer-events-none" : "bg-white border-slate-200 hover:border-brand-primary active:scale-[0.97]"}`}
              >
                다음 →
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
