// features/meditation/services/word.service.ts
import "server-only";

import {
  Word,
  WordType,
  WordStats,
  SearchResult,
  MatchType,
  extractChosung,
  getSynonyms,
  getHighlightRanges,
  hasHangul,
  normalizeText,
  tokenize,
  preprocessWord,
  calculateSearchScore,
} from "@/shared/lib/utils/word-core";

// ✅ 싱글톤 인스턴스 관리를 위한 변수
let _allWords: Word[] | null = null;
let _wordIndex: WordIndex[] | null = null;

// -----------------------------
// 0️⃣ 데이터 지연 로딩 (Lazy Loading)
// -----------------------------
function loadAllWords(): Word[] {
  if (_allWords) return _allWords;

  // JSON 파일을 필요한 시점에만 로드 (서버 사이드 가용성 보장)
  const rawWordsData = require("@/data/words.json");
  const rawCheonseongData = require("@/data/cheonseong_words.json");
  const rawWonliData = require("@/data/wonligangnon_words.json");
  const rawPyeonghwaData = require("@/data/pyeonghwashinkyung_words.json");
  const rawCheonIlGukData = require("@/data/Cheon Il Guk_ddeutgil_words.json");
  const rawCheonseongEngData = require("@/data/CheonSeongGyeong_en_words.json");

  const assertWords = (data: unknown): Word[] => Array.isArray(data) ? data as Word[] : [];

  const wordsData = assertWords(rawWordsData);
  const cheonseongData = assertWords(rawCheonseongData);
  const wonliData = assertWords(rawWonliData);
  const pyeonghwashinkyungData = assertWords(rawPyeonghwaData);
  const CheonIlGukDdeutgilData = assertWords(rawCheonIlGukData);
  const cheonseongDataEng = assertWords(rawCheonseongEngData);

  _allWords = [
    ...wordsData.map((w) => ({ ...w, type: "general" as WordType })),
    ...cheonseongData.map((w, i) => ({ ...w, type: "cheonseong" as WordType, id: 10000 + i })),
    ...wonliData.map((w, i) => ({ ...w, type: "wonli" as WordType, id: 20000 + i })),
    ...pyeonghwashinkyungData.map((w, i) => ({ ...w, type: "pyeonghwashinkyung" as WordType, id: 30000 + i })),
    ...CheonIlGukDdeutgilData.map((w, i) => ({ ...w, type: "CheonIlGuk_ddeutgil" as WordType, id: 40000 + i })),
    ...cheonseongDataEng.map((w, i) => ({ ...w, type: "CheonSeongGyeong_en_words" as WordType, id: 50000 + i })),
  ];

  return _allWords;
}

type WordIndex = {
  normalizedText: string;
  normalizedSource: string;
  normalizedSpeaker: string;
  textChosung: string;
};

function getWordIndex(): WordIndex[] {
  if (_wordIndex) return _wordIndex;
  
  const words = loadAllWords();
  _wordIndex = words.map((w) => ({
    normalizedText: normalizeText(w.text),
    normalizedSource: normalizeText(w.source),
    normalizedSpeaker: normalizeText(w.speaker || ""),
    textChosung: extractChosung(normalizeText(w.text)),
  }));
  
  return _wordIndex;
}

// -----------------------------
// 새로운 유틸: 문장 정규화 + 중복 제거
// -----------------------------
function normalizeTextForDeduplication(text: string): string {
  return normalizeText(text);
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
// 4️⃣ 핵심 검색 함수 (전체 아키텍처 개선)
// -----------------------------
export function searchWordsServer(
  query: string,
  mode: "text" | "source" = "text",
  type?: string
): { results: SearchResult[]; counts: Record<string, number> } {
  const rawQuery = query.trim();
  if (!rawQuery) return { results: [], counts: { all: 0 } };

  // 1. 쿼리 전처리
  const isExactPhrase = rawQuery.startsWith('"') && rawQuery.endsWith('"');
  const cleanQuery = isExactPhrase ? rawQuery.slice(1, -1) : rawQuery;
  const normalizedQuery = normalizeText(cleanQuery);
  const isChosungSearch = !isExactPhrase && /^[ㄱ-ㅎ\s]+$/.test(normalizedQuery);
  
  const queryTokens = isExactPhrase 
    ? [normalizedQuery] 
    : tokenize(normalizedQuery);

  const tokenMeta = queryTokens.map(token => ({
    original: token,
    processed: preprocessWord(token),
    synonyms: getSynonyms(token),
    chosung: extractChosung(token),
  }));

  let results: SearchResult[] = [];

  const words = loadAllWords();
  const index = getWordIndex();

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const ix = index[i];

    let totalScore = 0;
    let matchCount = 0;
    let highlightTokens: string[] = [];
    let bestMatchType: MatchType = "token";

    // 검색 대상 설정
    const targetText = mode === "text" 
      ? ix.normalizedText 
      : `${ix.normalizedSource} ${ix.normalizedSpeaker}`;
    
    const originalTarget = mode === "text"
      ? word.text
      : `${word.source} ${word.speaker || ""}`;

    // 초성 검색 처리
    if (isChosungSearch) {
      const matchIdx = ix.textChosung.indexOf(normalizedQuery);
      if (matchIdx !== -1) {
        const matchedText = ix.normalizedText.substring(matchIdx, matchIdx + normalizedQuery.length);
        results.push({
          word,
          score: calculateSearchScore("chosung"),
          matchType: "chosung",
          explanation: `초성 검색: "${matchedText}"`,
          confidence: "low",
          highlightRanges: [] // 초성 검색은 하이라이트 생략하거나 전체 처리
        });
        continue;
      }
    }

    let chosungMatchText = "";

    // 일반 토큰 기반 검색
    for (const meta of tokenMeta) {
      let tokenScore = 0;
      let matched = false;

      // 1. Exact Match (Whole word)
      const escapedToken = meta.original.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const isKorean = hasHangul(meta.original);
      const exactRegex = new RegExp(isKorean ? escapedToken : `\\b${escapedToken}\\b`, "i");

      if (exactRegex.test(targetText)) {
        tokenScore = calculateSearchScore("exact", 1, targetText === meta.original);
        matched = true;
        bestMatchType = isExactPhrase ? "phrase" : "exact";
        highlightTokens.push(meta.original);
      } 
      // 2. Preprocessed (Stem/Particle removed) Match
      else if (meta.processed !== meta.original && targetText.includes(meta.processed)) {
        tokenScore = calculateSearchScore("stem");
        matched = true;
        bestMatchType = "stem";
        highlightTokens.push(meta.processed);
      }
      // 3. Synonym Match
      else {
        for (const syn of meta.synonyms) {
          const escapedSyn = syn.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const synRegex = new RegExp(hasHangul(syn.word) ? escapedSyn : `\\b${escapedSyn}\\b`, "i");
          if (synRegex.test(targetText)) {
            tokenScore = calculateSearchScore("synonym", syn.weight);
            matched = true;
            bestMatchType = "synonym";
            highlightTokens.push(syn.word);
            break;
          }
        }
      }

      // 4. Chosung Fallback (Token level)
      if (!matched && meta.chosung.length >= 2) {
        const matchIdx = ix.textChosung.indexOf(meta.chosung);
        if (matchIdx !== -1) {
          tokenScore = calculateSearchScore("chosung");
          matched = true;
          bestMatchType = "chosung";
          chosungMatchText = ix.normalizedText.substring(matchIdx, matchIdx + meta.chosung.length);
        }
      }

      if (matched) {
        totalScore += tokenScore;
        matchCount++;
      }
    }

    // 모든 토큰이 매칭되었을 때만 결과에 추가 (AND 검색 지향)
    if (matchCount > 0 && (isExactPhrase ? matchCount === queryTokens.length : true)) {
      const finalScore = (totalScore / queryTokens.length) * (1 + Math.max(0, 1 - word.text.length / 5000) * 0.1);
      
      let explanation = "";
      let confidence: "high" | "medium" | "low" = "low";

      if (bestMatchType === "exact" || bestMatchType === "phrase") {
        explanation = "검색어와 정확히 일치합니다.";
        confidence = "high";
      } else if (bestMatchType === "stem") {
        explanation = `"${highlightTokens[0]}" (기본형) 매칭`;
        confidence = "medium";
      } else if (bestMatchType === "synonym") {
        explanation = `유사 의미: ${queryTokens[0]} → ${highlightTokens[0]}`;
        confidence = "medium";
      } else if (bestMatchType === "chosung") {
        explanation = chosungMatchText ? `초성 검색: "${chosungMatchText}"` : "초성 검색 결과입니다.";
        confidence = "low";
      }

      results.push({
        word,
        score: finalScore,
        matchType: bestMatchType,
        explanation,
        confidence,
        highlightRanges: getHighlightRanges(word.text, highlightTokens.length > 0 ? highlightTokens : queryTokens)
      });
    }
  }

  // 중복 제거
  let deduplicatedResults = deduplicateResults(results);

  // 카운트 계산
  const counts: Record<string, number> = { all: 0 };
  for (const res of deduplicatedResults) {
    counts.all++;
    counts[res.word.type] = (counts[res.word.type] || 0) + 1;
  }
  counts["Cheon Il Guk_ddeutgil"] = counts["CheonIlGuk_ddeutgil"] || 0;

  // 필터링
  if (type) {
    const normalizedType = type.replace(/\s+/g, "");
    deduplicatedResults = deduplicatedResults.filter(
      (r) => r.word.type.replace(/\s+/g, "") === normalizedType
    );
  }

  // 정렬
  deduplicatedResults.sort((a, b) => b.score - a.score);

  return {
    results: deduplicatedResults,
    counts,
  };
}

// -----------------------------
// 5️⃣ 유틸 함수
// -----------------------------
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
  const candidates = loadAllWords().filter(w => w.type !== "CheonSeongGyeong_en_words");
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
    (w) => !excludedIds.has(w.id) && w.type !== "CheonSeongGyeong_en_words"
  );

  return candidates.length > 0
    ? candidates[Math.floor(Math.random() * candidates.length)]
    : getRandomWordServer();
}