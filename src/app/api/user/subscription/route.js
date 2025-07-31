import User from "@/models/User";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. User not logged in." },
        { status: 401 }
      );
    }

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const { subscription } = user;

    console.log("[USER_SUBSCRIPTION]", subscription);

    if (!subscription || !subscription.isActive) {
      return NextResponse.json(
        { error: "No active subscription found." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      subscription: {
        isActive: subscription.isActive,
        expiresAt: subscription.expiresAt,
        plan: subscription.plan,
      },
    });
  } catch (error) {
    console.error("Subscription check failed:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
};
