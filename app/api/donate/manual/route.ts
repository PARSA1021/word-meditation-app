import { NextResponse } from 'next/server';
import { sendSlackNotification } from '@/lib/notifications';

export async function POST(req: Request) {
  try {
    const { name, amount, message } = await req.json();

    if (!name || !amount) {
      return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    // TODO: DB 저장 로직 추가 (PostgreSQL/Prisma 연동 시)
    // 예: const donation = await db.donations.create({ 
    //   data: { name, amount, message, method: 'bank', status: 'pending' } 
    // });

    // 업그레이드된 프리미엄 슬랙 알림 형식
    const slackPayload = {
      attachments: [
        {
          color: "#0099FF", // TruePath 브랜드 컬러
          pretext: "🔔 *새로운 후원 입금 알림이 도착했습니다*",
          title: `후원자: ${name}님`,
          fields: [
            {
              title: "금액",
              value: `*${Number(amount).toLocaleString()}원*`,
              short: true
            },
            {
              title: "입금 확인 시간",
              value: new Date().toLocaleString('ko-KR'),
              short: true
            },
            {
              title: "응원 메시지",
              value: message || "_메시지가 없습니다._",
              short: false
            }
          ],
          footer: "TruePath Donation System",
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    };

    await sendSlackNotification(slackPayload);

    return NextResponse.json({ 
      success: true, 
      message: '후원 알림이 성공적으로 전송되었습니다.' 
    });
  } catch (error) {
    console.error('Manual donation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
