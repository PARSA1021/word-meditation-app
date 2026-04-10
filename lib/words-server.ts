import "server-only";
import wordsData from "@/data/words.json";
import cheonseongData from "@/data/cheonseong_words.json";
import wonliData from "@/data/wonligangnon_words.json";
import pyeonghwashinkyungData from "@/data/pyeonghwashinkyung_words.json";
import CheonIlGukDdeutgilData from "@/data/Cheon Il Guk_ddeutgil_words.json";
import { Word, WordType, WordStats, SearchResult, extractChosung, stemKorean, getSynonyms, getHighlightRanges } from "@/lib/words";

// -----------------------------
// 1️⃣ 데이터 합치기 (id 중복 방지 및 초기화) - 서버에서만 수행
// -----------------------------
export const allWords: Word[] = [
  ...wordsData.map((w) => ({ ...w, type: "general" } as Word)),
  ...cheonseongData.map((w, i) => ({ ...w, type: "cheonseong", id: 10000 + i } as Word)),
  ...wonliData.map((w, i) => ({ ...w, type: "wonli", id: 20000 + i } as Word)),
  ...pyeonghwashinkyungData.map((w, i) => ({ ...w, type: "pyeonghwashinkyung", id: 30000 + i } as Word)),
  ...CheonIlGukDdeutgilData.map((w, i) => ({ ...w, type: "Cheon Il Guk_ddeutgil", id: 40000 + i } as unknown as Word))
];

// -----------------------------
// 2️⃣ 사전 빌드 인덱스 (메모리 상주)
// -----------------------------
type WordIndex = {
  textLower: string;
  sourceLower: string;
  speakerLower: string;
  textChosung: string;
};

const wordIndex: WordIndex[] = allWords.map((w) => ({
  textLower: w.text.toLowerCase().replace(/\s+/g, ""),
  sourceLower: w.source.toLowerCase(),
  speakerLower: (w.speaker || "").toLowerCase(),
  textChosung: extractChosung(w.text).replace(/\s+/g, ""),
}));

// -----------------------------
// 3️⃣ 핵심 검색 (Advanced) - 서버 사이드 실행
// -----------------------------
export function searchWordsServer(
  query: string,
  mode: "text" | "source" = "text",
  type?: WordType
): { results: SearchResult[]; counts: Record<string, number> } {
  const rawQuery = query.trim();
  if (!rawQuery) return { results: [], counts: { all: 0 } };

  const isExactPhrase = rawQuery.startsWith('"') && rawQuery.endsWith('"');
  const phrase = isExactPhrase ? rawQuery.slice(1, -1).toLowerCase().trim() : null;
  const isChosungSearch = !isExactPhrase && /^[ㄱ-ㅎ]+$/.test(rawQuery);
  const tokens = isExactPhrase ? [phrase!] : rawQuery.toLowerCase().split(/\s+/).filter(Boolean);

  const tokenMeta = tokens.map((token) => ({
    token,
    tokenNoSpace: token.replace(/\s+/g, ""),
    stem: stemKorean(token),
    synonyms: getSynonyms(token),
    tokenChosung: extractChosung(token).replace(/\s+/g, ""),
  }));

  const results: SearchResult[] = [];
  const counts: Record<string, number> = { all: 0 };

  for (let i = 0; i < allWords.length; i++) {
    const word = allWords[i];
    const ix = wordIndex[i];
    const originalTextLower = word.text.toLowerCase();

    let isMatch = false;
    let bestMatchType: SearchResult["matchType"] = "token";
    let score = 0;
    let highlightTokens: string[] = [];

    if (isChosungSearch) {
      if (ix.textChosung.includes(rawQuery)) {
        isMatch = true;
        score = 60;
        bestMatchType = "chosung";
      }
    } else {
      let totalScore = 0;
      let allTokensMatched = true;

      for (const { token, tokenNoSpace, stem, synonyms, tokenChosung } of tokenMeta) {
        let tokenScore = 0;
        let tokenMatched = false;

        const target = mode === "text" ? ix.textLower : `${ix.sourceLower} ${ix.speakerLower}`;
        const originalTarget = mode === "text" ? originalTextLower : `${ix.sourceLower} ${ix.speakerLower}`;

        if (originalTarget.includes(token)) {
          tokenScore = originalTarget === token ? 200 : 40;
          tokenMatched = true;
          highlightTokens.push(token);
        } else if (target.includes(tokenNoSpace)) {
          tokenScore = 30;
          tokenMatched = true;
        }

        if (!tokenMatched && stem.length >= 2 && originalTarget.includes(stem)) {
          tokenScore = 25; tokenMatched = true; bestMatchType = "stem";
          highlightTokens.push(stem);
        }

        if (!tokenMatched) {
          for (const syn of synonyms) {
            if (originalTarget.includes(syn)) {
              tokenScore = 15; tokenMatched = true; bestMatchType = "synonym";
              highlightTokens.push(syn);
              break;
            }
          }
        }

        if (!tokenMatched && tokenChosung.length >= 2 && ix.textChosung.includes(tokenChosung)) {
          tokenScore = 10; tokenMatched = true; bestMatchType = "chosung";
        }

        if (!tokenMatched) { allTokensMatched = false; break; }
        totalScore += tokenScore;
      }

      if (allTokensMatched) {
        isMatch = true;
        score = totalScore * (1 + Math.max(0, 1 - word.text.length / 2000) * 0.2);
      }
    }

    if (!isMatch) continue;

    // 통계 계산 (필터링 전 모든 검색 결과 대상)
    counts.all++;
    counts[word.type] = (counts[word.type] || 0) + 1;

    // 타입 필터링 적용
    if (type && word.type !== type) continue;

    results.push({
      word,
      score,
      matchType: bestMatchType,
      highlightRanges: getHighlightRanges(word.text, highlightTokens.length > 0 ? highlightTokens : tokens),
    });
  }

  return {
    results: results.sort((a, b) => b.score - a.score),
    counts,
  };
}

// -----------------------------
// 4️⃣ 유틸리티 함수
// -----------------------------
export const getAllWordsServer = () => allWords;
export const getWordByIdServer = (id: number) => allWords.find(w => w.id === id);

export function getWordStatsServer(): WordStats {
  const byCategory = allWords.reduce((acc, w) => {
    acc[w.category] = (acc[w.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  return { total: allWords.length, byCategory };
}

export function getCategoryWordsServer(category: string): Word[] {
  return allWords.filter((w) => w.category === category);
}

export const getRandomWordServer = () => allWords[Math.floor(Math.random() * allWords.length)];

export function getRandomWordExceptServer(except?: number | number[] | null): Word {
  const excludedIds = new Set(Array.isArray(except) ? except : except ? [except] : []);
  const candidates = allWords.filter((w) => !excludedIds.has(w.id));
  return candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : getRandomWordServer();
}
