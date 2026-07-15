import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const dataDir = path.join(process.cwd(), 'data');
  const files = fs.readdirSync(dataDir).filter(f => f.includes('words.json') || f === 'words.json');
  
  let totalInserted = 0;
  let globalId = 1; 

  console.log('기존 DB의 말씀 데이터를 초기화합니다...');
  await prisma.words.deleteMany({});
  
  for (const file of files) {
    console.log(`\n📄 [${file}] 처리 중...`);
    const filePath = path.join(dataDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const wordsArray = JSON.parse(content);

    let defaultType = "general";
    if (file.includes("cheonseong_words")) defaultType = "cheonseong";
    else if (file.includes("wonligangnon_words")) defaultType = "wonli";
    else if (file.includes("pyeonghwashinkyung_words")) defaultType = "pyeonghwashinkyung";
    else if (file.includes("Cheon Il Guk_ddeutgil_words")) defaultType = "CheonIlGuk_ddeutgil";
    else if (file.includes("CheonSeongGyeong_en_words")) defaultType = "CheonSeongGyeong_en_words";
    else if (file.includes("Divine_Principle_eng")) defaultType = "Divine_Principle_en";

    const dataToInsert = wordsArray.map((w: any) => ({
      id: globalId++,
      text: w.text,
      source: w.source || "",
      category: w.category || "",
      speaker: w.speaker || null,
      type: w.type || defaultType
    }));

    const batchSize = 1000;
    for (let i = 0; i < dataToInsert.length; i += batchSize) {
      const batch = dataToInsert.slice(i, i + batchSize);
      await prisma.words.createMany({
        data: batch,
        skipDuplicates: true, 
      });
    }

    console.log(`✅ ${file}에서 ${dataToInsert.length}개의 말씀 DB 삽입 완료!`);
    totalInserted += dataToInsert.length;
  }

  console.log(`\n🎉 모든 데이터 마이그레이션 완료! (총 삽입된 말씀: ${totalInserted}개)`);
}

main()
  .catch(e => {
    console.error('마이그레이션 중 오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
