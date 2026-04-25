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
    <div className="w-full">
      <button
        onClick={handleClick}
        className={`
          w-full flex items-center justify-between py-2 px-3 rounded-lg text-sm transition-all text-left
          ${isSelected 
            ? "bg-primary/10 text-primary font-bold border-l-4 border-primary" 
            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
          }
        `}
        style={{ paddingLeft: `${paddingLeft + 12}px` }}
      >
        <span className="truncate">{renderName()}</span>
        
        {hasChildren && (
          <svg
            className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

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
