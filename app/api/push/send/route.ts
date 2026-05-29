import { NextResponse } from 'next/server';
import webpush from 'web-push';
import fs from 'fs';
import path from 'path';

// VAPID 키 설정
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@truepath.app',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
  process.env.VAPID_PRIVATE_KEY as string
);

const dataFilePath = path.join(process.cwd(), 'data', 'subscriptions.json');

export async function POST(req: Request) {
  try {
    if (!fs.existsSync(dataFilePath)) {
      return NextResponse.json({ message: '등록된 구독자가 없습니다.' });
    }

    const subscriptions = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    
    // 매일 아침 전송할 푸시 내용 (또는 매번 DB에서 랜덤으로 가져올 수 있음)
    const payload = JSON.stringify({
      title: '🌿 오늘의 말씀이 도착했습니다',
      body: '아침을 여는 고요한 묵상. 지금 들어와서 오늘의 말씀을 확인해보세요.',
      url: '/today',
      icon: '/TP_192_192.png'
    });

    const sendPromises = subscriptions.map((sub: any) => 
      webpush.sendNotification(sub, payload).catch(err => {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // 구독이 만료되었거나 유효하지 않음 (이후 필터링 로직 추가 가능)
          console.log('만료된 구독:', sub.endpoint);
        } else {
          console.error('푸시 전송 에러:', err);
        }
      })
    );

    await Promise.all(sendPromises);

    return NextResponse.json({ success: true, message: `${subscriptions.length}명에게 푸시 발송 완료` });
  } catch (error) {
    console.error('Send error:', error);
    return NextResponse.json({ success: false, error: '발송 실패' }, { status: 500 });
  }
}
