// components/library/TOCAccordion.tsx
"use client";

import { useState, useMemo, memo, useEffect } from "react";
import { SerializedTOCNode } from "@/lib/toc";
import { motion, AnimatePresence } from "framer-motion";

interface TOCAccordionProps {
  node: SerializedTOCNode;
  level: number;
  onSelect: (path: string[]) => void;
  selectedPath: string[];
  searchQuery?: string;
}

const TOCAccordion = memo(function TOCAccordion({ 
  node, 
  level, 
  onSelect, 
  selectedPath,
  searchQuery = ""
}: TOCAccordionProps) {
  const hasChildren = Object.keys(node.children).length > 0;
  const isSelected = selectedPath.join(" > ") === node.path.join(" > ");
  
  // 현재 노드가 선택된 경로의 부모인지 확인 (열어두기 위해)
  const isParentOfSelected = useMemo(() => {
    if (selectedPath.length <= node.path.length) return false;
    return node.path.every((segment, i) => selectedPath[i] === segment);
  }, [selectedPath, node.path]);

  // 검색어가 포함되어 있는지 확인
  const isMatch = useMemo(() => {
    if (!searchQuery) return false;
    return node.name.toLowerCase().includes(searchQuery.toLowerCase());
  }, [node.name, searchQuery]);

  const [isOpen, setIsOpen] = useState(isParentOfSelected || searchQuery.length > 0);

  // 검색어가 바뀔 때마다 검색 결과가 있으면 열어줌
  useEffect(() => {
    if (searchQuery) {
      setIsOpen(true);
    } else {
      setIsOpen(isParentOfSelected);
    }
  }, [searchQuery, isParentOfSelected]);

  const handleClick = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
    // 데이터(말씀)가 있는 노드라면 선택 처리
    if (node.words && node.words.length > 0) {
      onSelect(node.path);
    }
  };

  const renderName = () => {
    if (!searchQuery || !isMatch) return node.name;

    const parts = node.name.split(new RegExp(`(${searchQuery})`, "gi"));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === searchQuery.toLowerCase() ? (
            <mark key={i} className="bg-primary/20 text-primary font-bold rounded px-0.5">{part}</mark>
          ) : part
        )}
      </span>
    );
  };

  const paddingLeft = level === 0 ? 0 : 16;

  return (
    <div className="md:px-2">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleClick}
        className={`
          w-full flex items-center justify-between py-4 px-5 rounded-[24px] text-[14px] transition-all text-left group
          ${isSelected 
            ? "bg-brand-primary/5 text-brand-primary font-black shadow-inner-soft" 
            : "text-text-secondary dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-brand-deep dark:hover:text-white"
          }
        `}
        style={{ paddingLeft: `${paddingLeft + 20}px` }}
      >
        <div className="flex items-center gap-3 truncate">
           <span className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${isSelected ? "bg-brand-primary scale-150" : "bg-slate-200 group-hover:bg-slate-300"}`} />
           <span className="truncate">{renderName()}</span>
        </div>
        
        {hasChildren && (
          <div className={`p-1 rounded-full transition-all duration-300 ${isOpen ? "bg-primary/10 text-primary rotate-180" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </motion.button>

      <AnimatePresence initial={false}>
        {isOpen && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {Object.values(node.children)
              .sort((a, b) => {
                // 제1편, 제2편... 순으로 정렬 시도
                const aNum = parseInt(a.name.match(/\d+/)?.[0] || "0");
                const bNum = parseInt(b.name.match(/\d+/)?.[0] || "0");
                return aNum - bNum;
              })
              .map((child) => (
                <TOCAccordion
                  key={child.name}
                  node={child}
                  level={level + 1}
                  onSelect={onSelect}
                  selectedPath={selectedPath}
                  searchQuery={searchQuery}
                />
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default TOCAccordion;
