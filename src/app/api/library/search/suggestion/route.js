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
    query = searchParams.get("query")?.trim() || "";

    const authResult = await getUserId(req);
    userId = authResult?.userId;

    if (!userId) {
      return NextResponse.json(
        {
          message: "Unauthorized",
          success: false,
        },
        { status: 401 }
      );
    }

    if (!query) {
      return NextResponse.json(
        {
          message: "Search query is required",
          success: false,
        },
        { status: 400 }
      );
    }

    // Using an Atlas Search pipeline for efficient autocomplete
    const suggestionsPipeline = [
      {
        $search: {
          index: "default", // or your specific autocomplete index
          autocomplete: {
            query,
            path: "title",
            fuzzy: { maxEdits: 1 },
          },
        },
      },
      { $limit: 5 },
      {
        $project: {
          _id: 1,
          title: 1,
          score: { $meta: "searchScore" },
        },
      },
    ];

    const suggestions = await Image.aggregate(suggestionsPipeline);

    return NextResponse.json({
      success: true,
      suggestions,
    });
  } catch (err) {
    console.error("[SUGGESTION_ERROR]", err);

    return NextResponse.json(
      {
        message: err.message || "Internal Server Error",
        success: false,
      },
      { status: 500 }
    );
  }
};
