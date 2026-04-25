"use client";

import { useState, useMemo, useCallback, useEffect} from"react";
import { useSearchParams, useRouter} from"next/navigation";
import { SerializedTOCNode} from"@/lib/toc";
import TOCAccordion from"@/components/library/TOCAccordion";
import WordListViewer from"@/components/library/WordListViewer";
import { motion, AnimatePresence} from"framer-motion";
import { useBookmarks} from"@/context/BookmarkContext";
import QuoteCard from"@/components/QuoteCard";
import Link from"next/link";

interface LibraryClientProps {
 toc: SerializedTOCNode;
}

export default function LibraryClient({ toc}: LibraryClientProps) {
 const [selectedPath, setSelectedPath] = useState<string[]>([]);
 const [isSidebarOpen, setIsSidebarOpen] = useState(false);
 const [searchQuery, setSearchQuery] = useState("");
 const [activeTab, setActiveTab] = useState<"hierarchy" |"bookmarks">("hierarchy");
 const [highlightId, setHighlightId] = useState<number | null>(null);
 const { bookmarks} = useBookmarks();
 const searchParams = useSearchParams();
 const router = useRouter();

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
 // 해당 경로가 실제 TOC에 존재하는지 확인
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
 // 하이라이팅 아이디가 없을 때만 최상단으로 스크롤 (있을 경우 QuoteCard에서 스크롤 담당)
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
 return rootFiltered || { ...toc, children: {}};
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
 window.scrollTo({ top: 0, behavior:"smooth"});
}, []);


 return (
 <div className="flex flex-col md:flex-row min-h-screen bg-brand-bg text-text-primary transition-colors duration-500">
 
 {/* 🖥️ Desktop Sidebar */}
 <aside className="hidden md:flex sticky top-0 left-0 w-85 lg:w-96 h-screen overflow-hidden flex-col bg-white/80 backdrop-blur-xl border-r border-slate-100/50 z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
 <div className="p-8 pb-6 flex items-center justify-between">
 <h2 className="text-2xl font-black tracking-tight text-brand-deep">
 <span className="text-brand-primary mr-2">/</span>
 말씀 도서관
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
 className="w-full bg-white border border-border-subtle rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all placeholder:text-text-muted font-bold shadow-sm"
 />
 <svg className="absolute left-4.5 top-4.5 w-4.5 h-4.5 text-text-muted group-focus-within:text-brand-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
 </svg>
 </div>
 </div>

 {/* 📑 Mode Switcher Tabs */}
 <div className="px-5 mb-8 flex gap-1 bg-slate-200/40 p-1.5 rounded-[22px] mx-8 border border-white shadow-inner-soft">
 {[
 { id:"hierarchy", label:"말씀 도서관", color:"text-brand-primary"},
 { id:"bookmarks", label:"저장된 말씀", color:"text-red-500"}
 ].map((tab) => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id as any)}
 className={`flex-1 py-3 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all duration-500 ${activeTab === tab.id ? `bg-white shadow-premium ${tab.color}` :"text-text-muted hover:text-text-secondary"}`}
 >
 {tab.label}
 </button>
 ))}
 </div>

 <nav className="flex-1 overflow-y-auto px-8 pb-16 space-y-1.5 custom-scrollbar">
 {activeTab ==="hierarchy" ? (
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
 <div className="py-24 text-center space-y-4 opacity-40">
 <span className="text-4xl block">🔍</span>
 <p className="text-xs font-black uppercase tracking-widest text-text-muted">No Results Found</p>
 </div>
 )
 ) : (
 <div className="py-4 space-y-8">
 <div className="flex items-center justify-between px-2">
 <p className="text-[11px] font-black text-text-muted uppercase tracking-[0.3em]">Saved Wisdom</p>
 <span className="bg-red-50 text-red-500 text-[10px] font-black px-3 py-1 rounded-full">{bookmarks.length}</span>
 </div>
 <div className="grid gap-3">
 {bookmarks.length > 0 ? (
 bookmarks.map(word => (
 <button
 key={word.id}
 onClick={() => {
 setActiveTab("bookmarks");
 // Smooth scroll to top when switching to bookmarks
 window.scrollTo({ top: 0, behavior:"smooth"});
}}
 className="group w-full text-left p-5 rounded-[24px] text-[13px] font-bold text-text-primary bg-white/40 border border-transparent hover:border-red-100 transition-all flex items-center gap-4"
 >
 <span className="text-xl group-hover:scale-120 transition-transform duration-500">❤️</span>
 <span className="line-clamp-1 flex-1 font-bold">{word.text}</span>
 </button>
 ))
 ) : (
 <div className="py-20 text-center">
 <p className="text-xs font-black uppercase tracking-widest text-text-muted">No Saved Items</p>
 </div>
 )}
 </div>
 </div>
 )}
 </nav>
 </aside>

            {/* 📱 Mobile UI: Top Navigation & Quick TOC */}
            <div className="md:hidden">
                {/* Main Sticky Header */}
                <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm transition-all duration-500 pt-safe-top">
                    <div className="p-5 flex items-center justify-between">
 <div className="flex items-center gap-4">
 <button 
 onClick={() => setIsSidebarOpen(true)}
 className="w-11 h-11 rounded-2xl bg-brand-deep text-white flex items-center justify-center shadow-active active:scale-95 transition-all"
 >
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" />
 </svg>
 </button>
 <h1 className="text-xl font-black tracking-tight text-brand-deep">
 <span className="text-brand-primary mr-1.5">/</span>도서관
 </h1>
 </div>
 
 <div className="flex items-center gap-2">
 <button 
 onClick={() => setActiveTab("bookmarks")}
 className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 ${activeTab ==="bookmarks" ?"bg-red-50 text-red-500 shadow-premium" :"bg-white/40 text-text-muted border border-slate-100"}`}
 >
 <span className="text-xl">❤️</span>
 </button>
 </div>
 </div>

 {/* Horizontal Quick-Nav (Level 1 Categories) */}
 <div className="px-5 pb-5 overflow-x-auto no-scrollbar flex items-center gap-2">
 <button
 onClick={() => {
 setSelectedPath([]);
 setActiveTab("hierarchy");
}}
 className={`flex-shrink-0 px-5 py-2.5 rounded-2xl text-[12px] font-black uppercase tracking-[0.15em] transition-all border ${selectedPath.length === 0 ?"bg-brand-deep text-white border-brand-deep shadow-md" :"bg-white text-text-muted border-slate-200 hover:border-slate-300"}`}
 >
 ★ 첫 화면
 </button>
 {Object.values(toc.children).map((node) => (
 <button
 key={node.name}
 onClick={() => handleSelectSection([node.name])}
 className={`flex-shrink-0 px-5 py-2.5 rounded-2xl text-[12px] font-black uppercase tracking-[0.1em] border transition-all ${selectedPath[0] === node.name ?"bg-brand-primary/10 text-brand-primary border-brand-primary/30 shadow-sm" :"bg-white text-text-muted border-slate-200 hover:border-slate-300"}`}
 >
 {node.name}
 </button>
 ))}
 </div>
 </div>

 {/* Bottom Drawer */}
 <AnimatePresence>
 {isSidebarOpen && (
 <>
 <motion.div
 initial={{ opacity: 0}}
 animate={{ opacity: 1}}
 exit={{ opacity: 0}}
 onClick={() => setIsSidebarOpen(false)}
 className="fixed inset-0 bg-brand-deep/30 backdrop-blur-md z-[100]"
 />
 <motion.div
 initial={{ y:"100%"}}
 animate={{ y: 0}}
 exit={{ y:"100%"}}
 transition={{ type:"spring", damping: 30, stiffness: 300}}
 className="fixed inset-x-0 bottom-0 bg-brand-bg rounded-t-[48px] shadow-2xl z-[101] flex flex-col h-[88vh] border-t border-white"
 >
 <div className="flex justify-center p-5">
 <div className="w-16 h-1.5 bg-slate-200 rounded-full opacity-50" />
 </div>
 
 <div className="flex-1 flex flex-col min-h-0">
 <div className="px-10 flex items-center justify-between mb-8">
 <div>
 <h2 className="heading-lg">도서관 탐색</h2>
 <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mt-1">Explore Word Wisdom</p>
 </div>
 <button 
 onClick={() => setIsSidebarOpen(false)}
 className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-text-muted active:scale-90 transition-all font-black text-2xl shadow-sm"
 >
 ✕
 </button>
 </div>

 <div className="px-10 flex-1 overflow-hidden flex flex-col">
 <div className="relative mb-8">
 <input
 type="text"
 placeholder="어떤 말씀을 찾으시나요?"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full bg-white border-none rounded-3xl py-5 pl-14 pr-6 text-base focus:ring-4 focus:ring-brand-primary/10 transition-all font-bold placeholder:text-text-muted shadow-inner-soft"
 />
 <svg className="absolute left-5 top-5 w-6 h-6 text-text-muted font-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
 </svg>
 </div>

 <div className="flex gap-1.5 bg-slate-200/50 p-2 rounded-3xl mb-8 border border-white/50">
 {[
 { id:"hierarchy", label:"말씀 도서관", color:"text-brand-primary"},
 { id:"bookmarks", label:"저장된 말씀", color:"text-red-500"}
 ].map((tab) => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id as any)}
 className={`flex-1 py-4 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all duration-500 ${activeTab === tab.id ? `bg-white shadow-premium ${tab.color}` :"text-text-muted"}`}
 >
 {tab.label}
 </button>
 ))}
 </div>

 <nav className="flex-1 overflow-y-auto pb-20 space-y-2 custom-scrollbar">
 {activeTab ==="hierarchy" ? (
 Object.values(filteredTOC.children).map((node) => (
 <TOCAccordion
 key={node.name}
 node={node}
 level={0}
 onSelect={handleSelectSection}
 selectedPath={selectedPath}
 searchQuery={searchQuery}
 />
 ))
 ) : (
 <div className="space-y-4 pb-12">
 {bookmarks.map(word => (
 <button
 key={word.id}
 onClick={() => {
 setActiveTab("bookmarks");
 setIsSidebarOpen(false);
}}
 className="w-full text-left p-6 rounded-[32px] bg-white border border-slate-100 flex items-center gap-5 active:scale-95 transition-all shadow-premium group"
 >
 <span className="text-2xl group-hover:scale-120 transition-transform duration-500">❤️</span>
 <span className="text-[15px] font-bold text-brand-deep line-clamp-1 flex-1">{word.text}</span>
 </button>
 ))}
 {bookmarks.length === 0 && (
 <div className="py-24 text-center">
 <span className="text-4xl block mb-4 opacity-50">💝</span>
 <p className="text-sm font-black uppercase tracking-widest text-text-muted">Empty Collection</p>
 </div>
 )}
 </div>
 )}
 </nav>
 </div>
 </div>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 </div>

 {/* 📄 Main Content Area */}
 <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-10 md:py-20 pb-safe-offset-20">
 {activeTab ==="bookmarks" ? (
 <div className="space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 pt-8 md:pt-0">
 {/* Bookmarks Section code... */}
 <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-12">
 <div>
 <p className="text-[12px] font-black text-brand-primary uppercase tracking-[0.4em] mb-3">Collection</p>
 <h2 className="heading-xl">저장된 말씀</h2>
 <p className="text-text-muted font-bold mt-2">
 Total of {bookmarks.length} verses saved for your meditation.
 </p>
 </div>
 </div>
 
 {bookmarks.length > 0 ? (
 <div className="grid gap-10 md:gap-14 pb-32">
 {bookmarks.map((word) => (
 <QuoteCard key={word.id} word={word} showCategory={true} />
 ))}
 </div>
 ) : (
 <div className="py-32 text-center space-y-8">
 <div className="text-8xl animate-pulse">💝</div>
 <div>
 <p className="heading-lg">아직 저장된 말씀이 없습니다</p>
 <p className="text-text-muted font-bold mt-4 max-w-sm mx-auto leading-relaxed">
 마음에 울림을 주는 말씀들을 <br/>나만의 보물함에 담아보세요.
 </p>
 </div>
 </div>
 )}
 </div>
 ) : selectedNode ? (
 <div className="pt-6 md:pt-0 space-y-6 md:space-y-8">
 <div className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-premium group">
 <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-brand-primary/10 transition-colors duration-1000" />
 <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-6 md:mb-0">
 <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 rounded-[20px] flex items-center justify-center text-brand-primary text-2xl md:text-3xl border border-brand-primary/10 group-hover:scale-110 transition-transform duration-500 shadow-sm">
 📁
 </div>
 <div>
 <p className="text-[10px] md:text-[11px] font-black text-brand-primary uppercase tracking-[0.3em] mb-1.5 flex items-center gap-2">
 <span className="w-2 h-2 rounded-full bg-brand-primary/40 animate-pulse" />
 Current Section
 </p>
 <h3 className="text-2xl md:text-3xl font-black text-brand-deep tracking-tight">{selectedNode.name}</h3>
 </div>
 </div>
 
 <Link 
 href={`/search?mode=source&q=${encodeURIComponent(selectedNode.name)}`}
 className="inline-flex items-center justify-center gap-3 px-6 py-4 md:py-3.5 bg-brand-deep border border-brand-deep text-white rounded-2xl md:rounded-full text-[13px] font-black uppercase tracking-widest hover:bg-brand-primary hover:border-brand-primary transition-all active:scale-95 shadow-xl w-full md:w-auto text-center"
 >
 🔍 <span>섹션 내 검색</span>
 </Link>
 </div>

 <WordListViewer 
 node={selectedNode} 
 isLoading={false} 
 highlightId={highlightId}
 />
 </div>
 ) : (
 <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-10 animate-in fade-in duration-1000 pt-16 md:pt-0 pb-16">
 <div className="relative z-10 w-32 h-32 md:w-36 md:h-36 bg-white/60 backdrop-blur-xl rounded-[40px] md:rounded-[48px] flex items-center justify-center text-6xl md:text-7xl shadow-premium border border-white/80">
 📖
 </div>
 
 <div className="space-y-6 md:space-y-8 relative px-4">
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-brand-primary/10 rounded-full blur-3xl -z-10" />
 <h2 className="text-[34px] md:text-[56px] font-black tracking-tighter leading-[1.2] drop-shadow-sm">
 <span className="block text-slate-400 text-xl md:text-2xl mb-2 font-medium tracking-tight">당신을 위한 편지,</span>
 <span className="bg-gradient-to-r from-brand-deep via-[#00adef] to-brand-deep bg-clip-text text-transparent italic pr-2 pb-2">
 진리의 빛으로
 </span>
 <br />
 <span className="text-brand-deep">
 마음을 밝히는 묵상
 </span>
 </h2>
 <div className="flex flex-col items-center gap-4 pt-2">
 <span className="w-10 md:w-12 h-1 bg-brand-primary/20 rounded-full" />
 <p className="text-text-secondary font-bold max-w-[280px] md:max-w-sm mx-auto leading-relaxed text-[15px] md:text-[16px] tracking-widest break-keep">
 도서관의 카테고리를 선택하여<br />
 <span className="text-brand-primary/80">지혜의 여정을 시작해 보세요.</span>
 </p>
 </div>
 </div>

 <button
 onClick={() => setIsSidebarOpen(true)}
 className="group relative px-10 py-5 md:px-12 md:py-6 bg-brand-deep text-white rounded-[32px] font-black shadow-premium active:scale-95 transition-all text-[14px] md:text-[15px] uppercase tracking-widest overflow-hidden"
 >
 <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
 <span className="relative z-10 flex items-center gap-3">
 전체 도서관 둘러보기
 <svg className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
 </svg>
 </span>
 </button>
 </div>
 )}
 </main>
 </div>
 );
}
