import { getUserId } from "@/helpers/auth";
import Image from "@/models/Image";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";

    const { userId } = await getUserId();
    if (!userId) {
      return NextResponse.json({
        message: "User not found",
        success: false,
      });
    }

    const suggestions = await Image.find({
      title: { $regex: query, $options: "i" },
    })
      .sort({ createdAt: -1 })
      .limit(5);

    return NextResponse.json({
      success: true,
      suggestions,
    });
  } catch (err) {
    return NextResponse.json({
      message: err.message || "Internal Server Error",
      success: false,
    });
  }
};
