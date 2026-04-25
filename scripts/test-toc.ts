import { parseSource } from "../lib/toc";

const testCases = [
  {
    input: "천성경, 제1편 하나님 > 제1장 하나님의 존재와 속성 > 1절 하나님의 실존",
    expected: { category: "천성경", part: "제1편 하나님", chapter: "제1장 하나님의 존재와 속성", section: "1절 하나님의 실존" }
  },
  {
    input: "원리강론, 총서",
    expected: { category: "원리강론", part: "총서", chapter: undefined, section: undefined }
  },
  {
    input: "천일국시대 뜻길, 뜻의 장 > I. 뜻",
    expected: { category: "천일국시대 뜻길", part: "뜻의 장", chapter: "I. 뜻", section: undefined }
  },
  {
    input: "평화신경, 제1편 평화메시지 1",
    expected: { category: "평화신경", part: "제1편 평화메시지 1", chapter: undefined, section: undefined }
  },
  {
    input: "Invalid Format Data",
    expected: { category: "Invalid Format Data" } // No comma or '>', treat as category
  }
];

console.log("🚀 Starting TOC Parser Test...\n");

let passed = 0;
testCases.forEach((tc, i) => {
  const result = parseSource(tc.input);
  const isMatch = JSON.stringify(result) === JSON.stringify(tc.expected);
  
  if (isMatch) {
    console.log(`✅ Test #${i + 1} Passed`);
    passed++;
  } else {
    console.log(`❌ Test #${i + 1} Failed`);
    console.log(`   Input: ${tc.input}`);
    console.log(`   Expected:`, tc.expected);
    console.log(`   Got:     `, result);
  }
});

console.log(`\n📊 Result: ${passed}/${testCases.length} Passed`);

if (passed === testCases.length) {
  process.exit(0);
} else {
  process.exit(1);
}
