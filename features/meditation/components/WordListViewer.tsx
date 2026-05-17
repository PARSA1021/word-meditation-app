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

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [node]);

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
    <div className="space-y-12 pb-32">
      {/* 🧭 Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-6 border-b border-brand-primary/5">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-6 bg-brand-primary/30 rounded-full"></div>
          <h4 className="text-[14px] font-black text-brand-deep uppercase tracking-[0.3em]">Word Collection</h4>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-sm border border-brand-primary/5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
          <span className="text-[11px] font-black text-brand-deep uppercase tracking-widest">{words.length} Verses</span>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-14 animate-in fade-in duration-500">
          {[1, 2].map(i => (
            <QuoteSkeleton key={i} />
          ))}
        </div>
      ) : visibleWords.length > 0 ? (
        <div className="space-y-14">
          {visibleWords.map((word, index) => (
            <motion.div
              key={word.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.05, 0.4) }}
            >
              <QuoteCard 
                word={word} 
                isHighlighted={word.id === highlightId} 
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-32 text-center grayscale opacity-50">
          <p className="text-sm font-black text-slate-300 uppercase tracking-[0.5em]">No verses in this section</p>
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      {visibleCount < words.length && (
        <div ref={loadMoreRef} className="h-40 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-brand-primary/10 border-t-brand-primary rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
