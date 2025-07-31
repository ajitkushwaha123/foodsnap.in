import User from "@/models/User";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const PUT = async () => {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.credits <= 0) {
      user.subscription.isActive = false;
      user.credits = 0;
      await user.save();
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 402 }
      );
    }

    user.credits -= 1;
    await user.save();

    return NextResponse.json({ credits: user.credits }, { status: 200 });
  } catch (err) {
    console.error("Credit update error:", err);
    return NextResponse.json(
      { error: "Failed to update credits" },
      { status: 500 }
    );
  }
};
