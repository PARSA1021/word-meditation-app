"use client"

import { useState } from "react"
import { Word } from "@/lib/words"

interface QuoteCardProps {
    word: Word
    showCategory?: boolean
}

export default function QuoteCard({ word, showCategory = false }: QuoteCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const MAX_LENGTH = 120

    const needsExpansion = word.text.length > MAX_LENGTH
    const displayText = !isExpanded && needsExpansion
        ? word.text.slice(0, MAX_LENGTH) + "..."
        : word.text

    const copyToClipboard = async () => {
        try {
            const textToCopy = `"${word.text}"\n- ${word.source} ${word.speaker ? `(${word.speaker})` : ""}`;
            await navigator.clipboard.writeText(textToCopy);
            alert("말씀이 클립보드에 복사되었습니다!");
        } catch (err) {
            console.error("복사 실패:", err);
            alert("복사에 실패했습니다.");
        }
    }

    return (
        <div className="airbnb-card bg-white p-6 space-y-4 hover:border-[#0099ff] transition-colors relative group">
            <div className="space-y-2">
                <p className="word-emphasis text-black leading-snug whitespace-pre-line">
                    &quot;{displayText}&quot;
                </p>

                {needsExpansion && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-[#0099ff] text-[15px] font-bold block pt-1 hover:text-blue-700 transition-colors"
                    >
                        {isExpanded ? "접기" : "더보기"}
                    </button>
                )}
            </div>

            <div className="flex items-center justify-between border-t border-black/5 pt-5 mt-4">
                <div className="flex items-center gap-3">
                    {showCategory ? (
                        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                            <span className="text-[11px] font-black text-blue-600 uppercase tracking-wider">{word.category}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">진리의 보물창고</span>
                        </div>
                    )}
                    <p className="text-[14px] font-bold text-slate-800">
                        {word.source} <span className="text-slate-400 font-medium">{word.speaker ? `(${word.speaker})` : ""}</span>
                    </p>
                </div>

                <button
                    onClick={copyToClipboard}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-[#0099ff] hover:text-white transition-all active:scale-95"
                    title="말씀 복사하기"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                </button>
            </div>
        </div>
    )
}
