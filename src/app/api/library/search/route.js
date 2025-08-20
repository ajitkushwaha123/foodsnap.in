import { getUserId } from "@/helpers/auth";
import { updateCredits } from "@/helpers/update-credit";
import dbConnect from "@/lib/dbConnect";
import Image from "@/models/Image";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { track } from "@/lib/track";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

export const OPTIONS = async () =>
  NextResponse.json({}, { status: 204, headers: corsHeaders });

// Helper function to simplify tracking calls for search
const trackSearchEvent = async ({
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
    context: { url: "/api/library/search" },
  });
};

export const GET = async (req) => {
  let userId = null;
  let query = null;

  try {
    await dbConnect();

    const authResult = await getUserId(req);
    userId = authResult?.userId;

    query = new URL(req.url).searchParams.get("search")?.trim() || null;
    await trackSearchEvent({
      typeKey: "SEARCH_ATTEMPT",
      status: "info",
      severity: "low",
      userId,
      metadata: { query },
    });

    if (!userId) {
      await trackSearchEvent({
        typeKey: "UNAUTHORIZED_ACCESS",
        status: "failure",
        severity: "high",
        userId: null,
        metadata: { query },
      });
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 12;
    const skip = (page - 1) * limit;

    if (!query) {
      await trackSearchEvent({
        typeKey: "SEARCH_FAILED",
        status: "failure",
        severity: "low",
        userId,
        metadata: { reason: "NO_QUERY", query: null },
      });
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const filters = { approved: false };
    const category = searchParams.get("category");
    const region = searchParams.get("region");
    const premium = searchParams.get("premium");

    if (category) filters.category = category;
    if (region) filters.region = region;
    if (premium === "true") filters.premium = true;

    const creditUpdate = await updateCredits(userId, 1);
    if (!creditUpdate.success) {
      await trackSearchEvent({
        typeKey: "SEARCH_FAILED",
        status: "failure",
        severity: "medium",
        userId,
        metadata: { reason: "INSUFFICIENT_CREDITS", query },
      });
      return NextResponse.json(
        { error: creditUpdate.message },
        { status: 402, headers: corsHeaders }
      );
    }

    // Update user's search history and total searches
    await User.findByIdAndUpdate(userId, {
      $pull: { searchHistory: { query } },
    });
    await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          searchHistory: {
            $each: [{ query, timestamp: new Date() }],
            $position: 0,
            $slice: 5,
          },
        },
        $inc: { totalSearches: 1 },
      },
      { new: true }
    );

    const searchPipeline = [
      {
        $search: {
          index: "default",
          compound: {
            should: [
              {
                autocomplete: {
                  query,
                  path: "title",
                  fuzzy: { maxEdits: 2, prefixLength: 1 },
                },
              },
              {
                text: {
                  query,
                  path: "tags",
                  fuzzy: { maxEdits: 2, prefixLength: 1 },
                },
              },
              {
                autocomplete: {
                  query,
                  path: "cuisine",
                  fuzzy: { maxEdits: 2, prefixLength: 1 },
                },
              },
            ],
            minimumShouldMatch: 1,
          },
        },
      },
      { $match: filters },
      { $addFields: { score: { $meta: "searchScore" } } },
      { $sort: { score: -1, quality_score: -1 } },
      {
        $facet: {
          paginatedResults: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                title: 1,
                tags: 1,
                cuisine: 1,
                image_url: 1,
                category: 1,
                region: 1,
                quality_score: 1,
                score: 1,
              },
            },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const aggregationResult = await Image.aggregate(searchPipeline);
    const results = aggregationResult[0]?.paginatedResults || [];
    const total = aggregationResult[0]?.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    await trackSearchEvent({
      typeKey: "SEARCH_SUCCESS",
      status: "success",
      severity: "low",
      userId,
      metadata: {
        query,
        returnedCount: results.length,
        remainingCredits: creditUpdate.credits,
        page,
        total,
      },
    });

    return NextResponse.json(
      {
        results,
        page,
        totalPages,
        total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit,
        credits: creditUpdate.credits,
        message: "Search completed successfully",
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("[SEARCH_ERROR]", error);

    await trackSearchEvent({
      typeKey: "API_ERROR",
      status: "failure",
      severity: "critical",
      userId,
      metadata: { error: error.message, query },
    });

    return NextResponse.json(
      { error: "An error occurred while processing your request." },
      { status: 500, headers: corsHeaders }
    );
  }
};
