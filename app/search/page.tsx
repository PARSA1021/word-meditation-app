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

  // URL에서 초기 상태 로드
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [mode, setMode] = useState<"text" | "source">((searchParams.get("mode") as "text" | "source") || "text");
  const type = searchParams.get("type") || "";

  // 검색어 입력 시 URL 업데이트
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (query) params.set("q", query); else params.delete("q");
    params.set("mode", mode);
    if (type) params.set("type", type); else params.delete("type");

    // shallow routing (Next.js 14+ app router에서는 router.replace가 권장됨)
    router.replace(`${pathname}?${params.toString()}`);
  }, [query, mode, type, pathname, router]);

  const { data, isLoading } = useSWR(
    query ? `/api/words/search?q=${encodeURIComponent(query)}&mode=${mode}${type ? `&type=${type}` : ""}` : null,
    fetcher,
    { keepPreviousData: true }
  );

  const handleTypeChange = (newType: string) => {
    const params = new URLSearchParams(searchParams);
    if (newType) params.set("type", newType);
    else params.delete("type");
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Sticky Search Header */}
      <header className="sticky top-0 z-50 glass-header px-6 py-4">
        <div className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto space-y-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-100/50 text-brand-deep hover:bg-brand-primary hover:text-white transition-all active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-black text-brand-deep tracking-tight">말씀 검색</h1>
          </div>

          <div className="space-y-4">
            <SearchInput onSearch={setQuery} initialValue={query} />

            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Search Mode Toggle */}
              <div className="flex gap-2 min-w-[180px]">
                {(["text", "source"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-black transition-all border uppercase tracking-widest
                          ${mode === m
                        ? "bg-brand-deep text-white border-brand-deep shadow-button"
                        : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
                      }`}
                  >
                    {m === "text" ? "본문" : "출처"}
                  </button>
                ))}
              </div>

              {/* Category Counter Tabs */}
              <div className="flex-1 min-w-0">
                <SearchCategoryTabs
                  counts={data?.meta?.counts || {}}
                  activeType={type}
                  onTypeChange={handleTypeChange}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Results Feed */}
      <main className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto w-full px-6 pt-4 pb-40">
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
              <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em]">Searching Path</p>
            </motion.div>
          )}

          {data?.data?.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 pt-2"
            >
              <div className="flex items-center justify-between px-2 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-3 bg-brand-primary rounded-full" />
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    말씀 검색 결과
                  </p>
                </div>
                <p className="text-[11px] font-black text-brand-primary tabular-nums">
                  {data.meta.total.toLocaleString()}
                </p>
              </div>

              <div className="space-y-4">
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

              {data.data.length < data.meta.total && (
                <div className="py-20 text-center">
                  <div className="w-1 h-12 bg-slate-50 mx-auto mb-6 rounded-full" />
                  <p className="text-[11px] text-text-muted font-black uppercase tracking-[0.4em]">
                    End of Results
                  </p>
                </div>
              )}
            </motion.div>
          ) : query && !isLoading ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-40 text-center"
            >
              <div className="w-24 h-24 bg-white rounded-[40px] shadow-premium flex items-center justify-center text-4xl mx-auto mb-8 opacity-40">
                🔎
              </div>
              <h3 className="text-xl font-black text-brand-deep mb-3">결과를 찾지 못했습니다</h3>
              <p className="text-sm font-bold text-slate-400">"{type}" 범주 내에 일치하는 내용이 없습니다.</p>
            </motion.div>
          ) : !query && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 space-y-12"
            >
              <div className="text-center">
                <div className="w-24 h-24 bg-white rounded-[40px] shadow-premium flex items-center justify-center text-4xl mx-auto mb-8 transition-all hover:scale-110 active:scale-95 cursor-default group">
                  <span className="group-hover:animate-bounce">✨</span>
                </div>
                <h3 className="text-2xl font-black text-brand-deep tracking-tighter mb-4">어떤 말씀을 찾으시나요?</h3>
                <p className="text-[15px] text-text-secondary font-medium leading-relaxed px-12 break-keep">
                  상황이나 키워드를 입력하여<br />
                  지금 당신에게 꼭 필요한 진리를 만나보세요.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 px-2">
                  <div className="w-1 h-3 bg-brand-primary rounded-full" />
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">추천 검색어</h4>
                </div>

                <div className="flex flex-wrap gap-2">
                  {["사랑", "하나님", "참부모", "가정", "진리", "평화", "믿음", "기도", "생명", "축복", "회복", "심정"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="px-5 py-3 rounded-2xl bg-white border border-slate-100 text-[14px] font-black text-slate-600 hover:border-brand-primary/20 hover:text-brand-primary hover:shadow-lg hover:shadow-brand-primary/5 transition-all active:scale-90"
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