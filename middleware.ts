import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Nếu chưa có sessionCartId thì set cookie mới
  if (!req.cookies.get("sessionCartId")) {
    res.cookies.set("sessionCartId", crypto.randomUUID(), {
      path: "/",
      httpOnly: false, // client có thể đọc
      sameSite: "lax",
    });
  }

  return res;
}

export const config = {
  matcher: ["/cart/:path*", "/checkout/:path*", "/user/:path*", "/admin/:path*"],
  runtime: "nodejs",
};
