import { NextResponse } from "next/server";

const protectedRoutes = ["/", "/dashboard", "/account", "/settings"];
const publicRoutes = ["/sign-in", "/sign-up", "/about", "/contact"]; // Add any public pages

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const pathname = request.nextUrl.pathname;

  // Skip middleware for public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if route is protected
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
