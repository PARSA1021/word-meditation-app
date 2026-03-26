import { NextResponse } from 'next/server';
import { sendSlackNotification } from '@/lib/notifications';

export async function POST(req: Request) {
  try {
    const { name, phone, message } = await req.json();

    // 입력이 없으면 익명으로 처리
    const finalName = name?.trim() || '익명 후원자';
    const finalPhone = phone?.trim() || '정보 없음';

    // TODO: DB 저장 로직 추가 (PostgreSQL/Prisma 연동 시)
    // 예: const donation = await db.donations.create({ 
    //   data: { name, phone, message, method: 'bank', status: 'pending' } 
    // });

    // 업그레이드된 프리미엄 슬랙 알림 형식
    const slackPayload = {
      attachments: [
        {
          color: "#0099FF", // TruePath 브랜드 컬러
          pretext: "🔔 *새로운 후원 정보가 등록되었습니다*",
          title: `후원자: ${finalName}님`,
          fields: [
            {
              title: "연락처",
              value: `*${finalPhone}*`,
              short: true
            },
            {
              title: "등록 시간",
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

    try {
      await sendSlackNotification(slackPayload);
    } catch (notifError: any) {
      console.error('Notification failed:', notifError.message);
      // 알림 설정 문제(Webhook 누락 등)인 경우 에러 응답 반환하여 관리자에게 알림
      return NextResponse.json({ 
        success: false, 
        error: '시스템 설정 오류로 인해 알림을 전송할 수 없습니다. 관리자에게 문의하세요.',
        details: process.env.NODE_ENV === 'development' ? notifError.message : undefined
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: '후원 알림이 성공적으로 전송되었습니다.' 
    });
  } catch (error) {
    console.error('Manual donation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
