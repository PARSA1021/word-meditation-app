import fs from "fs"

// 원본 데이터 읽기
const rawData = JSON.parse(
  fs.readFileSync("./data/raw.json", "utf8")
)

// 변환
const converted = rawData.map((item, index) => {
  return {
    id: index + 1,
    text: item.text.trim(),
    source: item.source || "",
    category: item.category || "기타",
    speaker: item.speaker || null
  }
})

// 저장
fs.writeFileSync(
  "./data/words.json",
  JSON.stringify(converted, null, 2),
  "utf8"
)

console.log("✅ 말씀 데이터 변환 완료!")