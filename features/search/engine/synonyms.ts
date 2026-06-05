// features/search/engine/synonyms.ts
import { Synonym, SynonymMap } from "../types"

const RAW_SYNONYMS: Record<string, string[]> = {
  "사랑": ["참사랑", "위하는 사랑", "심정", "애정", "은혜", "자비"],
  "하나님": ["하늘부모님", "천부", "창조주", "신", "하느님", "주님", "절대자", "조물주"],
  "참부모": ["참아버지", "참어머니", "참부모님", "메시아", "구세주", "재림주", "독생자", "독생녀"],
  "참사랑": ["진정한 사랑", "절대사랑", "위하는 사랑", "희생적인 사랑", "본연의 사랑"],
  "말씀": ["원리", "원리강론", "천성경", "평화신경", "참부모경", "성언", "교리", "가르침", "진리"],
  "정성": ["조건", "기도", "훈독", "백일정성", "철야", "수행", "헌신", "간구"],
  "축복": ["축복결혼", "성혼", "합동결혼", "은총", "가호"],
  "가정": ["참가정", "축복가정", "종족메시아", "가족", "부부", "자녀"],
  "평화": ["평화세계", "천일국", "하나님 아래 인류 한 가족", "화평", "조화", "안식"],
  "심정": ["본연의 사랑", "정", "애휼", "마음", "본심"],
  "탕감": ["복귀", "조건", "회개", "청산"],
  "이상세계": ["천일국", "지상천국", "천상천국", "이상향", "에덴동산"],
  "행복": ["기쁨", "환희", "축복", "즐거움", "평안"],
  "희망": ["소망", "비전", "꿈", "기대", "바람"],
  "생명": ["영생", "목숨", "영인체", "생기"],
  "본질": ["근본", "본성", "정수", "핵심", "기원"],
  "훈독": ["훈독회", "말씀공부", "낭독", "독서"],
  "god": ["heavenly parent", "creator", "deity", "heavenly father", "divine"],
  "love": ["true love", "heart", "shimjung", "affection", "compassion", "grace"],
  "parent": ["father", "mother"],
  "parents": ["true parents"],
  "spirit": ["soul", "spirit mind", "spirit body", "inner self"],
  "mind": ["heart", "shimjung", "consciousness", "original mind"],
  "heart": ["shimjung", "mind", "feeling", "true love"],
  "body": ["physical body", "form", "flesh"],
  "visible": ["corporeal", "physical", "tangible"],
  "incorporeal": ["invisible", "formless", "spiritual"],
  "heaven": ["cheon il guk", "kingdom of heaven", "spiritual world", "paradise"],
  "blessing": ["blessing marriage", "grace", "benediction"],
  "true": ["genuine", "original", "absolute"],
  "faith": ["belief", "trust", "conviction", "devotion"],
  "prayer": ["jeongseong", "devotion", "meditation"],
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
