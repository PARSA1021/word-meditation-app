"use client"

import { useState, useMemo } from "react"
import { getRandomQuiz, Quiz, QuizType, shuffleArray } from "@/lib/quiz"

type ViewState = "selection" | "quiz" | "result"

export default function QuizPage() {
    const [view, setView] = useState<ViewState>("selection")
    const [quizType, setQuizType] = useState<QuizType | null>(null)
    const [quiz, setQuiz] = useState<Quiz | null>(null)
    const [userAnswers, setUserAnswers] = useState<string[]>([])
    const [activeBlankIndex, setActiveBlankIndex] = useState(0)
    const [showCorrection, setShowCorrection] = useState(false)
    const [shuffledOptions, setShuffledOptions] = useState<string[]>([])

    // Initialize/Next Quiz
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

    const handleOptionClick = (option: string) => {
        if (showCorrection) return

        const newAnswers = [...userAnswers]
        newAnswers[activeBlankIndex] = option
        setUserAnswers(newAnswers)

        // Auto-advance
        const nextEmpty = newAnswers.findIndex((ans, idx) => idx > activeBlankIndex && ans === "")
        if (nextEmpty !== -1) {
            setActiveBlankIndex(nextEmpty)
        } else {
            const anyEmpty = newAnswers.findIndex(ans => ans === "")
            if (anyEmpty !== -1) {
                setActiveBlankIndex(anyEmpty)
            }
        }
    }

    const checkAnswer = () => {
        setShowCorrection(true)
    }

    // Parse question into parts and blanks
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
                        key={`blank-${index}`}
                        onClick={() => !showCorrection && setActiveBlankIndex(currentIdx)}
                        className={`inline-flex items-center justify-center min-w-[90px] px-3 py-2 mx-1 rounded-2xl border-[3px] transition-all duration-300 font-bold text-lg ${activeBlankIndex === currentIdx && !showCorrection
                            ? "border-amber-400 bg-amber-50 scale-105 shadow-lg shadow-amber-200/20"
                            : "border-slate-100 bg-slate-50 text-slate-400"
                            } ${isCorrect ? "bg-emerald-50 border-emerald-500 text-emerald-700" : ""} ${isWrong ? "bg-rose-50 border-rose-500 text-rose-700" : ""
                            }`}
                    >
                        {userAnswers[currentIdx] || (showCorrection ? quiz.answers[currentIdx] : "?")}
                    </button>
                )
            }
            return <span key={`text-${index}`} className="leading-normal">{part}</span>
        })
    }, [quiz, userAnswers, activeBlankIndex, showCorrection])

    const allFilled = userAnswers.every(ans => ans !== "")
    const totalCorrect = userAnswers.filter((ans, i) => ans === quiz?.answers[i]).length
    const isPerfect = quiz && totalCorrect === quiz.answers.length

    if (view === "selection") {
        return (
            <div className="min-h-screen bg-[#F2F2F7] p-6 pb-32">
                <div className="max-w-xl mx-auto space-y-10 pt-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="space-y-2 px-2">
                        <p className="label-tertiary">Learning Center</p>
                        <h1 className="text-4xl font-black text-black">말씀 퀴즈</h1>
                        <p className="text-[17px] text-slate-500 font-medium">학습하고 싶은 분야를 선택해 주세요.</p>
                    </div>

                    <div className="space-y-4">
                        <QuizCategoryCard
                            title="원리강론 퀴즈"
                            description="진리의 핵심 원리를 빈칸 채우기로 마스터합니다."
                            icon="💡"
                            onClick={() => startQuiz("divine_principle")}
                            accent="bg-orange-100 text-orange-600"
                        />
                        <QuizCategoryCard
                            title="성경 말씀 퀴즈"
                            description="성경 속 귀한 성구들을 재미있게 암송합니다."
                            icon="📖"
                            onClick={() => startQuiz("bible")}
                            accent="bg-blue-100 text-blue-600"
                        />
                    </div>
                </div>
            </div>
        )
    }

    if (!quiz) return null

    return (
        <div className="min-h-screen bg-[#F2F2F7] pb-40">
            {/* Header */}
            <header className="sticky top-0 z-50 airbnb-nav border-b border-black/5 px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => setView("selection")}
                        className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-black active:scale-90 transition-transform hover:bg-[#0099ff] hover:text-white"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    <h2 className="text-lg font-black text-black">
                        {quizType === "bible" ? "성경 퀴즈" : "원리강론 퀴즈"}
                    </h2>
                    <div className="w-10"></div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto p-6 space-y-8 animate-in fade-in zoom-in-95 duration-500">
                {/* Question Area */}
                <div className="airbnb-card bg-white p-8 md:p-12">
                    <div className="word-emphasis text-center leading-relaxed">
                        {questionElements}
                    </div>
                </div>

                {/* Options Section */}
                <div className="space-y-4">
                    <p className="label-tertiary px-2">정답 선택</p>
                    <div className="grid grid-cols-2 gap-3">
                        {shuffledOptions.map((option) => (
                            <button
                                key={option}
                                onClick={() => handleOptionClick(option)}
                                disabled={showCorrection}
                                className={`airbnb-card py-5 px-4 text-center font-bold text-[17px] active:bg-[#f7f7f7] hover:border-[#0099ff] ${userAnswers.includes(option)
                                    ? "border-[#0099ff] bg-blue-50/50 text-[#0099ff]"
                                    : "text-[#222222]"
                                    } ${showCorrection ? "opacity-40 cursor-not-allowed" : ""}`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results / Next */}
                {showCorrection && (
                    <div className="airbnb-card bg-[#F7F7F7] border-none p-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-start gap-4">
                            <div className="text-4xl">{isPerfect ? "🌟" : "🧐"}</div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-black">
                                    {isPerfect ? "완벽합니다!" : "결과를 확인해 보세요."}
                                </h3>
                                <p className="text-[15px] text-slate-500 font-medium leading-relaxed">
                                    {quiz.explanation}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleNext}
                            className="ios-btn w-full bg-black shadow-lg shadow-black/10"
                        >
                            다음 문제 풀기
                        </button>
                    </div>
                )}
            </main>

            {/* Sticky Check Button */}
            {!showCorrection && (
                <div className="fixed bottom-28 left-6 right-6 z-40 max-w-xl mx-auto">
                    <button
                        onClick={checkAnswer}
                        disabled={!allFilled}
                        className="ios-btn w-full shadow-2xl disabled:bg-slate-200 disabled:shadow-none transition-all"
                    >
                        <span>정답 확인하기</span>
                    </button>
                </div>
            )}
        </div>
    )
}

function QuizCategoryCard({ title, description, icon, onClick, accent }: {
    title: string;
    description: string;
    icon: string;
    onClick: () => void;
    accent: string;
}) {
    return (
        <button
            onClick={onClick}
            className="airbnb-card w-full flex items-center gap-4 text-left group hover:border-[#0099ff]"
        >
            <div className={`w-14 h-14 shrink-0 rounded-[22px] flex items-center justify-center text-3xl ${accent}`}>
                {icon}
            </div>
            <div className="flex-grow">
                <h3 className="text-[19px] font-black text-black">{title}</h3>
                <p className="text-[14px] text-slate-500 font-medium">{description}</p>
            </div>
            <div className="text-slate-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
            </div>
        </button>
    )
}
