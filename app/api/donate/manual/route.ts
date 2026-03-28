// app/api/donate/manual/route.ts
import { NextResponse } from 'next/server';
import { sendSlackNotification } from '@/lib/notifications';
import { z } from 'zod';

const donationSchema = z.object({
  name: z.string().trim().max(50).optional().default(''),
  message: z.string().trim().max(800).optional().default(''),
  anonymous: z.boolean().optional().default(false),
  hasDonated: z.boolean().optional().default(false),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, message, anonymous, hasDonated } = donationSchema.parse(body);

    // 이름 처리
    const finalName = (!anonymous && name?.trim())
      ? name.trim()
      : '익명 후원자';

    const finalMessage = message?.trim() || '';

    // 시간 포맷 (관리자가 보기 편하게)
    const now = new Date();
    const formattedTime = now.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    // 후원 상태 표시 (가장 중요!)
    const donationStatus = hasDonated
      ? '✅ 실제 송금 완료'
      : '💌 메시지만 보냄 (송금 예정)';

    const slackPayload = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '✨ 새로운 나눔의 마음이 도착했습니다',
            emoji: true,
          },
        },
        { type: 'divider' },

        // 기본 정보 (이름 + 시간 + 후원 상태)
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*🙏 후원자*\n${finalName}`,
            },
            {
              type: 'mrkdwn',
              text: `*⏰ 시간*\n${formattedTime}`,
            },
          ],
        },

        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*📌 후원 상태*\n${donationStatus}`,
          },
        },

        { type: 'divider' },

        // 메시지 본문 (가장 중요하게 강조)
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: finalMessage
              ? `💬 *남겨주신 마음*\n${finalMessage.replace(/\n/g, '\n> ')}`
              : '_메시지가 없습니다._',
          },
        },

        { type: 'divider' },

        // 감성 푸터
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: '🕊️ 지금 이 순간에도 하나님의 사랑이 여러분을 통해 흘러가고 있습니다',
            },
          ],
        },
      ],
    };

    await sendSlackNotification(slackPayload);

    return NextResponse.json({
      success: true,
      message: '감사합니다. 따뜻한 마음이 잘 전달되었습니다.',
    });

  } catch (error: any) {
    console.error('Manual donation API error:', {
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });

    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: '입력값이 올바르지 않습니다.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: '서버 내부 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}