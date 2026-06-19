import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Paths that require authentication
  const isAdminPath = path.startsWith('/admin');
  const isAdminApi = path.startsWith('/api/admin');
  
  // Public paths
  const isLoginPage = path === '/admin/login';
  const isLoginApi = path === '/api/admin/login';

  if ((isAdminPath || isAdminApi) && !isLoginPage && !isLoginApi) {
    const adminToken = req.cookies.get('admin_token')?.value;

    if (adminToken !== 'authenticated') {
      // For API requests, return 401 JSON
      if (isAdminApi) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      // For page requests, redirect to custom login page
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  // If trying to access login page while already authenticated, redirect to dashboard
  if (isLoginPage) {
    const adminToken = req.cookies.get('admin_token')?.value;
    if (adminToken === 'authenticated') {
      return NextResponse.redirect(new URL('/admin/donations', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
