// features/meditation/services/word.service.ts
import "server-only";
import { prisma } from "@/lib/prisma";
import { Word, WordStats } from "@/shared/types/word";

/**
 * 명언 데이터 관련 서버 전용 서비스
 * 데이터베이스(Prisma) 연동으로 업데이트 되었습니다.
 */

export async function getAllWordsServer(): Promise<Word[]> {
  const words = await prisma.words.findMany({
    orderBy: { id: "asc" }
  });
  return words as unknown as Word[];
}

export async function getWordByIdServer(id: number): Promise<Word | null> {
  const word = await prisma.words.findUnique({
    where: { id },
  });
  return word as unknown as Word | null;
}

import { unstable_cache } from "next/cache";

export const getWordStatsServer = unstable_cache(
  async (): Promise<WordStats> => {
    const byCategory = await prisma.words.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
    });

    const total = await prisma.words.count();
    
    const categoryStats = byCategory.reduce((acc, curr) => {
      acc[curr.category] = curr._count.category;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      byCategory: categoryStats,
    };
  },
  ['word-stats'],
  { revalidate: 3600, tags: ['word-stats'] }
);

export async function getCategoryWordsServer(category: string): Promise<Word[]> {
  const words = await prisma.words.findMany({
    where: { category },
    orderBy: { id: "asc" }
  });
  return words as unknown as Word[];
}

export async function getRandomWordServer(): Promise<Word | null> {
  const count = await prisma.words.count({
    where: {
      type: {
        in: ["cheonseong", "CheonIlGuk_ddeutgil"]
      }
    }
  });

  if (count === 0) return null;

  const skip = Math.floor(Math.random() * count);
  const randomWords = await prisma.words.findMany({
    where: {
      type: {
        in: ["cheonseong", "CheonIlGuk_ddeutgil"]
      }
    },
    take: 1,
    skip,
  });

  return randomWords[0] as unknown as Word | null;
}

export async function getRandomWordExceptServer(
  except?: number | number[] | null
): Promise<Word | null> {
  const excludedIds = Array.isArray(except) ? except : except ? [except] : [];
  
  const count = await prisma.words.count({
    where: {
      id: { notIn: excludedIds },
      type: {
        in: ["cheonseong", "CheonIlGuk_ddeutgil"]
      }
    }
  });

  if (count === 0) return getRandomWordServer();

  const skip = Math.floor(Math.random() * count);
  const randomWords = await prisma.words.findMany({
    where: {
      id: { notIn: excludedIds },
      type: {
        in: ["cheonseong", "CheonIlGuk_ddeutgil"]
      }
    },
    take: 1,
    skip,
  });

  return randomWords[0] as unknown as Word | null;
}