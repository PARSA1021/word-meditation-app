"use client";

import React, { useState, Suspense, useEffect } from "react";
import useSWR from "swr";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { SearchResult } from "@/features/search/types";
import SearchInput from "@/features/search/components/SearchInput";
import SearchCategoryTabs from "@/features/search/components/SearchCategoryTabs";
import QuoteCard from "@/shared/ui/QuoteCard";
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

  const [isMounted, setIsMounted] = useState(false);

  // URL에서 초기 상태 로드
  const [query, setQuery] = useState(() => searchParams.get("q") || "");
  const [mode, setMode] = useState<"text" | "source">(() => (searchParams.get("mode") as "text" | "source") || "text");
  const [type, setType] = useState(() => searchParams.get("type") || "");
  const [page, setPage] = useState(() => parseInt(searchParams.get("page") || "1"));

  useEffect(() => {
    setIsMounted(true);
    
    // 브라우저에서만 sessionStorage/localStorage 접근
    const savedQuery = sessionStorage.getItem("last_search_query");
    const savedMode = sessionStorage.getItem("last_search_mode") as "text" | "source";
    const savedType = sessionStorage.getItem("last_search_type");
    
    if (!searchParams.get("q") && savedQuery) {
      setQuery(savedQuery);
    }
    if (!searchParams.get("mode") && savedMode) {
      setMode(savedMode);
    }
    if (!searchParams.get("type") && savedType) {
      setType(savedType);
    }
  }, [searchParams]);

  // 카테고리 및 URL 동기화 실시간 감지 이펙트
  useEffect(() => {
    const urlQuery = searchParams.get("q");
    const urlMode = searchParams.get("mode") as "text" | "source";
    const urlType = searchParams.get("type");
    const urlPage = searchParams.get("page");

    if (urlQuery !== null) {
      setQuery(urlQuery);
    }

    if (urlMode) {
      setMode(urlMode);
    }

    if (urlType !== null) {
      setType(urlType);
    }

    if (urlPage) {
      setPage(parseInt(urlPage));
    } else {
      setPage(1);
    }
  }, [searchParams]);
  
  const limit = 30;

  const [isRelatedExpanded, setIsRelatedExpanded] = useState(false);
  const [filterConfidence, setFilterConfidence] = useState<"all" | "high" | "medium" | "low">("all");
  const [showScrollTop, setShowScrollTop] = useState(false);

  // 검색 상태 변경 시 URL 및 sessionStorage 업데이트
  useEffect(() => {
    if (!isMounted) return;
    
    setIsRelatedExpanded(false); 
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
    } else {
      sessionStorage.removeItem("last_search_type");
    }
    
    if (page > 1) params.set("page", page.toString());

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    
    router.replace(newUrl, { scroll: false });
  }, [query, mode, type, page, pathname, router, isMounted]);

  // 스크롤 위치 복원 및 감지
  useEffect(() => {
    if (!isMounted) return;
    
    const savedScroll = sessionStorage.getItem("last_search_scroll");
    const savedQuery = sessionStorage.getItem("last_search_query");

    if (savedScroll && query === savedQuery) {
      setTimeout(() => {
        window.scrollTo({ top: parseInt(savedScroll), behavior: "instant" });
      }, 300);
    }

    const handleScroll = () => {
      sessionStorage.setItem("last_search_scroll", window.scrollY.toString());
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [query, isMounted]);

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

  useEffect(() => {
    if (!isMounted) return;
    
    const saved = localStorage.getItem("recent_searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent searches", e);
      }
    }
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    
    if (query && data?.data?.length > 0) {
      setRecentSearches(prev => {
        const next = [query, ...prev.filter(q => q !== query)].slice(0, 5);
        localStorage.setItem("recent_searches", JSON.stringify(next));
        return next;
      });
    }
  }, [query, data, isMounted]);

  const removeRecentSearch = (e: React.MouseEvent, q: string) => {
    e.stopPropagation();
    setRecentSearches(prev => {
      const next = prev.filter(item => item !== q);
      localStorage.setItem("recent_searches", JSON.stringify(next));
      return next;
    });
  };

  const isFetching = isLoading || isValidating;
  const handleTypeChange = (newType: string) => setType(newType);
  const totalPages = data?.meta?.totalPages || 0;

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg/30 selection:bg-brand-primary/10">
      {/* 1. Sticky Search Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-4 py-3 sm:px-6 md:py-4 transition-all duration-300">
        <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Link
                href="/"
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-slate-50 text-brand-deep hover:bg-brand-primary hover:text-white transition-all active:scale-95 border border-slate-200/60 shrink-0 shadow-sm"
                aria-label="메인 홈 화면으로 이동"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-brand-deep tracking-tight truncate">말씀 검색</h1>
            </div>
            
            {/* Grid 기반 완전 반응형 토글 스위치 */}
            <div className="relative grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200/40 shrink-0 shadow-inner w-[130px] sm:w-[150px]">
              <div
                className={`absolute top-1 bottom-1 bg-white rounded-lg shadow-sm border border-slate-200/50 transition-all duration-300 ease-out w-[calc(50%-4px)]
                  ${mode === 'text' ? 'left-1' : 'left-[calc(50%+3px)]'}`}
              />
              {(["text", "source"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`relative z-10 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold transition-colors duration-200 tracking-wider text-center
                        ${mode === m ? "text-brand-primary" : "text-slate-500 hover:text-slate-700"}`}
                >
                  {m === "text" ? "본문" : "출처"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <SearchInput onSearch={setQuery} initialValue={query} />
            <div className="pt-0.5 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
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
      <main className="max-w-3xl mx-auto w-full px-4 sm:px-6 pt-6 pb-24 md:pb-16 flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {isFetching && !data && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="my-auto py-24 text-center space-y-4 flex flex-col items-center justify-center"
            >
              <div className="w-9 h-9 border-3 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
              <p className="text-[11px] font-bold text-brand-primary uppercase tracking-[0.25em]">단어를 조명하는 중</p>
            </motion.div>
          )}

          {data?.data?.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 sm:space-y-8 w-full"
            >
              {/* 필터 세션 */}
              <div className="px-1">
                <div className="flex items-center justify-between mb-4 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-3.5 bg-brand-primary rounded-full" />
                    <h2 className="text-[12px] font-bold text-brand-deep uppercase tracking-widest">검색 분석 필터</h2>
                  </div>
                  <button 
                    onClick={() => setFilterConfidence("all")}
                    className={`text-[11px] font-medium text-slate-400 hover:text-brand-primary transition-all ${filterConfidence !== 'all' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                  >
                    필터 초기화
                  </button>
                </div>
                
                {/* [수정] 이모지 대신 인디케이터 서클로 정돈된 칩 버튼 배치 */}
                <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2">
                  {data.data.some((r: SearchResult) => r.confidence === 'high') && (
                    <button
                      onClick={() => setFilterConfidence(filterConfidence === 'high' ? 'all' : 'high')}
                      className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl border text-center transition-all duration-200 ${
                        filterConfidence === 'high' 
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                          : 'bg-white text-emerald-700 border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/20'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${filterConfidence === 'high' ? 'bg-white' : 'bg-emerald-500'}`} />
                      <span className="text-[11px] sm:text-xs font-bold tracking-tight whitespace-nowrap">정확 일치</span>
                    </button>
                  )}

                  {data.data.some((r: SearchResult) => r.confidence === 'medium') && (
                    <button
                      onClick={() => setFilterConfidence(filterConfidence === 'medium' ? 'all' : 'medium')}
                      className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl border text-center transition-all duration-200 ${
                        filterConfidence === 'medium' 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                          : 'bg-white text-indigo-700 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/20'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${filterConfidence === 'medium' ? 'bg-white' : 'bg-indigo-500'}`} />
                      <span className="text-[11px] sm:text-xs font-bold tracking-tight whitespace-nowrap">유사 의미</span>
                    </button>
                  )}

                  {data.data.some((r: SearchResult) => r.confidence === 'low') && (
                    <button
                      onClick={() => setFilterConfidence(filterConfidence === 'low' ? 'all' : 'low')}
                      className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl border text-center transition-all duration-200 ${
                        filterConfidence === 'low' 
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm' 
                          : 'bg-white text-amber-700 border-slate-200 hover:border-amber-200 hover:bg-amber-50/20'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${filterConfidence === 'low' ? 'bg-white' : 'bg-amber-500'}`} />
                      <span className="text-[11px] sm:text-xs font-bold tracking-tight whitespace-nowrap">부분 단어</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 말씀 리스트 카드 컨테이너 */}
              <div className="space-y-10 sm:space-y-12">
                {/* 1. Exact Matches Section */}
                {data.data.some((r: SearchResult) => r.confidence === 'high') && (filterConfidence === 'all' || filterConfidence === 'high') && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">정확히 일치하는 본문</span>
                    </div>
                    <div className="space-y-4">
                      {data.data
                        .filter((r: SearchResult) => r.confidence === 'high')
                        .map((result: SearchResult, index: number) => (
                          <motion.div
                            key={result.word.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.2) }}
                          >
                            <QuoteCard
                              word={result.word}
                              showCategory={true}
                              highlightRanges={result.highlightRanges}
                              matchType={result.matchType}
                              explanation={result.explanation}
                              confidence={result.confidence}
                              searchQuery={query}
                            />
                          </motion.div>
                        ))}
                    </div>
                  </div>
                )}

                {/* 2. Related Results Section */}
                {data.data.some((r: SearchResult) => r.confidence !== 'high') && (filterConfidence === 'all' || filterConfidence === 'medium' || filterConfidence === 'low') && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">연관 또는 확장 검색 결과</span>
                    </div>
                    <div className="space-y-4">
                      {data.data
                        .filter((r: SearchResult) => (filterConfidence === 'all' ? r.confidence !== 'high' : r.confidence === filterConfidence))
                        .slice(0, (isRelatedExpanded || filterConfidence !== 'all') ? undefined : 3)
                        .map((result: SearchResult, index: number) => (
                          <motion.div
                            key={result.word.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.2) }}
                          >
                            <QuoteCard
                              word={result.word}
                              showCategory={true}
                              highlightRanges={result.highlightRanges}
                              matchType={result.matchType}
                              explanation={result.explanation}
                              confidence={result.confidence}
                              searchQuery={query}
                            />
                          </motion.div>
                        ))}
                      
                      {!isRelatedExpanded && filterConfidence === 'all' && data.data.filter((r: SearchResult) => r.confidence !== 'high').length > 3 && (
                        <button
                          onClick={() => setIsRelatedExpanded(true)}
                          className="w-full py-3.5 sm:py-4 bg-white border border-dashed border-slate-200 rounded-xl text-[11px] sm:text-xs font-bold text-slate-400 tracking-wider hover:border-brand-primary hover:text-brand-primary hover:bg-slate-50/50 transition-all"
                        >
                          관련 내용 더 보기 (+{data.data.filter((r: SearchResult) => r.confidence !== 'high').length - 3}개)
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="py-6 sm:py-8 flex flex-col items-center gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setPage(p => Math.max(1, p - 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={page === 1}
                      className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm text-slate-400 disabled:opacity-20 disabled:cursor-not-allowed hover:border-brand-primary hover:text-brand-primary transition-all active:scale-90"
                      aria-label="이전 말씀 목록 페이지로 이동"
                      title="이전 페이지"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm min-w-[80px] sm:min-w-[90px] text-center">
                      <span className="text-xs sm:text-sm font-bold text-brand-deep tabular-nums">
                        {page} <span className="text-slate-300 mx-1">/</span> {totalPages}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setPage(p => Math.min(totalPages, p + 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={page === totalPages}
                      className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm text-slate-400 disabled:opacity-20 disabled:cursor-not-allowed hover:border-brand-primary hover:text-brand-primary transition-all active:scale-90"
                      aria-label="다음 말씀 목록 페이지로 이동"
                      title="다음 페이지"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : query && !isFetching ? (
            /* [수정] 결과 없음 상태에서 이모지를 지우고 정갈한 돋보기 차단 아이콘으로 대체 */
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="my-auto py-12 sm:py-16 text-center space-y-8 sm:space-y-10 max-w-md mx-auto w-full"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4 shadow-sm">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-brand-deep tracking-tight">앗, 일치하는 말씀을 찾지 못했어요</h3>
                <p className="text-xs sm:text-sm text-slate-400 break-keep leading-relaxed px-4">
                  &apos;{query}&apos;에 대한 결과가 없습니다. 철자를 확인하시거나 보다 보편적인 다른 검색어로 다시 조회해보세요.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 justify-center">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">추천 탐색 주제</span>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-center px-4">
                  {["위로", "평안", "사랑", "지혜", "기도"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:border-brand-primary hover:text-brand-primary hover:bg-slate-50/50 transition-all shadow-sm active:scale-95"
                    >
                      # {tag}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : !query && (
            /* 초기 빈화면 (Idle State) */
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8 sm:space-y-10 w-full pt-2"
            >
              {recentSearches.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">최근 검색어</h4>
                    <button 
                      onClick={() => {
                        setRecentSearches([]);
                        localStorage.removeItem("recent_searches");
                      }}
                      className="text-[11px] font-medium text-slate-400 hover:text-red-500 transition-colors"
                    >
                      전체 삭제
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((q) => (
                      <div
                        key={q}
                        className="inline-flex items-center bg-white border border-slate-200 rounded-lg text-xs overflow-hidden shadow-sm"
                      >
                        <button
                          onClick={() => setQuery(q)}
                          className="px-3 py-1.5 font-medium text-slate-700 hover:text-brand-primary transition-colors text-left"
                        >
                          {q}
                        </button>
                        <button 
                          onClick={(e) => removeRecentSearch(e, q)}
                          className="px-2.5 py-1.5 border-l border-slate-100 text-slate-400 hover:text-red-500 hover:bg-slate-50 transition-colors min-w-[32px] text-center"
                          aria-label={`${q} 삭제`}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* [수정] 반짝이 이모지를 지우고 정적이고 차분한 서적 SVG 명세 배치 */}
              <div className="text-center space-y-4 py-8 sm:py-12 border border-dashed border-slate-200 rounded-2xl bg-white/40 shadow-sm">
                <div className="w-11 h-11 sm:w-12 sm:h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 mx-auto border border-slate-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="space-y-1 px-4">
                  <h3 className="text-sm sm:text-base font-bold text-brand-deep tracking-tight">어떤 말씀을 찾고 계신가요?</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed break-keep">
                    주제어, 말씀 제목 또는 원리강론 내용을 검색하여 신앙생활과 일상에 필요한 참된 말씀을 만나보세요.
                  </p>
                </div>
              </div>

              {/* 추천 단어 패널 */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">추천 검색 단어</h4>
                <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-1.5">
                  {["사랑", "하나님", "참부모", "가정", "진리", "평화", "믿음", "기도", "생명", "축복", "회복", "심정"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="px-2 py-2 text-center rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:border-brand-primary hover:text-brand-primary hover:bg-slate-50/50 transition-all shadow-sm active:scale-95 truncate"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Scroll to Top Floating Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed z-40 right-4 bottom-[calc(env(safe-area-inset-bottom)+80px)] sm:right-6 sm:bottom-6 w-11 h-11 bg-white text-brand-deep border border-slate-200 shadow-md flex items-center justify-center rounded-xl hover:border-brand-primary hover:text-brand-primary active:scale-90 transition-all backdrop-blur-md"
            aria-label="최상단으로 스크롤 이동"
            title="위로 가기"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-brand-bg">
        <div className="w-9 h-9 border-3 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
      </div>
    }>
      <SearchFeed />
    </Suspense>
  );
}