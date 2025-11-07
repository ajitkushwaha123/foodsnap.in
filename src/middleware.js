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
  "/api/plans",
];

const FREE_ALLOWED_ROUTES = [
  "/pricing",
  "/api/plans",
  "/api/payment",
  "/api/payment/verify",
  "/api/user/me",
  "/api/support",
  "/support",
  "/payment/cart",
  "/payment/checkout",
  "/payment/success",
  "/success",
  "/api/payment/billing",
];

export async function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  const isPublicPage = PUBLIC_ROUTES.some((p) => pathname.startsWith(p));
  const isPublicApi = PUBLIC_API.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!token) {
    if (isPublicPage || isPublicApi) return NextResponse.next();

    if (pathname.startsWith("/pricing")) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect", "/pricing");
      return NextResponse.redirect(signInUrl);
    }

    // redirect others to sign-in
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (pathname === "/sign-in" || pathname === "/sign-up") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    const decoded = await verifyJwtToken(token);
    console.log("[MIDDLEWARE_DECODED]", decoded);

    if (!decoded) {
      const res = NextResponse.redirect(new URL("/sign-in", req.url));
      res.cookies.delete("token");
      return res;
    }

    const userPlan = decoded?.plan || "free";

    if (userPlan === "free") {
      const isFreeAllowed = FREE_ALLOWED_ROUTES.some((r) =>
        pathname.startsWith(r)
      );

      if (!isFreeAllowed) {
        const pricingUrl = new URL("/pricing", req.url);
        return NextResponse.redirect(pricingUrl);
      }
    }
  } catch (err) {
    console.error("[JWT_ERROR]", err);
    const res = NextResponse.redirect(new URL("/sign-in", req.url));
    res.cookies.delete("token");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.png|videos/dashboard-video.mp4|public|api/auth).*)",
  ],
};
