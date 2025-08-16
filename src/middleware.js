import { NextResponse } from "next/server";
import { verifyJwtToken } from "./lib/jwt";

const PUBLIC_ROUTES = ["/sign-in", "/sign-up", "/forgot-password"];

const PUBLIC_API = [
  "/api/login",
  "/api/register",
  "/api/image/category",
  "/api/image",
  "/api/image/search",
  "/api/image/sub-category",
  "/api/image/title",
];

export async function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  const isPublicPage = PUBLIC_ROUTES.some((p) => pathname.startsWith(p));

  const isPublicApi = PUBLIC_API.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!token && !isPublicPage && !isPublicApi) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (token && (pathname === "/sign-in" || pathname === "/sign-up")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (token && !isPublicApi && !isPublicPage) {
    try {
      verifyJwtToken(token);
    } catch {
      const res = NextResponse.redirect(new URL("/sign-in", req.url));
      res.cookies.delete("auth_token");
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.png|videos/dashboard-video.mp4|public|api/auth).*)",
  ],
};
