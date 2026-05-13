"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { Word } from "@/shared/types/word";
import { resetWordCache } from "@/features/search/indexing/word-repository";

const WORDS_PATH = path.join(process.cwd(), "data", "words.json");

/**
 * 새로운 말씀을 추가하는 Server Action
 */
export async function addWordAction(formData: {
  text: string;
  source: string;
  category: string;
  speaker?: string;
}) {
  try {
    if (!formData.text || !formData.source || !formData.category) {
      throw new Error("필수 정보를 모두 입력해주세요.");
    }

    // 1. 기존 데이터 읽기
    const fileContent = await fs.readFile(WORDS_PATH, "utf-8");
    const words: Word[] = JSON.parse(fileContent);

    // 2. 새로운 ID 생성 (최대값 + 1)
    const maxId = words.reduce((max, w) => Math.max(max, w.id), 0);
    const newWord: Word = {
      id: maxId + 1,
      text: formData.text,
      source: formData.source,
      category: formData.category,
      speaker: formData.speaker || null,
      type: "general",
    };

    // 3. 데이터 추가 및 저장
    const updatedWords = [...words, newWord];
    await fs.writeFile(WORDS_PATH, JSON.stringify(updatedWords, null, 2), "utf-8");

    // 3.5 서버 사이드 인메모리 캐시 초기화
    resetWordCache();

    // 4. 관련 페이지 캐시 무효화
    revalidatePath("/library");
    revalidatePath("/search");
    revalidatePath("/today");
    revalidatePath("/admin");

    return { success: true, word: newWord };
  } catch (error) {
    console.error("Add word error:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * 대량의 말씀을 추가하는 Server Action
 */
export async function addBatchWordsAction(batchText: string) {
  try {
    const lines = batchText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const newWordsToAdd: Omit<Word, "id">[] = [];

    for (const line of lines) {
      const [text, source, category, speaker] = line.split("|").map((s) => s?.trim());
      if (text && source && category) {
        newWordsToAdd.push({
          text,
          source,
          category,
          speaker: speaker || null,
          type: "general",
        });
      }
    }

    if (newWordsToAdd.length === 0) {
      throw new Error("유효한 데이터가 없습니다. 형식을 확인해주세요.");
    }

    // 1. 기존 데이터 읽기
    const fileContent = await fs.readFile(WORDS_PATH, "utf-8");
    const words: Word[] = JSON.parse(fileContent);

    // 2. ID 생성 및 추가
    let currentMaxId = words.reduce((max, w) => Math.max(max, w.id), 0);
    const wordsWithIds = newWordsToAdd.map((w) => ({
      ...w,
      id: ++currentMaxId,
    })) as Word[];

    // 3. 저장
    const updatedWords = [...words, ...wordsWithIds];
    await fs.writeFile(WORDS_PATH, JSON.stringify(updatedWords, null, 2), "utf-8");

    // 3.5 서버 사이드 인메모리 캐시 초기화
    resetWordCache();

    // 4. 캐시 무효화
    revalidatePath("/library");
    revalidatePath("/admin");

    return { success: true, count: wordsWithIds.length };
  } catch (error) {
    console.error("Batch add error:", error);
    return { success: false, error: (error as Error).message };
  }
}
