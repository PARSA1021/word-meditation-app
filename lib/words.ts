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