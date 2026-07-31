"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import { Word } from "@/shared/types/word";
import { MatchType } from "@/features/search/types";
import { getWordPath } from "@/features/meditation/services/toc.service";
import { scriptureFont } from "@/shared/lib/fonts";
import { motion, AnimatePresence } from "framer-motion";
import { useBookmarks } from "@/features/meditation/context/BookmarkContext";
import Link from "next/link";
import WordCardImageModal from "./WordCardImageModal";

interface QuoteCardProps {
  word: Word;
  showCategory?: boolean;
  highlightRanges?: Array<{ start: number; end: number }>;
  matchType?: MatchType;
  explanation?: string;
  confidence?: "high" | "medium" | "low";
  id?: string;
  isHighlighted?: boolean;
  searchQuery?: string;
}

// ─── Highlight renderer ───────────────────────────────────────────────────────

const HIGHLIGHT_CLASS: Record<string, string> = {
  exact:   "bg-emerald-400/15 text-emerald-700 ring-1 ring-emerald-400/20",
  phrase:  "bg-emerald-400/15 text-emerald-700 ring-1 ring-emerald-400/20",
  stem:    "bg-blue-400/15   text-blue-700   ring-1 ring-blue-400/20",
  synonym: "bg-purple-400/15 text-purple-700 ring-1 ring-purple-400/20",
  chosung: "bg-amber-400/15  text-amber-700  ring-1 ring-amber-400/20",
};
const HIGHLIGHT_FALLBACK = "bg-slate-400/15 text-slate-700 ring-1 ring-slate-400/20";

function HighlightedByRanges({
  text,
  ranges,
  matchType = "token",
}: {
  text: string;
  ranges: Array<{ start: number; end: number }>;
  matchType?: MatchType;
}) {
  const hlClass = HIGHLIGHT_CLASS[matchType] ?? HIGHLIGHT_FALLBACK;
  const parts: React.ReactNode[] = [];
  let cursor = 0;

  for (const { start, end } of ranges) {
    if (start > cursor)
      parts.push(<span key={`t-${cursor}`}>{text.slice(cursor, start)}</span>);
    parts.push(
      <mark
        key={`h-${start}`}
        className={`${hlClass} rounded-[4px] px-1 font-bold not-italic transition-colors duration-500`}
      >
        {text.slice(start, end)}
      </mark>
    );
    cursor = end;
  }
  if (cursor < text.length)
    parts.push(<span key={`t-end`}>{text.slice(cursor)}</span>);

  return <>{parts}</>;
}

// ─── Match badge config ───────────────────────────────────────────────────────

const MATCH_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  exact:   { label: "정확 일치", color: "bg-emerald-500 text-white shadow-emerald-200", icon: "✨" },
  phrase:  { label: "정확 일치", color: "bg-emerald-500 text-white shadow-emerald-200", icon: "✨" },
  stem:    { label: "기본형",   color: "bg-blue-500   text-white shadow-blue-200",    icon: "🔍" },
  synonym: { label: "유사 의미", color: "bg-purple-500 text-white shadow-purple-200",  icon: "💡" },
  chosung: { label: "초성 검색", color: "bg-amber-500  text-white shadow-amber-200",   icon: "⌨️" },
  partial: { label: "부분 일치", color: "bg-slate-500  text-white shadow-slate-200",   icon: "🧩" },
  token:   { label: "단어 매칭", color: "bg-slate-500  text-white shadow-slate-200",   icon: "📍" },
};

const MATCH_ICON: Record<string, string> = {
  exact: "✨", phrase: "✨", stem: "🔍", synonym: "💡", chosung: "⌨️",
};

// ─── QuoteCard ────────────────────────────────────────────────────────────────

const MAX_LENGTH = 160;

const QuoteCard = React.memo(function QuoteCard({
  word,
  showCategory = false,
  highlightRanges,
  matchType,
  explanation,
  confidence,
  id,
  isHighlighted = false,
  searchQuery,
}: QuoteCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied]     = useState(false);
  const [copyError, setCopyError]   = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio]   = useState(false);
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleToggleAudio = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word.text);
    utterance.lang = "ko-KR";
    utterance.rate = 0.9;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  }, [word.text, isPlayingAudio]);

  const bookmarked    = isBookmarked(word.id);
  const needsExpansion = word.text.length > MAX_LENGTH;

  // ── Memoised text derivations ──────────────────────────────────────────────
  const displayText = useMemo(
    () =>
      !isExpanded && needsExpansion
        ? word.text.slice(0, MAX_LENGTH) + "…"
        : word.text,
    [isExpanded, needsExpansion, word.text]
  );

  const renderedText = useMemo(() => {
    if (!highlightRanges?.length) return displayText;
    const clipped = highlightRanges
      .filter((r) => r.start < displayText.length)
      .map((r) => ({ start: r.start, end: Math.min(r.end, displayText.length) }));
    return (
      <HighlightedByRanges text={displayText} ranges={clipped} matchType={matchType} />
    );
  }, [displayText, highlightRanges, matchType]);

  const renderedFullText = useMemo(() => {
    if (!highlightRanges?.length) return word.text;
    return (
      <HighlightedByRanges text={word.text} ranges={highlightRanges} matchType={matchType} />
    );
  }, [word.text, highlightRanges, matchType]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleToggleBookmark = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleBookmark(word);
    },
    [toggleBookmark, word]
  );

  const handleCardClick = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.toString().length > 0) return;
    setIsExpanded((v) => !v);
  }, []);

  const handleCollapse = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(false);
  }, []);

  const copyToClipboard = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      const text = `"${word.text}"\n— ${word.source}${word.speaker ? ` (${word.speaker})` : ""}`;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          // Fallback for HTTP / older browsers
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.style.cssText = "position:fixed;opacity:0;";
          document.body.appendChild(ta);
          ta.focus();
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
        }
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch {
        setCopyError(true);
        setTimeout(() => setCopyError(false), 2000);
      }
    },
    [word]
  );

  // ── Library link ───────────────────────────────────────────────────────────
  const libraryHref = useMemo(
    () =>
      `/library?path=${encodeURIComponent(
        JSON.stringify(getWordPath(word))
      )}&highlight=${word.id}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`,
    [word, searchQuery]
  );

  // ── Match icon (memoised, no object lookup in render) ──────────────────────
  const matchIcon = matchType ? (MATCH_ICON[matchType] ?? "📍") : null;
  const matchLabel = matchType ? (MATCH_CONFIG[matchType] ?? MATCH_CONFIG.token).label : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <motion.div
      layout
      ref={cardRef}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] as const }}
      onClick={handleCardClick}
      className={[
        // Base
        "premium-card premium-card-hover group",
        "relative overflow-hidden cursor-default",
        // Padding: compact on mobile, generous on md+
        "p-5 sm:p-7 md:p-10",
        // Transition
        "transition-all duration-700",
        // Glassmorphism backdrop (subtle; only visible when overlapping content)
        "backdrop-blur-[2px]",
        // Expanded state
        isExpanded  ? "ring-1 ring-brand-primary/10 shadow-premium scale-[1.005] sm:scale-[1.01]" : "",
        // Highlighted state
        isHighlighted
          ? "ring-2 ring-brand-primary/50 shadow-premium !border-brand-primary bg-brand-primary/[0.025] scale-[1.01] sm:scale-[1.02]"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* ── Header row ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 sm:mb-6 md:mb-8">
        <div className="flex items-center gap-2 flex-wrap">
          {showCategory && (
            <span
              className={`text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-md border transition-all ${
                isHighlighted
                  ? "bg-brand-primary text-white border-brand-primary"
                  : "bg-slate-50 text-slate-400 border-slate-100"
              }`}
            >
              {word.category}
            </span>
          )}

          {matchType && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 border border-slate-100/50">
              <span className="text-[10px] grayscale opacity-70">{matchIcon}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
                {matchLabel}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider sm:hidden">
                {matchType}
              </span>
            </div>
          )}
        </div>

        {/* Expand / collapse chevron */}
        {needsExpansion && (
          <div className="flex items-center gap-2 text-slate-200 group-hover:text-brand-primary transition-colors duration-500 ml-2 shrink-0">
            <svg
              className={`w-4 h-4 transition-transform duration-500 ${isExpanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </div>

      {/* ── Scripture text ───────────────────────────────────────────────────── */}
      <motion.div layout className="relative">
        {/* Decorative open-quote — scales down on mobile */}
        <span
          className="absolute -top-4 -left-2 sm:-top-5 sm:-left-3 md:-top-6 md:-left-4
                     text-5xl sm:text-6xl md:text-7xl
                     text-slate-100 font-serif pointer-events-none select-none"
          aria-hidden="true"
        >
          "
        </span>

        <div className="relative z-10">
          <p
            className={`${scriptureFont.className} scripture-text transition-all duration-500
              leading-[1.75] sm:leading-[1.8] md:leading-[1.85]
              text-[15px] sm:text-[16px] md:text-[17px]
              ${isExpanded ? "text-brand-deep !not-italic" : ""}`}
          >
            {isExpanded ? renderedFullText : renderedText}
          </p>
        </div>
      </motion.div>

      {/* ── Footer: source + actions ─────────────────────────────────────────── */}
      <motion.div
        layout
        className="mt-7 sm:mt-8 md:mt-10 pt-5 sm:pt-6 md:pt-8 border-t border-slate-50
                   flex flex-col gap-3 sm:gap-4"
      >
        {/* Source info — wraps freely, no truncation */}
        <div className="space-y-0.5 md:space-y-1">
          <p className="text-brand-deep font-extrabold text-[15px] sm:text-[17px] md:text-[19px] tracking-tight leading-snug break-keep">
            {word.source}
          </p>
          {word.speaker && (
            <p className="text-text-secondary text-[12px] sm:text-[13px] md:text-sm font-medium break-keep">
              {word.speaker}
            </p>
          )}
          {explanation && (
            <div className="flex items-center gap-1.5 mt-1.5 py-1 px-2 bg-slate-50/50 rounded-lg w-fit max-w-full">
              <div className="w-1 h-1 shrink-0 rounded-full bg-brand-primary/40" />
              <p className="text-[10px] font-bold text-slate-400 tracking-tight break-keep">
                {explanation}
              </p>
            </div>
          )}
        </div>

        {/* Action buttons — always on their own row, right-aligned */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
          {/* Bookmark */}
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={handleToggleBookmark}
            aria-label={bookmarked ? "북마크 해제" : "북마크 추가"}
            aria-pressed={bookmarked}
            className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-sm transition-all ${
              bookmarked
                ? "bg-red-50 text-red-500 shadow-sm ring-1 ring-red-100"
                : "bg-slate-50 text-slate-400 hover:text-red-400 active:bg-red-50"
            }`}
          >
            <svg
              className="w-4.5 h-4.5 sm:w-5 sm:h-5"
              fill={bookmarked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </motion.button>

          {/* Library link */}
          <Link
            href={libraryHref}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            aria-label="말씀 도서관에서 보기"
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-sm
                       bg-slate-50 text-slate-400 hover:text-brand-primary
                       active:scale-95 transition-all shadow-sm group/lib"
          >
            <svg
              className="w-4.5 h-4.5 sm:w-5 sm:h-5 group-hover/lib:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.246 18.477 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </Link>

          {/* Copy */}
          <button
            onClick={copyToClipboard}
            aria-label="텍스트 복사"
            className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-sm transition-all shadow-sm active:scale-90 ${
              isCopied
                ? "bg-green-50 text-green-600 ring-1 ring-green-100"
                : copyError
                ? "bg-red-50 text-red-500 ring-1 ring-red-100"
                : "bg-slate-50 text-slate-400 hover:text-brand-primary"
            }`}
          >
            <AnimatePresence mode="wait">
              {isCopied ? (
                <motion.svg
                  key="check"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="w-4.5 h-4.5 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </motion.svg>
              ) : copyError ? (
                <motion.svg
                  key="error"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="w-4.5 h-4.5 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                </motion.svg>
              ) : (
                <motion.svg
                  key="copy"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="w-4.5 h-4.5 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </motion.svg>
              )}
            </AnimatePresence>
          </button>

          {/* TTS Audio Speech Button */}
          <button
            onClick={handleToggleAudio}
            aria-label={isPlayingAudio ? "음성 낭독 일시정지" : "말씀 음성 낭독"}
            title={isPlayingAudio ? "음성 낭독 중지" : "말씀 음성으로 듣기"}
            className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-sm transition-all shadow-sm active:scale-90 ${
              isPlayingAudio
                ? "bg-brand-primary text-white ring-2 ring-brand-primary/40 animate-pulse"
                : "bg-slate-50 text-slate-400 hover:text-brand-primary"
            }`}
          >
            <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            </svg>
          </button>

          {/* Image Card Generator Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setIsImageModalOpen(true);
            }}
            aria-label="말씀 카드 이미지 생성 및 공유"
            title="이미지 카드로 저장 및 공유"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-90 bg-slate-50 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/5 border border-slate-200/50 shadow-xs"
          >
            <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        </div>

      {/* Image Modal */}
      <WordCardImageModal
        word={word}
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
      />

      {/* ── Copy-error toast (positioned absolute, doesn't shift layout) ──────── */}
      <AnimatePresence>
        {copyError && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute bottom-16 right-4 sm:right-6 z-20
                       bg-red-500 text-white text-[11px] font-bold px-3 py-1.5
                       rounded-lg shadow-lg pointer-events-none"
          >
            복사에 실패했습니다
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Collapse button (only when expanded) ─────────────────────────────── */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] as const }}
            className="overflow-hidden"
          >
            <div className="mt-6 sm:mt-8 flex justify-center">
              <button
                onClick={handleCollapse}
                className="text-[10px] font-black text-slate-300 uppercase tracking-[0.35em]
                           hover:text-brand-primary transition-colors
                           py-3 px-8 sm:py-4 sm:px-10
                           flex items-center gap-2
                           touch-manipulation"
              >
                <svg
                  className="w-3 h-3 rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" />
                </svg>
                접기
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>
    </motion.div>
  );
});

export default QuoteCard;