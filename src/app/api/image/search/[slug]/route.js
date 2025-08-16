import dbConnect from "@/lib/dbConnect";
import Image from "@/models/Image";
import { NextResponse } from "next/server";

const allowedOrigin =
  process.env.NODE_ENV === "production"
    ? "https://foodsnap.in"
    : "http://localhost:3000";

const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

export const OPTIONS = async () =>
  new NextResponse(null, { status: 204, headers: corsHeaders });

export const GET = async (req, { params }) => {
  try {
    await dbConnect();

    const { slug } = await params;

    console.log(slug);
    const { searchParams } = new URL(req.url);
    const query = slug?.trim();

    console.log("Query:", query);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 20;
    const skip = (page - 1) * limit;

    if (!query) {
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

    console.log("Search results:", {
      query,
      page,
      totalPages,
      total,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });

    return NextResponse.json(
      {
        data: results,
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
