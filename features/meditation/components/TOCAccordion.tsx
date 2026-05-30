// components/library/TOCAccordion.tsx
"use client";

import { useState, useMemo, memo, useEffect} from "react";
import { SerializedTOCNode } from "@/features/meditation/services/toc.service";
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
  const isSelected = selectedPath.join(" >") === node.path.join(" >");
  
  const isParentOfSelected = useMemo(() => {
    if (selectedPath.length <= node.path.length) return false;
    return node.path.every((segment, i) => selectedPath[i] === segment);
  }, [selectedPath, node.path]);

  const isMatch = useMemo(() => {
    if (!searchQuery) return false;
    return node.name.toLowerCase().includes(searchQuery.toLowerCase());
  }, [node.name, searchQuery]);

  const [isOpen, setIsOpen] = useState(isParentOfSelected || searchQuery.length > 0);

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
    onSelect(node.path);
  };

  const renderName = () => {
    if (!searchQuery || !isMatch) return node.name;

    const parts = node.name.split(new RegExp(`(${searchQuery})`, "gi"));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === searchQuery.toLowerCase() ? (
            <mark key={i} className="bg-brand-primary/20 text-brand-primary font-bold rounded px-0.5">{part}</mark>
          ) : part
        )}
      </span>
    );
  };

  const paddingLeft = level === 0 ? 0 : 16;

  return (
    <div className="md:px-2">
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className={`
          w-full flex items-center justify-between py-3.5 px-4 rounded-sm text-[13px] transition-all text-left group
          ${isSelected 
            ? "bg-brand-primary/5 text-brand-primary font-black shadow-sm ring-1 ring-brand-primary/10" 
            : "text-text-secondary hover:bg-slate-50 hover:text-brand-deep"
          }
        `}
        style={{ paddingLeft: `${paddingLeft + 16}px` }}
      >
        <div className="flex items-center gap-3 truncate">
          <span className={`w-1 h-3 rounded-full transition-all duration-500 ${isSelected ? "bg-brand-primary h-5" : "bg-slate-200 group-hover:bg-slate-300"}`} />
          <span className="truncate font-bold tracking-tight">{renderName()}</span>
        </div>
        
        {hasChildren && (
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black text-slate-300 group-hover:text-brand-primary/50 transition-colors uppercase">{node.wordCount}</span>
            <div className={`p-1 transition-all duration-300 ${isOpen ? "text-brand-primary rotate-180" : "text-slate-300"}`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        )}
        {!hasChildren && (
          <span className="text-[9px] font-black text-slate-300 group-hover:text-brand-primary/50 transition-colors uppercase">{node.wordCount}</span>
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
