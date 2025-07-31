import User from "@/models/User";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const PUT = async (req) => {
  try {
    const { userId } = await auth();

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.credits -= 1;
    if (user.credits < 0) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 400 }
      );
    }

    await user.save();

    return NextResponse.json({ credits: user.credits }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Failed to update credits",
      },
      { status: 500 }
    );
  }
};
