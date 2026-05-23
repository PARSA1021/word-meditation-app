"use client";

import { useState, useMemo, useCallback, useEffect, useRef, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SerializedTOCNode } from "@/features/meditation/services/toc.service";
import TOCAccordion from "@/features/meditation/components/TOCAccordion";
import WordListViewer from "@/features/meditation/components/WordListViewer";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useBookmarks } from "@/features/meditation/context/BookmarkContext";
import QuoteCard from "@/shared/ui/QuoteCard";
import Link from "next/link";
import { getWordsByPathAction } from "@/features/meditation/services/word-actions.server";
import { Word } from "@/shared/types/word";
import React from "react";

interface LibraryClientProps {
  toc: SerializedTOCNode;
}

// ─── Micro Components ─────────────────────────────────────────────────────

const SidebarTab = React.memo(({
  active,
  onClick,
  label,
  count,
  accentClass,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
  accentClass: string;
}) => {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={`
        relative flex-1 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] rounded-sm
        transition-all duration-200 focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-brand-primary focus-visible:ring-offset-1
        ${active
          ? `bg-white shadow-sm ring-1 ring-brand-primary/10 ${accentClass}`
          : "text-text-muted hover:text-text-primary"}
      `}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span
          className={`
            ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px]
            ${active ? "bg-red-100 text-red-500" : "bg-slate-100 text-text-muted"}
          `}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
});

const Breadcrumb = React.memo(({
  selectedPath,
  onNavigate,
}: {
  selectedPath: string[];
  onNavigate: (path: string[]) => void;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [selectedPath]);

  if (selectedPath.length === 0) return null;

  return (
    <div
      ref={scrollRef}
      className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1"
      aria-label="Navigation path"
    >
      <button
        onClick={() => onNavigate([])}
        className="flex-shrink-0 px-2.5 py-1 bg-brand-primary/5 text-brand-primary text-[10px] font-black uppercase tracking-widest rounded-sm border border-brand-primary/10 hover:bg-brand-primary/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
      >
        Root
      </button>
      {selectedPath.map((seg, i) => {
        const isLast = i === selectedPath.length - 1;
        return (
          <div key={i} className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-slate-300 text-xs select-none" aria-hidden>›</span>
            <button
              onClick={() => !isLast && onNavigate(selectedPath.slice(0, i + 1))}
              className={`
                px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-sm
                border transition-all focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-brand-primary
                ${isLast
                  ? "bg-brand-primary text-white border-brand-primary cursor-default"
                  : "bg-white text-text-muted border-slate-200 hover:border-brand-primary/30 hover:text-brand-primary cursor-pointer"}
              `}
              disabled={isLast}
            >
              {seg.length > 14 ? `${seg.slice(0, 14)}…` : seg}
            </button>
          </div>
        );
      })}
    </div>
  );
});

const SearchInput = React.memo(({
  value,
  onChange,
  placeholder = "검색...",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => {
  return (
    <div className="relative group">
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        className="
          w-full bg-slate-50 border border-slate-200 rounded-sm
          py-3.5 pl-11 pr-9 text-sm font-semibold
          focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/30
          placeholder:text-text-muted transition-all duration-150
        "
      />
      <svg
        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-brand-primary transition-colors pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-300 text-white flex items-center justify-center hover:bg-slate-400 transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  );
});

const EmptyState = ({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) => (
  <div className="py-24 text-center space-y-4 select-none">
    <div className="text-5xl opacity-30">{icon}</div>
    <p className="text-sm font-black text-text-muted uppercase tracking-widest">{title}</p>
    {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}
  </div>
);

// ─── Main Component ─────────────────────────────────────────────────────

export default function LibraryClient({ toc }: LibraryClientProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isPending, startTransition] = useTransition();

  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [currentWords, setCurrentWords] = useState<Word[]>([]);
  const [isLoadingWords, setIsLoadingWords] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"hierarchy" | "bookmarks">("hierarchy");
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { bookmarks } = useBookmarks();
  const searchParams = useSearchParams();
  const router = useRouter();

  const touchStartY = useRef<number | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Scroll to top visibility
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close drawer on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileDrawerOpen) setIsMobileDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMobileDrawerOpen]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = isMobileDrawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileDrawerOpen]);

  // Deep Linking
  useEffect(() => {
    const pathParam = searchParams.get("path");
    const highlightParam = searchParams.get("highlight");

    if (highlightParam) {
      setHighlightId(parseInt(highlightParam));
    }

    if (pathParam) {
      try {
        const decodedPath = JSON.parse(pathParam);
        if (Array.isArray(decodedPath) && decodedPath.length > 0) {
          let current = toc;
          let isValid = true;

          for (const segment of decodedPath) {
            if (current.children[segment]) {
              current = current.children[segment];
            } else {
              isValid = false;
              break;
            }
          }

          if (isValid) {
            startTransition(() => {
              setSelectedPath(decodedPath);
              setActiveTab("hierarchy");
            });
          }
        }
      } catch (err) {
        console.error("Failed to parse library path:", err);
      }
    }
  }, [searchParams, toc]);

  // Fetch words by path
  useEffect(() => {
    if (selectedPath.length === 0) {
      setCurrentWords([]);
      return;
    }

    let cancelled = false;
    setIsLoadingWords(true);

    getWordsByPathAction(selectedPath)
      .then((words) => {
        if (!cancelled) setCurrentWords(words);
      })
      .catch((err) => console.error("Failed to fetch words:", err))
      .finally(() => {
        if (!cancelled) setIsLoadingWords(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedPath]);

  // Filtered TOC
  const filteredTOC = useMemo(() => {
    if (!searchQuery.trim()) return toc;

    const lowerQuery = searchQuery.toLowerCase();

    const filterNode = (node: SerializedTOCNode): SerializedTOCNode | null => {
      const isNameMatch = node.name.toLowerCase().includes(lowerQuery);
      const filteredChildren: Record<string, SerializedTOCNode> = {};

      Object.entries(node.children).forEach(([key, child]) => {
        const filteredChild = filterNode(child);
        if (filteredChild) filteredChildren[key] = filteredChild;
      });

      return isNameMatch || Object.keys(filteredChildren).length > 0
        ? { ...node, children: filteredChildren }
        : null;
    };

    return filterNode(toc) ?? { ...toc, children: {} };
  }, [toc, searchQuery]);

  const selectedNode = useMemo(() => {
    if (selectedPath.length === 0) return null;
    let current = toc;
    for (const segment of selectedPath) {
      if (current.children[segment]) {
        current = current.children[segment];
      } else {
        return null;
      }
    }
    return current;
  }, [toc, selectedPath]);

  // Handlers
  const handleSelectSection = useCallback((path: string[]) => {
    startTransition(() => {
      setSelectedPath(path);
      setIsMobileDrawerOpen(false);
      window.scrollTo({
        top: 0,
        behavior: shouldReduceMotion ? "instant" : "smooth",
      });
    });
  }, [shouldReduceMotion]);

  const handleBreadcrumbNavigate = useCallback((path: string[]) => {
    startTransition(() => setSelectedPath(path));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // 북마크 클릭 처리 (path 속성이 없을 수 있으므로 안전하게 처리)
  const handleBookmarkClick = useCallback((word: Word) => {
    // Word 타입에 path가 없을 경우 안전하게 처리
    // 만약 Word에 source나 category 정보가 있다면 이를 활용할 수 있습니다.
    setActiveTab("bookmarks"); // 기본적으로 북마크 탭 유지
    // TODO: 필요 시 Word 타입에 path 추가하거나, 다른 방식으로 섹션 이동 구현
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const delta = e.changedTouches[0].clientY - touchStartY.current;
    if (delta > 80) setIsMobileDrawerOpen(false);
    touchStartY.current = null;
  };

  const fade = shouldReduceMotion
    ? { initial: {}, animate: {}, exit: {} }
    : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } };

  // Sidebar Content
  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-5 pb-5">
        <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="목차 검색..." />
      </div>

      <div className="px-5 pb-4">
        <div role="tablist" aria-label="Library navigation tabs" className="flex gap-1 bg-slate-50 p-1 rounded-sm border border-slate-200/70">
          <SidebarTab
            active={activeTab === "hierarchy"}
            onClick={() => setActiveTab("hierarchy")}
            label="말씀 도서관"
            accentClass="text-brand-primary"
          />
          <SidebarTab
            active={activeTab === "bookmarks"}
            onClick={() => setActiveTab("bookmarks")}
            label="저장된 말씀"
            count={bookmarks.length}
            accentClass="text-red-500"
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-5 pb-8 space-y-0.5 custom-scrollbar" role="tabpanel">
        {activeTab === "hierarchy" ? (
          Object.values(filteredTOC.children).length > 0 ? (
            Object.values(filteredTOC.children).map((categoryNode) => (
              <TOCAccordion
                key={categoryNode.name}
                node={categoryNode}
                level={0}
                onSelect={handleSelectSection}
                selectedPath={selectedPath}
                searchQuery={searchQuery}
              />
            ))
          ) : (
            <EmptyState icon="🔍" title="검색 결과 없음" subtitle={`"${searchQuery}"에 해당하는 항목이 없습니다`} />
          )
        ) : (
          <div className="py-4 space-y-2">
            {bookmarks.length === 0 ? (
              <EmptyState icon="💝" title="저장된 말씀 없음" subtitle="마음에 드는 구절을 저장해보세요" />
            ) : (
              bookmarks.map((word) => (
                <button
                  key={word.id}
                  onClick={() => handleBookmarkClick(word)}
                  className="group w-full text-left p-3.5 rounded-sm text-[13px] font-semibold text-text-primary bg-white border border-slate-100 hover:border-red-100 hover:bg-red-50/50 transition-all flex items-start gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  <span className="text-base mt-0.5 flex-shrink-0">❤️</span>
                  <span className="line-clamp-2 flex-1 leading-snug">{word.text}</span>
                </button>
              ))
            )}
          </div>
        )}
      </nav>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-brand-bg text-text-primary">
      {/* Desktop Sidebar */}
      <aside
        aria-label="Library navigation"
        className="hidden md:flex sticky top-0 left-0 w-[320px] lg:w-[360px] xl:w-[400px] h-screen overflow-hidden flex-col bg-white border-r border-slate-100 z-30"
      >
        <div className="px-5 pt-8 pb-6 flex items-center gap-3 border-b border-slate-100 flex-shrink-0">
          <div className="w-8 h-8 bg-brand-primary rounded-sm flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-brand-deep font-serif leading-none">Library</h2>
            <p className="text-[10px] font-bold text-text-muted mt-0.5 uppercase tracking-widest">말씀 도서관</p>
          </div>
        </div>
        <div className="flex-1 overflow-hidden flex flex-col pt-5">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 pt-safe-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            aria-label="목차 열기"
            aria-expanded={isMobileDrawerOpen}
            className="w-10 h-10 rounded-sm bg-brand-deep text-white flex items-center justify-center flex-shrink-0 shadow-md active:scale-95 transition-transform focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <h1 className="text-base font-black tracking-tight text-brand-deep font-serif uppercase flex-1 min-w-0">
            <span className="text-brand-primary mr-1">/</span>Library
          </h1>

          <button
            onClick={() => setActiveTab(activeTab === "bookmarks" ? "hierarchy" : "bookmarks")}
            className={`relative w-10 h-10 rounded-sm flex items-center justify-center transition-all active:scale-90 ${activeTab === "bookmarks" ? "bg-red-50 text-red-500" : "bg-slate-50 text-text-muted border border-slate-200"}`}
          >
            ❤️
            {bookmarks.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                {bookmarks.length > 9 ? "9+" : bookmarks.length}
              </span>
            )}
          </button>
        </div>

        {selectedPath.length > 0 && activeTab === "hierarchy" && (
          <div className="px-4 pb-3 border-t border-slate-100 pt-2.5">
            <Breadcrumb selectedPath={selectedPath} onNavigate={handleBreadcrumbNavigate} />
          </div>
        )}
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="fixed inset-0 bg-brand-deep/40 backdrop-blur-[2px] z-[100] md:hidden"
            />
            <motion.div
              ref={drawerRef}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl z-[101] flex flex-col md:hidden h-[88dvh] max-h-[88dvh] pb-safe-bottom border-t border-slate-200/50"
            >
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                <div className="w-10 h-1 bg-slate-200 rounded-full" />
              </div>

              <div className="px-5 pt-3 pb-4 flex items-center justify-between border-b border-slate-100 flex-shrink-0">
                <h2 className="text-lg font-black text-brand-deep font-serif uppercase tracking-tight">
                  <span className="text-brand-primary mr-1">/</span>Library
                </h2>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-text-muted hover:bg-slate-200 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col pt-4">
                {sidebarContent}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 min-w-0 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 pb-32">
        <AnimatePresence mode="wait">
          {activeTab === "bookmarks" ? (
            <motion.div key="bookmarks" {...fade} className="space-y-10">
              <div className="pt-4 md:pt-0">
                <p className="text-[11px] font-black text-brand-primary uppercase tracking-[0.4em] mb-2">Collection</p>
                <h2 className="text-3xl md:text-5xl font-black text-brand-deep tracking-tighter">저장된 말씀</h2>
                {bookmarks.length > 0 && (
                  <p className="text-sm text-text-muted mt-2">{bookmarks.length}개의 구절이 저장되어 있습니다</p>
                )}
              </div>

              {bookmarks.length > 0 ? (
                <div className="grid gap-10 pb-16">
                  {bookmarks.map((word) => (
                    <QuoteCard key={word.id} word={word} showCategory={true} />
                  ))}
                </div>
              ) : (
                <div className="py-32 text-center space-y-6">
                  <div className="text-6xl grayscale opacity-40">💝</div>
                  <div>
                    <p className="text-xl font-bold text-text-muted">아직 저장된 말씀이 없습니다</p>
                    <p className="text-sm text-text-muted mt-2">구절 카드의 ♡ 버튼을 눌러 저장해보세요</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("hierarchy")}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-brand-deep text-white rounded-sm text-sm font-black uppercase tracking-widest hover:bg-brand-primary transition-colors"
                  >
                    도서관 탐색하기 →
                  </button>
                </div>
              )}
            </motion.div>
          ) : selectedNode ? (
            <motion.div key={selectedPath.join("/")} {...fade} className="space-y-8 pt-2 md:pt-0">
              <div className="hidden md:block">
                <Breadcrumb selectedPath={selectedPath} onNavigate={handleBreadcrumbNavigate} />
              </div>

              <div className="bg-white p-6 md:p-10 rounded-sm border border-brand-primary/5 shadow-sm group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/5 rounded-full blur-[80px] -z-10 group-hover:bg-brand-primary/8 transition-all duration-700" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-brand-primary/5 rounded-sm flex items-center justify-center text-2xl md:text-3xl flex-shrink-0 transition-transform group-hover:scale-105">
                      📁
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mb-1.5 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/50 animate-pulse" />
                        Current Section
                      </p>
                      <h3 className="text-2xl md:text-3xl font-black text-brand-deep tracking-tight leading-tight break-keep">
                        {selectedNode.name}
                      </h3>
                    </div>
                  </div>
                  <Link
                    href={`/search?mode=source&q=${encodeURIComponent(selectedNode.name)}`}
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-4 bg-brand-deep text-white rounded-sm text-[11px] font-black uppercase tracking-widest hover:bg-brand-primary transition-colors shadow-lg w-full sm:w-auto"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Explore Within</span>
                  </Link>
                </div>
              </div>

              {Object.keys(selectedNode.children).length > 0 && (
                <section aria-label="Sub sections">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-1.5 h-7 bg-brand-primary rounded-full" />
                    <div>
                      <h3 className="text-[13px] font-black text-brand-deep uppercase tracking-[0.25em]">Sub Sections</h3>
                      <p className="text-[10px] font-bold text-text-muted mt-0.5 uppercase tracking-widest">
                        {Object.keys(selectedNode.children).length}개 카테고리
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {Object.values(selectedNode.children).map((child) => (
                      <button
                        key={child.name}
                        onClick={() => handleSelectSection(child.path)}
                        className="flex items-start gap-4 p-5 md:p-6 text-left bg-white border border-slate-100 rounded-sm hover:border-brand-primary/20 hover:shadow-md transition-all group focus-visible:ring-2 focus-visible:ring-brand-primary"
                      >
                        <div className="w-10 h-10 bg-brand-primary/5 rounded-sm flex items-center justify-center text-xl group-hover:bg-brand-primary/10">📁</div>
                        <div className="min-w-0 flex-1">
                          <span className="text-sm font-black text-brand-deep group-hover:text-brand-primary line-clamp-2 leading-snug">
                            {child.name}
                          </span>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                              {child.wordCount}절
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              <div className="pt-4">
                <WordListViewer
                  node={selectedNode}
                  words={currentWords}
                  isLoading={isLoadingWords || isPending}
                  highlightId={highlightId}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div key="root" {...fade} className="flex flex-col items-center justify-center min-h-[70vh] text-center py-8 md:py-0">
              <div className="space-y-5 mb-16 px-4 relative max-w-xl">
                <div className="absolute inset-0 bg-brand-primary/5 blur-[100px] rounded-full -z-10" />
                <h2 className="text-[42px] sm:text-[60px] md:text-[80px] font-black tracking-tighter leading-[0.95] text-brand-deep font-serif">
                  말씀 <span className="text-brand-primary">도서관</span>
                </h2>
                <div className="w-10 h-1 bg-brand-primary/30 mx-auto rounded-full" />
                <p className="text-base md:text-lg text-text-secondary font-medium max-w-md mx-auto leading-relaxed break-keep">
                  지혜의 깊은 숲을 거닐며,<br />
                  당신의 영혼을 깨우는 구절을 발견하세요.
                </p>
              </div>

              <section className="w-full max-w-4xl px-0 sm:px-4 text-left">
                <div className="flex items-center gap-3 mb-6 px-4 sm:px-0">
                  <div className="w-1.5 h-8 bg-brand-primary rounded-full" />
                  <div>
                    <h3 className="text-[13px] font-black text-brand-deep uppercase tracking-[0.35em]">Browse Wisdom</h3>
                    <p className="text-[10px] font-bold text-text-muted mt-0.5 uppercase tracking-widest">카테고리를 선택하세요</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 px-4 sm:px-0">
                  {Object.values(toc.children).map((node) => (
                    <button
                      key={node.name}
                      onClick={() => handleSelectSection([node.name])}
                      className="flex items-start gap-4 p-6 md:p-8 bg-white rounded-sm border border-slate-100 hover:border-brand-primary/20 hover:shadow-md transition-all group text-left focus-visible:ring-2 focus-visible:ring-brand-primary relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/4 rounded-full blur-[40px] -z-10 group-hover:bg-brand-primary/8" />
                      <div className="w-12 h-12 bg-slate-50 rounded-sm flex items-center justify-center text-2xl flex-shrink-0 group-hover:bg-brand-primary/5">📔</div>
                      <div className="min-w-0 flex-1">
                        <span className="text-base font-black text-brand-deep group-hover:text-brand-primary line-clamp-2 leading-snug">
                          {node.name}
                        </span>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                            {node.wordCount}절
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Scroll to Top FAB */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: shouldReduceMotion ? "instant" : "smooth" })}
            className="fixed z-40 right-5 bottom-[calc(env(safe-area-inset-bottom,0px)+90px)] md:bottom-8 md:right-8 w-11 h-11 bg-brand-deep text-white rounded-sm shadow-xl flex items-center justify-center hover:bg-brand-primary active:scale-90 transition-all focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}