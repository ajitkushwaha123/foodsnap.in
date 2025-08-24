import { getUserId } from "@/helpers/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(req) {
  let userId = null;

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

    const user = await User.findById(userId).select("credits");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      credits: user.credits,
      message: "User credits fetched successfully",
    });
  } catch (err) {
    console.error("Fetch credits API error:", err);

    return NextResponse.json(
      { message: "An internal server error occurred.", success: false },
      { status: 500 }
    );
  }
}
