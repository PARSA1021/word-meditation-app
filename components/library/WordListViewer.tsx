// components/library/WordListViewer.tsx
"use client";

import { SerializedTOCNode } from "@/lib/toc";
import QuoteCard from "../QuoteCard";
import { motion } from "framer-motion";

interface WordListViewerProps {
  node: SerializedTOCNode | null;
  isLoading?: boolean;
}

export default function WordListViewer({ node, isLoading }: WordListViewerProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-400 animate-pulse">말씀을 불러오는 중...</p>
      </div>
    );
  }

  if (!node) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-200 dark:text-slate-800">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">말씀을 선택해주세요</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            왼쪽 목차에서 원하시는 카테고리와 장, 절을 선택하여 말씀을 열람하실 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  const words = node.words || [];

  return (
    <div className="space-y-12 pb-32">
      {/* 🧭 Premium Breadcrumbs */}
      <nav className="flex items-center text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-text-muted overflow-x-auto no-scrollbar py-2">
        {node.path.map((segment, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-3 opacity-30 select-none">/</span>
            )}
            <span className={index === node.path.length - 1 ? "text-brand-primary" : ""}>
              {segment}
            </span>
          </div>
        ))}
      </nav>

      {/* 📄 Elegant Header */}
      <div className="relative">
        <div className="absolute -left-4 top-0 w-1 h-full bg-brand-primary rounded-full opacity-50 hidden md:block" />
        <h1 className="heading-xl leading-tight text-slate-900 dark:text-white">
          {node.name}
        </h1>
        <div className="flex items-center gap-2 mt-4">
          <span className="w-8 h-px bg-slate-200 dark:bg-slate-800" />
          <p className="text-[11px] font-black text-brand-primary uppercase tracking-widest">
            {words.length} Divine Verses
          </p>
        </div>
      </div>

      {/* 📜 Word List */}
      <div className="grid gap-6 md:gap-8">
        {words.length > 0 ? (
          words.map((word, i) => (
            <QuoteCard key={word.id} word={word} />
          ))
        ) : (
          <div className="p-12 text-center bg-slate-50 dark:bg-slate-900/50 backdrop-blur-sm rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-slate-400">이 섹션에는 직접적인 말씀이 없습니다. 하위 항목을 선택해주세요.</p>
          </div>
        )}
      </div>

      {/* 🔙 Back to Top */}
      <div className="flex justify-center pt-12">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="text-xs font-black uppercase tracking-[0.3em] text-slate-300 hover:text-primary transition-colors"
        >
          Back to Top
        </button>
      </div>
    </div>
  );
}
