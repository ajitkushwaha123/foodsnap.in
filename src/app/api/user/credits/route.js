import { getUserId } from "@/helpers/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { track } from "@/lib/track";

// Helper function to centralize tracking for this route
const trackCreditsEvent = async ({
  typeKey,
  status,
  severity,
  userId,
  metadata,
}) => {
  await track({
    typeKey,
    kind: "billing",
    status,
    severity,
    userId,
    metadata,
    context: { url: "/api/credits" },
  });
};

export async function GET(req) {
  let userId = null;

  try {
    await dbConnect();

    // Track the initial attempt to fetch credits
    await trackCreditsEvent({
      typeKey: "CREDITS_FETCH_ATTEMPT",
      status: "info",
      severity: "low",
      userId: null,
      metadata: {},
    });

    const authResult = await getUserId(req);
    userId = authResult?.userId;

    if (!userId) {
      await trackCreditsEvent({
        typeKey: "UNAUTHORIZED_ACCESS",
        status: "failure",
        severity: "high",
        userId: null,
        metadata: { reason: "AUTHENTICATION_FAILED" },
      });
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fix: Use findById to query by _id, which `getUserId` returns
    const user = await User.findById(userId).select("credits");

    if (!user) {
      await trackCreditsEvent({
        typeKey: "USER_NOT_FOUND",
        status: "failure",
        severity: "medium",
        userId,
        metadata: { reason: "USER_ID_NOT_IN_DB" },
      });
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    await trackCreditsEvent({
      typeKey: "CREDITS_FETCH_SUCCESS",
      status: "success",
      severity: "low",
      userId,
      metadata: { credits: user.credits },
    });

    return NextResponse.json({
      success: true,
      credits: user.credits,
      message: "User credits fetched successfully",
    });
  } catch (err) {
    console.error("Fetch credits API error:", err);
    await trackCreditsEvent({
      typeKey: "API_ERROR",
      status: "failure",
      severity: "critical",
      userId,
      metadata: { error: err.message },
    });

    return NextResponse.json(
      { message: "An internal server error occurred.", success: false },
      { status: 500 }
    );
  }
}
