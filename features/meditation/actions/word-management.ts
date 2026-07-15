"use server";

import { revalidatePath } from "next/cache";
import { Word } from "@/shared/types/word";
import { resetWordCache } from "@/features/search/indexing/word-repository";
import { prisma } from "@/lib/prisma";

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

    // 1. 데이터 베이스에 추가
    const newWord = await prisma.words.create({
      data: {
        id: (await prisma.words.aggregate({ _max: { id: true } }))._max.id! + 1,
        text: formData.text,
        source: formData.source,
        category: formData.category,
        speaker: formData.speaker || null,
        type: "general",
      }
    });

    // 2. 서버 사이드 인메모리 캐시 초기화
    resetWordCache();

    // 3. 관련 페이지 캐시 무효화
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

    const newWordsToAdd: any[] = [];
    
    let currentMaxId = (await prisma.words.aggregate({ _max: { id: true } }))._max.id || 0;

    for (const line of lines) {
      const [text, source, category, speaker] = line.split("|").map((s) => s?.trim());
      if (text && source && category) {
        newWordsToAdd.push({
          id: ++currentMaxId,
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

    // 1. 데이터 베이스에 추가
    await prisma.words.createMany({
      data: newWordsToAdd
    });

    // 2. 서버 사이드 인메모리 캐시 초기화
    resetWordCache();

    // 3. 캐시 무효화
    revalidatePath("/library");
    revalidatePath("/admin");

    return { success: true, count: newWordsToAdd.length };
  } catch (error) {
    console.error("Batch add error:", error);
    return { success: false, error: (error as Error).message };
  }
}
