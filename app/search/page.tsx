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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function SearchFeed() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // URL에서 초기 상태 로드 및 상태 통합
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [mode, setMode] = useState<"text" | "source">((searchParams.get("mode") as "text" | "source") || "text" as const);
  const [type, setType] = useState(searchParams.get("type") || "");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
  const limit = 30; // User requested 30-50 per page

  // 검색 상태 변경 시 URL 업데이트
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (mode !== "text") params.set("mode", mode);
    if (type) params.set("type", type);
    if (page > 1) params.set("page", page.toString());

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    
    router.replace(newUrl, { scroll: false });
  }, [query, mode, type, page, pathname, router]);

  // 필터 변경 시 페이지 초기화
  useEffect(() => {
    setPage(1);
  }, [query, mode, type]);

  const { data, isLoading } = useSWR(
    query ? `/api/words/search?q=${encodeURIComponent(query)}&mode=${mode}${type ? `&type=${type}` : ""}&page=${page}&limit=${limit}` : null,
    fetcher,
    { 
      keepPreviousData: true,
      revalidateOnFocus: false
    }
  );

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
          {isLoading && !data && (
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
              <div className="flex items-center justify-between px-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-3 bg-brand-primary rounded-full" />
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    말씀 검색 결과 ({data.meta.total.toLocaleString()}개)
                  </p>
                </div>
                {totalPages > 1 && (
                  <p className="text-[10px] font-black text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    Page {page} of {totalPages}
                  </p>
                )}
              </div>

              <div className="space-y-4 md:space-y-6">
                {data.data.map((result: SearchResult, index: number) => (
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
                    />
                  </motion.div>
                ))}
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

              {data.data.length < data.meta.total && totalPages <= 1 && (
                <div className="py-20 text-center">
                  <div className="w-1 h-12 bg-slate-200/50 mx-auto mb-6 rounded-full" />
                  <p className="text-[11px] text-slate-300 font-black uppercase tracking-[0.4em]">
                    End of Wisdom
                  </p>
                </div>
              )}
            </motion.div>
          ) : query && !isLoading ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-32 md:py-40 text-center"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-[32px] md:rounded-[40px] shadow-sm flex items-center justify-center text-3xl md:text-4xl mx-auto mb-8 opacity-40 border border-slate-100">
                🔎
              </div>
              <h3 className="text-xl font-black text-brand-deep mb-3 capitalize">결과를 찾지 못했습니다</h3>
              <p className="text-sm font-bold text-slate-400 px-10 break-keep">"{type || "전체"}" 범주 내에 일치하는 내용이 없습니다.</p>
            </motion.div>
          ) : !query && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 md:py-16 space-y-12"
            >
              <div className="text-center space-y-6">
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