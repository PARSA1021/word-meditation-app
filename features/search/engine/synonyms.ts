// features/search/engine/synonyms.ts
import { Synonym, SynonymMap } from "../types"

const RAW_SYNONYMS: Record<string, string[]> = {
  "사랑": ["애정", "자비", "은혜", "인애", "사모"],
  "하나님": ["하느님", "창조주", "아버지", "천부"],
  "참부모": ["참아버지", "참어머니", "메시아", "구세주"],
  "참사랑": ["진정한 사랑", "절대사랑"],
  "본질": ["근본", "본성", "정수"],
  "말씀": ["교리", "가르침", "성언"],
  "평화": ["안식", "화평", "조화"],
  "행복": ["기쁨", "환희", "축복"],
  "훈독": ["낭독", "공부", "학습"],
  "정성": ["정성", "기도", "헌신"],
  "god": ["creator", "deity", "lord"],
  "love": ["affection", "compassion", "grace", "benevolence"],
  "parent": ["father", "mother"],
  "parents": ["true parents"],
  "spirit": ["soul"],
  "mind": ["heart"],
  "heart": ["mind"],
  "body": ["physical", "form"],
  "visible": ["corporeal", "physical"],
  "incorporeal": ["invisible", "formless"],
  "heaven": ["paradise", "kingdom"],
  "blessing": ["grace"],
  "true": ["genuine", "original"],
  "faith": ["belief", "trust"],
}

const FULL_SYNONYM_MAP: SynonymMap = {}

Object.entries(RAW_SYNONYMS).forEach(([key, values]) => {
  const mainWord = key.toLowerCase()
  if (!FULL_SYNONYM_MAP[mainWord]) FULL_SYNONYM_MAP[mainWord] = []
  values.forEach(val => {
    const synWord = val.toLowerCase()
    FULL_SYNONYM_MAP[mainWord].push({ word: synWord, weight: 0.9 })
    if (!FULL_SYNONYM_MAP[synWord]) FULL_SYNONYM_MAP[synWord] = []
    if (!FULL_SYNONYM_MAP[synWord].find(s => s.word === mainWord)) {
      FULL_SYNONYM_MAP[synWord].push({ word: mainWord, weight: 0.8 })
    }
  })
})

export function getSynonyms(token: string): Synonym[] {
  const lowerToken = token.toLowerCase()
  return FULL_SYNONYM_MAP[lowerToken] || []
}
