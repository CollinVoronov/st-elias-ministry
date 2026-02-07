import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: "st-elias-ministry-secret-key-2024" });
  const { pathname } = req.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isCommunityRoute = pathname.startsWith("/community");
  const isIdeasRoute = pathname.startsWith("/ideas");
  const isLoginRoute = pathname.startsWith("/login");
  const isRegisterRoute = pathname.startsWith("/register");
  const isProtectedRoute = isAdminRoute || isCommunityRoute || isIdeasRoute;

  // Redirect logged-in users away from register
  if (isRegisterRoute && token) {
    const role = token.role as string;
    const dest = role === "COMMUNITY" ? "/community" : "/admin";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect logged-in users away from login based on role
  if (isLoginRoute && token) {
    const role = token.role as string;
    const dest = role === "COMMUNITY" ? "/community" : "/admin";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  // Role-based access control
  if (token) {
    const role = token.role as string;

    // Community users cannot access admin routes
    if (isAdminRoute && role === "COMMUNITY") {
      return NextResponse.redirect(new URL("/community", req.url));
    }

    // Admin/Organizer users cannot access community routes
    if (isCommunityRoute && (role === "ADMIN" || role === "ORGANIZER")) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login/:path*", "/ideas/:path*", "/community/:path*", "/register/:path*"],
};
