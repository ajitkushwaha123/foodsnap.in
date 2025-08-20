import { NextResponse } from "next/server";
import { track } from "@/lib/track";

// Helper function to centralize tracking calls for this route.
const trackLogoutEvent = async ({
  typeKey,
  status,
  severity,
  metadata,
  context,
}) => {
  await track({
    typeKey,
    kind: "auth",
    status,
    severity,
    metadata,
    context: { url: "/api/logout", ...context },
  });
};

export const GET = async () => {
  try {
    // 1. Log the attempt to start the logout process.
    await trackLogoutEvent({
      typeKey: "LOGOUT_INITIATED",
      status: "info",
      severity: "low",
      metadata: {},
    });

    // 2. Create a JSON response and immediately clear the token cookie.
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use a dynamic secure flag for different environments.
      sameSite: "lax",
      path: "/",
      expires: new Date(0), // Sets the expiration date to the past to immediately delete the cookie.
    });

    // 3. Log a success event.
    await trackLogoutEvent({
      typeKey: "LOGOUT_SUCCESS",
      status: "success",
      severity: "low",
      metadata: { cookieCleared: true },
    });

    return response;
  } catch (err) {
    // 4. Log any unexpected errors.
    console.error("Logout error:", err);

    await trackLogoutEvent({
      typeKey: "LOGOUT_FAILURE", // Use a generic failure key for the catch block.
      status: "error",
      severity: "critical",
      metadata: { error: err.message },
    });

    return NextResponse.json(
      { success: false, message: "An internal server error occurred." },
      { status: 500 }
    );
  }
};
