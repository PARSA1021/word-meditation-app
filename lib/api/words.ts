// lib/api/words.ts
import { Word } from "@/lib/types/word"

export async function fetchRandomWord(exceptId?: number): Promise<Word> {
  const url = exceptId
    ? `/api/words/random?except=${exceptId}`
    : '/api/words/random'

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error("Failed to fetch random word")
  }
  return res.json()
}
