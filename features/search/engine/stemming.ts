// features/search/engine/stemming.ts
const KOREAN_PARTICLES = [
  "께로부터", "으로부터", "에서부터", "께서", "에서", "에게", "으로", "이나", "이랑", "까지", "부터", "마다", "보다",
  "은", "는", "이", "가", "을", "를", "에", "와", "과", "도", "만", "로", "의"
].sort((a, b) => b.length - a.length)

const VERB_ENDINGS = [
  "하였습니다", "하였다", "하겠습니다", "하겠다", "합니다", "한다", "해야", "하여", "하는", "하고",
  "하지", "하면", "하니", "하여서", "하니라", "하리라", "하였으니", "하였으며", "하였고",
  "입니다", "이다", "이라", "이며", "이고", "이니", "이면", "으로서", "로서", "습니다", "ㅂ니다", 
  "았다", "었다", "겠다", "리라", "니라", "은가", "는가",
  "되었습니다", "됩니다", "된다", "되어", "되니", "되고", "되면",
  "하다", "한다", "했다", "이다", "이라", "이며", "이고"
].sort((a, b) => b.length - a.length)

export function removeKoreanParticles(word: string): string {
  if (word.length <= 1) return word
  for (const particle of KOREAN_PARTICLES) {
    if (word.endsWith(particle) && word.length > particle.length) {
      return word.slice(0, -particle.length)
    }
  }
  return word
}

export function stemKorean(word: string): string {
  for (const ending of VERB_ENDINGS) {
    if (word.endsWith(ending) && word.length > ending.length + 1) {
      return word.slice(0, -ending.length)
    }
  }
  return word
}

export function stemEnglish(word: string): string {
  let s = word.toLowerCase().trim()
  if (s.length < 3) return s

  if (s.endsWith("ies")) s = s.slice(0, -3) + "y"
  else if (s.endsWith("es") && s.length > 3) s = s.slice(0, -2)
  else if (s.endsWith("s") && !s.endsWith("ss")) s = s.slice(0, -1)

  let wasIngOrEd = false
  if (s.endsWith("ed") && s.length > 3) {
    s = s.slice(0, -2)
    wasIngOrEd = true
  } else if (s.endsWith("ing") && s.length > 4) {
    s = s.slice(0, -3)
    wasIngOrEd = true
  }

  if (wasIngOrEd && !/([bcdfghjklmnpqrstvwxyz])\1$/.test(s) && !s.endsWith("e")) {
    s += "e"
  }
  return s
}
