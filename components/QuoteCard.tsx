import React, { useState, useEffect, useRef } from "react";
import { Word, MatchType } from "@/lib/words";
import { getWordPath } from "@/lib/toc";
import { scriptureFont } from "@/lib/fonts";
import { motion, AnimatePresence } from "framer-motion";
import { useBookmarks } from "@/context/BookmarkContext";
import Link from "next/link";

interface QuoteCardProps {
  word: Word;
  showCategory?: boolean;
  highlightRanges?: Array<{ start: number; end: number }>;
  matchType?: MatchType;
  explanation?: string;
  confidence?: "high" | "medium" | "low";
  id?: string;
  isHighlighted?: boolean;
}

function HighlightedByRanges({
  text,
  ranges,
  matchType = "token"
}: {
  text: string;
  ranges: Array<{ start: number; end: number }>;
  matchType?: MatchType;
}) {
  const parts: React.ReactNode[] = [];
  let cursor = 0;

  const getHighlightClass = (type: MatchType) => {
    switch (type) {
      case "exact":
      case "phrase":
        return "bg-emerald-400/15 text-emerald-700 ring-1 ring-emerald-400/20";
      case "stem":
        return "bg-blue-400/15 text-blue-700 ring-1 ring-blue-400/20";
      case "synonym":
        return "bg-purple-400/15 text-purple-700 ring-1 ring-purple-400/20";
      case "chosung":
        return "bg-amber-400/15 text-amber-700 ring-1 ring-amber-400/20";
      default:
        return "bg-slate-400/15 text-slate-700 ring-1 ring-slate-400/20";
    }
  };

  const highlightClass = getHighlightClass(matchType);

  for (const { start, end } of ranges) {
    if (start > cursor) parts.push(<span key={`t-${cursor}`}>{text.slice(cursor, start)}</span>);
    parts.push(
      <mark
        key={`h-${start}`}
        className={`${highlightClass} rounded-[4px] px-1 font-bold not-italic transition-colors duration-500`}
      >
        {text.slice(start, end)}
      </mark>
    );
    cursor = end;
  }
  if (cursor < text.length) parts.push(<span key={`t-${cursor}`}>{text.slice(cursor)}</span>);
  return <>{parts}</>;
}

function MatchBadge({ type, explanation }: { type: MatchType; explanation?: string }) {
  const config: Record<string, { label: string; color: string; icon: string }> = {
    exact: { label: "정확 일치", color: "bg-emerald-500 text-white shadow-emerald-200", icon: "✨" },
    phrase: { label: "정확 일치", color: "bg-emerald-500 text-white shadow-emerald-200", icon: "✨" },
    stem: { label: "기본형", color: "bg-blue-500 text-white shadow-blue-200", icon: "🔍" },
    synonym: { label: "유사 의미", color: "bg-purple-500 text-white shadow-purple-200", icon: "💡" },
    chosung: { label: "초성 검색", color: "bg-amber-500 text-white shadow-amber-200", icon: "⌨️" },
    partial: { label: "부분 일치", color: "bg-slate-500 text-white shadow-slate-200", icon: "🧩" },
    token: { label: "단어 매칭", color: "bg-slate-500 text-white shadow-slate-200", icon: "📍" },
  };

  const item = config[type] || config.token;

  return (
    <div className="flex flex-col gap-1">
      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${item.color}`}>
        <span>{item.icon}</span>
        <span>{item.label}</span>
      </div>
      {explanation && (
        <span className="text-[10px] font-bold text-slate-400 pl-1">
          {explanation}
        </span>
      )}
    </div>
  );
}

const QuoteCard = React.memo(function QuoteCard({
  word,
  showCategory = false,
  highlightRanges,
  matchType,
  explanation,
  confidence,
  id,
  isHighlighted = false,
}: QuoteCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const cardRef = useRef<HTMLDivElement>(null);

  // --- Highlighting & Scroll-into-view Logic ---
  useEffect(() => {
    if (isHighlighted) {
      const timer = setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 600); 
      return () => clearTimeout(timer);
    }
  }, [isHighlighted]);
  
  const bookmarked = isBookmarked(word.id);
  const MAX_LENGTH = 160;

  const handleToggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark(word);
  };

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
      matchType={matchType}
    />
    : displayText;

  const renderedExpandedText = highlightRanges && highlightRanges.length > 0
    ? <HighlightedByRanges
      text={word.text}
      ranges={highlightRanges
        .filter((r) => r.start < word.text.length)
        .map((r) => ({ start: r.start, end: Math.min(r.end, word.text.length) }))
      }
      matchType={matchType}
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
      ref={cardRef}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] as const }}
      onClick={() => {
        // 텍스트 드래그/선택 중일 때는 확장이 트리거되지 않도록 처리
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) return;
        setIsExpanded(!isExpanded);
      }}
      className={`premium-card premium-card-hover group p-6 md:p-10 cursor-default relative overflow-hidden transition-all duration-700
        ${isExpanded ? 'ring-2 ring-brand-primary/10 shadow-active' : ''}
        ${isHighlighted ? 'ring-4 ring-brand-primary/50 shadow-premium !border-brand-primary bg-brand-primary/[0.02] scale-[1.02]' : ''}`}
    >
      {/* 1. Subtle Header: Category only if needed */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div className="flex items-center gap-2">
          {showCategory && (
            <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-md border transition-all ${
              isHighlighted ? 'bg-brand-primary text-white border-brand-primary' : 'bg-slate-50 text-slate-400 border-slate-100'
            }`}>
              {word.category}
            </span>
          )}
          {matchType && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 border border-slate-100/50">
              <span className="text-[10px] grayscale opacity-70">
                {matchType === 'exact' || matchType === 'phrase' ? '✨' : 
                 matchType === 'stem' ? '🔍' : 
                 matchType === 'synonym' ? '💡' : 
                 matchType === 'chosung' ? '⌨️' : '📍'}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{matchType} match</span>
            </div>
          )}
        </div>

        {/* Subtle Expansion Hint */}
        <div className="flex items-center gap-2 text-slate-200 group-hover:text-brand-primary transition-colors duration-500">
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
        <div className="flex-1 space-y-2">
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
          
          {/* Subtle match explanation at the bottom */}
          {explanation && (
            <div className="flex items-center gap-1.5 py-1 px-2 bg-slate-50/50 rounded-lg w-fit">
              <div className="w-1 h-1 rounded-full bg-brand-primary/40" />
              <p className="text-[10px] font-bold text-slate-400 tracking-tight">{explanation}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={handleToggleBookmark}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
              bookmarked ? "bg-red-50 text-red-500" : "bg-slate-50 text-slate-400 hover:text-red-400"
            }`}
          >
            <svg className="w-5 h-5" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </motion.button>

          <Link
            href={`/library?path=${encodeURIComponent(JSON.stringify(getWordPath(word)))}&highlight=${word.id}`}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-brand-primary transition-all active:scale-95 group/lib"
            title="말씀 도서관에서 보기"
          >
            <svg className="w-5 h-5 group-hover/lib:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.246 18.477 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </Link>

          <button
            onClick={copyToClipboard}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-90 ${
              isCopied ? "bg-green-50 text-green-600" : "bg-slate-50 text-slate-400 hover:text-brand-primary"
            }`}
          >
            <AnimatePresence mode="wait">
              {isCopied ? (
                <motion.svg key="check" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </motion.svg>
              ) : (
                <motion.svg key="copy" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                </motion.svg>
              )}
            </AnimatePresence>
          </button>
        </div>
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
});

export default QuoteCard;