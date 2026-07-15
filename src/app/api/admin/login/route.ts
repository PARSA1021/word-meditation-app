import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (adminPassword && password === adminPassword) {
      const response = NextResponse.json({ success: true });
      
      // Session cookie: expires when the browser is closed (no maxAge)
      response.cookies.set({
        name: 'admin_token',
        value: 'authenticated',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        // maxAge 없음 → 세션 쿠키 → 브라우저 종료 시 자동 삭제
      });

      return response;
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
