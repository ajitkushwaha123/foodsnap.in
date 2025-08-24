import { getUserId } from "@/helpers/auth";
import User from "@/models/User";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";

export const PUT = async (req) => {
  let userId = null;
  let user = null;

  try {
    await dbConnect();
    const authResult = await getUserId(req);
    userId = authResult?.userId;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    user = await User.findById(userId);

    if (!user) {
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

      return NextResponse.json(
        { success: false, message: "Insufficient credits" },
        { status: 402 }
      );
    }

    user.credits -= 1;
    await user.save();

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

    return NextResponse.json(
      { success: false, message: "An internal server error occurred." },
      { status: 500 }
    );
  }
};
