"use client";

import React, { 
  useState, useMemo, useCallback, useEffect, useTransition, memo 
} from "react";

import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { 
  Menu, X, ArrowUp, Search, Bookmark, Layers, 
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
  return [...nodes].sort((a, b) => {
    const diff = direction === "desc" ? b.wordCount - a.wordCount : a.wordCount - b.wordCount;
    if (diff !== 0) return diff;
    return a.name.localeCompare(b.name, "ko");
  });
};

const getCategoryColor = (name: string): string => {
  const text = name.toLowerCase();
  if (text.includes("위로") || text.includes("슬픔")) return "#6366f1"; // Indigo
  if (text.includes("감사") || text.includes("기도")) return "#f59e0b"; // Amber
  if (text.includes("지혜") || text.includes("명상")) return "#10b981"; // Emerald
  if (text.includes("사랑") || text.includes("은혜")) return "#ec4899"; // Pink
  return "#64748b"; // Slate default
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
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    role="tab"
    aria-selected={active}
    className={`
      relative flex items-center justify-center gap-1.5 flex-1 min-h-[44px] py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-primary/50 touch-manipulation
      ${active 
        ? "bg-white shadow-md text-slate-900 border border-slate-100 font-bold" 
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
  </motion.button>
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
      autoFocus
      enterKeyHint="search"
      className="w-full bg-slate-100/50 border border-slate-200/80 rounded-2xl py-3.5 pl-11 pr-10 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all duration-300"
    />
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
    {value && (
      <button 
        onClick={() => onChange("")} 
        className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-500 text-xs transition-colors active:scale-90"
        aria-label="검색어 초기화"
      >
        ✕
      </button>
    )}
  </div>
));

const BottomSheet = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] md:hidden"
        />
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl rounded-t-[32px] z-[101] md:hidden max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border-t border-slate-200/50"
        >
          <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-1" />
          <div className="px-6 py-4 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 tracking-tight">{title}</h3>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={onClose} 
              className="p-2 -mr-2 text-slate-400 hover:text-slate-600 active:scale-95 bg-slate-100 rounded-full transition-all"
            >
              <X size={18} />
            </motion.button>
          </div>
          <div className="p-4 pt-1 overflow-y-auto overscroll-contain pb-24">
            {children}
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

const EmptyState = ({ icon, title, subtitle, onReset }: { icon: string; title: string; subtitle?: string; onReset?: () => void }) => (
  <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center px-4 animate-in fade-in zoom-in duration-500">
    <div className="text-4xl sm:text-5xl mb-6 bg-white w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center rounded-3xl border border-slate-100 shadow-xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <span className="relative z-10 transition-transform group-hover:scale-110 duration-500">{icon}</span>
    </div>
    <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">{title}</h3>
    {subtitle && <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-xs leading-relaxed">{subtitle}</p>}
    {onReset && (
      <motion.button 
        whileTap={{ scale: 0.95 }}
        onClick={onReset}
        className="mt-8 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-brand-primary active:scale-95 transition-all"
      >
        검색 초기화
      </motion.button>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

export default function LibraryMain({ toc }: LibraryClientProps) {
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
  const [hasMounted, setHasMounted] = useState(false);

  // 마운트 완료 후 상태 업데이트
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // 개인화 설정 및 일괄 제어 상태 
  const [accordionExpandKey, setAccordionExpandKey] = useState(0);

  // 현재 시간에 맞춘 따뜻한 환영 메시지 생성 (Hydration 안정성을 위해 클라이언트 마운트 후 활성화)
  const getWelcomeMessage = () => {
    if (!hasMounted) return "말씀 도서관에 오신 것을 환영합니다. 지혜의 말씀을 만나보세요.";
    
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "상쾌한 아침입니다, 늘 곁에 있는 지혜를 만나보세요.";
    if (hour >= 12 && hour < 18) return "평온한 오후입니다, 잠시 묵상의 여유를 가져보세요.";
    if (hour >= 18 && hour < 22) return "차분한 저녁입니다, 하루를 정리하는 말씀을 읽어보세요.";
    return "고요한 밤입니다, 지친 마음을 달래는 평안의 시간입니다.";
  };

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
      .then((words: Word[]) => !cancelled && setCurrentWords(words))
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

  const rootNodes = useMemo(() => sortNodesByWordCount(Object.values(toc.children), "desc"), [toc]);

  const sortedFilteredNodes = useMemo(() => 
    sortNodesByWordCount(Object.values(filteredTOC.children), "desc"), [filteredTOC]);

  const sortedChildren = useMemo(() => 
    selectedNode ? sortNodesByWordCount(Object.values(selectedNode.children), "desc") : [], [selectedNode]);

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

  return (
    <div className="flex min-h-screen bg-[#fafafa] text-slate-800 antialiased font-sans selection:bg-brand-primary/10 selection:text-brand-primary">
      
      {/* 1. Global Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white/80 border-b border-slate-200/60 backdrop-blur-md z-40 px-4 xs:px-5 flex items-center justify-between">
        <button 
          onClick={() => handleSelectSection([])}
          className="text-base font-bold tracking-tight text-slate-900 active:opacity-70 transition-opacity min-h-[44px] flex items-center"
        >
          말씀 도서관
        </button>
        <div className="flex items-center gap-1">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setActiveTab("bookmarks");
              setIsMobileMenuOpen(true);
            }}
            className="p-2 rounded-xl text-slate-500 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <Bookmark size={20} className={bookmarks.length > 0 ? "fill-brand-primary text-brand-primary" : ""} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="메뉴 토글"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.button>
        </div>
      </header>

      {/* Mobile Bottom Sheet Navigation */}
      <BottomSheet 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        title={activeTab === "bookmarks" ? "나의 보관함" : "주제별 말씀 전체보기"}
      >
        {activeTab === "hierarchy" ? (
          <TOCAccordion 
            node={toc} 
            level={0}
            selectedPath={selectedPath} 
            onSelect={(path: string[]) => {
              handleSelectSection(path);
              setIsMobileMenuOpen(false);
            }}
            searchQuery={searchQuery}
          />
        ) : bookmarks.length > 0 ? (
          <div className="space-y-4 pt-2">
            {bookmarks.map((word: Word) => (
              <QuoteCard key={word.id} word={word} />
            ))}
          </div>
        ) : (
          <EmptyState icon="✨" title="저장된 말씀이 없습니다" subtitle="구절 옆의 하트 아이콘을 눌러보세요." />
        )}
      </BottomSheet>

      {/* 3. Adaptive Sidebar (Desktop) */}
      <aside className="hidden md:flex fixed md:sticky top-0 left-0 h-full md:h-screen w-[22rem] md:w-[20rem] lg:w-[23rem] border-r z-50 bg-white border-slate-100 transform transition-transform duration-300 ease-out flex-col">
        <div className="px-5 xs:px-6 pt-5 lg:pt-8 pb-4">
          <h2 className="text-lg lg:text-xl font-bold tracking-tight text-slate-900">말씀 도서관</h2>
          <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 mt-0.5">Wisdom Library</p>
        </div>

        <div className="px-5 xs:px-6 py-2 space-y-4">
          <SearchInput value={searchQuery} onChange={setSearchQuery} />
          
          <div className="flex items-center justify-between text-xs px-0.5 pt-1">
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
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleToggleAllAccordions}
                className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 transition-colors"
                title="목차 일괄 리셋"
              >
                <Layers size={13} />
                <span>정돈</span>
              </motion.button>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-5 xs:px-6 py-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-200 overscroll-contain">
          {activeTab === "hierarchy" ? (
            sortedFilteredNodes.length > 0 ? (
              sortedFilteredNodes.map((node) => (
                <div key={`${node.name}-${accordionExpandKey}`} className="space-y-0.5">
                  <TOCAccordion
                    node={node}
                    level={0}
                    onSelect={(path: string[]) => handleSelectSection(path)}
                    selectedPath={selectedPath}
                    searchQuery={searchQuery}
                  />
                </div>
              ))
            ) : (
              <EmptyState 
                icon="🔍" 
                title="일치하는 정보가 없네요" 
                onReset={() => setSearchQuery("")}
              />
            )
          ) : bookmarks.length > 0 ? (
            <div className="space-y-3.5 py-1">
              {bookmarks.map((word: Word) => (
                <QuoteCard key={word.id} word={word} />
              ))}
            </div>
          ) : (
            <EmptyState icon="✨" title="저장함이 비어있습니다" />
          )}
        </nav>
      </aside>

      {/* 4. Fluid Main Layout */}
      <main className="flex-1 min-w-0 pt-14 md:pt-0 pb-32 px-3 xs:px-4 sm:px-8 lg:px-10 xl:px-16 flex justify-center">
        <div className="w-full max-w-4xl xl:max-w-5xl">
          
          {/* Path Pill Breadcrumb (Premium Mobile UI) */}
          <div className="sticky top-14 md:top-0 bg-[#fafafa]/90 backdrop-blur-md z-30 flex items-center justify-between py-3 md:py-5 border-b border-slate-200/60 mb-4 sm:mb-8">
            <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelectSection([])}
                className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
                  selectedPath.length === 0 
                  ? "bg-slate-900 text-white shadow-lg" 
                  : "bg-white border border-slate-200 text-slate-400"
                }`}
              >
                <Home size={15} />
              </motion.button>

              <AnimatePresence mode="popLayout">
                {selectedPath.map((segment, index) => (
                  <motion.div 
                    key={`${index}-${segment}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2 flex-shrink-0"
                  >
                    <ChevronRight size={12} className="text-slate-300" />
                    <motion.button 
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleSelectSection(selectedPath.slice(0, index + 1))}
                      className={`
                        px-4 py-2 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border
                        ${index === selectedPath.length - 1 
                          ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                          : "bg-white text-slate-600 border-slate-200"}
                      `}
                    >
                      {segment}
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="hidden md:flex items-center gap-2 ml-4">
              {selectedPath.length > 0 && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGoBack}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all shadow-sm"
                >
                  <ChevronLeft size={14} className="stroke-[2.5px]" />
                  <span>이전</span>
                </motion.button>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {selectedNode ? (
              <motion.div key="section" {...fade} className="space-y-6 sm:space-y-12">
                <div className="relative bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-12 shadow-xs overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#f1f5f9_1px,transparent_1px)] [background-size:20px_20px] opacity-30" />
                  <div className="relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-200/50">
                      <div className="w-1 h-1 rounded-full bg-brand-primary" />
                      <span>{selectedPath.length > 1 ? selectedPath[selectedPath.length - 2] : "카테고리"}</span>
                    </div>
                    <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight break-keep flex items-center gap-4">
                      <span 
                        className="w-1.5 h-8 md:h-12 rounded-full shrink-0" 
                        style={{ backgroundColor: getCategoryColor(selectedNode.name) }}
                      />
                      <span>{selectedNode.name}</span>
                    </h1>
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-slate-50 border border-slate-200/60 text-slate-600 rounded-lg text-xs font-bold">
                        <span className="text-brand-primary">{selectedNode.wordCount}</span> 구절
                      </div>
                    </div>
                  </div>
                </div>

                {sortedChildren.length > 0 && (
                  <section className="space-y-5">
                    <h3 className="text-base font-bold text-slate-400 px-1 uppercase tracking-widest">하위 카테고리</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sortedChildren.map((child) => (
                        <motion.button
                          key={child.name}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleSelectSection(child.path)}
                          className="group p-6 bg-white border border-slate-200/80 hover:border-brand-primary/30 rounded-2xl text-left transition-all hover:shadow-lg flex flex-col justify-between min-h-[140px]"
                        >
                          <h4 className="font-extrabold text-slate-800 group-hover:text-brand-primary transition-colors text-base break-keep line-clamp-2">
                            {child.name}
                          </h4>
                          <div className="mt-4 text-[10px] font-bold text-slate-400 group-hover:text-brand-primary/60 tracking-wider">
                            {child.wordCount.toLocaleString()} VERSES
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </section>
                )}

                <div className="bg-white border border-slate-200/60 rounded-[32px] p-4 sm:p-10 shadow-xs max-w-4xl mx-auto">
                  <WordListViewer
                    node={selectedNode}
                    words={currentWords}
                    isLoading={isLoadingWords || isPending}
                    highlightId={highlightId}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div key="root" {...fade} className="py-8 sm:py-16 space-y-12 sm:space-y-20">
                <div className="text-center space-y-4 px-2">
                  <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-slate-900">
                    말씀 도서관
                  </h1>
                  <p className="text-sm font-medium text-slate-400 max-w-md mx-auto leading-relaxed break-keep">
                    {getWelcomeMessage()}
                  </p>
                </div>

                <section className="space-y-6">
                  <div className="flex items-end justify-between border-b pb-3 px-1 border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900">전체 카테고리</h2>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">DENSITY SORTED</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
                    {rootNodes.map((node: SerializedTOCNode, i: number) => (
                      <motion.button
                        key={node.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        whileHover={{ y: -6, transition: { duration: 0.2 } }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleSelectSection([node.name])}
                        className="group relative bg-white border border-slate-200/60 hover:border-brand-primary/40 rounded-[32px] p-8 text-left hover:shadow-2xl transition-all duration-500 min-h-[200px] flex flex-col justify-between overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-brand-primary/10 transition-colors" />
                        
                        <div className="relative z-10">
                          <div 
                            className="w-10 h-1 rounded-full mb-6 transition-all duration-500 group-hover:w-16"
                            style={{ backgroundColor: getCategoryColor(node.name) }}
                          />
                          <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-brand-primary transition-colors leading-tight break-keep">
                            {node.name}
                          </h3>
                        </div>

                        <div className="relative z-10 flex items-center justify-between mt-6">
                          <div className="text-[10px] font-black text-slate-400 group-hover:text-brand-primary/50 tracking-widest uppercase">
                            {node.wordCount} Verses
                          </div>
                          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-all duration-300">
                            <ChevronRight size={14} />
                          </div>
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

      {/* 5. Premium Mobile Bottom Navigation (Tab Bar) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] px-4 pb-8 pt-2 pointer-events-none">
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[28px] h-16 flex items-center justify-around px-2 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => handleSelectSection([])}
            className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all ${selectedPath.length === 0 ? "text-white bg-white/10 shadow-inner" : "text-slate-500"}`}
          >
            <Home size={22} strokeWidth={selectedPath.length === 0 ? 2.5 : 2} />
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => {
              setActiveTab("hierarchy");
              setIsMobileMenuOpen(true);
            }}
            className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all ${isMobileMenuOpen && activeTab === "hierarchy" ? "text-white bg-white/10" : "text-slate-500"}`}
          >
            <Menu size={22} strokeWidth={isMobileMenuOpen && activeTab === "hierarchy" ? 2.5 : 2} />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => {
              setActiveTab("hierarchy");
              setIsMobileMenuOpen(true);
              setTimeout(() => {
                const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
                if (searchInput) searchInput.focus();
              }, 400);
            }}
            className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all ${searchQuery ? "text-brand-primary bg-brand-primary/10 shadow-inner shadow-brand-primary/20" : "text-slate-500"}`}
          >
            <Search size={22} strokeWidth={searchQuery ? 2.5 : 2} />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => {
              setActiveTab("bookmarks");
              setIsMobileMenuOpen(true);
            }}
            className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all ${activeTab === "bookmarks" && isMobileMenuOpen ? "text-brand-primary bg-brand-primary/10 shadow-inner shadow-brand-primary/20" : "text-slate-500"}`}
          >
            <Bookmark size={22} strokeWidth={activeTab === "bookmarks" ? 2.5 : 2} className={bookmarks.length > 0 ? "fill-current" : ""} />
          </motion.button>

          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 20 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center justify-center w-12 h-12 rounded-2xl text-white bg-brand-primary shadow-lg shadow-brand-primary/30"
            >
              <ArrowUp size={22} strokeWidth={3} />
            </motion.button>
          )}
        </div>
      </nav>

      {/* Floating Action (Desktop) */}
      <div className="hidden md:block fixed bottom-10 right-10 z-40">
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-full shadow-2xl hover:bg-brand-primary transition-all duration-300 font-bold text-sm tracking-tight"
            >
              <ArrowUp size={18} strokeWidth={2.5} />
              <span>TOP</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}