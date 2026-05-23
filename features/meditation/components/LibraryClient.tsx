"use client";

import React, { 
  useState, useMemo, useCallback, useEffect, useTransition, memo 
} from "react";

import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { 
  Menu, X, ArrowUp, Search, Bookmark, Layers, Sparkles, 
  ChevronLeft, ChevronRight, Home
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

// [새 기능] 카테고리 이름별 맞춤형 이모지 추천 유틸리티
const getCategoryEmoji = (name: string): string => {
  const text = name.toLowerCase();
  if (text.includes("위로") || text.includes("슬픔") || text.includes("마음")) return "❤️";
  if (text.includes("감사") || text.includes("기도") || text.includes("예배")) return "🙏";
  if (text.includes("지혜") || text.includes("명상") || text.includes("생각")) return "💡";
  if (text.includes("사랑") || text.includes("은혜") || text.includes("축복")) return "✨";
  if (text.includes("능력") || text.includes("용기") || text.includes("승리")) return "⚡";
  if (text.includes("치유") || text.includes("회복") || text.includes("건강")) return "🌿";
  if (text.includes("평안") || text.includes("안식") || text.includes("위로")) return "🕊️";
  if (text.includes("기쁨") || text.includes("소망") || text.includes("행복")) return "☀️";
  if (text.includes("믿음") || text.includes("신뢰") || text.includes("확신")) return "💎";
  if (text.includes("인생") || text.includes("길") || text.includes("인도")) return "🗺️";
  return "🔖"; // 기본 매핑 이모지
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
    aria-selected={active}
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

const EmptyState = ({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) => (
  <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center px-4">
    <div className="text-4xl sm:text-5xl mb-4 bg-slate-50 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl border border-slate-100 shadow-sm">{icon}</div>
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

  // 개인화 설정 및 일괄 제어 상태 상태 
  const [textSize, setTextSize] = useState<"sm" | "base" | "lg">("base");
  const [accordionExpandKey, setAccordionExpandKey] = useState(0);

  const { bookmarks } = useBookmarks();
  const searchParams = useSearchParams();

  // Scroll 반응형 컨트롤
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300); // 300px 이상 내려가면 빠르게 노출
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 모바일 메뉴 열렸을 때 본문 스크롤 방지
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  // Deep Linking
  useEffect(() => {
    const pathParam = searchParams.get("path");
    const highlightParam = searchParams.get("highlight");

    if (highlightParam) setHighlightId(parseInt(highlightParam));

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

  // 뒤로 가기 (상위 노드로 한 단계 이동)
  const handleGoBack = useCallback(() => {
    if (selectedPath.length === 0) return;
    const nextPath = selectedPath.slice(0, -1);
    handleSelectSection(nextPath);
  }, [selectedPath, handleSelectSection]);

  // 목차 전체 접기/펼치기
  const handleToggleAllAccordions = useCallback(() => {
    setAccordionExpandKey(prev => prev + 1);
  }, []);

  const fade = shouldReduceMotion ? {} : ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.25, ease: "easeInOut" }
  } as const);

  // 글자 크기 매핑 클래스
  const textClassMap = {
    sm: "text-xs md:text-sm",
    base: "text-sm md:text-base",
    lg: "text-base md:text-lg"
  };

  return (
    <div className="flex min-h-screen bg-[#fafafa] text-slate-800 antialiased font-sans selection:bg-brand-primary/10 selection:text-brand-primary">
      
      {/* 1. Global Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white/80 border-b border-slate-200/60 backdrop-blur-md z-40 px-4 xs:px-5 flex items-center justify-between">
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
            className="text-base font-bold tracking-tight text-slate-900 active:opacity-70 transition-opacity"
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
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* 3. Adaptive Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-full lg:h-screen w-full sm:w-[22rem] lg:w-[23rem] border-r z-50 bg-white border-slate-100
        transform transition-transform duration-300 ease-out flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="px-5 xs:px-6 pt-5 lg:pt-8 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg lg:text-xl font-bold tracking-tight text-slate-900">말씀 도서관</h2>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 mt-0.5">Wisdom Library</p>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-xl hover:bg-slate-100 lg:hidden text-slate-500"
            aria-label="메뉴 닫기"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Controller */}
        <div className="px-5 xs:px-6 py-2 space-y-3">
          <SearchInput value={searchQuery} onChange={setSearchQuery} />
          
          <div className="flex items-center justify-between text-xs px-0.5">
            <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/30 flex-1 max-w-[75%]">
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

        {/* Dynamic Sidebar List */}
        <nav className="flex-1 overflow-y-auto px-5 xs:px-6 py-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-200 overscroll-contain">
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
              <EmptyState icon="🔍" title="검색 결과가 없습니다" subtitle="단어를 올바르게 입력했는지 확인해 보세요." />
            )
          ) : bookmarks.length > 0 ? (
            <div className="space-y-3.5 py-1">
              {bookmarks.map((word) => (
                <QuoteCard key={word.id} word={word} />
              ))}
            </div>
          ) : (
            <EmptyState icon="✨" title="저장된 말씀이 없습니다" subtitle="구절 옆의 하트 아이콘을 눌러 보관함을 채워보세요." />
          )}
        </nav>
      </aside>

      {/* 4. Fluid Main Layout */}
      <main className="flex-1 min-w-0 pt-14 lg:pt-0 pb-24 px-3 xs:px-4 sm:px-8 lg:px-10 xl:px-16 flex justify-center">
        <div className="w-full max-w-4xl xl:max-w-5xl">
          
          {/* Sticky Breadcrumb & Navigation Action Bar */}
          <div className="sticky top-14 lg:top-0 bg-[#fafafa]/90 backdrop-blur-md z-30 flex items-center justify-between py-3.5 border-b border-slate-200/60 mb-6 shadow-[0_4px_12px_-12px_rgba(0,0,0,0.05)]">
            {/* 브레드크럼 내비게이터 */}
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

            {/* 우측 폰트 리사이저 */}
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
                
                {/* Hero Dashboard Box */}
                <div className="relative bg-white border border-slate-200/60 rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-12 shadow-xs overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-20" />
                  <div className="relative z-10 space-y-3 sm:space-y-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 bg-brand-primary/10 text-brand-primary rounded-full text-[11px] font-bold uppercase tracking-wider">
                      <Sparkles size={11} />
                      <span>현재 구간</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-snug break-keep flex items-center gap-2.5">
                      {/* 상세 뷰에서도 카테고리 기반 감성 이모지 배치 */}
                      <span className="text-2xl sm:text-3xl shrink-0">{getCategoryEmoji(selectedNode.name)}</span>
                      <span>{selectedNode.name}</span>
                    </h1>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <div className="px-3 py-1 bg-slate-100 border border-slate-200/40 text-slate-700 rounded-lg text-xs font-semibold">
                        총 <span className="font-bold font-mono text-brand-primary">{selectedNode.wordCount.toLocaleString()}</span>개 구절
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub Sections Grid */}
                {sortedChildren.length > 0 && (
                  <section className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-1.5 h-4 sm:h-5 bg-brand-primary rounded-full" />
                      하위 카테고리
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {sortedChildren.map((child) => (
                        <button
                          key={child.name}
                          onClick={() => handleSelectSection(child.path)}
                          className="group p-5 sm:p-6 bg-white border border-slate-200/60 hover:border-brand-primary/40 rounded-xl sm:rounded-2xl text-left transition-all duration-300 hover:shadow-md md:hover:-translate-y-0.5 active:bg-slate-50/50 min-h-[44px] touch-manipulation flex flex-col justify-between"
                        >
                          <h4 className="font-bold text-sm sm:text-base text-slate-800 group-hover:text-brand-primary transition-colors line-clamp-1 break-all flex items-center gap-2">
                            <span>{getCategoryEmoji(child.name)}</span>
                            <span>{child.name}</span>
                          </h4>
                          <div className="mt-3 text-[11px] sm:text-xs font-medium text-slate-400 group-hover:text-brand-primary/80 transition-colors">
                            {child.wordCount.toLocaleString()} 구절
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Reader Card Content */}
                <div className={`bg-white border border-slate-200/60 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xs ${textClassMap[textSize]}`}>
                  <WordListViewer
                    node={selectedNode}
                    words={currentWords}
                    isLoading={isLoadingWords || isPending}
                    highlightId={highlightId}
                  />
                </div>
              </motion.div>
            ) : (
              /* --- [업그레이드] ROOT INDEX DASHBOARD (이모지 전면 고도화 및 모든 스크린 최적화) --- */
              <motion.div key="root" {...fade} className="py-6 sm:py-12 md:py-16 space-y-10 sm:space-y-16">
                <div className="text-center space-y-3 sm:space-y-4 px-2">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                    말씀 도서관
                  </h1>
                  <p className="text-sm sm:text-base text-slate-500 font-medium max-w-md mx-auto leading-relaxed break-keep">
                    복잡한 마음을 가지런히 정돈하고<br className="xs:hidden" /> 시대를 관통하는 지혜의 말씀을 마주해보세요.
                  </p>
                </div>

                <section className="space-y-5">
                  <div className="flex items-end justify-between border-b border-slate-200/60 pb-3 px-1">
                    <h2 className="text-base sm:text-xl font-bold text-slate-900">전체 카테고리</h2>
                    <p className="text-[11px] sm:text-xs text-slate-400 font-medium">구절이 많은 순</p>
                  </div>

                  {/* 완벽한 반응형 뷰포트 대응 Grid 수치 조정 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
                    {sortedRootNodes.map((node, i) => (
                      <motion.button
                        key={node.name}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02, duration: 0.35 }}
                        onClick={() => handleSelectSection([node.name])}
                        className="group bg-white border border-slate-200/70 hover:border-brand-primary/30 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-7 text-left hover:shadow-lg md:hover:-translate-y-1 transition-all duration-300 relative overflow-hidden touch-manipulation text-slate-800 flex flex-col justify-between min-h-[140px] sm:min-h-[160px]"
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 group-hover:bg-brand-primary transition-colors" />
                        
                        <div className="space-y-2">
                          {/* [새 기능] 대형 카드 상단 이모지 서클 뱃지 배정 */}
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-brand-primary/5 transition-all flex items-center justify-center text-lg sm:text-xl shadow-xs">
                            {getCategoryEmoji(node.name)}
                          </div>
                          <h3 className="text-base sm:text-lg font-bold leading-snug group-hover:text-brand-primary transition-colors line-clamp-2 break-keep text-slate-800 pt-1">
                            {node.name}
                          </h3>
                        </div>

                        <div className="mt-4 flex items-baseline gap-0.5">
                          <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900 group-hover:text-brand-primary transition-colors">
                            {node.wordCount.toLocaleString()}
                          </span>
                          <span className="text-[10px] sm:text-xs font-semibold text-slate-400">구절</span>
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

      {/* 5. [업그레이드] 스마트 유틸리티 플로팅 컨트롤러 패널 (모바일/태블릿 시인성 극대화) */}
      <div className="fixed bottom-6 right-4 sm:right-6 md:bottom-8 md:right-8 z-40 flex flex-col items-end gap-2.5 pointer-events-none">
        
        {/* 모바일 최적화 원터치 이전단계 이동 버튼 */}
        <AnimatePresence>
          {selectedPath.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              onClick={handleGoBack}
              className="pointer-events-auto w-11 h-11 sm:w-12 sm:h-12 bg-white text-slate-800 border border-slate-200/80 rounded-2xl flex items-center justify-center shadow-md hover:bg-slate-50 active:scale-90 transition-all touch-manipulation"
              aria-label="이전 화면으로"
            >
              <ChevronLeft size={20} className="stroke-[2.5px]" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* [업그레이드] 와이드 텍스트형 초간편 맨 위로 가기 버튼 */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 5 }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="pointer-events-auto flex items-center gap-1.5 px-4 h-11 sm:h-12 bg-slate-900 text-white rounded-full shadow-xl hover:bg-brand-primary active:scale-95 md:hover:scale-105 transition-all duration-200 touch-manipulation font-bold text-xs tracking-tight"
              aria-label="맨 위로 스크롤"
            >
              <ArrowUp size={14} className="stroke-[3px]" />
              <span>맨 위로</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}