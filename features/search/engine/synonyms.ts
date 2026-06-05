// features/search/engine/synonyms.ts
import { Synonym, SynonymMap } from "../types"

const RAW_SYNONYMS: Record<string, string[]> = {
  // --- 한국어 핵심 교리 용어 ---
  "하나님": ["하늘부모님", "천부", "창조주", "신", "하느님", "주님", "절대자", "조물주", "상제"],
  "하늘부모님": ["하나님", "창조주", "천부", "하느님", "주님"],
  "참부모": ["참부모님", "천지인참부모", "천지인참부모님", "참아버지", "참어머니", "메시아", "구세주", "재림주", "독생자", "독생녀"],
  "참부모님": ["참부모", "천지인참부모님", "참아버지", "참어머니", "메시아"],
  "사랑": ["참사랑", "위하는 사랑", "심정", "애정", "은혜", "자비", "효정"],
  "참사랑": ["진정한 사랑", "절대사랑", "위하는 사랑", "희생적인 사랑", "본연의 사랑", "신경지적 사랑"],
  "말씀": ["원리", "원리강론", "천성경", "평화경", "참부모경", "평화신경", "성언", "교리", "가르침", "진리", "훈독 말씀"],
  "원리": ["원리강론", "원리본체론", "통일원리", "말씀", "교리"],
  "정성": ["조건", "기도", "훈독", "백일정성", "철야", "수행", "헌신", "간구", "찬양", "예배", "역사"],
  "축복": ["축복결혼", "성혼", "합동결혼", "은총", "가호", "국제결혼", "매칭", "2세 축복"],
  "축복가정": ["참가정", "종족메시아", "신종족메시아", "축복가정가정", "가족", "부부"],
  "가정": ["참가정", "축복가정", "종족메시아", "가족", "부부", "자녀", "이상가정"],
  "평화": ["평화세계", "천일국", "하나님 아래 인류 한 가족", "화평", "조화", "안식", "원모평애"],
  "천일국": ["이상세계", "지상천국", "천상천국", "평화세계", "하나님 주권 국가"],
  "심정": ["본연의 사랑", "정", "애휼", "마음", "본심", "심정문화"],
  "탕감": ["탕감조건", "복귀", "조건", "회개", "청산", "복귀섭리"],
  "이상세계": ["천일국", "지상천국", "천상천국", "이상향", "에덴동산", "지상낙원"],
  "행복": ["기쁨", "환희", "축복", "즐거움", "평안", "천복"],
  "희망": ["소망", "비전", "꿈", "기대", "바람", "비전2027"], // 교단 내 주요 섭리적 비전 해 반영 가능
  "생명": ["영생", "목숨", "영인체", "생기", "영적 생명"],
  "본질": ["근본", "본성", "정수", "핵심", "기원", "성품"],
  "훈독": ["훈독회", "말씀공부", "낭독", "독서", "훈독정성"],

  // --- 영어 및 로마자 글로벌 용어 ---
  "god": ["heavenly parent", "creator", "deity", "heavenly father", "divine", "allah", "yahweh"],
  "heavenly parent": ["god", "heavenly father", "heavenly mother", "creator"],
  "love": ["true love", "heart", "shimjung", "affection", "compassion", "grace", "hyojeong"],
  "true love": ["absolute love", "sacrificial love", "unconditional love"],
  "parent": ["father", "mother", "true parent"],
  "parents": ["true parents", "computational parents"],
  "true parents": ["true parent", "messiah", "savior", "true father", "true mother"],
  "spirit": ["soul", "spirit mind", "spirit body", "inner self", "spiritual world", "young-in-chae"],
  "mind": ["heart", "shimjung", "consciousness", "original mind", "spirit mind"],
  "heart": ["shimjung", "mind", "feeling", "true love", "emotion"],
  "shimjung": ["heart", "original mind", "deepest emotion"],
  "body": ["physical body", "form", "flesh", "physical mind"],
  "visible": ["corporeal", "physical", "tangible", "substantial world"],
  "incorporeal": ["invisible", "formless", "spiritual", "incorporeal world"],
  "heaven": ["cheon il guk", "kingdom of heaven", "spiritual world", "paradise", "cheongpyeong"],
  "cheon il guk": ["cjg", "kingdom of heaven", "ideal world", "heavenly kingdom"],
  "blessing": ["blessing marriage", "grace", "benediction", "holy wedding", "mass wedding"],
  "true": ["genuine", "original", "absolute", "eternal"],
  "faith": ["belief", "trust", "conviction", "devotion", "spirituality"],
  "prayer": ["jeongseong", "devotion", "meditation", "supplication"],
  "jeongseong": ["devotion", "prayer", "sincerity", "spiritual condition"]
}

const FULL_SYNONYM_MAP: SynonymMap = {}

Object.entries(RAW_SYNONYMS).forEach(([key, values]) => {
  const mainWord = key.toLowerCase()
  if (!FULL_SYNONYM_MAP[mainWord]) FULL_SYNONYM_MAP[mainWord] = []
  values.forEach(val => {
    const synWord = val.toLowerCase()
    // 메인 키 -> 유의어 가중치
    FULL_SYNONYM_MAP[mainWord].push({ word: synWord, weight: 0.9 })

    // 역방향 매핑 활성화
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