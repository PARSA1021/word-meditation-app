import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 임시 구독 저장소 (실제 서비스에서는 DB 사용 권장)
const dataFilePath = path.join(process.cwd(), 'data', 'subscriptions.json');

export async function POST(req: Request) {
  try {
    const subscription = await req.json();

    // subscriptions.json 파일 확인 및 생성
    let subscriptions: any[] = [];
    if (fs.existsSync(dataFilePath)) {
      subscriptions = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    } else {
      // data 폴더가 없으면 생성
      if (!fs.existsSync(path.dirname(dataFilePath))) {
        fs.mkdirSync(path.dirname(dataFilePath), { recursive: true });
      }
    }

    // 중복 구독 방지
    const exists = subscriptions.find(s => s.endpoint === subscription.endpoint);
    if (!exists) {
      subscriptions.push(subscription);
      fs.writeFileSync(dataFilePath, JSON.stringify(subscriptions, null, 2));
    }

    return NextResponse.json({ success: true, message: '구독 성공' });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ success: false, error: '구독 실패' }, { status: 500 });
  }
}
