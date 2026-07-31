// features/meditation/services/word.service.ts
import "server-only";
import { Word, WordStats } from "@/shared/types/word";
import { loadAllWords } from "@/features/search/indexing/word-repository";

export async function getAllWordsServer(): Promise<Word[]> {
  return await loadAllWords();
}

export async function getWordByIdServer(id: number): Promise<Word | null> {
  const words = await loadAllWords();
  return words.find(w => w.id === id) || null;
}

export async function getWordStatsServer(): Promise<WordStats> {
  const words = await loadAllWords();
  const byCategory: Record<string, number> = {};
  for (const w of words) {
    const cat = w.category || "기타";
    byCategory[cat] = (byCategory[cat] || 0) + 1;
  }
  return {
    total: words.length,
    byCategory,
  };
}

export async function getCategoryWordsServer(category: string): Promise<Word[]> {
  const words = await loadAllWords();
  return words.filter(w => w.category === category);
}

export async function getRandomWordServer(): Promise<Word | null> {
  const words = await loadAllWords();
  const filtered = words.filter(w => ["cheonseong", "CheonIlGuk_ddeutgil"].includes(w.type));
  const pool = filtered.length > 0 ? filtered : words;
  if (pool.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

export async function getRandomWordExceptServer(
  except?: number | number[] | null
): Promise<Word | null> {
  const words = await loadAllWords();
  const excludedIds = new Set(Array.isArray(except) ? except : except ? [except] : []);
  const filtered = words.filter(w => !excludedIds.has(w.id) && ["cheonseong", "CheonIlGuk_ddeutgil"].includes(w.type));
  const pool = filtered.length > 0 ? filtered : words.filter(w => !excludedIds.has(w.id));
  if (pool.length === 0) return getRandomWordServer();
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}