// lib/quiz.ts

import bibleQuizData from "@/data/bibleQuiz.json"
import divineQuizData from "@/data/divineQuiz.json"

// -----------------------------
// 1️⃣ 타입 정의
// -----------------------------
export type QuizType = "bible" | "divine_principle"

export type Quiz = {
  id: number
  type: QuizType
  question: string
  options: string[]
  answers: string[]
  explanation: string
}

// -----------------------------
// 2️⃣ 데이터 초기화 (타입 주입 🔥)
// -----------------------------
const bibleQuiz: Quiz[] = (bibleQuizData as Omit<Quiz, "type">[]).map(
  (q, i) => ({
    ...q,
    type: "bible",
    id: q.id ?? i,
  })
)

const divineQuiz: Quiz[] = (divineQuizData as Omit<Quiz, "type">[]).map(
  (q, i) => ({
    ...q,
    type: "divine_principle",
    id: q.id ?? 10000 + i, // 👉 충돌 방지
  })
)

// -----------------------------
// 3️⃣ 🔥 핵심: 데이터 레지스트리
// -----------------------------
const quizMap: Record<QuizType, Quiz[]> = {
  bible: bibleQuiz,
  divine_principle: divineQuiz,
}

// 전체 풀
const allQuiz: Quiz[] = Object.values(quizMap).flat()

// -----------------------------
// 4️⃣ 가져오기
// -----------------------------
export function getQuizByType(type: QuizType): Quiz[] {
  return quizMap[type]
}

export function getAllQuiz(): Quiz[] {
  return allQuiz
}

// -----------------------------
// 5️⃣ 랜덤 퀴즈 (안전 개선)
// -----------------------------
export function getRandomQuiz(type?: QuizType): Quiz {
  const pool = type ? quizMap[type] : allQuiz

  if (pool.length === 0) {
    throw new Error("퀴즈 데이터가 비어 있습니다.")
  }

  const index = Math.floor(Math.random() * pool.length)
  return pool[index]
}

// -----------------------------
// 6️⃣ 🔥 중복 방지 랜덤
// -----------------------------
export function getRandomQuizExcept(
  exceptIds?: number[] | number
): Quiz {
  let excluded: number[] = []

  if (Array.isArray(exceptIds)) excluded = exceptIds
  else if (typeof exceptIds === "number") excluded = [exceptIds]

  const excludedSet = new Set(excluded)

  const candidates = allQuiz.filter((q) => !excludedSet.has(q.id))

  if (candidates.length === 0) {
    return getRandomQuiz()
  }

  return candidates[Math.floor(Math.random() * candidates.length)]
}

// -----------------------------
// 7️⃣ 🔥 셔플 (더 안전한 Fisher-Yates)
// -----------------------------
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array]

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }

  return result
}

// -----------------------------
// 8️⃣ 🔥 퀴즈 + 옵션 셔플
// -----------------------------
export function getShuffledQuiz(quiz: Quiz): Quiz {
  return {
    ...quiz,
    options: shuffleArray(quiz.options),
  }
}

// -----------------------------
// 9️⃣ 🔥 통계
// -----------------------------
export function getQuizStats() {
  const stats: Record<QuizType, number> = {
    bible: quizMap.bible.length,
    divine_principle: quizMap.divine_principle.length,
  }

  return {
    total: allQuiz.length,
    byType: stats,
  }
}