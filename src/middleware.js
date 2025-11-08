import { NextResponse } from "next/server";
import { verifyJwtToken } from "./lib/jwt";

// Public pages that don’t require authentication
const PUBLIC_ROUTES = ["/sign-in", "/sign-up", "/forgot-password"];

// Public APIs accessible without login
const PUBLIC_API = [
  "/api/login",
  "/api/register",
  "/api/image/category",
  "/api/image",
  "/api/image/search",
  "/api/image/sub-category",
  "/api/image/title",
  "/api/plans",
];

// Routes allowed even for "free" users
const FREE_ALLOWED_ROUTES = [
  "/pricing",
  "/support",
  "/success",
  "/payment/cart",
  "/payment/checkout",
  "/payment/success",
  "/api/plans",
  "/api/payment",
  "/api/payment/verify",
  "/api/payment/billing",
  "/api/user/me",
  "/api/user/logout",
  "/api/support",
  "/api/*",
];

export async function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  const startsWithAny = (path, list) =>
    list.some((r) => path === r || path.startsWith(r.replace("*", "")));

  const redirectTo = (path) => NextResponse.redirect(new URL(path, req.url));

  if (!token) {
    if (startsWithAny(pathname, [...PUBLIC_ROUTES, ...PUBLIC_API])) {
      return NextResponse.next();
    }

    const redirectUrl =
      pathname.startsWith("/pricing") || pathname.startsWith("/support")
        ? "/sign-in?redirect=/pricing"
        : `/sign-in?redirect=${pathname}`;
    return redirectTo(redirectUrl);
  }

  if (pathname === "/sign-in" || pathname === "/sign-up") {
    return redirectTo("/");
  }

  try {
    const decoded = await verifyJwtToken(token);
    console.log("[MIDDLEWARE_DECODED]", decoded);

    if (!decoded) {
      const res = redirectTo("/sign-in");
      res.cookies.delete("token");
      return res;
    }

    const userPlan = decoded.plan || "free";
    if (userPlan === "free") {
      const isAllowed = startsWithAny(pathname, FREE_ALLOWED_ROUTES);
      if (!isAllowed) {
        return redirectTo("/pricing");
      }
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
