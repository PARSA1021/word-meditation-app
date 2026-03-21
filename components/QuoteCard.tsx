"use client"

import { useState } from "react"
import { Word } from "@/lib/words"
import { scriptureFont } from "@/lib/fonts"
import { highlightText } from "@/lib/highlight"

interface QuoteCardProps {
    word: Word
    showCategory?: boolean
    highlightQuery?: string // ✅ 추가
}

export default function QuoteCard({
    word,
    showCategory = false,
    highlightQuery = ""
}: QuoteCardProps) {

    const [isExpanded, setIsExpanded] = useState(false)
    const MAX_LENGTH = 120

    const needsExpansion = word.text.length > MAX_LENGTH

    const displayText = !isExpanded && needsExpansion
        ? word.text.slice(0, MAX_LENGTH) + "..."
        : word.text

    const highlighted = highlightText(displayText, highlightQuery)

    const copyToClipboard = async () => {
        try {
            const textToCopy = `"${word.text}"\n- ${word.source} ${word.speaker ? `(${word.speaker})` : ""}`
            await navigator.clipboard.writeText(textToCopy)
            alert("말씀이 클립보드에 복사되었습니다!")
        } catch (err) {
            console.error("복사 실패:", err)
        }
    }

    return (
        <div className="airbnb-card bg-white p-6 space-y-4 hover:border-[#0099ff] transition">

            {/* 말씀 */}
            <div className="space-y-2">
                <p className={`${scriptureFont.className} text-[16px] leading-[1.7] text-gray-900 whitespace-pre-line`}>
                    “{highlighted}”
                </p>

                {needsExpansion && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-[#0099ff] text-sm font-semibold"
                    >
                        {isExpanded ? "접기" : "더보기"}
                    </button>
                )}
            </div>

            {/* 하단 */}
            <div className="flex justify-between items-center border-t pt-4">

                <div className="flex items-center gap-3 flex-wrap">

                    {showCategory && (
                        <div className="bg-blue-50 px-3 py-1 rounded-full text-xs font-bold text-blue-600">
                            {word.category}
                        </div>
                    )}

                    <p className="text-sm text-slate-600">
                        {highlightText(word.source, highlightQuery)}
                        {word.speaker && (
                            <span className="text-slate-400 ml-1">
                                ({highlightText(word.speaker, highlightQuery)})
                            </span>
                        )}
                    </p>
                </div>

                <button
                    onClick={copyToClipboard}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 hover:bg-[#0099ff] hover:text-white transition"
                >
                    📋
                </button>

            </div>
        </div>
    )
}