"use client";

import React, { useRef, useCallback } from "react";
import { WordType } from "@/lib/words";
import { motion } from "framer-motion";

interface SearchCategoryTabsProps {
  counts: Record<string, number>;
  activeType: string;
  onTypeChange: (type: string) => void;
}

const MAIN_TABS = [
  { id: "all", name: "전체" },
  { id: "cheonseong", name: "천성경" },
  { id: "wonli", name: "원리강론" },
  { id: "pyeonghwashinkyung", name: "평화신경" },
  { id: "Cheon Il Guk_ddeutgil", name: "천일국시대 뜻길" },
  { id: "general", name: "일반말씀" },
];

export default function SearchCategoryTabs({
  counts,
  activeType,
  onTypeChange,
}: SearchCategoryTabsProps) {
  const formatCount = (num: number = 0) => num.toLocaleString();

  // Drag-to-scroll logic
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const dragDistance = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    isDragging.current = true;
    dragDistance.current = 0;
    startX.current = e.pageX - el.offsetLeft;
    scrollLeft.current = el.scrollLeft;
    el.style.cursor = "grabbing";
    el.style.userSelect = "none";
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!isDragging.current || !el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    dragDistance.current = Math.abs(walk);
    el.scrollLeft = scrollLeft.current - walk;
  }, []);

  const onMouseUpOrLeave = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    isDragging.current = false;
    el.style.cursor = "";
    el.style.userSelect = "";
  }, []);

  const handleTabClick = useCallback(
    (tabId: string) => {
      // If dragged more than 5px, treat as drag — not a click
      if (dragDistance.current > 5) return;
      onTypeChange(tabId === "all" ? "" : tabId);
    },
    [onTypeChange]
  );

  return (
    <div className="relative w-full">
      {/* Left fade hint */}
      <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white/80 to-transparent pointer-events-none z-10" />

      {/* Tab container with drag scroll */}
      <div
        ref={scrollRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUpOrLeave}
        onMouseLeave={onMouseUpOrLeave}
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-3 py-2 md:py-3 selection:bg-transparent cursor-grab active:cursor-grabbing"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {MAIN_TABS.map((tab) => {
          const isActive = activeType === tab.id || (tab.id === "all" && !activeType);
          const count = tab.id === "all" ? (counts.all || 0) : (counts[tab.id] || 0);

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`relative shrink-0 flex items-center gap-1.5 px-4 md:px-5 py-2 rounded-full transition-all duration-300 active:scale-95 select-none group ${!isActive ? 'hover:bg-slate-100/60' : ''}`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-brand-primary to-[#007acc] shadow-[0_4px_12px_rgba(0,153,255,0.25)] ring-1 ring-white/20 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className={`relative z-10 text-[13px] md:text-[14px] font-black tracking-tight transition-colors duration-300
                ${isActive ? "text-white" : "text-slate-400 group-hover:text-brand-primary"}`}
              >
                {tab.name}
              </span>
              <span className={`relative z-10 text-[10px] md:text-[11px] font-bold px-1.5 py-0.5 rounded-md transition-colors duration-300
                ${isActive ? "bg-white/20 text-white" : "bg-slate-50 text-slate-300 group-hover:bg-brand-primary/10 group-hover:text-brand-primary"}`}
              >
                {formatCount(count)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right fade hint */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/80 to-transparent pointer-events-none z-10" />
    </div>
  );
}
