import { getUserId } from "@/helpers/auth";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { track } from "@/lib/track";
import dbConnect from "@/lib/dbConnect";

// Helper function to centralize tracking calls for this route
const trackCreditUpdate = async ({
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

export const PUT = async (req) => {
  let userId = null;
  let user = null;

  try {
    await dbConnect();
    const authResult = await getUserId(req);
    userId = authResult?.userId;

    // Track the initial attempt to update credits
    await trackCreditUpdate({
      typeKey: "CREDIT_UPDATE_ATTEMPT",
      status: "info",
      severity: "low",
      userId,
      metadata: {},
    });

    if (!userId) {
      await trackCreditUpdate({
        typeKey: "UNAUTHORIZED_ACCESS",
        status: "failure",
        severity: "high",
        userId: null,
        metadata: { reason: "TOKEN_MISSING_OR_INVALID" },
      });
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    user = await User.findById(userId);

    if (!user) {
      await trackCreditUpdate({
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

    if (user.credits <= 0) {
      // Logic to manage subscription status for zero credits
      if (user.subscription && user.subscription.isActive) {
          user.subscription.isActive = false;
          user.credits = 0;
          await user.save();
      }

      await trackCreditUpdate({
        typeKey: "INSUFFICIENT_CREDITS",
        status: "failure",
        severity: "high",
        userId,
        metadata: { currentCredits: user.credits },
      });

      return NextResponse.json(
        { success: false, message: "Insufficient credits" },
        { status: 402 }
      );
    }

    user.credits -= 1;
    await user.save();

    await trackCreditUpdate({
      typeKey: "CREDIT_DEDUCTED_SUCCESS",
      status: "success",
      severity: "low",
      userId,
      metadata: { remainingCredits: user.credits },
    });

    return NextResponse.json(
      {
        success: true,
        credits: user.credits,
        message: "Credit deducted successfully",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Credit update error:", err);

    await trackCreditUpdate({
      typeKey: "API_ERROR",
      status: "failure",
      severity: "critical",
      userId,
      metadata: { error: err.message || "Unknown error" },
    });

    return NextResponse.json(
      { success: false, message: "An internal server error occurred." },
      { status: 500 }
    );
  }
};