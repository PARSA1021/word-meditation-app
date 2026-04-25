// lib/toc.ts
import { Word } from "./types/word";

export type ParsedSource = {
  category: string;
  part?: string;
  chapter?: string;
  section?: string;
};

/**
 * source 문자열을 파싱하여 계층 구조로 분리합니다.
 * 예: "천성경, 제1편 하나님 > 제1장 하나님의 존재와 속성 > 1절 하나님의 실존"
 */
export function parseSource(source: string, defaultCategory: string = "기타"): ParsedSource {
  if (!source) return { category: defaultCategory };

  // 1. 카테고리와 본문 계층 분리 (컴마 기준)
  const firstCommaIndex = source.indexOf(",");
  let category = defaultCategory;
  let remaining = source;

  if (firstCommaIndex !== -1) {
    category = source.substring(0, firstCommaIndex).trim();
    remaining = source.substring(firstCommaIndex + 1).trim();
  } else if (!source.includes(">")) {
    // 컴마도 없고 '>'도 없으면 전체를 카테고리로 간주
    return { category: source.trim() };
  }

  // 2. 계층 분리 (> 기준)
  const levels = remaining.split(">").map((s) => s.trim()).filter(Boolean);

  // 3. 필드 매핑 (편, 장, 절 순서)
  // 데이터에 따라 "편"이 없을 수도 있으므로 유연하게 처리
  const result: ParsedSource = { category };

  if (levels.length === 1) {
    // 예: "원리강론, 총서" -> Level 1만 있음
    result.part = levels[0];
  } else if (levels.length === 2) {
    // 예: "범주, 편 > 장"
    result.part = levels[0];
    result.chapter = levels[1];
  } else if (levels.length >= 3) {
    // 예: "범주, 편 > 장 > 절"
    result.part = levels[0];
    result.chapter = levels[1];
    result.section = levels[2];
  }

  return result;
}

export type TOCNode = {
  name: string;
  children: Map<string, TOCNode>;
  words?: Word[];
  path: string[]; // 이동 및 브레드크럼용 경로
};

/**
 * Word 배열을 받아 계층형 TOC 트리를 생성합니다.
 * O(n) 성능 최적화 (Map 기반)
 */
export function generateTOC(words: Word[]): TOCNode {
  const root: TOCNode = {
    name: "Root",
    children: new Map(),
    path: [],
  };

  for (const word of words) {
    const parsed = parseSource(word.source, word.category);
    const path = [parsed.category];
    if (parsed.part) path.push(parsed.part);
    if (parsed.chapter) path.push(parsed.chapter);
    if (parsed.section) path.push(parsed.section);

    let currentNode = root;

    for (let i = 0; i < path.length; i++) {
      const levelName = path[i];
      if (!currentNode.children.has(levelName)) {
        currentNode.children.set(levelName, {
          name: levelName,
          children: new Map(),
          path: path.slice(0, i + 1),
        });
      }
      currentNode = currentNode.children.get(levelName)!;

      // 마지막 노드(leaf or target section)에 word 추가
      if (i === path.length - 1) {
        if (!currentNode.words) currentNode.words = [];
        currentNode.words.push(word);
      }
    }
  }

  return root;
}

/**
 * 클라이언트 전송을 위해 Map을 일반 객체로 변환합니다 (JSON 직렬화 가능)
 */
export type SerializedTOCNode = {
  name: string;
  children: Record<string, SerializedTOCNode>;
  words?: Word[];
  path: string[];
};

export function serializeTOC(node: TOCNode): SerializedTOCNode {
  const children: Record<string, SerializedTOCNode> = {};
  node.children.forEach((child, key) => {
    children[key] = serializeTOC(child);
  });

  return {
    name: node.name,
    children,
    words: node.words,
    path: node.path,
  };
}
