"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { getRandomQuiz, Quiz, QuizType, shuffleArray } from "@/features/quiz/services/quiz.service"

type ViewState = "selection" | "quiz"

export default function QuizPage() {
    const router = useRouter()

    const [view, setView] = useState<ViewState>("selection")
    const [quizType, setQuizType] = useState<QuizType | null>(null)
    const [quiz, setQuiz] = useState<Quiz | null>(null)
    const [userAnswers, setUserAnswers] = useState<string[]>([])
    const [activeBlankIndex, setActiveBlankIndex] = useState(0)
    const [showCorrection, setShowCorrection] = useState(false)
    const [shuffledOptions, setShuffledOptions] = useState<string[]>([])

    const startQuiz = (type: QuizType) => {
        const newQuiz = getRandomQuiz(type)
        setQuiz(newQuiz)
        setQuizType(type)
        setUserAnswers(new Array(newQuiz.answers.length).fill(""))
        setActiveBlankIndex(0)
        setShowCorrection(false)
        setShuffledOptions(shuffleArray([...newQuiz.options]))
        setView("quiz")
    }

    const handleNext = () => {
        if (quizType) startQuiz(quizType)
    }

    const goBack = () => {
        setView("selection")
        setQuiz(null)
    }

    const goHome = () => {
        router.push("/")
    }

    const handleOptionClick = (option: string) => {
        if (showCorrection) return

        const newAnswers = [...userAnswers]

        // 선택 해제
        const existingIndex = newAnswers.indexOf(option)
        if (existingIndex !== -1) {
            newAnswers[existingIndex] = ""
            setUserAnswers(newAnswers)
            setActiveBlankIndex(existingIndex)
            return
        }

        newAnswers[activeBlankIndex] = option
        setUserAnswers(newAnswers)

        const nextEmpty = newAnswers.findIndex(ans => ans === "")
        if (nextEmpty !== -1) setActiveBlankIndex(nextEmpty)
    }

    const checkAnswer = () => {
        setShowCorrection(true)
    }

    const questionElements = useMemo(() => {
        if (!quiz) return null

        const parts = quiz.question.split(/(\( *___ *\)|\b___+\b)/g)
        let blankCounter = 0

        return parts.map((part, index) => {
            if (part.match(/(\( *___ *\)|\b___+\b)/)) {
                const currentIdx = blankCounter++

                const isCorrect = showCorrection && userAnswers[currentIdx] === quiz.answers[currentIdx]
                const isWrong = showCorrection && userAnswers[currentIdx] !== quiz.answers[currentIdx]

                return (
                    <button
                        key={index}
                        onClick={() => !showCorrection && setActiveBlankIndex(currentIdx)}
                        className={`inline-flex flex-col items-center justify-center min-w-[64px] sm:min-w-[80px] px-2 sm:px-3 py-1 sm:py-2 mx-0.5 sm:mx-1 rounded-xl border-2 font-bold text-sm sm:text-base transition-all duration-200

                        ${activeBlankIndex === currentIdx && !showCorrection
                                ? "border-slate-900 bg-slate-50 scale-105"
                                : "border-slate-200 bg-slate-50 text-slate-400"}

                        ${isCorrect ? "bg-emerald-50 border-emerald-500 text-emerald-700" : ""}
                        ${isWrong ? "bg-rose-50 border-rose-500 text-rose-700" : ""}
                        `}
                    >
                        {showCorrection ? (
                            userAnswers[currentIdx] === quiz.answers[currentIdx] ? (
                                userAnswers[currentIdx]
                            ) : (
                                <div className="text-[11px] sm:text-xs text-center leading-tight">
                                    <div className="line-through text-rose-400">
                                        {userAnswers[currentIdx] || "?"}
                                    </div>
                                    <div className="text-emerald-600 font-bold">
                                        {quiz.answers[currentIdx]}
                                    </div>
                                </div>
                            )
                        ) : (
                            userAnswers[currentIdx] || "?"
                        )}
                    </button>
                )
            }
            return <span key={index} className="text-slate-800 font-medium text-base sm:text-lg">{part}</span>
        })
    }, [quiz, userAnswers, activeBlankIndex, showCorrection])

    const allFilled = userAnswers.every(ans => ans !== "")
    const totalCorrect = userAnswers.filter((ans, i) => ans === quiz?.answers[i]).length
    const isPerfect = quiz && totalCorrect === quiz.answers.length

    // ===========================
    // 선택 화면 (Selection View)
    // ===========================
    if (view === "selection") {
        return (
            <div className="min-h-screen bg-slate-50/60 flex items-center justify-center px-4 pt-8 pb-36 w-full">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-serif">
                            말씀 퀴즈 도서관
                        </h1>
                        <p className="text-xs sm:text-sm font-medium text-slate-400">
                            체계적인 말씀 학습을 통해 영성의 지혜를 심화합니다
                        </p>
                    </div>

                    <div className="space-y-3">
                        <QuizCategoryCard
                            title="원리강론 퀴즈"
                            description="통일 원리의 핵심 구조 체계적 학습"
                            categoryCode="DP"
                            onClick={() => startQuiz("divine_principle")}
                        />
                        <QuizCategoryCard
                            title="성경 말씀 퀴즈"
                            description="신구약 성구 암송 및 심정문 학습"
                            categoryCode="BI"
                            onClick={() => startQuiz("bible")}
                        />
                    </div>
                </div>
            </div>
        )
    }

    if (!quiz) return null

    // ===========================
    // 퀴즈 화면 (Quiz View)
    // ===========================
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col w-full">
            
            {/* 상단 네비게이션 헤더 */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 w-full">
                <div className="max-w-2xl mx-auto px-4 h-12 sm:h-14 flex items-center justify-between">
                    <button 
                        onClick={goBack} 
                        className="text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        이전으로
                    </button>
                    <h2 className="font-bold text-xs sm:text-sm text-slate-900 tracking-tight">말씀 퀴즈</h2>
                    <button 
                        onClick={goHome} 
                        className="text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        메인으로
                    </button>
                </div>
            </header>

            {/* 메인 콘텐츠 스크롤 영역 (하단 바 공간 증가에 맞춰 pb-60으로 확장) */}
            <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 space-y-5 pb-60 sm:pb-40">
                
                {/* 문제 카드 */}
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 sm:p-8 text-center leading-relaxed break-keep">
                    <div className="flex justify-center mb-4">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">
                            {quizType === "divine_principle" ? "원리강론" : "성경말씀"}
                        </span>
                    </div>
                    <div className="space-y-2">
                        {questionElements}
                    </div>
                </div>

                {/* 선택지 그리드 */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                    {shuffledOptions.map((option) => {
                        const isSelected = userAnswers.includes(option)
                        const isCorrect = quiz.answers.includes(option)

                        return (
                            <button
                                key={option}
                                onClick={() => handleOptionClick(option)}
                                className={`p-3.5 sm:p-4 rounded-xl border font-bold text-xs sm:text-sm transition-all duration-150 active:scale-98 text-center break-all flex items-center justify-center min-h-[52px] sm:min-h-[60px]

                                ${!showCorrection
                                        ? isSelected
                                            ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-400"
                                        : ""}

                                ${showCorrection
                                        ? isCorrect
                                            ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                                            : isSelected
                                                ? "bg-rose-50 border-rose-500 text-rose-800"
                                                : "opacity-30 bg-white border-slate-100 text-slate-400"
                                        : ""}
                                `}
                            >
                                {option}
                            </button>
                        )
                    })}
                </div>

                {/* 결과 고지창 피드백 오버레이 패널 */}
                {showCorrection && (
                    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 sm:p-6 space-y-4 transition-all">
                        <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-3.5 rounded-full ${isPerfect ? "bg-emerald-500" : "bg-rose-500"}`} />
                            <h3 className="font-bold text-base sm:text-lg text-slate-900">
                                {isPerfect ? "모든 정답을 맞추셨습니다" : "오답을 확인해 주세요"}
                            </h3>
                        </div>

                        <p className="text-xs sm:text-sm font-medium text-slate-500 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/40 break-keep">
                          {quiz.explanation}
                        </p>

                        <button
                            onClick={handleNext}
                            className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-xs sm:text-sm font-bold tracking-wider hover:bg-slate-800 transition shadow-sm active:scale-98"
                        >
                            다음 문제 이동
                        </button>
                    </div>
                )}
            </main>

            {/* 하단 유틸리티 고정 확인 바
               - 기존 bottom-[calc(5.5rem+...)] 에서 bottom-[calc(6.8rem+...)] 으로 높이를 더 상향 조절하여 BottomNav와 시각적/기능적 여유 공간을 확보했습니다.
            */}
            {!showCorrection && (
                <div className="fixed bottom-[calc(6.8rem+env(safe-area-inset-bottom))] lg:bottom-0 left-0 right-0 bg-white/90 lg:bg-white backdrop-blur-md border-t border-slate-200/60 lg:border-slate-100 p-4 pb-[calc(env(safe-area-inset-bottom)+4px)] lg:pb-4 z-30 transition-all duration-300">
                    <div className="max-w-2xl mx-auto">
                        <button
                            onClick={checkAnswer}
                            disabled={!allFilled}
                            className="w-full py-3.5 sm:py-4 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-bold tracking-wider hover:bg-slate-800 active:scale-[0.98] transition disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-md shadow-slate-950/5"
                        >
                            정답 확인하기
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

interface CategoryCardProps {
    title: string;
    description: string;
    categoryCode: string;
    onClick: () => void;
}

function QuizCategoryCard({ title, description, categoryCode, onClick }: CategoryCardProps) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-4 p-4 sm:p-5 bg-white rounded-2xl shadow-xs border border-slate-200/70
            hover:border-slate-400 hover:shadow-md active:scale-[0.99] transition-all duration-200 group text-left"
        >
            <div className="w-12 h-12 flex items-center justify-center rounded-xl text-xs font-mono font-bold bg-slate-50 border border-slate-100 text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors shrink-0">
                {categoryCode}
            </div>

            <div className="min-w-0 flex-1">
                <h3 className="font-bold text-base sm:text-lg text-slate-800 group-hover:text-slate-900 transition-colors tracking-tight">
                    {title}
                </h3>
                <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                    {description}
                </p>
            </div>
        </button>
    )
}