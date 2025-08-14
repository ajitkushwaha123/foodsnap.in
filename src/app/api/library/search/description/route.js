import { getUserId } from "@/helpers/auth";
import Image from "@/models/Image";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";

    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ message: "User not found", success: false });
    }

    const results = await Image.find({ $text: { $search: query } })
      .sort({ score: { $meta: "textScore" } })
      .limit(5)
      .select("description -_id");

    const descriptions = results.map((item) => item.description);

    return NextResponse.json({
      message: "Top descriptions fetched successfully",
      success: true,
      descriptions,
    });
  } catch (err) {
    return NextResponse.json({
      message: err.message || "Error fetching description",
      success: false,
    });
  }
};
