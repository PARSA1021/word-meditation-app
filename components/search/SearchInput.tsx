"use client";

import React, { useState, useEffect, useCallback } from "react";

interface SearchInputProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
}

export default function SearchInput({
  onSearch,
  placeholder = "키워드를 입력하세요...",
  initialValue = "",
}: SearchInputProps) {
  const [value, setValue] = useState(initialValue);

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(value);
    }, 300); // 300ms debounce

    return () => clearTimeout(handler);
  }, [value, onSearch]);

  const clearInput = useCallback(() => {
    setValue("");
  }, []);

  return (
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0099FF] transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/70 backdrop-blur-md border border-white/20 focus:bg-white focus:border-brand-primary/40 focus:ring-4 focus:ring-brand-primary/10 pl-12 pr-12 py-4 rounded-[24px] outline-none text-[16px] font-bold text-brand-deep transition-all duration-300 placeholder:text-slate-400 placeholder:font-medium shadow-[0_2px_10px_rgb(0,0,0,0.02)] focus:shadow-[0_8px_30px_rgb(0,153,255,0.12)]"
      />
      {value && (
        <button
          onClick={clearInput}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 active:scale-90 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
