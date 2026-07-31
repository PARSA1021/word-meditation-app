import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  // proxy.ts in Next.js 16 is a simple passthrough
  // Auth protection is handled at page/layout level via getServerSession
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
