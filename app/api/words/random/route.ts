import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'words.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const words = JSON.parse(fileContent);

    if (!Array.isArray(words) || words.length === 0) {
      return NextResponse.json({ error: 'No words found' }, { status: 404 });
    }

    // 랜덤으로 한 개 선택
    const randomWord = words[Math.floor(Math.random() * words.length)];

    return NextResponse.json(randomWord);
  } catch (error) {
    console.error('Fetch random word error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
