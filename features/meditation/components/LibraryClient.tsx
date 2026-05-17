"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SerializedTOCNode } from "@/features/meditation/services/toc.service";
import TOCAccordion from "@/features/meditation/components/TOCAccordion";
import WordListViewer from "@/features/meditation/components/WordListViewer";
import { motion, AnimatePresence } from "framer-motion";
import { useBookmarks } from "@/features/meditation/context/BookmarkContext";
import QuoteCard from "@/shared/ui/QuoteCard";
import Link from "next/link";
import { getWordsByPathAction } from "@/features/meditation/services/word-actions.server";
import { Word } from "@/shared/types/word";

interface LibraryClientProps {
  toc: SerializedTOCNode;
}

export default function LibraryClient({ toc }: LibraryClientProps) {
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [currentWords, setCurrentWords] = useState<Word[]>([]);
  const [isLoadingWords, setIsLoadingWords] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"hierarchy" | "bookmarks">("hierarchy");
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const { bookmarks } = useBookmarks();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- Deep Linking Logic ---
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
            setSelectedPath(decodedPath);
            setActiveTab("hierarchy");
            if (!highlightParam) {
              setTimeout(() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }, 100);
            }
          }
        }
      } catch (err) {
        console.error("Failed to parse library path:", err);
      }
    }
  }, [searchParams, toc]);

  // --- Word Fetching Logic ---
  useEffect(() => {
    if (selectedPath.length > 0) {
      const fetchWords = async () => {
        setIsLoadingWords(true);
        try {
          const words = await getWordsByPathAction(selectedPath);
          setCurrentWords(words);
        } catch (err) {
          console.error("Failed to fetch words for path:", err);
        } finally {
          setIsLoadingWords(false);
        }
      };
      fetchWords();
    } else {
      setCurrentWords([]);
    }
  }, [selectedPath]);

  // --- Search Logic ---
  const filteredTOC = useMemo(() => {
    if (!searchQuery) return toc;

    const filterNode = (node: SerializedTOCNode): SerializedTOCNode | null => {
      const lowerQuery = searchQuery.toLowerCase();
      const isNameMatch = node.name.toLowerCase().includes(lowerQuery);
      const filteredChildren: Record<string, SerializedTOCNode> = {};
      let hasMatchingChild = false;

      Object.entries(node.children).forEach(([key, child]) => {
        const filteredChild = filterNode(child);
        if (filteredChild) {
          filteredChildren[key] = filteredChild;
          hasMatchingChild = true;
        }
      });

      if (isNameMatch || hasMatchingChild) {
        return { ...node, children: filteredChildren };
      }
      return null;
    };

    const rootFiltered = filterNode(toc);
    return rootFiltered || { ...toc, children: {} };
  }, [toc, searchQuery]);

  // --- Current Selected Node ---
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

  const handleSelectSection = useCallback((path: string[]) => {
    setSelectedPath(path);
    setIsSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-brand-bg text-text-primary">
      
      {/* 🖥️ Desktop Sidebar */}
      <aside className="hidden md:flex sticky top-0 left-0 w-85 lg:w-96 h-screen overflow-hidden flex-col bg-white border-r border-slate-100 z-30 shadow-sm">
        <div className="p-8 pb-6 flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tight text-brand-deep font-serif uppercase">
            <span className="text-brand-primary mr-2">/</span>Library
          </h2>
        </div>

        {/* 🔍 Search Input */}
        <div className="px-6 mb-8">
          <div className="relative group">
            <input
              type="text"
              placeholder="목차 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-sm py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all font-bold placeholder:text-text-muted"
            />
            <svg className="absolute left-4 top-4.5 w-4.5 h-4.5 text-text-muted group-focus-within:text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* 📑 Mode Switcher Tabs */}
        <div className="px-6 mb-8">
          <div className="flex gap-1 bg-brand-bg/50 p-1 rounded-sm border border-brand-primary/5">
            {[
              { id: "hierarchy", label: "말씀 도서관", color: "text-brand-primary" },
              { id: "bookmarks", label: "저장된 말씀", color: "text-red-500" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-sm transition-all duration-300 ${activeTab === tab.id ? `bg-white shadow-sm ring-1 ring-brand-primary/5 ${tab.color}` : "text-text-muted hover:text-brand-primary/60"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 pb-16 space-y-1 custom-scrollbar">
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
              <div className="py-24 text-center opacity-40">
                <p className="text-xs font-black uppercase tracking-widest text-text-muted">No Results Found</p>
              </div>
            )
          ) : (
            <div className="py-4 space-y-6">
              <div className="flex items-center justify-between px-2">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Saved Wisdom</p>
                <span className="bg-red-50 text-red-500 text-[10px] font-black px-2.5 py-1 rounded-full">{bookmarks.length}</span>
              </div>
              <div className="grid gap-2">
                {bookmarks.map(word => (
                  <button
                    key={word.id}
                    onClick={() => { setActiveTab("bookmarks"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="group w-full text-left p-4 rounded-sm text-[13px] font-bold text-text-primary bg-slate-50 hover:bg-red-50 transition-all flex items-center gap-3"
                  >
                    <span className="text-lg">❤️</span>
                    <span className="line-clamp-1 flex-1">{word.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>
      </aside>

      {/* 📱 Mobile UI: Top Navigation & Quick TOC */}
      <div className="md:hidden w-full">
        <div className="sticky top-0 z-50 glass-header border-b border-brand-primary/5 pt-safe-top">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="w-10 h-10 rounded-sm bg-brand-deep text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-lg font-black tracking-tighter text-brand-deep font-serif uppercase">
                <span className="text-brand-primary mr-1">/</span>Library
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setActiveTab("bookmarks")}
                className={`w-10 h-10 rounded-sm flex items-center justify-center transition-all active:scale-90 ${activeTab === "bookmarks" ? "bg-red-50 text-red-500 shadow-sm" : "bg-white border border-brand-primary/5 text-text-muted"}`}
              >
                <span className="text-lg">❤️</span>
              </button>
            </div>
          </div>

          {/* Mobile Path Breadcrumbs */}
          {selectedPath.length > 0 && (
            <div className="px-4 pb-4 flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-brand-primary/5 pt-3">
              <button
                onClick={() => setSelectedPath([])}
                className="flex-shrink-0 px-3 py-1.5 bg-brand-primary/5 text-brand-primary text-[10px] font-black uppercase tracking-widest rounded-sm border border-brand-primary/10"
              >
                Root
              </button>
              {selectedPath.map((seg, i) => (
                <div key={i} className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-slate-300 text-xs">/</span>
                  <button
                    onClick={() => setSelectedPath(selectedPath.slice(0, i + 1))}
                    className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-sm border transition-all ${i === selectedPath.length - 1 ? "bg-brand-primary text-white border-brand-primary" : "bg-white text-text-muted border-brand-primary/5"}`}
                  >
                    {seg}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Sidebar/Drawer (Bottom Sheet style) */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-brand-deep/30 backdrop-blur-sm z-[100]"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed inset-x-0 bottom-0 bg-white rounded-t-[32px] shadow-2xl z-[101] flex flex-col h-[85vh] border-t border-brand-primary/5"
              >
                <div className="flex justify-center p-4">
                  <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                </div>
                
                <div className="flex-1 flex flex-col min-h-0 px-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-brand-deep font-serif uppercase tracking-tight">Navigation</h2>
                    <button onClick={() => setIsSidebarOpen(false)} className="w-10 h-10 rounded-sm bg-slate-50 flex items-center justify-center font-black text-lg shadow-sm">✕</button>
                  </div>

                  <div className="mb-6 relative">
                    <input
                      type="text"
                      placeholder="주제를 찾아보세요..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-sm py-4 pl-12 pr-4 text-sm font-bold shadow-inner-soft"
                    />
                    <svg className="absolute left-4 top-4.5 w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  <nav className="flex-1 overflow-y-auto pb-24 space-y-2 custom-scrollbar">
                    {Object.values(filteredTOC.children).map((node) => (
                      <TOCAccordion
                        key={node.name}
                        node={node}
                        level={0}
                        onSelect={handleSelectSection}
                        selectedPath={selectedPath}
                        searchQuery={searchQuery}
                      />
                    ))}
                  </nav>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* 📄 Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-10 md:py-20 pb-safe-offset-20">
        <AnimatePresence mode="wait">
          {activeTab === "bookmarks" ? (
            <motion.div 
              key="bookmarks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12 pt-8 md:pt-0"
            >
              <div>
                <p className="text-[11px] font-black text-brand-primary uppercase tracking-[0.4em] mb-3">Collection</p>
                <h2 className="text-3xl md:text-5xl font-black text-brand-deep tracking-tighter">저장된 말씀</h2>
              </div>
              
              {bookmarks.length > 0 ? (
                <div className="grid gap-12 pb-32">
                  {bookmarks.map((word) => (
                    <QuoteCard key={word.id} word={word} showCategory={true} />
                  ))}
                </div>
              ) : (
                <div className="py-32 text-center space-y-8 grayscale">
                  <div className="text-6xl">💝</div>
                  <p className="text-xl font-bold text-text-muted">아직 저장된 말씀이 없습니다</p>
                </div>
              )}
            </motion.div>
          ) : selectedNode ? (
            <motion.div 
              key={selectedPath.join('-')}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="pt-6 md:pt-0 space-y-10"
            >
              {/* Section Header Card */}
              <div className="bg-white p-8 md:p-12 rounded-sm border border-brand-primary/5 shadow-premium group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-[100px] -z-10 group-hover:bg-brand-primary/10 transition-all duration-1000" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex items-center gap-8">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-brand-primary/5 rounded-sm flex items-center justify-center text-brand-primary text-3xl md:text-4xl transition-transform group-hover:scale-110">
                      📁
                    </div>
                    <div>
                      <p className="text-[10px] md:text-[11px] font-black text-brand-primary uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-primary/40 animate-pulse" />
                        Current Section
                      </p>
                      <h3 className="text-3xl md:text-4xl font-black text-brand-deep tracking-tighter">{selectedNode.name}</h3>
                    </div>
                  </div>
                  <Link 
                    href={`/search?mode=source&q=${encodeURIComponent(selectedNode.name)}`}
                    className="flex items-center justify-center gap-3 px-10 py-5 bg-brand-deep text-white rounded-sm text-[12px] font-black uppercase tracking-widest hover:bg-brand-primary transition-all active:scale-95 shadow-xl shadow-brand-deep/10 w-full md:w-auto"
                  >
                    🔍 <span>Explore Within</span>
                  </Link>
                </div>
              </div>

              {/* DRILL-DOWN NAVIGATION: Show Sub-Categories as Tiles */}
              {Object.keys(selectedNode.children).length > 0 && (
                <div className="space-y-8 pt-4">
                   <div className="flex items-center gap-4">
                    <div className="w-2 h-8 bg-brand-primary rounded-sm shadow-[0_0_15px_rgba(0,136,238,0.3)]"></div>
                    <div>
                      <h3 className="text-[14px] font-black text-brand-deep uppercase tracking-[0.3em]">Sub Sections</h3>
                      <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-widest">{Object.keys(selectedNode.children).length} Categories available</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {Object.values(selectedNode.children).map(child => (
                      <button
                        key={child.name}
                        onClick={() => handleSelectSection(child.path)}
                        className="flex flex-col items-start p-8 bg-white border border-brand-primary/5 rounded-sm shadow-sm hover:border-brand-primary/20 hover:shadow-active transition-all active:scale-[0.98] group text-left relative overflow-hidden"
                      >
                        <div className="absolute -right-4 -bottom-4 text-brand-primary/5 text-6xl font-black select-none group-hover:scale-125 transition-transform duration-700">
                          📁
                        </div>
                        <div className="w-12 h-12 bg-brand-primary/5 rounded-sm flex items-center justify-center text-2xl mb-6 group-hover:bg-brand-primary/10 transition-colors">
                          📁
                        </div>
                        <span className="text-base font-black text-brand-deep group-hover:text-brand-primary transition-colors pr-8">{child.name}</span>
                        <div className="flex items-center gap-2 mt-3">
                          <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{child.wordCount} Verses</span>
                          <span className="text-brand-primary opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">→</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Word List Section */}
              <div className="pt-10">
                <WordListViewer 
                  node={selectedNode} 
                  words={currentWords}
                  isLoading={isLoadingWords} 
                  highlightId={highlightId}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="root"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center min-h-[70vh] text-center pt-12 md:pt-0"
            >
              <div className="space-y-6 mb-20 px-4 relative">
                <div className="absolute inset-0 bg-brand-primary/5 blur-[120px] rounded-full -z-10" />
                <h2 className="text-[48px] md:text-[80px] font-black tracking-tighter leading-[1] text-brand-deep font-serif">
                  말씀 <span className="text-brand-primary">도서관</span>
                </h2>
                <div className="w-12 h-1 bg-brand-primary/30 mx-auto rounded-full" />
                <p className="text-[16px] md:text-[20px] text-text-secondary font-medium max-w-lg mx-auto leading-relaxed break-keep">
                  지혜의 깊은 숲을 거닐며,<br />당신의 영혼을 깨우는 구절을 발견하세요.
                </p>
              </div>

              <div className="w-full max-w-4xl mx-auto pt-10 px-4 text-left">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-2 h-10 bg-brand-primary rounded-sm"></div>
                  <div>
                    <h3 className="text-[15px] font-black text-brand-deep uppercase tracking-[0.4em]">Browse Wisdom</h3>
                    <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-widest">Select a primary category to begin</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {Object.values(toc.children).map(node => (
                    <button
                      key={node.name}
                      onClick={() => handleSelectSection([node.name])}
                      className="flex flex-col items-start p-10 bg-white rounded-sm border border-brand-primary/5 shadow-premium hover:border-brand-primary/20 hover:shadow-active transition-all active:scale-95 group text-left relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-[60px] -z-10 group-hover:bg-brand-primary/10 transition-all duration-700" />
                      <div className="w-16 h-16 bg-slate-50 group-hover:bg-brand-primary/5 rounded-sm flex items-center justify-center text-3xl mb-8 transition-all duration-500 shadow-inner-soft group-hover:ring-1 group-hover:ring-brand-primary/20">
                        📔
                      </div>
                      <span className="text-xl font-black text-brand-deep group-hover:text-brand-primary transition-colors">{node.name}</span>
                      <div className="flex items-center gap-3 mt-4">
                        <span className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em]">{node.wordCount} Verses</span>
                        <span className="w-4 h-[1px] bg-slate-200 group-hover:w-8 group-hover:bg-brand-primary transition-all duration-500" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed z-40 right-6 bottom-[calc(env(safe-area-inset-bottom)+100px)] md:bottom-10 w-12 h-12 bg-brand-deep text-white rounded-sm shadow-2xl flex items-center justify-center active:scale-90 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
