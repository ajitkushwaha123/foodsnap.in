import { getUserId } from "@/helpers/auth";
import User from "@/models/User";
import { NextResponse } from "next/server";

export const PUT = async () => {
  try {
    const { userId } = await getUserId();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    if (user.credits <= 0) {
      user.subscription.isActive = false;
      user.credits = 0;
      await user.save();
      return NextResponse.json(
        {
          success: false,
          message: "Insufficient credits",
        },
        { status: 402 }
      );
    }

    user.credits -= 1;
    await user.save();

    return NextResponse.json(
      {
        success: true,
        credits: user.credits,
        message: "Credits updated successfully",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Credit update error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
};
