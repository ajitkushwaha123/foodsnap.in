import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { track } from "@/lib/track";

const trackUserEvent = async ({
  typeKey,
  status,
  severity,
  userId,
  metadata,
}) => {
  await track({
    typeKey,
    kind: "auth",
    status,
    severity,
    userId,
    metadata: {
      ...metadata,
    },
    context: { url: "/api/user/me" },
  });
};

export const GET = async () => {
  let userId = null;
  let decoded = null;
  let user = null;

  try {
    await dbConnect();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    await trackUserEvent({
      typeKey: "USER_FETCH_ATTEMPT",
      status: "info",
      severity: "low",
      userId: null,
      metadata: { hasToken: !!token },
    });

    if (!token) {
      await trackUserEvent({
        typeKey: "UNAUTHORIZED_ACCESS",
        status: "failure",
        severity: "medium",
        userId: null,
        metadata: { reason: "TOKEN_MISSING" },
      });
      return NextResponse.json(
        { success: false, message: "Unauthorized: Token missing" },
        { status: 401 }
      );
    }

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch (err) {
      await trackUserEvent({
        typeKey: "UNAUTHORIZED_ACCESS",
        status: "failure",
        severity: "high",
        userId: null,
        metadata: { reason: "TOKEN_INVALID", error: err.message },
      });
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }

    user = await User.findById(userId).select("-password -__v");

    if (!user) {
      await trackUserEvent({
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

    await trackUserEvent({
      typeKey: "USER_FETCH_SUCCESS",
      status: "success",
      severity: "low",
      userId: user._id,
      metadata: { phone: user.phone, credits: user.credits },
    });

    return NextResponse.json({
      success: true,
      message: "User data fetched successfully",
      user,
    });
  } catch (err) {
    console.error("User fetch error:", err);
    await trackUserEvent({
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
