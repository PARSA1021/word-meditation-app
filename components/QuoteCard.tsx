"use client"

import { useState } from "react"
import { Word } from "@/lib/words"
import { scriptureFont } from "@/lib/fonts"

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
            const textToCopy = `"${word.text}"\n- ${word.source} ${word.speaker ? `(${word.speaker})` : ""}`
            await navigator.clipboard.writeText(textToCopy)
            alert("말씀이 클립보드에 복사되었습니다!")
        } catch (err) {
            console.error("복사 실패:", err)
            alert("복사에 실패했습니다.")
        }
    }

    return (
        <div className="
            airbnb-card
            bg-white
            p-5 sm:p-6 md:p-7
            space-y-4
            hover:border-[#0099ff]
            transition-colors
            relative
            group
        ">

            {/* 말씀 본문 */}
            <div className="space-y-2">
                <p
                    className={`
                        ${scriptureFont.className}
                        text-[15px] sm:text-[16px] md:text-[17px] lg:text-[18px]
                        leading-[1.7]
                        tracking-[0.01em]
                        font-normal
                        text-gray-900
                        whitespace-pre-line
                    `}
                >
                    &quot;{displayText}&quot;
                </p>

                {needsExpansion && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="
                            text-[#0099ff]
                            text-[13px] sm:text-[14px]
                            font-semibold
                            pt-1
                            hover:text-blue-700
                            transition-colors
                        "
                    >
                        {isExpanded ? "접기" : "더보기"}
                    </button>
                )}
            </div>

            {/* 하단 영역 */}
            <div className="
                flex items-center justify-between
                border-t border-black/5
                pt-4 mt-4
            ">

                {/* 왼쪽 정보 */}
                <div className="flex items-center gap-3 flex-wrap">

                    {showCategory ? (
                        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                            <span className="text-[10px] sm:text-[11px] font-bold text-blue-600 uppercase tracking-wide">
                                {word.category}
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                                진리의 보물창고
                            </span>
                        </div>
                    )}

                    <p className="text-[13px] sm:text-[14px] font-medium text-slate-700">
                        {word.source}
                        <span className="text-slate-400 font-normal ml-1">
                            {word.speaker ? `(${word.speaker})` : ""}
                        </span>
                    </p>
                </div>

                {/* 복사 버튼 */}
                <button
                    onClick={copyToClipboard}
                    className="
                        w-9 h-9 sm:w-10 sm:h-10
                        flex items-center justify-center
                        rounded-full
                        bg-slate-50
                        text-slate-400
                        hover:bg-[#0099ff]
                        hover:text-white
                        transition-all
                        active:scale-95
                    "
                    title="말씀 복사하기"
                >
                    <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                    </svg>
                </button>

            </div>
        </div>
    )
}