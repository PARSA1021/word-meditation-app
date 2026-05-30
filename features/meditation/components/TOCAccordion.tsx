// components/library/TOCAccordion.tsx
"use client";

import { useState, useMemo, memo, useEffect} from "react";
import { SerializedTOCNode } from "@/features/meditation/services/toc.service";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";

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

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
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
            <mark key={i} className="bg-brand-primary/10 text-brand-primary font-bold rounded px-0.5">{part}</mark>
          ) : part
        )}
      </span>
    );
  };

  const paddingLeft = level === 0 ? 0 : 8;

  return (
    <div className="md:px-0.5">
      <motion.button
        onClick={handleToggle}
        whileTap={{ scale: 0.97 }}
        className={`w-full group flex items-center justify-between py-3 px-4 rounded-2xl transition-all duration-300 ${
          isSelected 
            ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10" 
            : "hover:bg-slate-100/50 text-slate-500 hover:text-slate-900"
        }`}
        style={{ paddingLeft: `${paddingLeft + (level * 12)}px` }}
      >
        <div className="flex items-center gap-3 truncate">
          <div className="flex-shrink-0">
            {hasChildren ? (
              <div className={`transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`}>
                <ChevronRight size={16} className={isSelected ? "text-white" : "text-slate-300 group-hover:text-slate-400"} />
              </div>
            ) : (
              <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-slate-200 group-hover:bg-brand-primary/40 transition-colors"}`} />
            )}
          </div>
          <span className={`truncate tracking-tight ${isSelected ? "font-bold text-[15px]" : "font-medium text-[14px]"}`}>
            {renderName()}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold py-0.5 px-1.5 rounded-md transition-colors tabular-nums ${
            isSelected ? "bg-white/10 text-white/60" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
          }`}>
            {node.wordCount}
          </span>
        </div>
      </motion.button>

      <AnimatePresence initial={false}>
        {isOpen && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-0.5 space-y-0.5 border-l border-slate-100/80 ml-4.5">
              {Object.values(node.children)
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default TOCAccordion;
