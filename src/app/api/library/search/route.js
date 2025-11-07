import { getUserId } from "@/helpers/auth";
import dbConnect from "@/lib/dbConnect";
import Image from "@/models/Image";
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

export const OPTIONS = async () =>
  NextResponse.json({}, { status: 204, headers: corsHeaders });

export const GET = async (req) => {
  try {
    await dbConnect();

    const authResult = await getUserId(req);
    const userId = authResult?.userId;
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("search")?.trim();
    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 12;
    const skip = (page - 1) * limit;

    // Filters
    const filters = { approved: false };
    const category = searchParams.get("category");
    const region = searchParams.get("region");
    const premium = searchParams.get("premium");
    if (category) filters.category = category;
    if (region) filters.region = region;
    if (premium === "true") filters.premium = true;

    const searchPipeline = [
      {
        $search: {
          index: "searchIndex",
          compound: {
            should: [
              {
                phrase: {
                  query,
                  path: "title",
                  score: { boost: { value: 20 } },
                },
              },
              {
                text: { query, path: "title", score: { boost: { value: 12 } } },
              },
              {
                text: {
                  query,
                  path: ["manual_tags", "auto_tags", "cuisine"],
                  score: { boost: { value: 6 } },
                  fuzzy: { maxEdits: 1 },
                },
              },
              {
                autocomplete: {
                  query,
                  path: "title",
                  score: { boost: { value: 3 } },
                  fuzzy: { maxEdits: 1, prefixLength: 1 },
                },
              },
              {
                text: {
                  query,
                  path: "description",
                  score: { boost: { value: 1 } },
                },
              },
            ],
            minimumShouldMatch: 1,
          },
        },
      },
      { $match: filters },
      {
        $addFields: {
          exactTitleMatch: {
            $cond: [
              {
                $regexMatch: {
                  input: "$title",
                  regex: new RegExp(`^${query}$`, "i"),
                },
              },
              15,
              0,
            ],
          },
          partialTitleMatch: {
            $cond: [
              {
                $regexMatch: {
                  input: "$title",
                  regex: new RegExp(`\\b${query}\\b`, "i"),
                },
              },
              5,
              0,
            ],
          },
        },
      },
      {
        $addFields: {
          score: {
            $add: [
              { $meta: "searchScore" },
              "$exactTitleMatch",
              "$partialTitleMatch",
              { $multiply: ["$quality_score", 0.5] },
              { $multiply: ["$popularity_score", 0.3] },
              { $multiply: ["$likes", 0.2] },
            ],
          },
        },
      },
      { $sort: { score: -1 } },
      {
        $facet: {
          paginatedResults: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                title: 1,
                manual_tags: 1,
                auto_tags: 1,
                cuisine: 1,
                image_url: 1,
                category: 1,
                region: 1,
                quality_score: 1,
                popularity_score: 1,
                likes: 1,
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

    return NextResponse.json(
      {
        results,
        page,
        totalPages,
        total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit,
        message: "Search completed successfully",
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("[SEARCH_ERROR]", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request." },
      { status: 500, headers: corsHeaders }
    );
  }
};
