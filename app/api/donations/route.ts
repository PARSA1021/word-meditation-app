import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // TODO: DB에서 실제 승인된 후원 목록 가져오기
    // const donations = await db.donations.findMany({
    //   where: { status: 'confirmed' },
    //   orderBy: { createdAt: 'desc' },
    //   take: 10
    // });

    // 개발용 Mock 데이터
    const mockDonations = [
      {
        id: '1',
        name: '김*도',
        amount: 30000,
        message: '말씀을 통해 큰 위로를 얻고 있습니다.',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: '익명',
        amount: 10000,
        message: '작은 정성을 보탭니다.',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      }
    ];

    return NextResponse.json(mockDonations);
  } catch (error) {
    console.error('Fetch donations error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
