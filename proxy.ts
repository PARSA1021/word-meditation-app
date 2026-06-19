import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  // Only apply to /admin and /api/admin
  if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/api/admin')) {
    const authHeader = req.headers.get('authorization');

    if (!authHeader) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
      });
    }

    const authPattern = /^Basic\s+(.*)$/i;
    const match = authHeader.match(authPattern);

    if (match) {
      const credentials = atob(match[1]);
      const [username, password] = credentials.split(':');

      const adminPassword = process.env.ADMIN_PASSWORD;

      if (adminPassword && password === adminPassword && username === 'admin') {
        return NextResponse.next();
      }
    }

    return new NextResponse('Authentication failed', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
