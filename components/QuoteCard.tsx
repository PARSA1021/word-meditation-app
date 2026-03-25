"use client"

import { useState } from "react"
import { Word } from "@/lib/words"
import { scriptureFont } from "@/lib/fonts"
import { highlightText } from "@/lib/highlight"

interface QuoteCardProps {
    word: Word
    showCategory?: boolean
    highlightQuery?: string
}

export default function QuoteCard({
    word,
    showCategory = false,
    highlightQuery = ""
}: QuoteCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [isCopied, setIsCopied] = useState(false) // 복사 상태 추가
    const MAX_LENGTH = 120

    const needsExpansion = word.text.length > MAX_LENGTH
    const displayText = !isExpanded && needsExpansion
        ? word.text.slice(0, MAX_LENGTH) + "..."
        : word.text

    const highlighted = highlightText(displayText, highlightQuery)

    const copyToClipboard = async () => {
        try {
            // 수정: 템플릿 리터럴 백틱(`) 적용
            const textToCopy = `"${word.text}"\n- ${word.source} ${word.speaker ? `(${word.speaker})` : ""}`
            await navigator.clipboard.writeText(textToCopy)

            // 피드백 애니메이션
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
        } catch (err) {
            console.error("복사 실패:", err)
        }
    }

    return (
        <div className="group relative bg-white p-5 md:p-7 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 ease-in-out">

            {/* 상단: 말씀 본문 */}
            <div className="space-y-3">
                <div className="relative">
                    {/* 인용구 장식 (선택 사항) */}
                    <span className="absolute -top-2 -left-2 text-4xl text-blue-50 opacity-10 font-serif">“</span>
                    <p className={`${scriptureFont.className} text-[17px] md:text-[19px] leading-[1.8] text-slate-800 whitespace-pre-line break-keep`}>
                        {highlighted}
                    </p>
                </div>

                {needsExpansion && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors inline-flex items-center gap-1"
                    >
                        {isExpanded ? "접기 ▲" : "더보기 ▼"}
                    </button>
                )}
            </div>

            {/* 구분선 */}
            <div className="my-5 border-t border-slate-50" />

            {/* 하단: 정보 및 액션 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    {showCategory && (
                        <span className="bg-blue-50 px-2.5 py-1 rounded-lg text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                            {word.category}
                        </span>
                    )}

                    <div className="text-sm md:text-base text-slate-600 font-medium">
                        <span className="text-blue-900/70">#</span> {highlightText(word.source, highlightQuery)}
                        {word.speaker && (
                            <span className="text-slate-400 ml-1.5 font-normal text-sm">
                                ({highlightText(word.speaker, highlightQuery)})
                            </span>
                        )}
                    </div>
                </div>

                {/* 복사 버튼: 모바일에서 터치 영역 확보 */}
                <button
                    onClick={copyToClipboard}
                    title="복사하기"
                    className={`
                        self-end sm:self-center w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200
                        ${isCopied
                            ? "bg-green-500 text-white"
                            : "bg-slate-50 text-slate-400 hover:bg-blue-500 hover:text-white active:scale-95"}
                    `}
                >
                    {isCopied ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                    )}
                </button>

            </div>
        </div>
    )
}