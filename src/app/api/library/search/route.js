import { updateCredits } from "@/helpers/global";
import dbConnect from "@/lib/dbConnect";
import Image from "@/models/Image";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  try {
    await dbConnect();
    const { userId } = await auth();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("search")?.trim();
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const filters = {
      approved: true,
    };

    const category = searchParams.get("category");
    const region = searchParams.get("region");
    const premium = searchParams.get("premium");

    if (category) filters.category = category;
    if (region) filters.region = region;
    if (premium === "true") filters.premium = true;

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    console.log("[ATLAS_SEARCH_QUERY]", query);

    const results = await Image.aggregate([
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
    ]);

    const creditUpdate = await updateCredits(userId, 1);
    console.log("[CREDITS_UPDATED]", creditUpdate);

    if (!creditUpdate.success) {
      return NextResponse.json(
        { error: creditUpdate.message },
        { status: 402 } 
      );
    }

    return NextResponse.json(
      {
        results,
        page,
        limit,
        message: "Search completed successfully",
        credits: creditUpdate.credits,
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
