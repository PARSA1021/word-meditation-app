import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => {
      // role이 ADMIN인 사용자만 접근 가능하도록 설정
      return token?.role === "ADMIN";
    },
  },
});

export const config = {
  matcher: [
    "/admin/:path*", 
    "/api/evangelism/generate"
  ],
};
