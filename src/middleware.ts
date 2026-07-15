import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // If the user is authenticated, continue.
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Admin routes require an ADMIN role
        return token?.role === "ADMIN";
      },
    },
    pages: {
      signIn: "/admin/login",
    },
  }
);

export const config = {
  matcher: [
    "/admin/((?!login).*)",
  ],
};
