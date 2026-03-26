import { NextResponse } from 'next/server';
import { sendSlackNotification } from '@/lib/notifications';

export async function POST(req: Request) {
  try {
    const { name, phone, amount, message } = await req.json();

    // 입력이 없으면 기본값 처리
    const finalName = name?.trim() || '익명 후원자';
    const finalPhone = phone?.trim() || '정보 없음';
    const finalAmount = amount?.trim() ? `${amount}원` : '미기입';

    // 한층 품격 있는 프리미엄 슬랙 알림 형식
    const slackPayload = {
      attachments: [
        {
          fallback: `새로운 후원 정보 등록: ${finalName}님 (${finalAmount})`,
          color: "#00CA72", // 성공을 상징하는 청량한 그린
          pretext: "✨ *새로운 소중한 마음이 도착했습니다*",
          title: `🙏 후원자: ${finalName}님`,
          text: message ? `> "${message}"` : "_응원 메시지가 없습니다._",
          fields: [
            {
              title: "💰 후원 금액",
              value: `*${finalAmount}*`,
              short: true
            },
            {
              title: "📱 연락처",
              value: finalPhone !== '정보 없음' ? `\`${finalPhone}\`` : "_익명_",
              short: true
            },
            {
              title: "⏰ 등록 시간",
              value: new Date().toLocaleString('ko-KR', { 
                month: 'long', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              }),
              short: true
            }
          ],
          footer: "🕊️ TruePath Donation Management Suite",
          footer_icon: "https://word-meditation-app.vercel.app/favicon.ico",
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
        error: `알림 전송 실패: ${notifError.message}`,
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
