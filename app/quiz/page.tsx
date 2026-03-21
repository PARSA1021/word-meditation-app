"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { getRandomQuiz, Quiz, QuizType, shuffleArray } from "@/lib/quiz"

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
                        className={`inline-flex flex-col items-center justify-center min-w-[80px] px-3 py-2 mx-1 rounded-xl border-2 font-bold text-base transition

                        ${activeBlankIndex === currentIdx && !showCorrection
                            ? "border-blue-400 bg-blue-50 scale-105"
                            : "border-gray-200 bg-gray-50 text-gray-400"}

                        ${isCorrect ? "bg-emerald-50 border-emerald-500 text-emerald-700" : ""}
                        ${isWrong ? "bg-rose-50 border-rose-500 text-rose-700" : ""}
                        `}
                    >
                        {showCorrection ? (
                            userAnswers[currentIdx] === quiz.answers[currentIdx] ? (
                                userAnswers[currentIdx]
                            ) : (
                                <div className="text-xs text-center">
                                    <div className="line-through text-rose-400">
                                        {userAnswers[currentIdx]}
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
            return <span key={index}>{part}</span>
        })
    }, [quiz, userAnswers, activeBlankIndex, showCorrection])

    const allFilled = userAnswers.every(ans => ans !== "")
    const totalCorrect = userAnswers.filter((ans, i) => ans === quiz?.answers[i]).length
    const isPerfect = quiz && totalCorrect === quiz.answers.length

    // ===========================
    // 선택 화면
    // ===========================
    if (view === "selection") {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4">

                <div className="w-full max-w-md">

                    <div className="text-center mb-10">
                        <h1 className="text-3xl md:text-4xl font-black">
                            말씀 퀴즈
                        </h1>
                        <p className="text-gray-500 mt-2">
                            말씀을 통해 지혜를 쌓아보세요
                        </p>
                    </div>

                    <div className="space-y-4">
                        <QuizCategoryCard
                            title="원리강론 퀴즈"
                            description="핵심 원리 학습"
                            icon="💡"
                            onClick={() => startQuiz("divine_principle")}
                            color="orange"
                        />
                        <QuizCategoryCard
                            title="성경 말씀 퀴즈"
                            description="성구 암송"
                            icon="📖"
                            onClick={() => startQuiz("bible")}
                            color="blue"
                        />
                    </div>
                </div>
            </div>
        )
    }

    if (!quiz) return null

    // ===========================
    // 퀴즈 화면
    // ===========================
    return (
        <div className="min-h-screen bg-gray-50 pb-32">

            {/* 상단 네비 */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
                    <button onClick={goBack} className="text-sm text-gray-600 hover:text-black">
                        ← 뒤로
                    </button>

                    <div className="font-bold text-sm">말씀 퀴즈</div>

                    <button onClick={goHome} className="text-sm text-blue-500 hover:text-blue-600">
                        홈
                    </button>
                </div>
            </div>

            <main className="max-w-2xl mx-auto p-4 space-y-6">

                {/* 문제 */}
                <div className="bg-white rounded-2xl shadow-md p-6 text-center leading-relaxed">
                    {questionElements}
                </div>

                {/* 선택지 */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {shuffledOptions.map((option) => {
                        const isSelected = userAnswers.includes(option)
                        const isCorrect = quiz.answers.includes(option)

                        return (
                            <button
                                key={option}
                                onClick={() => handleOptionClick(option)}
                                className={`p-4 rounded-xl border font-semibold transition-all duration-200 active:scale-95

                                ${!showCorrection
                                    ? isSelected
                                        ? "bg-blue-100 border-blue-500 text-blue-700 shadow-md scale-105"
                                        : "bg-white border-gray-200 hover:border-blue-300"
                                    : ""}

                                ${showCorrection
                                    ? isCorrect
                                        ? "bg-emerald-50 border-emerald-500"
                                        : isSelected
                                            ? "bg-rose-50 border-rose-500"
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
                    <div className="bg-white rounded-2xl shadow-md p-6 space-y-3">
                        <h3 className="font-bold text-lg">
                            {isPerfect ? "🌟 완벽합니다!" : "❌ 틀린 부분 확인"}
                        </h3>

                        <p className="text-gray-600">{quiz.explanation}</p>

                        <button
                            onClick={handleNext}
                            className="w-full py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
                        >
                            다음 문제
                        </button>
                    </div>
                )}
            </main>

            {/* 하단 버튼 */}
            {!showCorrection && (
                <div className="sticky bottom-0 bg-white/80 backdrop-blur border-t p-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
                    <div className="max-w-2xl mx-auto">
                        <button
                            onClick={checkAnswer}
                            disabled={!allFilled}
                            className="w-full py-4 rounded-xl bg-blue-500 text-white font-semibold shadow-md hover:bg-blue-600 active:scale-[0.98] transition disabled:bg-gray-300"
                        >
                            정답 확인하기
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

// 카드
function QuizCategoryCard({ title, description, icon, onClick, color }: any) {

    const colorStyles: any = {
        orange: "bg-orange-100 text-orange-600",
        blue: "bg-blue-100 text-blue-600",
    }

    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-4 p-5 bg-white rounded-2xl shadow-md border border-gray-100
            hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] transition-all duration-300"
        >
            <div className={`w-14 h-14 flex items-center justify-center rounded-xl text-2xl ${colorStyles[color]}`}>
                {icon}
            </div>

            <div className="text-left">
                <h3 className="font-bold text-lg">{title}</h3>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
        </button>
    )
}