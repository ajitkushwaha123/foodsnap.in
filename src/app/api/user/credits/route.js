import { getUserId } from "@/helpers/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const { userId } = await getUserId();
    if (!userId)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    const user = await User.findOne({ userId });

    if (!user)
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );

    return NextResponse.json({
      success: true,
      credits: user.credits,
      message: "User credits fetched successfully",
    });
  } catch (err) {
    return NextResponse.json(
      { message: err.message || "Internal Server Error", success: false },
      { status: 500 }
    );
  }
}
