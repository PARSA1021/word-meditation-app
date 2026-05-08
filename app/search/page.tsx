"use client";

import React, { useState, Suspense, useEffect } from "react";
import useSWR from "swr";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { SearchResult } from "@/lib/words";
import SearchInput from "@/components/search/SearchInput";
import SearchCategoryTabs from "@/components/search/SearchCategoryTabs";
import QuoteCard from "@/components/QuoteCard";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const fetcher = (url: string) => fetch(url).then(async (res) => {
  if (!res.ok) throw new Error("Search API failed");
  return res.json();
});

function SearchFeed() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // URL에서 초기 상태 로드 (SSR 및 초기 Hydration 일관성 유지)
  const [query, setQuery] = useState(() => searchParams.get("q") || "");
  const [mode, setMode] = useState<"text" | "source">(() => (searchParams.get("mode") as "text" | "source") || "text");
  const [type, setType] = useState(() => searchParams.get("type") || "");
  const [page, setPage] = useState(() => parseInt(searchParams.get("page") || "1"));

  // 컴포넌트 마운트 시 sessionStorage에서 상태 복원 (URL에 값이 없는 경우에만)
  useEffect(() => {
    if (!searchParams.get("q")) {
      const savedQuery = sessionStorage.getItem("last_search_query");
      if (savedQuery) setQuery(savedQuery);
    }
    if (!searchParams.get("mode")) {
      const savedMode = sessionStorage.getItem("last_search_mode") as "text" | "source";
      if (savedMode) setMode(savedMode);
    }
    if (!searchParams.get("type")) {
      const savedType = sessionStorage.getItem("last_search_type");
      if (savedType) setType(savedType);
    }
  }, []); // 마운트 시 1회 실행
  
  const limit = 30;

  const [isRelatedExpanded, setIsRelatedExpanded] = useState(false);
  const [filterConfidence, setFilterConfidence] = useState<"all" | "high" | "medium" | "low">("all");

  // 검색 상태 변경 시 URL 및 sessionStorage 업데이트
  useEffect(() => {
    setIsRelatedExpanded(false); // 검색 조건 변경 시 초기화
    setFilterConfidence("all");
    const params = new URLSearchParams();
    if (query) {
      params.set("q", query);
      sessionStorage.setItem("last_search_query", query);
    } else {
      sessionStorage.removeItem("last_search_query");
    }
    
    params.set("mode", mode);
    sessionStorage.setItem("last_search_mode", mode);
    
    if (type) {
      params.set("type", type);
      sessionStorage.setItem("last_search_type", type);
    }
    
    if (page > 1) params.set("page", page.toString());

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    
    router.replace(newUrl, { scroll: false });
  }, [query, mode, type, page, pathname, router]);

    // 페이지 진입 시 이전 스크롤 위치 복원
    useEffect(() => {
        const savedScroll = sessionStorage.getItem("last_search_scroll");
        const savedQuery = sessionStorage.getItem("last_search_query");

        // 만약 넘어온 검색어가 이전 세션의 검색어와 동일하다면 (뒤로가기 등) 스크롤을 복원
        if (savedScroll && query === savedQuery) {
            // SWR이 캐시에서 데이터를 렌더링할 시간을 충분히 확보
            setTimeout(() => {
                window.scrollTo({ top: parseInt(savedScroll), behavior: "instant" });
            }, 300);
        }

        const handleScroll = () => {
            sessionStorage.setItem("last_search_scroll", window.scrollY.toString());
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [query]);

  // 필터 변경 시 페이지 초기화
  useEffect(() => {
    setPage(1);
  }, [query, mode, type]);

  const { data, isLoading, isValidating } = useSWR(
    query ? `/api/words/search?q=${encodeURIComponent(query)}&mode=${mode}${type ? `&type=${encodeURIComponent(type)}` : ""}&page=${page}&limit=${limit}` : null,
    fetcher,
    { 
      keepPreviousData: true,
      revalidateOnFocus: false
    }
  );

  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches on mount
  useEffect(() => {
    const saved = localStorage.getItem("recent_searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent searches", e);
      }
    }
  }, []);

  // Update recent searches when query changes and results are found
  useEffect(() => {
    if (query && data?.data?.length > 0) {
      setRecentSearches(prev => {
        const next = [query, ...prev.filter(q => q !== query)].slice(0, 5);
        localStorage.setItem("recent_searches", JSON.stringify(next));
        return next;
      });
    }
  }, [query, data]);

  const removeRecentSearch = (e: React.MouseEvent, q: string) => {
    e.stopPropagation();
    setRecentSearches(prev => {
      const next = prev.filter(item => item !== q);
      localStorage.setItem("recent_searches", JSON.stringify(next));
      return next;
    });
  };

  const isFetching = isLoading || isValidating;

  const handleTypeChange = (newType: string) => {
    setType(newType);
  };

  const totalPages = data?.meta?.totalPages || 0;

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg/30">
      {/* 1. Sticky Search Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-3xl border-b border-slate-200/50 px-4 py-3 md:px-6 md:py-4 transition-all duration-300">
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100/80 text-brand-deep hover:bg-brand-primary hover:text-white transition-all active:scale-90"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-lg md:text-xl font-black text-brand-deep tracking-tight">말씀 검색</h1>
            </div>
            
            {/* Mobile-friendly Search Mode Toggle */}
            <div className="relative flex p-1 bg-slate-100/50 backdrop-blur-md rounded-xl border border-white/60 shadow-inner scale-90 origin-right md:scale-100">
              <div
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm border border-slate-100/50 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)"
                style={{ left: mode === 'text' ? '4px' : 'calc(50%)' }}
              />
              {(["text", "source"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`relative z-10 px-4 py-1.5 rounded-lg text-[10px] font-black transition-colors duration-300 uppercase tracking-widest
                        ${mode === m ? "text-brand-deep" : "text-slate-400"}`}
                >
                  {m === "text" ? "본문" : "출처"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <SearchInput onSearch={setQuery} initialValue={query} />

            <div className="pt-1">
              <SearchCategoryTabs
                counts={data?.meta?.counts || {}}
                activeType={type}
                onTypeChange={handleTypeChange}
              />
            </div>
          </div>
        </div>
      </header>

      {/* 2. Results Feed */}
      <main className="max-w-3xl mx-auto w-full px-4 md:px-6 pt-4 pb-24 lg:pb-12">
        <AnimatePresence mode="wait">
          {isFetching && !data && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-32 text-center space-y-4"
            >
              <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mx-auto" />
              <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em]">Searching Truth</p>
            </motion.div>
          )}

          {data?.data?.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 pt-2"
            >
              <div className="px-2 mb-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-brand-primary rounded-full shadow-[0_0_8px_rgba(var(--brand-primary-rgb),0.5)]" />
                    <h2 className="text-[13px] font-black text-brand-deep uppercase tracking-widest">
                      Insight Analysis
                    </h2>
                  </div>
                  <button 
                    onClick={() => setFilterConfidence("all")}
                    className={`text-[10px] font-bold transition-all ${filterConfidence === 'all' ? 'text-brand-primary opacity-100' : 'text-slate-300 opacity-0 pointer-events-none'}`}
                  >
                    Reset Filter
                  </button>
                </div>
                
                {/* Premium Interactive Chips */}
                <div className="flex flex-wrap gap-2.5">
                  {data.data.some((r: SearchResult) => r.confidence === 'high') && (
                    <button
                      onClick={() => setFilterConfidence(filterConfidence === 'high' ? 'all' : 'high')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all duration-500 ${
                        filterConfidence === 'high' 
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-100 scale-105' 
                          : 'bg-white text-emerald-600 border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/30'
                      }`}
                    >
                      <span className="text-xs">✨</span>
                      <span className="text-[11px] font-black uppercase tracking-tight">정확 일치</span>
                    </button>
                  )}

                  {data.data.some((r: SearchResult) => r.confidence === 'medium') && (
                    <button
                      onClick={() => setFilterConfidence(filterConfidence === 'medium' ? 'all' : 'medium')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all duration-500 ${
                        filterConfidence === 'medium' 
                          ? 'bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-100 scale-105' 
                          : 'bg-white text-purple-600 border-purple-100 hover:border-purple-300 hover:bg-purple-50/30'
                      }`}
                    >
                      <span className="text-xs">💡</span>
                      <span className="text-[11px] font-black uppercase tracking-tight">유사/기본형</span>
                    </button>
                  )}

                  {data.data.some((r: SearchResult) => r.confidence === 'low') && (
                    <button
                      onClick={() => setFilterConfidence(filterConfidence === 'low' ? 'all' : 'low')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all duration-500 ${
                        filterConfidence === 'low' 
                          ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-100 scale-105' 
                          : 'bg-white text-amber-600 border-amber-100 hover:border-amber-300 hover:bg-amber-50/30'
                      }`}
                    >
                      <span className="text-xs">⌨️</span>
                      <span className="text-[11px] font-black uppercase tracking-tight">초성/부분</span>
                    </button>
                  )}
                </div>

                {filterConfidence !== 'all' && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 text-[11px] font-medium text-slate-400 italic"
                  >
                    * '{filterConfidence === 'high' ? '정확 일치' : filterConfidence === 'medium' ? '유사 의미/기본형' : '초성/부분 일치'}' 필터가 적용되었습니다.
                  </motion.p>
                )}
              </div>

              <div className="space-y-16">
                {/* 1. Exact Matches Section */}
                {data.data.some((r: SearchResult) => r.confidence === 'high') && (filterConfidence === 'all' || filterConfidence === 'high') && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-[11px] font-black text-brand-deep uppercase tracking-[0.2em]">정확히 일치하는 말씀</span>
                    </div>
                    <div className="space-y-4 md:space-y-6">
                      {data.data
                        .filter((r: SearchResult) => r.confidence === 'high')
                        .map((result: SearchResult, index: number) => (
                          <motion.div
                            key={result.word.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <QuoteCard
                              word={result.word}
                              showCategory={true}
                              highlightRanges={result.highlightRanges}
                              matchType={result.matchType}
                              explanation={result.explanation}
                              confidence={result.confidence}
                            />
                          </motion.div>
                        ))}
                    </div>
                  </div>
                )}

                {/* 2. Related Results Section */}
                {data.data.some((r: SearchResult) => r.confidence !== 'high') && (filterConfidence === 'all' || filterConfidence === 'medium' || filterConfidence === 'low') && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">관련 말씀</span>
                    </div>
                    <div className="space-y-4 md:space-y-6">
                      {data.data
                        .filter((r: SearchResult) => (filterConfidence === 'all' ? r.confidence !== 'high' : r.confidence === filterConfidence))
                        .slice(0, (isRelatedExpanded || filterConfidence !== 'all') ? undefined : 3)
                        .map((result: SearchResult, index: number) => (
                          <motion.div
                            key={result.word.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <QuoteCard
                              word={result.word}
                              showCategory={true}
                              highlightRanges={result.highlightRanges}
                              matchType={result.matchType}
                              explanation={result.explanation}
                              confidence={result.confidence}
                            />
                          </motion.div>
                        ))}
                      
                      {!isRelatedExpanded && filterConfidence === 'all' && data.data.filter((r: SearchResult) => r.confidence !== 'high').length > 3 && (
                        <button
                          onClick={() => setIsRelatedExpanded(true)}
                          className="w-full py-4 bg-white border border-dashed border-slate-200 rounded-2xl text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] hover:border-brand-primary hover:text-brand-primary transition-all active:scale-[0.98]"
                        >
                          관련 말씀 더 보기 (+{data.data.filter((r: SearchResult) => r.confidence !== 'high').length - 3}개)
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="py-12 flex flex-col items-center gap-6">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        setPage(p => Math.max(1, p - 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={page === 1}
                      className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-sm text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:border-brand-primary hover:text-brand-primary transition-all active:scale-90"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <div className="px-6 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-sm">
                      <span className="text-sm font-black text-brand-deep tabular-nums">
                        {page} <span className="text-slate-300 mx-1">/</span> {totalPages}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setPage(p => Math.min(totalPages, p + 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={page === totalPages}
                      className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-sm text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:border-brand-primary hover:text-brand-primary transition-all active:scale-90"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  
                  <p className="text-[11px] text-slate-300 font-black uppercase tracking-[0.4em]">
                    Keep Exploring Wisdom
                  </p>
                </div>
              )}

              {data?.data && (data.data.length ?? 0) < (data?.meta?.total ?? 0) && totalPages <= 1 && (
                <div className="py-20 text-center">
                  <div className="w-1 h-12 bg-slate-200/50 mx-auto mb-6 rounded-full" />
                  <p className="text-[11px] text-slate-300 font-black uppercase tracking-[0.4em]">
                    End of Wisdom
                  </p>
                </div>
              )}
            </motion.div>
          ) : query && !isFetching ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-32 md:py-40 text-center space-y-12"
            >
              <div>
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-[32px] md:rounded-[40px] shadow-sm flex items-center justify-center text-4xl md:text-5xl mx-auto mb-8 opacity-60 border border-slate-100">
                  🥺
                </div>
                <h3 className="text-xl md:text-2xl font-black text-brand-deep mb-3 capitalize tracking-tight">앗, 관련 말씀을 아직 찾지 못했어요</h3>
                <p className="text-sm font-bold text-slate-400 px-10 break-keep leading-relaxed">'{query}'에 대한 일치하는 내용이 없습니다.<br/>다른 검색어로 다시 시도하거나 아래 추천 주제를 확인해 보세요.</p>
              </div>

              <div className="space-y-6 max-w-md mx-auto pt-4">
                <div className="flex items-center gap-2 px-1 justify-center">
                  <div className="w-1 h-3 bg-brand-primary rounded-full" />
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">대신 이런 주제는 어떠세요?</h4>
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  {["위로", "평안", "사랑", "지혜", "기도"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="px-5 py-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-[13px] font-bold text-brand-deep hover:border-brand-primary/50 hover:bg-brand-primary/5 hover:text-brand-primary transition-all duration-300 active:scale-95"
                    >
                      # {tag}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : !query && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 md:py-16 space-y-12"
            >
              {/* Recent Searches Section */}
              {recentSearches.length > 0 && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-3 bg-brand-primary rounded-full" />
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">최근 검색어</h4>
                    </div>
                    <button 
                      onClick={() => {
                        setRecentSearches([]);
                        localStorage.removeItem("recent_searches");
                      }}
                      className="text-[10px] font-bold text-slate-300 hover:text-red-400 transition-colors"
                    >
                      전체 삭제
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((q) => (
                      <button
                        key={q}
                        onClick={() => setQuery(q)}
                        className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-100 shadow-sm text-[13px] font-bold text-brand-deep hover:border-brand-primary/30 transition-all active:scale-95"
                      >
                        <span>{q}</span>
                        <div 
                          onClick={(e) => removeRecentSearch(e, q)}
                          className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          ✕
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-center space-y-6 pt-4">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-[32px] md:rounded-[40px] shadow-premium flex items-center justify-center text-3xl md:text-4xl mx-auto transition-all hover:scale-110 active:scale-95 cursor-default group border border-slate-50/50">
                  <span className="group-hover:animate-bounce">✨</span>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-brand-deep tracking-tighter">어떤 말씀을 찾으시나요?</h3>
                  <p className="text-[14px] md:text-[15px] text-slate-500 font-medium leading-relaxed px-8 md:px-12 break-keep">
                    키워드를 입력하여<br className="md:hidden" />
                    내 영혼을 깨우는 진리를 찾아보세요.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-center gap-2 px-1">
                  <div className="w-1 h-3 bg-brand-primary rounded-full" />
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">추천 검색어</h4>
                </div>

                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {["사랑", "하나님", "참부모", "가정", "진리", "평화", "믿음", "기도", "생명", "축복", "회복", "심정"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-sm text-[13px] font-bold text-slate-600 hover:border-brand-primary/30 hover:bg-brand-primary/5 hover:text-brand-primary transition-all duration-300 active:scale-95"
                    >
                      # {tag}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-brand-bg">
        <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
      </div>
    }>
      <SearchFeed />
    </Suspense>
  );
}