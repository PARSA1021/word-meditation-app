"use client";

import React, { 
  useState, useMemo, useCallback, useEffect, useTransition, memo, useRef 
} from "react";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { 
  Menu, X, ArrowUp, Search, Bookmark, Layers, 
  ChevronLeft, ChevronRight, Home, BookOpen, Tag
} from "lucide-react";

import { SerializedTOCNode } from "@/features/meditation/services/toc.service";
import TOCAccordion from "@/features/meditation/components/TOCAccordion";
import WordListViewer from "@/features/meditation/components/WordListViewer";
import { useBookmarks } from "@/features/meditation/context/BookmarkContext";
import QuoteCard from "@/shared/ui/QuoteCard";
import { getWordsByPathAction } from "@/features/meditation/services/word-actions.server";
import { Word } from "@/shared/types/word";

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
    // ✅ 수정: Boolean 값을 확실히 받아서 브라우저 표준 문자열 규격인 "true" / "false"로 바인딩
    aria-selected={active ? "true" : "false"}
    className={`
      relative flex items-center justify-center gap-1.5 flex-1 min-h-[40px] py-2 px-2.5 text-xs font-bold rounded-lg transition-all duration-200
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-primary/50 touch-manipulation
      ${active 
        ? "bg-white shadow-sm text-slate-900 border border-slate-100 font-bold" 
        : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
      }
    `}
  >
    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${active ? "text-brand-primary" : "text-slate-400"}`} />
    <span className="truncate">{label}</span>
    {count !== undefined && count > 0 && (
      <span className={`ml-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full font-mono flex-shrink-0
        ${active ? "bg-brand-primary/10 text-brand-primary" : "bg-slate-200 text-slate-600"}`}>
        {count > 99 ? "99+" : count}
      </span>
    )}
  </button>
));
SidebarTab.displayName = "SidebarTab";

const SearchInput = memo(({ value, onChange }: {
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="relative group w-full">
    <input
      type="search"
      placeholder="훈독 말씀 검색..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-2.5 pl-9 pr-8 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all duration-300"
    />
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
    {value && (
      <button 
        onClick={() => onChange("")} 
        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-500 text-[10px] transition-colors"
        aria-label="검색어 초기화"
      >
        ✕
      </button>
    )}
  </div>
));
SearchInput.displayName = "SearchInput";

const EmptyState = ({ icon: Icon, title, subtitle }: { icon: React.ComponentType<{ className?: string; size?: number }>; title: string; subtitle?: string }) => (
  <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center px-4">
    <div className="mb-3 bg-slate-50 w-12 h-12 flex items-center justify-center rounded-xl border border-slate-100 shadow-sm">
      <Icon className="w-5 h-5 text-slate-400" />
    </div>
    <p className="text-xs sm:text-sm font-bold text-slate-800">{title}</p>
    {subtitle && <p className="text-[11px] text-slate-400 mt-1 max-w-xs">{subtitle}</p>}
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
    <div className="flex items-start min-h-screen bg-[#fafafa] text-slate-800 antialiased font-sans selection:bg-brand-primary/10 selection:text-brand-primary w-full">
      
      {/* 1. Global Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white/80 border-b border-slate-200/60 backdrop-blur-md z-40 px-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          {selectedPath.length > 0 && (
            <button 
              onClick={handleGoBack}
              className="p-2 -ml-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors active:scale-95"
              aria-label="이전 분류로 이동"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <button 
            onClick={() => handleSelectSection([])}
            className="text-sm font-bold tracking-tight text-slate-900 truncate"
          >
            참사랑 말씀 도서관
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
      <aside className={`
        fixed md:sticky top-0 md:top-6 w-[18rem] sm:w-[22rem] md:w-[18rem] lg:w-[21rem] xl:w-[23rem] border-r md:border border-slate-100 z-50 md:z-30 bg-white
        h-screen md:h-[calc(100vh-3rem)] rounded-r-2xl md:rounded-2xl md:ml-4 md:my-6 shadow-xl md:shadow-sm
        transform transition-transform duration-300 ease-out flex flex-col shrink-0 overflow-hidden
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="px-5 pt-5 pb-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base lg:text-lg font-bold tracking-tight text-slate-900">참사랑 말씀 도서관</h2>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-0.5">천일국 말씀</p>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-xl hover:bg-slate-100 md:hidden text-slate-500"
            aria-label="메뉴 닫기"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-2 space-y-3 shrink-0">
          <SearchInput value={searchQuery} onChange={setSearchQuery} />
          
          <div className="flex items-center justify-between text-xs px-0.5 gap-2">
            {/* ✅ 수정: 하위 자식들이 role="tab"을 가질 수 있도록 확실한 최상위 수동 parent 지정 완료 */}
            <div role="tablist" aria-label="도서관 탐색 탭 목록" className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/30 flex-1">
              <SidebarTab
                active={activeTab === "hierarchy"}
                onClick={() => setActiveTab("hierarchy")}
                label="전체 목차"
                icon={Layers}
              />
              <SidebarTab
                active={activeTab === "bookmarks"}
                onClick={() => setActiveTab("bookmarks")}
                label="훈독함"
                count={bookmarks.length}
                icon={Bookmark}
              />
            </div>

            {activeTab === "hierarchy" && (
              <button
                onClick={handleToggleAllAccordions}
                className="flex items-center gap-1 py-2 px-2.5 rounded-xl font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 transition-colors shrink-0 text-xs shadow-xs"
                title="목차 일괄 정돈"
              >
                <span>정돈</span>
              </button>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-5 py-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-200 overscroll-contain pb-24 md:pb-6">
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
              <EmptyState icon={BookOpen} title="검색 결과 없음" subtitle="정확한 분류명을 입력해 주세요." />
            )
          ) : bookmarks.length > 0 ? (
            <div className="space-y-3 py-1">
              {bookmarks.map((word) => (
                <QuoteCard key={word.id} word={word} />
              ))}
            </div>
          ) : (
            <EmptyState icon={Bookmark} title="보관된 말씀 없음" subtitle="구절 옆의 하트 아이콘을 눌러 보관할 수 있습니다." />
          )}
        </nav>
      </aside>

      {/* 4. Fluid Main Layout */}
      <main className="flex-1 min-w-0 pt-14 md:pt-6 pb-28 md:pb-16 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 flex justify-center w-full">
        <div className="w-full max-w-4xl xl:max-w-5xl">
          
          {/* Breadcrumb Action Bar */}
          <div className="sticky top-14 md:top-0 bg-[#fafafa]/90 backdrop-blur-md z-20 flex items-center justify-between py-3 border-b border-slate-200/60 mb-6">
            <div className="flex items-center gap-1 sm:gap-1.5 text-xs font-bold text-slate-500 truncate pr-2">
              {selectedPath.length > 0 && (
                <button
                  onClick={handleGoBack}
                  className="flex items-center justify-center p-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 shadow-xs hover:bg-slate-50 transition-all active:scale-95 mr-1"
                  aria-label="이전 분류 단계로 가기"
                >
                  <ChevronLeft size={14} className="stroke-[2.5px]" />
                </button>
              )}
              
              <button 
                onClick={() => handleSelectSection([])}
                className="p-1.5 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-800 transition-colors shrink-0"
                title="처음으로"
                aria-label="도서관 처음 위치로 이동"
              >
                <Home size={14} />
              </button>

              {selectedPath.map((segment, index) => (
                <React.Fragment key={segment}>
                  <ChevronRight size={12} className="text-slate-300 shrink-0" />
                  <span 
                    className={`truncate max-w-[80px] sm:max-w-[140px] px-1 py-0.5 rounded-md transition-colors ${
                      index === selectedPath.length - 1 
                        ? "text-brand-primary bg-brand-primary/5 font-bold" 
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
                {(["sm", "base", "lg"] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setTextSize(size)}
                    className={`rounded-lg text-[11px] font-bold w-6 h-6 flex items-center justify-center transition-all ${
                      textSize === size ? "bg-brand-primary text-white shadow-xs" : "text-slate-400 hover:text-slate-600"
                    }`}
                    aria-label={`본문 글자 크기 ${size === "sm" ? "작게" : size === "base" ? "보통" : "크게"}`}
                  >
                    {size === "sm" ? "A-" : size === "base" ? "A" : "A+"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {selectedNode ? (
              /* --- 말씀 내용 대시보드 --- */
              <motion.div key="section" {...fade} className="space-y-6 sm:space-y-8">
                
                <div className="relative bg-white border border-slate-200/60 rounded-2xl p-6 sm:p-8 md:p-10 shadow-xs overflow-hidden">
                  <div className="relative z-10 space-y-2">
                    <div className="inline-flex items-center px-2 py-0.5 bg-brand-primary/10 text-brand-primary rounded-md text-[10px] font-bold uppercase tracking-wider">
                      분류 노선
                    </div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900 leading-snug break-keep border-l-4 border-brand-primary pl-3 sm:pl-4">
                      {selectedNode.name}
                    </h1>
                    <div className="pt-1">
                      <div className="inline-block px-2.5 py-0.5 bg-slate-100 border border-slate-200/40 text-slate-600 rounded-md text-xs font-medium">
                        총 <span className="font-mono text-brand-primary font-bold">{selectedNode.wordCount.toLocaleString()}</span>개 구절 보관됨
                      </div>
                    </div>
                  </div>
                </div>

                {sortedChildren.length > 0 && (
                  <section className="space-y-3">
                    <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 opacity-80">
                      <span className="w-1 h-3 bg-brand-primary rounded-full" />
                      하위 분류 목록
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {sortedChildren.map((child) => (
                        <button
                          key={child.name}
                          onClick={() => handleSelectSection(child.path)}
                          className="group p-4 bg-white border border-slate-200/60 hover:border-brand-primary/40 rounded-xl text-left transition-all duration-200 hover:shadow-xs active:bg-slate-50 min-h-[44px] touch-manipulation flex flex-col justify-between"
                        >
                          <h4 className="font-bold text-xs sm:text-sm text-slate-800 group-hover:text-brand-primary transition-colors line-clamp-1 break-all flex items-center gap-2">
                            <Tag className="w-3.5 h-3.5 text-brand-primary opacity-60 shrink-0" />
                            <span className="tracking-tight">{child.name}</span>
                          </h4>
                          <div className="mt-2 text-[10px] font-mono font-bold text-slate-400">
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
                      className="flex items-center justify-between gap-3 px-4 py-2.5 bg-brand-primary/5 border border-brand-primary/15 rounded-xl"
                    >
                      <p className="text-[11px] font-medium text-brand-primary truncate">
                        &lsquo;<span className="font-bold">{urlQuery}</span>&rsquo; 검색 결과 보관함에서 이동했습니다
                      </p>
                      <Link
                        href={`/search?q=${encodeURIComponent(urlQuery)}`}
                        className="shrink-0 text-[10px] font-bold text-brand-primary bg-white border border-brand-primary/20 px-2.5 py-1 rounded-lg hover:bg-brand-primary hover:text-white transition-all whitespace-nowrap"
                      >
                        이전 검색
                      </Link>
                    </motion.div>
                  </AnimatePresence>
                )}

                <div className={`bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-6 shadow-xs ${textClassMap[textSize]}`}>
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
              /* --- 루트 메인 대시보드 --- */
              <motion.div key="root" {...fade} className="py-8 sm:py-12 space-y-10 sm:space-y-14">
                <div className="text-center space-y-2 px-2">
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                    참사랑 말씀 도서관
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto leading-relaxed break-keep">
                    하늘부모님과 참부모님의 심정과 은사가 가득한 생명의 말씀입니다.
                  </p>
                </div>

                <section className="space-y-4">
                  <div className="flex items-end justify-between border-b border-slate-200/60 pb-2 px-1">
                    <h2 className="text-sm sm:text-base font-bold tracking-tight text-slate-900">전체 분류</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedRootNodes.map((node, i) => (
                      <motion.button
                        key={node.name}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.01, duration: 0.25 }}
                        onClick={() => handleSelectSection([node.name])}
                        className="group bg-white border border-slate-200/70 hover:border-brand-primary/30 rounded-xl p-5 text-left hover:shadow-md transition-all duration-200 relative overflow-hidden touch-manipulation text-slate-800 flex flex-col justify-between min-h-[120px]"
                      >
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-slate-100 group-hover:bg-brand-primary transition-colors" />
                        
                        <div className="space-y-2">
                          <div className="w-6 h-6 rounded-md bg-slate-50 border border-slate-100 group-hover:bg-brand-primary/5 flex items-center justify-center text-[10px] font-bold text-slate-400 font-mono">
                            {String(i + 1).padStart(2, '0')}
                          </div>
                          <h3 className="text-base font-bold tracking-tight group-hover:text-brand-primary transition-colors line-clamp-2 break-keep text-slate-800">
                            {node.name}
                          </h3>
                        </div>

                        <div className="mt-3 flex items-baseline gap-0.5">
                          <span className="text-xl font-bold font-mono tracking-tight text-slate-900">
                            {node.wordCount.toLocaleString()}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 ml-1">구절</span>
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

      {/* 5. 스마트 유틸리티 플로팅 패널 */}
      <div className="fixed bottom-6 right-4 sm:right-6 z-40 pointer-events-none">
        <AnimatePresence mode="wait">
          {(selectedPath.length > 0 || showScrollTop) && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              className={`
                pointer-events-auto flex items-center bg-white/95 text-slate-800 border border-slate-200/80 backdrop-blur-md shadow-lg transition-all duration-300 p-1 rounded-xl
                ${isScrollingDown ? "rounded-full" : "gap-1"}
              `}
            >
              {selectedPath.length > 0 && !isScrollingDown && (
                <button
                  onClick={handleGoBack}
                  className="w-9 h-9 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg flex items-center justify-center transition-all active:scale-90 touch-manipulation border border-slate-100"
                  aria-label="이전 분류 노선으로 돌아가기"
                  title="이전 단계"
                >
                  <ChevronLeft size={16} className="stroke-[2.5px]" />
                </button>
              )}

              {/* ✅ 수정: 아이콘 버튼에 명확한 식별용 aria-label 및 title을 동시 매핑하여 axe/name-role-value 패스 */}
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                disabled={!showScrollTop}
                className={`
                  flex items-center justify-center font-bold text-xs tracking-tight transition-all duration-300 touch-manipulation h-9
                  ${isScrollingDown ? "w-9 h-9 rounded-full p-0" : "px-3 rounded-lg gap-1"}
                  ${showScrollTop 
                    ? "bg-slate-900 text-white hover:bg-brand-primary active:scale-95" 
                    : "bg-slate-100 text-slate-400 opacity-40 cursor-not-allowed"
                  }
                `}
                aria-label="최상단으로 화면 스크롤하기"
                title="맨 위로"
              >
                <ArrowUp size={14} className="stroke-[2.5px] shrink-0" />
                {!isScrollingDown && <span className="text-[11px] whitespace-nowrap">맨 위로</span>}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}