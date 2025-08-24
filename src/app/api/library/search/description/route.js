import { getUserId } from "@/helpers/auth";
import Image from "@/models/Image";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";

export const GET = async (req) => {
  let userId = null;
  let query = null;

  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    query = searchParams.get("query")?.trim();

    const authResult = await getUserId(req);
    userId = authResult?.userId;

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    if (!query) {
      return NextResponse.json(
        { message: "Search query is required", success: false },
        { status: 400 }
      );
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
    console.error("[DESCRIPTION_SEARCH_ERROR]", err);

    return NextResponse.json(
      {
        message: err.message || "Internal Server Error",
        success: false,
      },
      { status: 500 }
    );
  }
};
