// features/meditation/services/word.service.ts
import "server-only";
import { Word, WordStats } from "@/shared/types/word";
import { loadAllWords } from "@/features/search/indexing/word-repository";

/**
 * 명언 데이터 관련 서버 전용 서비스
 * 검색 기능은 features/search/server/search.service.ts 로 이전되었습니다.
 */

export const getAllWordsServer = (): Word[] => loadAllWords();

export const getWordByIdServer = (id: number): Word | undefined =>
  loadAllWords().find((w) => w.id === id);

export function getWordStatsServer(): WordStats {
  const words = loadAllWords();
  const byCategory = words.reduce((acc, w) => {
    acc[w.category] = (acc[w.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: words.length,
    byCategory,
  };
}

export function getCategoryWordsServer(category: string): Word[] {
  return loadAllWords().filter((w) => w.category === category);
}

export const getRandomWordServer = (): Word => {
  const candidates = loadAllWords().filter(
    (w) => w.type === "cheonseong" || w.type === "CheonIlGuk_ddeutgil"
  );
  return candidates[Math.floor(Math.random() * candidates.length)];
};

export function getRandomWordExceptServer(
  except?: number | number[] | null
): Word {
  const excludedIds = new Set(
    Array.isArray(except) ? except : except ? [except] : []
  );

  const words = loadAllWords();
  const candidates = words.filter(
    (w) => !excludedIds.has(w.id) && (w.type === "cheonseong" || w.type === "CheonIlGuk_ddeutgil")
  );

  return candidates.length > 0
    ? candidates[Math.floor(Math.random() * candidates.length)]
    : getRandomWordServer();
}