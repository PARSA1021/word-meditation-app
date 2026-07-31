"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Suggestion {
  text: string;
  type: "keyword" | "speaker" | "category";
}

interface SearchInputProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
  autoFocus?: boolean;
}

const POPULAR_TAGS = ["참사랑", "천일국", "참부모님", "평화", "위하여", "행복", "가정"];

export default function SearchInput({
  onSearch,
  placeholder = "말씀, 카테고리, 주제어를 입력하세요 (예: 사랑, ㄹㅇ)...",
  initialValue = "",
  autoFocus = false,
}: SearchInputProps) {
  const [value, setValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync with initialValue
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Handle focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Debounce onSearch
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(value);
    }, 400);
    return () => clearTimeout(handler);
  }, [value, onSearch]);

  // Fetch suggestions
  useEffect(() => {
    if (!value.trim() || value.trim().length < 1) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const handler = setTimeout(async () => {
      try {
        const res = await fetch(`/api/words/suggestions?q=${encodeURIComponent(value.trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (data.suggestions && data.suggestions.length > 0) {
            setSuggestions(data.suggestions);
            setIsOpen(true);
            setSelectedIndex(-1);
          } else {
            setSuggestions([]);
            setIsOpen(false);
          }
        }
      } catch (err) {
        console.error("Failed to fetch suggestions:", err);
      }
    }, 200);

    return () => clearTimeout(handler);
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (text: string) => {
    const cleanText = text.replace(/^\.\.\.|\.\.\.$/g, "").trim();
    setValue(cleanText);
    onSearch(cleanText);
    setIsOpen(false);
  };

  const handleTagClick = (tag: string) => {
    setValue(tag);
    onSearch(tag);
    setIsOpen(false);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[selectedIndex].text);
      } else {
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const clearInput = useCallback(() => {
    setValue("");
    setSuggestions([]);
    setIsOpen(false);
    if (inputRef.current) inputRef.current.focus();
  }, []);

  return (
    <div ref={containerRef} className="relative group w-full space-y-2">
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-all duration-300 pointer-events-none">
          <svg className="w-5 h-5 group-focus-within:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-slate-100/70 backdrop-blur-md border border-slate-200/60 focus:bg-white focus:border-brand-primary/40 focus:ring-4 focus:ring-brand-primary/10 pl-12 pr-12 py-3.5 md:py-4 rounded-2xl outline-none text-[14px] md:text-[16px] font-bold text-brand-deep transition-all duration-200 placeholder:text-slate-400 placeholder:font-normal shadow-sm focus:shadow-lg"
        />

        {value && (
          <button
            onClick={clearInput}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 active:scale-90 transition-all"
            aria-label="Clear search"
          >
            <div className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-200/80">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </button>
        )}
      </div>

      {/* 1-Click Popular Tag Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5 pb-1">
        <span className="text-[11px] font-bold text-slate-400 shrink-0">추천 키워드:</span>
        {POPULAR_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => handleTagClick(tag)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-all active:scale-95 ${
              value === tag
                ? "bg-brand-primary text-white font-bold shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-brand-primary"
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Autocomplete Dropdown */}
      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-xl z-50 overflow-hidden py-2"
          >
            <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span>실시간 추천 말씀 & 주제어</span>
              <span>↑↓ 키 탐색</span>
            </div>

            <div className="max-h-60 overflow-y-auto py-1">
              {suggestions.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={`${item.text}-${idx}`}
                    onClick={() => handleSelectSuggestion(item.text)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors text-xs sm:text-sm font-medium ${
                      isSelected
                        ? "bg-brand-primary/10 text-brand-primary font-bold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="shrink-0 text-slate-400">
                      {item.type === "category" ? (
                        <span className="px-1.5 py-0.5 rounded bg-brand-primary/10 text-brand-primary text-[10px] font-bold">카테고리</span>
                      ) : item.type === "speaker" ? (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 text-[10px] font-bold">화자</span>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      )}
                    </span>
                    <span className="truncate">{item.text}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
