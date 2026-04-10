"use client";

import { useState } from "react";
import { Word } from "@/lib/words";
import { scriptureFont } from "@/lib/fonts";
import { motion, AnimatePresence } from "framer-motion";

interface QuoteCardProps {
  word: Word;
  showCategory?: boolean;
  highlightRanges?: Array<{ start: number; end: number }>;
}

function HighlightedByRanges({
  text,
  ranges,
}: {
  text: string;
  ranges: Array<{ start: number; end: number }>;
}) {
  const parts: React.ReactNode[] = [];
  let cursor = 0;

  for (const { start, end } of ranges) {
    if (start > cursor) parts.push(<span key={`t-${cursor}`}>{text.slice(cursor, start)}</span>);
    parts.push(
      <mark
        key={`h-${start}`}
        className="bg-brand-primary/10 text-brand-primary rounded-sm px-0.5 font-semibold not-italic"
      >
        {text.slice(start, end)}
      </mark>
    );
    cursor = end;
  }
  if (cursor < text.length) parts.push(<span key={`t-${cursor}`}>{text.slice(cursor)}</span>);
  return <>{parts}</>;
}

export default function QuoteCard({
  word,
  showCategory = false,
  highlightRanges,
}: QuoteCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const MAX_LENGTH = 160;

  const needsExpansion = word.text.length > MAX_LENGTH;
  const displayText = !isExpanded && needsExpansion
    ? word.text.slice(0, MAX_LENGTH) + "..."
    : word.text;

  const renderedText = highlightRanges && highlightRanges.length > 0
    ? <HighlightedByRanges
      text={displayText}
      ranges={highlightRanges
        .filter((r) => r.start < displayText.length)
        .map((r) => ({ start: r.start, end: Math.min(r.end, displayText.length) }))
      }
    />
    : displayText;

  const renderedExpandedText = highlightRanges && highlightRanges.length > 0
    ? <HighlightedByRanges
      text={word.text}
      ranges={highlightRanges
        .filter((r) => r.start < word.text.length)
        .map((r) => ({ start: r.start, end: Math.min(r.end, word.text.length) }))
      }
    />
    : word.text;

  const copyToClipboard = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭(확장) 방지
    try {
      const textToCopy = `"${word.text}"\n- ${word.source} ${word.speaker ? `(${word.speaker})` : ""}`;
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("복사 실패:", err);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] as const }}
      onClick={() => {
        // 텍스트 드래그/선택 중일 때는 확장이 트리거되지 않도록 처리
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) return;
        setIsExpanded(!isExpanded);
      }}
      className={`premium-card premium-card-hover group p-6 md:p-10 cursor-default relative overflow-hidden
        ${isExpanded ? 'ring-2 ring-brand-primary/10 shadow-active' : ''}`}
    >
      {/* 1. Header: Category & Hint */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          {showCategory && (
            <span className="bg-slate-50 text-brand-primary text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-slate-100">
              {word.category}
            </span>
          )}
        </div>

        {/* Subtle Expansion Hint */}
        <div className="flex items-center gap-2 text-slate-200 group-hover:text-brand-primary transition-colors duration-500">
          {!isExpanded && (
            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-opacity translate-x-1">Expand Wisdom</span>
          )}
          <svg
            className={`w-4 h-4 transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* 2. Scripture Text */}
      <motion.div layout className="relative">
        <span className="absolute -top-6 -left-4 text-6xl md:text-7xl text-slate-100 font-serif pointer-events-none select-none">"</span>
        <div className="relative z-10">
          <p className={`${scriptureFont.className} scripture-text transition-all duration-500 ${isExpanded ? 'text-brand-deep !not-italic' : ''} !leading-[1.7] md:!leading-[1.8]`}>
            {isExpanded ? renderedExpandedText : renderedText}
          </p>
        </div>
      </motion.div>

      {/* 3. Footer Info & Copy */}
      <motion.div layout className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-slate-50 flex flex-row items-end justify-between gap-4">
        <div className="space-y-0.5 md:space-y-1">
          <p className="text-brand-deep font-extrabold text-[16px] md:text-[19px] tracking-tight leading-tight">
            {word.source}
          </p>
          {word.speaker && (
            <p className="text-text-secondary text-[13px] md:text-sm font-medium">
              {word.speaker}
            </p>
          )}
        </div>

        <button
          onClick={copyToClipboard}
          className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-500 relative
            ${isCopied
              ? "bg-green-500 text-white"
              : "bg-slate-50 text-slate-400 hover:bg-brand-primary hover:text-white active:scale-90"
            }`}
        >
          <AnimatePresence mode="wait">
            {isCopied ? (
              <motion.svg key="check" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </motion.svg>
            ) : (
              <motion.svg key="copy" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </motion.svg>
            )}
          </AnimatePresence>
        </button>
      </motion.div>

      {/* 4. Expanded Content: Simple Full Text View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] as const }}
            className="overflow-hidden"
          >
            <div className="mt-8 flex justify-center">
              <button
                onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] hover:text-brand-primary transition-colors py-4 px-10 flex items-center gap-2"
              >
                <svg className="w-3 h-3 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" />
                </svg>
                Collapse Wisdom
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}