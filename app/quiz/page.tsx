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

        const nextEmpty = newAnswers.findIndex((ans, idx) => idx > activeBlankIndex && ans === "")
        if (nextEmpty !== -1) {
            setActiveBlankIndex(nextEmpty)
        } else {
            const anyEmpty = newAnswers.findIndex(ans => ans === "")
            if (anyEmpty !== -1) setActiveBlankIndex(anyEmpty)
        }
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
                        key={`blank-${index}`}
                        onClick={() => !showCorrection && setActiveBlankIndex(currentIdx)}
                        className={`inline-flex flex-col items-center justify-center min-w-[90px] px-3 py-2 mx-1 rounded-2xl border-[3px] transition-all duration-300 font-bold text-lg
                        
                        ${activeBlankIndex === currentIdx && !showCorrection
                            ? "border-amber-400 bg-amber-50 scale-105 shadow-lg"
                            : "border-slate-100 bg-slate-50 text-slate-400"}
                        
                        ${isCorrect ? "bg-emerald-50 border-emerald-500 text-emerald-700 scale-105" : ""}
                        ${isWrong ? "bg-rose-50 border-rose-500 text-rose-700 animate-[shake_0.3s]" : ""}
                        `}
                    >
                        {showCorrection ? (
                            userAnswers[currentIdx] === quiz.answers[currentIdx] ? (
                                userAnswers[currentIdx]
                            ) : (
                                <span className="flex flex-col items-center leading-tight">
                                    <span className="line-through text-rose-500 text-sm">
                                        {userAnswers[currentIdx]}
                                    </span>
                                    <span className="text-emerald-600 text-sm font-bold">
                                        {quiz.answers[currentIdx]}
                                    </span>
                                </span>
                            )
                        ) : (
                            userAnswers[currentIdx] || "?"
                        )}
                    </button>
                )
            }
            return <span key={`text-${index}`}>{part}</span>
        })
    }, [quiz, userAnswers, activeBlankIndex, showCorrection])

    const allFilled = userAnswers.every(ans => ans !== "")
    const totalCorrect = userAnswers.filter((ans, i) => ans === quiz?.answers[i]).length
    const isPerfect = quiz && totalCorrect === quiz.answers.length

    if (view === "selection") {
        return (
            <div className="min-h-screen bg-[#F2F2F7] p-6">
                <div className="max-w-xl mx-auto space-y-6 pt-12">
                    <h1 className="text-3xl md:text-4xl font-black">말씀 퀴즈</h1>

                    <QuizCategoryCard
                        title="원리강론 퀴즈"
                        description="핵심 원리 학습"
                        icon="💡"
                        onClick={() => startQuiz("divine_principle")}
                        accent="bg-orange-100 text-orange-600"
                    />
                    <QuizCategoryCard
                        title="성경 말씀 퀴즈"
                        description="성구 암송"
                        icon="📖"
                        onClick={() => startQuiz("bible")}
                        accent="bg-blue-100 text-blue-600"
                    />
                </div>
            </div>
        )
    }

    if (!quiz) return null

    return (
        <div className="min-h-screen bg-[#F2F2F7] pb-32 md:pb-16">

            <main className="max-w-2xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">

                {/* 문제 */}
                <div className="airbnb-card bg-white p-6 md:p-10 text-center text-lg leading-relaxed">
                    {questionElements}
                </div>

                {/* 선택지 */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {shuffledOptions.map((option) => {
                        const isSelected = userAnswers.includes(option)
                        const isCorrect = quiz.answers.includes(option)

                        return (
                            <button
                                key={option}
                                onClick={() => handleOptionClick(option)}
                                disabled={showCorrection}
                                className={`airbnb-card py-4 px-3 font-bold text-sm md:text-base transition-all
                                
                                ${!showCorrection
                                    ? isSelected
                                        ? "border-blue-500 bg-blue-50 text-blue-600"
                                        : "hover:border-blue-400"
                                    : ""}

                                ${showCorrection
                                    ? isCorrect
                                        ? "bg-emerald-50 border-emerald-500 text-emerald-700 scale-105"
                                        : isSelected
                                            ? "bg-rose-50 border-rose-500 text-rose-700"
                                            : "opacity-30"
                                    : ""}
                                `}
                            >
                                {option}
                            </button>
                        )
                    })}
                </div>

                {/* 결과 */}
                {showCorrection && (
                    <div className="airbnb-card p-6 bg-gray-100">
                        <h3 className="font-bold text-lg">
                            {isPerfect ? "🌟 완벽합니다!" : "❌ 틀린 부분을 확인해보세요"}
                        </h3>
                        <p className="text-gray-600 mt-2">{quiz.explanation}</p>

                        <button
                            onClick={handleNext}
                            className="mt-4 ios-btn w-full bg-black text-white"
                        >
                            다음 문제
                        </button>
                    </div>
                )}

                {/* PC 버튼 */}
                {!showCorrection && (
                    <div className="hidden md:block mt-6">
                        <button
                            onClick={checkAnswer}
                            disabled={!allFilled}
                            className="ios-btn w-full"
                        >
                            정답 확인하기
                        </button>
                    </div>
                )}
            </main>

            {/* 모바일 버튼 */}
            {!showCorrection && (
                <div className="md:hidden fixed bottom-[calc(env(safe-area-inset-bottom)+16px)] left-4 right-4 z-50 max-w-xl mx-auto">
                    <button
                        onClick={checkAnswer}
                        disabled={!allFilled}
                        className="ios-btn w-full shadow-2xl disabled:bg-slate-200"
                    >
                        정답 확인하기
                    </button>
                </div>
            )}
        </div>
    )
}

function QuizCategoryCard({ title, description, icon, onClick, accent }: any) {
    return (
        <button onClick={onClick} className="airbnb-card flex gap-4 p-4">
            <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${accent}`}>
                {icon}
            </div>
            <div>
                <h3 className="font-bold">{title}</h3>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
        </button>
    )
}