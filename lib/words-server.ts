// words-server.ts
import "server-only";

import rawWordsData from "@/data/words.json";
import rawCheonseongData from "@/data/cheonseong_words.json";
import rawWonliData from "@/data/wonligangnon_words.json";
import rawPyeonghwaData from "@/data/pyeonghwashinkyung_words.json";
import rawCheonIlGukData from "@/data/Cheon Il Guk_ddeutgil_words.json";
import rawCheonseongEngData from "@/data/CheonSeongGyeong_en_words.json";

import {
  Word,
  WordType,
  WordStats,
  SearchResult,
  extractChosung,
  stemWord,
  getSynonyms,
  getHighlightRanges,
  hasHangul,
} from "@/lib/words";

// -----------------------------
// ✅ 1️⃣ 타입 안전 + 런타임 검증
// -----------------------------
function assertWords(data: unknown): Word[] {
  if (!Array.isArray(data)) {
    throw new Error("Invalid words data format");
  }
  return data as Word[];
}

const wordsData = assertWords(rawWordsData);
const cheonseongData = assertWords(rawCheonseongData);
const wonliData = assertWords(rawWonliData);
const pyeonghwashinkyungData = assertWords(rawPyeonghwaData);
const CheonIlGukDdeutgilData = assertWords(rawCheonIlGukData);
const cheonseongDataEng = assertWords(rawCheonseongEngData);

// -----------------------------
// 2️⃣ 데이터 합치기 (id 중복 방지)
// -----------------------------
export const allWords: Word[] = [
  ...wordsData.map((w) => ({ ...w, type: "general" as WordType })),

  ...cheonseongData.map((w, i) => ({
    ...w,
    type: "cheonseong" as WordType,
    id: 10000 + i,
  })),

  ...wonliData.map((w, i) => ({
    ...w,
    type: "wonli" as WordType,
    id: 20000 + i,
  })),

  ...pyeonghwashinkyungData.map((w, i) => ({
    ...w,
    type: "pyeonghwashinkyung" as WordType,
    id: 30000 + i,
  })),

  ...CheonIlGukDdeutgilData.map((w, i) => ({
    ...w,
    type: "CheonIlGuk_ddeutgil" as WordType,
    id: 40000 + i,
  })),

  ...cheonseongDataEng.map((w, i) => ({
    ...w,
    type: "CheonSeongGyeong_en_words" as WordType,
    id: 50000 + i,
  })),
];

// -----------------------------
// 3️⃣ 사전 인덱스 (검색 최적화)
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
  textChosung: extractChosung(w.text).toLowerCase().replace(/\s+/g, ""),
}));

// -----------------------------
// 새로운 유틸: 문장 정규화 + 중복 제거
// -----------------------------
function normalizeTextForDeduplication(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s가-힣]/g, " ")   // 구두점 제거
    .replace(/\s+/g, " ")            // 여러 공백 → 하나
    .trim();
}

// 결과에서 반복되는 문장(또는 매우 유사한 문장)을 제거
function deduplicateResults(results: SearchResult[]): SearchResult[] {
  const seen = new Map<string, SearchResult>();

  for (const res of results) {
    const normalized = normalizeTextForDeduplication(res.word.text);
    const existing = seen.get(normalized);

    if (!existing) {
      seen.set(normalized, res);
    } else {
      // 이미 있는 것보다 점수가 높으면 교체
      if (res.score > existing.score) {
        seen.set(normalized, res);
      }
    }
  }

  return Array.from(seen.values());
}

// -----------------------------
// 4️⃣ 핵심 검색 함수 (중복 제거 + 영어 정확도 강화)
// -----------------------------
export function searchWordsServer(
  query: string,
  mode: "text" | "source" = "text",
  type?: string
): { results: SearchResult[]; counts: Record<string, number> } {
  const rawQuery = query.trim();
  if (!rawQuery) return { results: [], counts: { all: 0 } };

  const isExactPhrase =
    rawQuery.startsWith('"') && rawQuery.endsWith('"');

  const phrase = isExactPhrase
    ? rawQuery.slice(1, -1).toLowerCase().trim()
    : null;

  const isChosungSearch =
    !isExactPhrase && /^[ㄱ-ㅎ]+$/.test(rawQuery);

  const isKorean = hasHangul(rawQuery);

  const tokens = isExactPhrase
    ? [phrase!]
    : rawQuery.toLowerCase().split(/\s+/).filter(Boolean);

  const tokenMeta = tokens.map((token) => ({
    token,
    tokenNoSpace: token.replace(/\s+/g, ""),
    stem: stemWord(token),
    synonyms: getSynonyms(token),
    tokenChosung: extractChosung(token).replace(/\s+/g, ""),
  }));

  let results: SearchResult[] = [];

  const useWholeWord = !isKorean && !isExactPhrase;

  function tokenMatches(target: string, token: string): boolean {
    if (!useWholeWord) return target.includes(token);

    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    return regex.test(target);
  }

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

      for (const {
        token,
        tokenNoSpace,
        stem,
        synonyms,
        tokenChosung,
      } of tokenMeta) {
        let tokenScore = 0;
        let tokenMatched = false;

        const target =
          mode === "text"
            ? ix.textLower
            : `${ix.sourceLower} ${ix.speakerLower}`;

        const originalTarget =
          mode === "text"
            ? originalTextLower
            : `${ix.sourceLower} ${ix.speakerLower}`;

        // 1. Whole-Word 매칭 (텍스트 본문 중심으로 강화)
        if (tokenMatches(originalTarget, token)) {
          tokenScore = originalTarget === token.toLowerCase() ? 200 : 45; // 점수 약간 상향
          tokenMatched = true;
          highlightTokens.push(token);
        }
        // 2. 공백 제거 fallback
        else if (target.includes(tokenNoSpace)) {
          tokenScore = 32;
          tokenMatched = true;
        }

        // 3. Stem
        if (!tokenMatched && stem.length >= 2) {
          if (tokenMatches(originalTarget, stem)) {
            tokenScore = 28;
            tokenMatched = true;
            bestMatchType = "stem";
            highlightTokens.push(stem);
          }
        }

        // 4. Synonym
        if (!tokenMatched) {
          for (const syn of synonyms) {
            if (tokenMatches(originalTarget, syn.toLowerCase())) {
              tokenScore = 18;
              tokenMatched = true;
              bestMatchType = "synonym";
              highlightTokens.push(syn);
              break;
            }
          }
        }

        // 5. Chosung fallback
        if (
          !tokenMatched &&
          tokenChosung.length >= 2 &&
          ix.textChosung.includes(tokenChosung)
        ) {
          tokenScore = 12;
          tokenMatched = true;
          bestMatchType = "chosung";
        }

        if (!tokenMatched) {
          allTokensMatched = false;
          break;
        }

        totalScore += tokenScore;
      }

      if (allTokensMatched) {
        isMatch = true;
        score =
          totalScore *
          (1 + Math.max(0, 1 - word.text.length / 2500) * 0.25); // 긴 문장 페널티 완화
      }
    }

    if (!isMatch) continue;

    results.push({
      word,
      score,
      matchType: bestMatchType,
      highlightRanges: getHighlightRanges(
        word.text,
        highlightTokens.length > 0 ? highlightTokens : tokens
      ),
    });
  }

  // ★★★ 중복 문장 제거 (전체 풀 대상) ★★★
  let deduplicatedResults = deduplicateResults(results);

  // 카운트 계산: 중복이 완전히 합쳐진(Deduplicated) 결과를 바탕으로 각 카테고리별 Count 집계
  const counts: Record<string, number> = { all: 0 };
  for (const res of deduplicatedResults) {
    counts.all++;
    counts[res.word.type] = (counts[res.word.type] || 0) + 1;
  }

  // 프론트엔드 SearchCategoryTabs.tsx 내의 하드코딩된 오타("Cheon Il Guk_ddeutgil") 대응용 Fallback Alias 주입
  counts["Cheon Il Guk_ddeutgil"] = counts["CheonIlGuk_ddeutgil"] || 0;

  // 타입 필터링: 탭(type) 선택 시 필터링 (아이디 공백 에러 방어 포함)
  if (type) {
    const normalizedType = type.replace(/\s+/g, "");
    deduplicatedResults = deduplicatedResults.filter(
      (r) => r.word.type.replace(/\s+/g, "") === normalizedType
    );
  }

  // 점수 순 정렬
  deduplicatedResults.sort((a, b) => b.score - a.score);

  return {
    results: deduplicatedResults,
    counts,
  };
}

// -----------------------------
// 5️⃣ 유틸 함수
// -----------------------------
export const getAllWordsServer = (): Word[] => allWords;

export const getWordByIdServer = (id: number): Word | undefined =>
  allWords.find((w) => w.id === id);

export function getWordStatsServer(): WordStats {
  const byCategory = allWords.reduce((acc, w) => {
    acc[w.category] = (acc[w.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: allWords.length,
    byCategory,
  };
}

export function getCategoryWordsServer(category: string): Word[] {
  return allWords.filter((w) => w.category === category);
}

export const getRandomWordServer = (): Word =>
  allWords[Math.floor(Math.random() * allWords.length)];

export function getRandomWordExceptServer(
  except?: number | number[] | null
): Word {
  const excludedIds = new Set(
    Array.isArray(except) ? except : except ? [except] : []
  );

  const candidates = allWords.filter(
    (w) => !excludedIds.has(w.id)
  );

  return candidates.length > 0
    ? candidates[Math.floor(Math.random() * candidates.length)]
    : getRandomWordServer();
}