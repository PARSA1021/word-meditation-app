import bibleQuizData from "@/data/bibleQuiz.json"
import divineQuizData from "@/data/divineQuiz.json"

export type QuizType = "bible" | "divine_principle"

export type Quiz = {
  id: number
  type: QuizType
  question: string
  options: string[]
  answers: string[]
  explanation: string
}

const bibleQuiz = bibleQuizData as Quiz[]
const divineQuiz = divineQuizData as Quiz[]

export function getBibleQuiz(): Quiz[] {
  return bibleQuiz
}

export function getDivineQuiz(): Quiz[] {
  return divineQuiz
}

export function getRandomQuiz(type?: QuizType): Quiz {
  const pool = type
    ? (type === "bible" ? bibleQuiz : divineQuiz)
    : [...bibleQuiz, ...divineQuiz]
  const index = Math.floor(Math.random() * pool.length)
  return pool[index]
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}