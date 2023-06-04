import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { UserController } from './app/server/controllers/user.controller';

const userC = new UserController();

export async function middleware(req: NextRequest) {
  const refreshToken = req.cookies.get("my-refresh-token")?.value || "";
  const accessToken = req.cookies.get("my-access-token")?.value || "";
  const session = await userC.getUserSession(refreshToken, accessToken);

  if (req.nextUrl.pathname.startsWith("/entities")) {
    if (session) return NextResponse.next();

    return NextResponse.redirect(`${req.nextUrl.origin}/login`);
  }

  const isLogin = req.nextUrl.pathname.startsWith("/login");
  const isRegister = req.nextUrl.pathname.startsWith("/register");
  if ((isLogin || isRegister) && session) {
    return NextResponse.redirect(`${req.nextUrl.origin}/entities`);
  }

  if (req.nextUrl.pathname === "/") {
    return NextResponse.redirect(`${req.nextUrl.origin}/entities`);
  }
  
}

export const config = {
  matcher: [
    "/entities/:path*", 
    "/login", 
    "/register",
    "/"
  ],
}