"use server";

import { getAllWordsServer } from "@/features/meditation/services/word.service";
import { generateTOC, getWordsInPath } from "@/features/meditation/services/toc.service";
import { Word } from "@/shared/types/word";

/**
 * 특정 TOC 경로에 해당하는 모든 말씀을 서버사이드에서 추출하여 반환합니다.
 */
export async function getWordsByPathAction(path: string[]): Promise<Word[]> {
  const allWords = await getAllWordsServer();
  const tocTree = generateTOC(allWords);
  return getWordsInPath(tocTree, path);
}
