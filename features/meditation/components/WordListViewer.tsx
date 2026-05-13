"use client";

import { useState, useRef, useEffect } from "react";
import { SerializedTOCNode } from "@/features/meditation/services/toc.service";
import QuoteCard from "@/shared/ui/QuoteCard";
import { motion } from "framer-motion";
import { QuoteSkeleton } from "@/shared/ui/Skeleton";
import { Word } from "@/shared/types/word";

interface WordListViewerProps {
  node: SerializedTOCNode | null;
  words: Word[];
  isLoading?: boolean;
  highlightId?: number | null;
}

const ITEMS_PER_PAGE = 20;

export default function WordListViewer({ node, words, isLoading, highlightId }: WordListViewerProps) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // 노드가 바뀌면 노출 개수 초기화
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [node]);

  // 무한 스크롤 구현 (Intersection Observer)
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && visibleCount < words.length) {
        setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
      }
    });

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [words, visibleCount]);

  if (!node) return null;

  const visibleWords = words.slice(0, visibleCount);

  return (
    <div className="space-y-8 md:space-y-12 pb-32">
      {/* 🧭 Premium Top Bar (Breadcrumbs & Count) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0 bg-white/50 backdrop-blur-xl p-4 md:px-6 md:py-4 rounded-2xl md:rounded-full border border-white shadow-sm">
        <nav className="flex flex-wrap items-center text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-text-muted">
          {node.path.map((segment, index) => (
            <div key={index} className="flex items-center whitespace-nowrap">
              {index > 0 && <span className="mx-2 md:mx-3 text-slate-200 select-none">/</span>}
              <span className={index === node.path.length - 1 ? "text-brand-deep font-black" : "opacity-70"}>
                {segment}
              </span>
            </div>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
          <span className="text-[11px] font-black text-brand-deep uppercase tracking-widest">{words.length} Verses</span>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-10 md:gap-14 animate-in fade-in duration-500">
          {[1, 2].map(i => (
            <QuoteSkeleton key={i} />
          ))}
        </div>
      ) : visibleWords.length > 0 ? (
        <div className="space-y-10 md:gap-14">
          {visibleWords.map((word, index) => (
            <motion.div
              key={word.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.05, 0.5) }}
            >
              <QuoteCard 
                word={word} 
                isHighlighted={word.id === highlightId} 
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center">
          <p className="text-sm font-black text-slate-300 uppercase tracking-widest">No words in this section</p>
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      {visibleCount < words.length && (
        <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
