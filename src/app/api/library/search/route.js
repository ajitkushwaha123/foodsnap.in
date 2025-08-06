import { getUserId } from "@/helpers/auth";
import { updateCredits } from "@/helpers/global";
import dbConnect from "@/lib/dbConnect";
import Image from "@/models/Image";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  try {
    await dbConnect();

    const { userId } = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("search")?.trim();
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "5", 20);
    const skip = (page - 1) * limit;

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    // Optional Filters
    const filters = { approved: false };
    const category = searchParams.get("category");
    const region = searchParams.get("region");
    const premium = searchParams.get("premium");

    if (category) filters.category = category;
    if (region) filters.region = region;
    if (premium === "true") filters.premium = true;

    // Deduct Credits
    const creditUpdate = await updateCredits(userId, 1);
    if (!creditUpdate.success) {
      return NextResponse.json(
        { error: creditUpdate.message },
        { status: 402 }
      );
    }

    // Perform MongoDB Atlas Search
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
    const results = aggregationResult[0].paginatedResults;
    const total = aggregationResult[0].totalCount[0]?.count || 0;

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
        credits: creditUpdate.credits,
        message: "Search completed successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[SEARCH_ERROR]", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
};
