// components/library/WordListViewer.tsx
"use client";

import { useState, useEffect, useRef, useCallback} from"react";
import { SerializedTOCNode} from"@/lib/toc";
import QuoteCard from"../QuoteCard";
import { motion} from"framer-motion";

interface WordListViewerProps {
 node: SerializedTOCNode | null;
 isLoading?: boolean;
 highlightId?: number | null;
}

const ITEMS_PER_PAGE = 20;

export default function WordListViewer({ node, isLoading, highlightId}: WordListViewerProps) {
 const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
 const observerRef = useRef<IntersectionObserver | null>(null);
 const loadMoreRef = useRef<HTMLDivElement | null>(null);

 // Reset visible count when node changes
 useEffect(() => {
 setVisibleCount(ITEMS_PER_PAGE);
 
 // If we have a highlightId, we should ensure the item is visible.
 // We can do this by expanding the visibleCount to exactly contain the highlighted item if needed.
 if (highlightId && node?.words) {
 const index = node.words.findIndex(w => w.id === highlightId);
 if (index !== -1 && index >= ITEMS_PER_PAGE) {
 // Render enough items to show the highlighted one, plus a little buffer
 setVisibleCount(Math.ceil((index + 1) / ITEMS_PER_PAGE) * ITEMS_PER_PAGE);
}
}
}, [node, highlightId]);

 const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
 const target = entries[0];
 if (target.isIntersecting) {
 setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
}
}, []);

 useEffect(() => {
 const option = {
 root: null,
 rootMargin:"0px",
 threshold: 0.1,
};
 observerRef.current = new IntersectionObserver(handleObserver, option);
 if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);
 
 return () => {
 if (observerRef.current) observerRef.current.disconnect();
};
}, [handleObserver, node]);

 if (isLoading) {
 return (
 <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
 <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
 <p className="text-slate-400 animate-pulse">말씀을 불러오는 중...</p>
 </div>
 );
}

 if (!node) {
 return (
 <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
 <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
 <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
 </svg>
 </div>
 <div>
 <h3 className="text-xl font-bold text-slate-900 mb-2">말씀을 선택해주세요</h3>
 <p className="text-slate-500 max-w-xs mx-auto">
 왼쪽 목차에서 원하시는 카테고리와 장, 절을 선택하여 말씀을 열람하실 수 있습니다.
 </p>
 </div>
 </div>
 );
}

 const words = node.words || [];

    return (
        <div className="space-y-8 md:space-y-12 pb-32">
            {/* 🧭 Premium Top Bar (Breadcrumbs & Count) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0 bg-white/50 backdrop-blur-xl p-4 md:px-6 md:py-4 rounded-2xl md:rounded-full border border-white shadow-sm">
                <nav className="flex flex-wrap items-center text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-text-muted">
                    {node.path.map((segment, index) => (
                        <div key={index} className="flex items-center whitespace-nowrap">
                            {index > 0 && <span className="mx-2 md:mx-3 text-slate-200 select-none">/</span>}
                            <span className={index === node.path.length - 1 ? "text-brand-deep font-black" : "opacity-70"}>
                                {segment}
                            </span>
                        </div>
                    ))}
                </nav>
                <div className="flex items-center gap-3 self-end md:self-auto whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                    <p className="text-[10px] md:text-[11px] font-black text-brand-primary uppercase tracking-widest mt-0.5">
                        {words.length} Verses
                    </p>
                </div>
            </div>

 {/* 📜 Word List */}
 <div className="grid gap-6 md:gap-8">
 {words.length > 0 ? (
 <>
 {words.slice(0, visibleCount).map((word, i) => (
 <QuoteCard 
 key={word.id} 
 word={word} 
 isHighlighted={highlightId === word.id} 
 />
 ))}
 {/* 🛑 Load More Observer */}
 {visibleCount < words.length && (
 <div ref={loadMoreRef} className="py-8 text-center flex items-center justify-center">
 <div className="w-8 h-8 flex items-center justify-center">
 <div className="w-6 h-6 border-2 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
 </div>
 </div>
 )}
 </>
                ) : (
                    <div className="p-16 text-center bg-white/60 backdrop-blur-md rounded-[40px] border border-dashed border-slate-200/60 shadow-sm flex flex-col items-center gap-6">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-3xl opacity-50">📂</div>
                        <div>
                            <p className="text-brand-deep font-bold text-lg mb-2">이 섹션에는 직접적인 말씀이 없습니다.</p>
                            <p className="text-text-muted text-sm font-medium tracking-tight">하위 항목을 선택해주세요.</p>
                        </div>
                    </div>
                )}
 </div>

            {/* 🔙 Back to Top */}
            <div className="flex justify-center pt-8 md:pt-12">
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-slate-100 text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-text-muted hover:text-brand-primary hover:border-brand-primary/20 hover:shadow-sm transition-all shadow-premium"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                    </svg>
                    Back to Top
                </button>
            </div>
        </div>
    );
}
