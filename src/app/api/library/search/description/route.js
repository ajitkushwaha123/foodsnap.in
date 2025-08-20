import { getUserId } from "@/helpers/auth";
import Image from "@/models/Image";
import { NextResponse } from "next/server";
import { track } from "@/lib/track";
import dbConnect from "@/lib/dbConnect";

const trackDescriptionEvent = async ({
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
    context: { url: "/api/library/search/description" },
  });
};

export const GET = async (req) => {
  let userId = null;
  let query = null;

  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    query = searchParams.get("query")?.trim();

    const authResult = await getUserId(req);
    userId = authResult?.userId;

    await trackDescriptionEvent({
      typeKey: "DESCRIPTION_SEARCH_ATTEMPT",
      status: "info",
      severity: "low",
      userId,
      metadata: { query },
    });

    if (!userId) {
      await trackDescriptionEvent({
        typeKey: "UNAUTHORIZED_ACCESS",
        status: "failure",
        severity: "high",
        userId: null,
        metadata: { query },
      });
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    if (!query) {
      await trackDescriptionEvent({
        typeKey: "SEARCH_QUERY_REQUIRED",
        status: "failure",
        severity: "low",
        userId,
        metadata: { reason: "NO_QUERY" },
      });
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

    await trackDescriptionEvent({
      typeKey: "DESCRIPTION_SEARCH_SUCCESS",
      status: "success",
      severity: "low",
      userId,
      metadata: { query, resultsCount: descriptions.length },
    });

    return NextResponse.json({
      message: "Top descriptions fetched successfully",
      success: true,
      descriptions,
    });
  } catch (err) {
    console.error("[DESCRIPTION_SEARCH_ERROR]", err);

    await trackDescriptionEvent({
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
