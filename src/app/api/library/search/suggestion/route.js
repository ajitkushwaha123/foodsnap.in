import { getUserId } from "@/helpers/auth";
import Image from "@/models/Image";
import { NextResponse } from "next/server";
import { track } from "@/lib/track";
import dbConnect from "@/lib/dbConnect";

const trackSuggestionEvent = async ({
  typeKey,
  status,
  severity,
  userId,
  metadata,
}) => {
  await track({
    typeKey,
    kind: "system",
    status,
    severity,
    userId,
    metadata: {
      ...metadata,
    },
    context: { url: "/api/library/search/suggestion" },
  });
};

export const GET = async (req) => {
  let userId = null;
  let query = null;

  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    query = searchParams.get("query")?.trim() || "";

    const authResult = await getUserId(req);
    userId = authResult?.userId;

    // Track initial suggestion attempt
    await trackSuggestionEvent({
      typeKey: "SUGGESTION_ATTEMPT",
      status: "info",
      severity: "low",
      userId,
      metadata: { query },
    });

    if (!userId) {
      await trackSuggestionEvent({
        typeKey: "UNAUTHORIZED_ACCESS",
        status: "failure",
        severity: "high",
        userId: null,
        metadata: { query },
      });
      return NextResponse.json(
        {
          message: "Unauthorized",
          success: false,
        },
        { status: 401 }
      );
    }

    if (!query) {
      await trackSuggestionEvent({
        typeKey: "SUGGESTION_FAILED",
        status: "failure",
        severity: "low",
        userId,
        metadata: { reason: "NO_QUERY" },
      });
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
      {
        $limit: 5,
      },
      {
        $project: {
          _id: 1,
          title: 1,
          score: { $meta: "searchScore" },
        },
      },
    ];

    const suggestions = await Image.aggregate(suggestionsPipeline);

    await trackSuggestionEvent({
      typeKey: "SUGGESTION_SUCCESS",
      status: "success",
      severity: "low",
      userId,
      metadata: { query, count: suggestions.length },
    });

    return NextResponse.json({
      success: true,
      suggestions,
    });
  } catch (err) {
    console.error("[SUGGESTION_ERROR]", err);

    await trackSuggestionEvent({
      typeKey: "API_ERROR",
      status: "failure",
      severity: "critical",
      userId,
      metadata: { error: err.message, query },
    });

    return NextResponse.json(
      {
        message: err.message || "Internal Server Error",
        success: false,
      },
      { status: 500 }
    );
  }
};
