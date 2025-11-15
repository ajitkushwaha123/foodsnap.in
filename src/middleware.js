import { NextResponse } from "next/server";
import { verifyJwtToken } from "./lib/jwt";

const PUBLIC_ROUTES = ["/sign-in", "/sign-up", "/forgot-password"];

const PUBLIC_API = ["/api/login", "/api/register"];

export async function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  const startsWithAny = (path, list) =>
    list.some((r) => path === r || path.startsWith(r));

  const redirectTo = (path) => NextResponse.redirect(new URL(path, req.url));

  if (!token) {
    if (startsWithAny(pathname, [...PUBLIC_ROUTES, ...PUBLIC_API])) {
      return NextResponse.next();
    }

    return redirectTo(`/sign-in?redirect=${pathname}`);
  }

  if (pathname === "/sign-in" || pathname === "/sign-up") {
    return redirectTo("/");
  }

  try {
    const decoded = await verifyJwtToken(token);
    if (!decoded) {
      const res = redirectTo("/sign-in");
      res.cookies.delete("token");
      return res;
    }
  } catch (err) {
    console.error("[JWT_ERROR]", err);
    const res = redirectTo("/sign-in");
    res.cookies.delete("token");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.png|videos/|public|api/auth).*)",
  ],
};
