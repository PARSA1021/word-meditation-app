import words from "@/data/words.json"

export type Word = {
  id: number
  text: string
  source: string
  category: string
  speaker?: string | null
}

export type WordStats = {
  total: number
  byCategory: { [key: string]: number }
}

export function getAllWords(): Word[] {
  return words
}

export function getRandomWord(): Word {
  const index = Math.floor(Math.random() * words.length)
  return words[index]
}

export function getRandomWordExcept(exceptId?: number | null): Word {
  if (words.length === 0) throw new Error("words 목록이 비어 있습니다.")
  if (exceptId == null || words.length === 1) return getRandomWord()

  // Avoid returning the same word repeatedly when user taps refresh quickly.
  // Bounded retries to prevent any possible infinite loop.
  for (let i = 0; i < 12; i++) {
    const w = getRandomWord()
    if (w.id !== exceptId) return w
  }
  // Fallback: deterministic next item if randomness keeps colliding.
  const currentIndex = words.findIndex(w => w.id === exceptId)
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % words.length : 0
  return words[nextIndex]
}

export function getWordStats(): WordStats {
  const byCategory: { [key: string]: number } = {}
  words.forEach(w => {
    byCategory[w.category] = (byCategory[w.category] || 0) + 1
  })
  return {
    total: words.length,
    byCategory
  }
}

export function searchWords(query: string, category?: string): Word[] {
  const lowerQuery = query.toLowerCase().trim()
  return words.filter(w => {
    const matchesQuery = lowerQuery === "" ||
      w.text.toLowerCase().includes(lowerQuery) ||
      w.source.toLowerCase().includes(lowerQuery)

    const matchesCategory = !category || w.category === category

    return matchesQuery && matchesCategory
  })
}