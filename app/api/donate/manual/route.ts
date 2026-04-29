// app/api/donate/manual/route.ts
import { NextResponse } from 'next/server';
import { sendDonationNotification } from '@/lib/notifications';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// -----------------------------
// 1️⃣ 타입 정의 (다른 모듈에서 사용 가능하도록 export)
// -----------------------------
export interface DonationRecord {
  id: string;           // randomUUID()
  donorName: string | null;
  isAnonymous: boolean;
  message: string;
  amount: number;       // 0 = 미입력
  status: 'CONFIRMED' | 'MESSAGE_ONLY';
  hasDonated: boolean;
  createdAt: string;    // ISO 8601
}

// -----------------------------
// 2️⃣ 유효성 검사 스키마
// -----------------------------
const donationSchema = z.object({
  name: z.string().trim().max(50).optional().default(''),
  message: z.string().trim().max(800).min(1, '마음을 한마디라도 남겨주세요.'),
  amount: z.number().nonnegative().default(0),
  anonymous: z.boolean().optional().default(false),
  hasDonated: z.boolean().optional().default(false),
});

// -----------------------------
// 3️⃣ 핵심 비즈니스 로직
// -----------------------------

/**
 * 데이터베이스 저장 로직 (현재는 Mock)
 * 추후 Prisma 연동 시 이 내부만 교체하면 됨
 */
async function saveDonation(record: DonationRecord) {
  // TODO: db.donation.create({ data: record })
  console.info('[Donation Save Mock]:', JSON.stringify(record, null, 2));
  return true;
}

// -----------------------------
// 4️⃣ 메인 핸들러 (POST)
// -----------------------------
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = donationSchema.parse(body);

    const id = randomUUID();
    const record: DonationRecord = {
      id,
      donorName: (parsed.anonymous || !parsed.name) ? null : parsed.name,
      isAnonymous: parsed.anonymous || !parsed.name,
      message: parsed.message,
      amount: parsed.amount,
      hasDonated: parsed.hasDonated,
      status: parsed.hasDonated ? 'CONFIRMED' : 'MESSAGE_ONLY',
      createdAt: new Date().toISOString(),
    };

    // 🚀 저장과 알림 전송을 병렬로 처리 (Slack 전송 지연이 응답에 영향을 주지 않도록 함)
    // 알림 전송에 실패해도 메인 흐름(성공 응답)은 유지
    Promise.allSettled([
      saveDonation(record),
      sendDonationNotification(record)
    ]).then((results) => {
      results.forEach((res, i) => {
        if (res.status === 'rejected') {
          console.error(`[Donation Background Process ${i === 0 ? 'Save' : 'Notify'} Failed]:`, res.reason);
        }
      });
    });

    return NextResponse.json({
      success: true,
      id,
      message: '감사합니다. 따뜻한 마음이 잘 전달되었습니다.',
    });

  } catch (error: any) {
    console.error('Manual donation API error:', error.message);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: error.issues[0]?.message || '입력값이 올바르지 않습니다.',
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