"use client";

import React, { useState, useEffect, useCallback } from "react";

interface SearchInputProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
  autoFocus?: boolean;
}

export default function SearchInput({
  onSearch,
  placeholder = "키워드를 입력하세요...",
  initialValue = "",
  autoFocus = false,
}: SearchInputProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Sync with initialValue (important for back navigation)
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Handle focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(value);
    }, 400); // 400ms debounce for smoother feeling

    return () => clearTimeout(handler);
  }, [value, onSearch]);

  const clearInput = useCallback(() => {
    setValue("");
  }, []);

  return (
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-all duration-300">
        <svg className="w-5 h-5 group-focus-within:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-100/50 backdrop-blur-md border border-transparent focus:bg-white focus:border-brand-primary/30 focus:ring-4 focus:ring-brand-primary/5 pl-12 pr-12 py-3 md:py-4 rounded-2xl md:rounded-[24px] outline-none text-[15px] md:text-[16px] font-bold text-brand-deep transition-all duration-300 placeholder:text-slate-400 placeholder:font-medium shadow-sm focus:shadow-xl focus:shadow-brand-primary/10"
      />
      {value && (
        <button
          onClick={clearInput}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 active:scale-90 transition-all"
          aria-label="Clear search"
        >
          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-200/80">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </button>
      )}
    </div>
  );
}
