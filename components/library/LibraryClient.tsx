"use client";

import { useState, useMemo, useCallback } from "react";
import { SerializedTOCNode } from "@/lib/toc";
import TOCAccordion from "@/components/library/TOCAccordion";
import WordListViewer from "@/components/library/WordListViewer";
import { motion, AnimatePresence } from "framer-motion";
import { useBookmarks } from "@/context/BookmarkContext";
import QuoteCard from "@/components/QuoteCard";

interface LibraryClientProps {
  toc: SerializedTOCNode;
}

export default function LibraryClient({ toc }: LibraryClientProps) {
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"hierarchy" | "topics" | "bookmarks">("hierarchy");
  const { bookmarks } = useBookmarks();

  // --- Search Logic: Recursive tree filtering ---
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

      // 이름이 매칭되거나, 자식 중에 매칭되는 것이 있으면 이 노드를 유지
      if (isNameMatch || hasMatchingChild) {
        return {
          ...node,
          children: filteredChildren,
        };
      }
      return null;
    };

    const rootFiltered = filterNode(toc);
    return rootFiltered || { ...toc, children: {} };
  }, [toc, searchQuery]);

  // --- Topics Mode Data: Just the top-level categories ---
  const topics = useMemo(() => {
    return Object.values(toc.children).sort((a, b) => a.name.localeCompare(b.name));
  }, [toc]);

  // 현재 선택된 노드 찾기
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
    setIsSidebarOpen(false); // 모바일에서 드로어 닫기
    
    // 부드러운 스크롤 이동 (상단으로)
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* 📱 Mobile Toggle Button */}
      <div className="md:hidden sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="flex items-center gap-2 text-primary font-medium"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          목차 열기
        </button>
        <div className="text-xs font-semibold text-slate-400 truncate max-w-[200px]">
          {selectedPath.join(" > ") || "말씀 카테고리 선택"}
        </div>
      </div>

      {/* 🖥️ Desktop Sidebar / 📱 Mobile Drawer Overlay */}
      <AnimatePresence>
        {(isSidebarOpen || true) && (
          <motion.aside
            initial={false}
            animate={{ x: 0 }}
            className={`
              fixed md:sticky top-0 left-0 z-50
              w-72 h-screen overflow-hidden flex flex-col
              bg-slate-50 dark:bg-slate-900/50
              border-r border-slate-200 dark:border-slate-800
              transition-transform duration-300 ease-in-out
              ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            `}
          >
            <div className="p-6 pb-0 flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold tracking-tight">말씀 라이브러리</h2>
              <button 
                className="md:hidden"
                onClick={() => setIsSidebarOpen(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 🔍 Search Input */}
            <div className="px-6 mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="목차 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <svg className="absolute left-3 top-3 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* 📑 Mode Switcher Tabs */}
            <div className="px-5 mb-4 flex gap-1 bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl mx-5">
              <button
                onClick={() => setActiveTab("hierarchy")}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === "hierarchy" ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-400"}`}
              >
                계층
              </button>
              <button
                onClick={() => setActiveTab("topics")}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === "topics" ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-slate-400"}`}
              >
                주제
              </button>
              <button
                onClick={() => setActiveTab("bookmarks")}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === "bookmarks" ? "bg-white dark:bg-slate-700 shadow-sm text-red-500" : "text-slate-400"}`}
              >
                저장
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-6 pb-6 space-y-1">
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
                  <div className="py-10 text-center text-xs text-slate-400">
                    검색 결과가 없습니다.
                  </div>
                )
              ) : activeTab === "topics" ? (
                <div className="grid gap-2">
                   {topics.map((topic) => (
                     <button
                        key={topic.name}
                        onClick={() => {
                          setSelectedPath([topic.name]);
                          setIsSidebarOpen(false);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={`w-full text-left p-3 rounded-xl text-sm transition-all flex items-center gap-3 border ${selectedPath[0] === topic.name ? 'bg-primary/5 border-primary/20 text-primary font-bold' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 hover:border-primary/20'}`}
                     >
                        <span className="text-lg">📁</span>
                        {topic.name}
                     </button>
                   ))}
                </div>
              ) : (
                <div className="py-4 space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Saved Verses ({bookmarks.length})</p>
                  <div className="grid gap-2">
                    {bookmarks.length > 0 ? (
                      bookmarks.map(word => (
                        <button
                          key={word.id}
                          onClick={() => {
                            setSelectedPath([]); // Clear path to show search results or dedicated view
                            // We might need a "View All Bookmarks" mode in WordListViewer
                            setIsSidebarOpen(false);
                          }}
                          className="w-full text-left p-3 rounded-xl text-[13px] font-bold text-slate-600 bg-white border border-slate-100 hover:border-red-200 transition-all line-clamp-1"
                        >
                          ❤️ {word.text}
                        </button>
                      ))
                    ) : (
                      <div className="py-10 text-center">
                        <p className="text-xs text-slate-400">저장된 말씀이 없습니다.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 📱 Mobile Drawer Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 📄 Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-8 md:py-12">
        {activeTab === "bookmarks" ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-brand-deep tracking-tight">저장된 말씀</h2>
                <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mt-1">
                  Saved Verses ({bookmarks.length})
                </p>
              </div>
            </div>
            
            {bookmarks.length > 0 ? (
              <div className="grid gap-6">
                {bookmarks.map((word) => (
                  <QuoteCard key={word.id} word={word} showCategory={true} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center space-y-4">
                <div className="text-5xl">💝</div>
                <div>
                  <p className="text-lg font-bold text-slate-700">아직 저장된 말씀이 없습니다.</p>
                  <p className="text-sm text-slate-400 mt-1">마음에 드는 말씀의 하트 아이콘을 눌러 저장해보세요.</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <WordListViewer 
            node={selectedNode} 
            isLoading={false} 
          />
        )}
      </main>
    </div>
  );
}
