import { NextResponse } from "next/server";

const protectedRoutes = ["/", "/dashboard", "/account", "/settings"];

export function middleware(request) {
  const token = request.cookies.get("token")?.value;

  const pathname = request.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !token) {
    const signInUrl = new URL("/sign-in", request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/",
    "/dashboard/:path*",
    "/account/:path*",
    "/settings/:path*",
  ],
};
