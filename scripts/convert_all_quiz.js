import fs from "fs"

function convert(file, type, output) {
  const raw = JSON.parse(fs.readFileSync(file, "utf8"))

  const converted = raw.map((item, index) => ({
    id: index + 1,
    type,
    question: item.question.trim(),
    answers: item.answers,
    options: item.options,
    explanation: item.explanation || "",
    difficulty: "normal"
  }))

  fs.writeFileSync(output, JSON.stringify(converted, null, 2), "utf8")

  console.log(`✅ ${type} 변환 완료`)
}

convert("./data/bible_raw.json", "bible", "./data/bibleQuiz.json")
convert("./data/divine_raw.json", "divine_principle", "./data/divineQuiz.json")

console.log("🎉 모든 퀴즈 변환 완료")