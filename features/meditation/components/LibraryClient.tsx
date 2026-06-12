"use client";

import React, { 
  useState, useMemo, useCallback, useEffect, useTransition, memo, useRef 
} from "react";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { 
  Menu, X, ArrowUp, Search, Bookmark, Layers, Sparkles, 
  ChevronLeft, ChevronRight, Home, BookOpen, Tag
} from "lucide-react";

import { SerializedTOCNode } from "@/features/meditation/services/toc.service";
import TOCAccordion from "@/features/meditation/components/TOCAccordion";
import WordListViewer from "@/features/meditation/components/WordListViewer";
import { useBookmarks } from "@/features/meditation/context/BookmarkContext";
import QuoteCard from "@/shared/ui/QuoteCard";
import { getWordsByPathAction } from "@/features/meditation/services/word-actions.server";
import { Word } from "@/shared/types/word";

// ─────────────────────────────────────────────────────────────
// Types & Utils
// ─────────────────────────────────────────────────────────────

interface LibraryClientProps {
  toc: SerializedTOCNode;
}

const sortNodesByWordCount = (nodes: SerializedTOCNode[], direction: "desc" | "asc" = "desc") => {
  return [...nodes].sort((a, b) => direction === "desc" ? b.wordCount - a.wordCount : a.wordCount - b.wordCount);
};

// ─────────────────────────────────────────────────────────────
// Micro Components
// ─────────────────────────────────────────────────────────────

const SidebarTab = memo(({ active, onClick, label, count, icon: Icon }: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}) => (
  <button
    onClick={onClick}
    role="tab"
    aria-selected={active ? "true" : "false"}
    className={`
      relative flex items-center justify-center gap-1.5 flex-1 min-h-[44px] py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-primary/50 touch-manipulation
      ${active 
        ? "bg-white shadow-sm text-slate-900 border border-slate-100 font-bold" 
        : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
      }
    `}
  >
    <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${active ? "text-brand-primary" : "text-slate-400"}`} />
    <span className="truncate">{label}</span>
    {count !== undefined && count > 0 && (
      <span className={`ml-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full font-mono flex-shrink-0
        ${active ? "bg-brand-primary/10 text-brand-primary" : "bg-slate-200 text-slate-600"}`}>
        {count > 99 ? "99+" : count}
      </span>
    )}
  </button>
));

const SearchInput = memo(({ value, onChange }: {
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="relative group w-full">
    <input
      type="search"
      placeholder="목차 또는 말씀 검색..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl py-3 pl-10 pr-9 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all duration-300"
    />
    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
    {value && (
      <button 
        onClick={() => onChange("")} 
        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-500 text-xs transition-colors"
        aria-label="검색어 초기화"
      >
        ✕
      </button>
    )}
  </div>
));

const EmptyState = ({ icon: Icon, title, subtitle }: { icon: React.ComponentType<{ className?: string; size?: number }>; title: string; subtitle?: string }) => (
  <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center px-4">
    <div className="mb-4 bg-slate-50 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl border border-slate-100 shadow-sm">
      <Icon className="w-6 h-6 text-slate-400" />
    </div>
    <p className="text-sm sm:text-base font-semibold text-slate-800">{title}</p>
    {subtitle && <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-xs">{subtitle}</p>}
  </div>
);

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

export default function LibraryClient({ toc }: LibraryClientProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isPending, startTransition] = useTransition();

  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [currentWords, setCurrentWords] = useState<Word[]>([]);
  const [isLoadingWords, setIsLoadingWords] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"hierarchy" | "bookmarks">("hierarchy");
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const lastScrollY = useRef(0);

  const [textSize, setTextSize] = useState<"sm" | "base" | "lg">("base");
  const [accordionExpandKey, setAccordionExpandKey] = useState(0);

  const { bookmarks } = useBookmarks();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowScrollTop(currentScrollY > 300);

      if (currentScrollY > lastScrollY.current && currentScrollY > 400) {
        setIsScrollingDown(true);
      } else if (currentScrollY < lastScrollY.current - 10 || currentScrollY < 100) {
        setIsScrollingDown(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  const [urlQuery, setUrlQuery] = useState<string | null>(null);

  // Deep Linking
  useEffect(() => {
    const pathParam = searchParams.get("path");
    const highlightParam = searchParams.get("highlight");
    const qParam = searchParams.get("q");

    if (highlightParam) setHighlightId(parseInt(highlightParam));
    if (qParam) setUrlQuery(qParam);

    if (pathParam) {
      try {
        const decoded = JSON.parse(pathParam);
        if (Array.isArray(decoded) && decoded.length > 0) {
          startTransition(() => setSelectedPath(decoded));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [searchParams]);

  // Fetch Words
  useEffect(() => {
    if (selectedPath.length === 0) {
      setCurrentWords([]);
      return;
    }

    let cancelled = false;
    setIsLoadingWords(true);

    getWordsByPathAction(selectedPath)
      .then((words) => !cancelled && setCurrentWords(words))
      .catch(console.error)
      .finally(() => !cancelled && setIsLoadingWords(false));

    return () => { cancelled = true; };
  }, [selectedPath]);

  // Filtered TOC
  const filteredTOC = useMemo(() => {
    if (!searchQuery.trim()) return toc;
    const lowerQuery = searchQuery.toLowerCase();

    const filterNode = (node: SerializedTOCNode): SerializedTOCNode | null => {
      const isMatch = node.name.toLowerCase().includes(lowerQuery);
      const filteredChildren: Record<string, SerializedTOCNode> = {};

      Object.entries(node.children).forEach(([key, child]) => {
        const filtered = filterNode(child);
        if (filtered) filteredChildren[key] = filtered;
      });

      return isMatch || Object.keys(filteredChildren).length > 0
        ? { ...node, children: filteredChildren }
        : null;
    };

    return filterNode(toc) ?? { ...toc, children: {} };
  }, [toc, searchQuery]);

  const selectedNode = useMemo(() => {
    if (selectedPath.length === 0) return null;
    let current: SerializedTOCNode | null = toc;
    for (const segment of selectedPath) {
      current = current?.children[segment] ?? null;
      if (!current) return null;
    }
    return current;
  }, [toc, selectedPath]);

  const sortedRootNodes = useMemo(() => 
    sortNodesByWordCount(Object.values(toc.children), "desc"), [toc]);

  const sortedFilteredNodes = useMemo(() => 
    sortNodesByWordCount(Object.values(filteredTOC.children), "desc"), [filteredTOC]);

  const sortedChildren = useMemo(() => 
    selectedNode ? Object.values(selectedNode.children) : [], [selectedNode]);

  const handleSelectSection = useCallback((path: string[]) => {
    startTransition(() => {
      setSelectedPath(path);
      setIsMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: shouldReduceMotion ? "instant" : "smooth" });
    });
  }, [shouldReduceMotion]);

  const handleGoBack = useCallback(() => {
    if (selectedPath.length === 0) return;
    const nextPath = selectedPath.slice(0, -1);
    handleSelectSection(nextPath);
  }, [selectedPath, handleSelectSection]);

  const handleToggleAllAccordions = useCallback(() => {
    setAccordionExpandKey(prev => prev + 1);
  }, []);

  const fade = shouldReduceMotion ? {} : ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.25, ease: "easeInOut" }
  } as const);

  const textClassMap = {
    sm: "text-xs md:text-sm",
    base: "text-sm md:text-base",
    lg: "text-base md:text-lg"
  };

  return (
    /* ✅ 고정(Sticky)의 핵심: 최상위 컨테이너에 items-start를 추가하여, 본문 높이가 길어질 때 사이드바가 억지로 늘어나지 않고 각자의 본래 높이를 보존하게 합니다. */
    <div className="flex items-start min-h-screen bg-[#fafafa] text-slate-800 antialiased font-sans selection:bg-brand-primary/10 selection:text-brand-primary">
      
      {/* 1. Global Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white/80 border-b border-slate-200/60 backdrop-blur-md z-40 px-4 xs:px-5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {selectedPath.length > 0 && (
            <button 
              onClick={handleGoBack}
              className="p-2 -ml-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors active:scale-95"
              aria-label="이전 단계로 가기"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <button 
            onClick={() => handleSelectSection([])}
            className="text-base font-black tracking-tight text-slate-900 active:opacity-70 transition-opacity"
          >
            말씀 도서관
          </button>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 -mr-2 rounded-xl hover:bg-slate-100 text-slate-600 active:scale-95 transition-all min-w-[40px] min-h-[40px] flex items-center justify-center"
          aria-label="메뉴 토글"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* 2. Responsive Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* 3. Adaptive Sticky Sidebar */}
      {/* ✅ 개선 핵심: 데스크탑 환경(md:)에서 position: sticky가 완벽하게 잡히도록 뷰포트 높이 제한과 top 여백을 브라우저 스크롤에 맞게 재정렬했습니다. */}
      <aside className={`
        fixed md:sticky md:top-6 w-full sm:w-[22rem] md:w-[19rem] lg:w-[22rem] xl:w-[24rem] border-r z-50 bg-white border-slate-100
        md:max-h-[calc(100vh-3rem)] rounded-r-2xl md:rounded-2xl md:ml-4 md:my-6 shadow-[1px_0_10px_rgba(0,0,0,0.02)] md:shadow-sm
        transform transition-transform duration-300 ease-out flex flex-col shrink-0 h-full md:h-auto
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="px-5 xs:px-6 pt-5 lg:pt-6 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg lg:text-xl font-black tracking-tight text-slate-900">말씀 도서관</h2>
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-0.5">Wisdom Library</p>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-xl hover:bg-slate-100 md:hidden text-slate-500"
            aria-label="메뉴 닫기"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 xs:px-6 py-2 space-y-3">
          <SearchInput value={searchQuery} onChange={setSearchQuery} />
          
          <div className="flex items-center justify-between text-xs px-0.5">
            <div
              role="tablist"
              className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/30 flex-1 max-w-[75%]"
            >
              <SidebarTab
                active={activeTab === "hierarchy"}
                onClick={() => setActiveTab("hierarchy")}
                label="전체 목차"
                icon={Layers}
              />
              <SidebarTab
                active={activeTab === "bookmarks"}
                onClick={() => setActiveTab("bookmarks")}
                label="저장함"
                count={bookmarks.length}
                icon={Bookmark}
              />
            </div>

            {activeTab === "hierarchy" && (
              <button
                onClick={handleToggleAllAccordions}
                className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 transition-colors"
                title="목차 일괄 리셋"
              >
                <Layers size={13} />
                <span>정돈</span>
              </button>
            )}
          </div>
        </div>

        {/* 내부 네비게이션 리스트 스크롤 영역 */}
        <nav className="flex-1 overflow-y-auto px-5 xs:px-6 py-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-200 overscroll-contain pb-28 md:pb-6">
          {activeTab === "hierarchy" ? (
            sortedFilteredNodes.length > 0 ? (
              sortedFilteredNodes.map((node) => (
                <TOCAccordion
                  key={`${node.name}-${accordionExpandKey}`}
                  node={node}
                  level={0}
                  onSelect={handleSelectSection}
                  selectedPath={selectedPath}
                  searchQuery={searchQuery}
                />
              ))
            ) : (
              <EmptyState icon={BookOpen} title="검색 결과가 없습니다" subtitle="단어를 올바르게 입력했는지 확인해 보세요." />
            )
          ) : bookmarks.length > 0 ? (
            <div className="space-y-3.5 py-1">
              {bookmarks.map((word) => (
                <QuoteCard key={word.id} word={word} />
              ))}
            </div>
          ) : (
            <EmptyState icon={Bookmark} title="저장된 말씀이 없습니다" subtitle="구절 옆의 북마크 아이콘을 눌러 보관함을 채워보세요." />
          )}
        </nav>
      </aside>

      {/* 4. Fluid Main Layout */}
      <main className="flex-1 min-w-0 pt-14 md:pt-6 pb-36 sm:pb-32 lg:pb-16 px-3 xs:px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 flex justify-center">
        <div className="w-full max-w-4xl xl:max-w-5xl">
          
          {/* Sticky Breadcrumb & Navigation Action Bar */}
          <div className="sticky top-14 md:top-0 bg-[#fafafa]/90 backdrop-blur-md z-30 flex items-center justify-between py-3.5 border-b border-slate-200/60 mb-6 shadow-[0_4px_12px_-12px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-1 sm:gap-2 text-xs font-semibold text-slate-500 truncate pr-4">
              {selectedPath.length > 0 && (
                <button
                  onClick={handleGoBack}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-800 shadow-xs hover:bg-slate-50 hover:border-slate-300 transition-all font-bold active:scale-95 mr-1"
                >
                  <ChevronLeft size={14} className="stroke-[3px]" />
                  <span className="hidden sm:inline">이전 단계</span>
                </button>
              )}
              
              <button 
                onClick={() => handleSelectSection([])}
                className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-800 transition-colors shrink-0 flex items-center justify-center"
                title="처음으로"
              >
                <Home size={14} />
              </button>

              {selectedPath.map((segment, index) => (
                <React.Fragment key={segment}>
                  <ChevronRight size={12} className="text-slate-300 shrink-0" />
                  <span 
                    className={`truncate max-w-[90px] sm:max-w-[160px] px-1 py-0.5 rounded-md transition-colors ${
                      index === selectedPath.length - 1 
                        ? "text-brand-primary bg-brand-primary/5 font-black" 
                        : "cursor-pointer hover:bg-slate-200/60 hover:text-slate-900"
                    }`}
                    onClick={() => handleSelectSection(selectedPath.slice(0, index + 1))}
                  >
                    {segment}
                  </span>
                </React.Fragment>
              ))}
            </div>

            <div className="flex items-center shrink-0">
              <div className="flex items-center bg-white rounded-xl p-0.5 border border-slate-200 shadow-xs">
                <button
                  onClick={() => setTextSize("sm")}
                  className={`p-1.5 rounded-lg text-xs font-bold w-7 h-7 flex items-center justify-center transition-all ${textSize === "sm" ? "bg-brand-primary text-white shadow-xs" : "text-slate-400 hover:text-slate-600"}`}
                >
                  A-
                </button>
                <button
                  onClick={() => setTextSize("base")}
                  className={`p-1.5 rounded-lg text-xs font-bold w-7 h-7 flex items-center justify-center transition-all ${textSize === "base" ? "bg-brand-primary text-white shadow-xs" : "text-slate-400 hover:text-slate-600"}`}
                >
                  A
                </button>
                <button
                  onClick={() => setTextSize("lg")}
                  className={`p-1.5 rounded-lg text-xs font-bold w-7 h-7 flex items-center justify-center transition-all ${textSize === "lg" ? "bg-brand-primary text-white shadow-xs" : "text-slate-400 hover:text-slate-600"}`}
                >
                  A+
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {selectedNode ? (
              /* --- SECTION VIEW --- */
              <motion.div key="section" {...fade} className="space-y-6 sm:space-y-10">
                
                <div className="relative bg-white border border-slate-200/60 rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-12 shadow-xs overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-20" />
                  <div className="relative z-10 space-y-3 sm:space-y-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-md text-[10px] font-black uppercase tracking-wider">
                      <Sparkles size={11} />
                      <span>현재 카테고리</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-none break-keep border-l-4 border-brand-primary pl-4 sm:pl-5">
                      {selectedNode.name}
                    </h1>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <div className="px-3 py-1 bg-slate-100 border border-slate-200/40 text-slate-700 rounded-lg text-xs font-bold">
                        총 <span className="font-mono text-brand-primary font-black">{selectedNode.wordCount.toLocaleString()}</span>개 말씀 구절
                      </div>
                    </div>
                  </div>
                </div>

                {sortedChildren.length > 0 && (
                  <section className="space-y-3 sm:space-y-4">
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 opacity-80">
                      <span className="w-1.5 h-3.5 bg-brand-primary rounded-full" />
                      하위 분류 목록
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {sortedChildren.map((child) => (
                        <button
                          key={child.name}
                          onClick={() => handleSelectSection(child.path)}
                          className="group p-5 bg-white border border-slate-200/60 hover:border-brand-primary/40 rounded-xl text-left transition-all duration-300 hover:shadow-md md:hover:-translate-y-0.5 active:bg-slate-50/50 min-h-[44px] touch-manipulation flex flex-col justify-between"
                        >
                          <h4 className="font-bold text-sm sm:text-base text-slate-800 group-hover:text-brand-primary transition-colors line-clamp-1 break-all flex items-center gap-2">
                            <Tag className="w-3.5 h-3.5 text-brand-primary opacity-60 group-hover:opacity-100 shrink-0 transition-opacity" />
                            <span className="tracking-tight">{child.name}</span>
                          </h4>
                          <div className="mt-3 text-[11px] font-mono font-bold text-slate-400 group-hover:text-brand-primary/80 transition-colors">
                            {child.wordCount.toLocaleString()} 구절
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {urlQuery && (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="flex items-center justify-between gap-3 px-4 py-3 bg-brand-primary/5 border border-brand-primary/15 rounded-2xl"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Search size={14} className="text-brand-primary shrink-0" />
                        <p className="text-[12px] font-bold text-brand-primary truncate">
                          &lsquo;<span className="font-black">{urlQuery}</span>&rsquo; 검색 결과에서 이동했습니다
                        </p>
                      </div>
                      <Link
                        href={`/search?q=${encodeURIComponent(urlQuery)}`}
                        className="shrink-0 text-[11px] font-black text-brand-primary bg-white border border-brand-primary/20 px-3 py-1.5 rounded-xl hover:bg-brand-primary hover:text-white transition-all active:scale-95 whitespace-nowrap"
                      >
                        ← 검색으로 돌아가기
                      </Link>
                    </motion.div>
                  </AnimatePresence>
                )}

                <div className={`bg-white border border-slate-200/60 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xs ${textClassMap[textSize]}`}>
                  <WordListViewer
                    node={selectedNode}
                    words={currentWords}
                    isLoading={isLoadingWords || isPending}
                    highlightId={highlightId}
                    searchQuery={urlQuery}
                  />
                </div>
              </motion.div>
            ) : (
              /* --- ROOT INDEX DASHBOARD --- */
              <motion.div key="root" {...fade} className="py-6 sm:py-12 md:py-16 space-y-10 sm:space-y-16">
                <div className="text-center space-y-3 sm:space-y-4 px-2">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-slate-900">
                    말씀 도서관
                  </h1>
                  <p className="text-sm sm:text-base text-slate-500 font-medium max-w-md mx-auto leading-relaxed break-keep">
                    복잡한 마음을 가지런히 정돈하고<br className="xs:hidden" /> 시대를 관통하는 지혜의 말씀을 마주해보세요.
                  </p>
                </div>

                <section className="space-y-5">
                  <div className="flex items-end justify-between border-b border-slate-200/60 pb-3 px-1">
                    <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900">전체 카테고리 분류</h2>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider font-mono">Sorted by Volume</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedRootNodes.map((node, i) => (
                      <motion.button
                        key={node.name}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02, duration: 0.35 }}
                        onClick={() => handleSelectSection([node.name])}
                        className="group bg-white border border-slate-200/70 hover:border-brand-primary/30 rounded-xl sm:rounded-2xl p-6 md:p-7 text-left hover:shadow-lg md:hover:-translate-y-1 transition-all duration-300 relative overflow-hidden touch-manipulation text-slate-800 flex flex-col justify-between min-h-[140px] sm:min-h-[160px]"
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 group-hover:bg-brand-primary transition-colors" />
                        
                        <div className="space-y-3">
                          <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 group-hover:bg-brand-primary/5 group-hover:border-brand-primary/20 transition-all flex items-center justify-center text-[10px] font-black shadow-xs text-slate-400 group-hover:text-brand-primary font-mono">
                            {String(i + 1).padStart(2, '0')}
                          </div>
                          <h3 className="text-lg sm:text-xl font-black tracking-tight leading-snug group-hover:text-brand-primary transition-colors line-clamp-2 break-keep text-slate-800 pt-0.5">
                            {node.name}
                          </h3>
                        </div>

                        <div className="mt-4 flex items-baseline gap-0.5">
                          <span className="text-2xl font-black font-mono tracking-tight text-slate-900 group-hover:text-brand-primary transition-colors">
                            {node.wordCount.toLocaleString()}
                          </span>
                          <span className="text-[11px] font-bold text-slate-400 ml-1">구절</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* 5. 스마트 유틸리티 플로팅 컨트롤러 패널 */}
      <div className="fixed bottom-[calc(8rem+env(safe-area-inset-bottom))] md:bottom-10 right-4 sm:right-6 md:right-8 z-40 pointer-events-none">
        <AnimatePresence mode="wait">
          {(selectedPath.length > 0 || showScrollTop) && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className={`
                pointer-events-auto flex items-center bg-white/95 text-slate-800 border border-slate-200/80 backdrop-blur-md shadow-[0_10px_32px_rgba(0,0,0,0.12)] transition-all duration-300
                ${isScrollingDown ? "p-1 rounded-full" : "p-1.5 rounded-2xl gap-2"}
              `}
            >
              {selectedPath.length > 0 && !isScrollingDown && (
                <motion.button
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  onClick={handleGoBack}
                  className="w-11 h-11 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center transition-all active:scale-90 touch-manipulation border border-slate-100"
                  aria-label="이전 화면으로"
                >
                  <ChevronLeft size={20} className="stroke-[2.5px]" />
                </motion.button>
              )}

              <motion.button
                layout
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                disabled={!showScrollTop}
                className={`
                  flex items-center justify-center font-black text-xs tracking-tight transition-all duration-300 touch-manipulation
                  ${isScrollingDown ? "w-11 h-11 rounded-full p-0" : "px-4 h-11 rounded-xl gap-1.5"}
                  ${showScrollTop 
                    ? "bg-slate-900 text-white hover:bg-brand-primary active:scale-95" 
                    : "bg-slate-100 text-slate-400 opacity-40 cursor-not-allowed"
                  }
                `}
                aria-label="맨 위로 스크롤"
              >
                <ArrowUp size={16} className="stroke-[3px] shrink-0" />
                
                {!isScrollingDown && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    맨 위로
                  </motion.span>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}