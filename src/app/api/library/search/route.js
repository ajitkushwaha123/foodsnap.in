import { getUserId } from "@/helpers/auth";
import dbConnect from "@/lib/dbConnect";
import Image from "@/models/Image";
import User from "@/models/User";
import { NextResponse } from "next/server";

export const OPTIONS = async () =>
  NextResponse.json({}, { status: 204, headers: corsHeaders });

export const GET = async (req) => {
  try {
    await dbConnect();

    const authResult = await getUserId(req);
    const userId = authResult?.userId;

    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized. Please login to continue.",
          action: {
            redirect: "/login",
            buttonText: "Login",
          },
        },
        { status: 401 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        {
          error: "User not found. Contact support.",
          action: {
            redirect: "/support",
            buttonText: "Contact Support",
          },
        },
        { status: 404 }
      );
    }

    if (user.credits <= 0) {
      return NextResponse.json(
        {
          error: "You are out of credits.",
          action: {
            redirect: "/pricing",
            buttonText: "View Plans",
          },
        },
        { status: 402 }
      );
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("search")?.trim();

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 12;
    const skip = (page - 1) * limit;

    const filters = {};
    const category = searchParams.get("category");
    const region = searchParams.get("region");
    const premium = searchParams.get("premium");

    if (category) filters.category = category;
    if (region) filters.region = region;
    if (premium === "true") filters.premium = true;

    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const safeQuery = escapeRegex(query);

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
                text: {
                  query,
                  path: "title",
                  score: { boost: { value: 12 } },
                },
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
                  regex: new RegExp(`^${safeQuery}$`, "i"),
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
                  regex: new RegExp(`\\b${safeQuery}\\b`, "i"),
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
    const total = aggregationResult[0]?.totalCount?.[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        results,
        pagination: {
          page,
          totalPages,
          total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit,
        },
        message: `Found ${total} items for query "${query}"`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[SEARCH_ERROR]", error);
    return NextResponse.json(
      {
        error: "An error occurred while processing your request.",
        action: {
          redirect: "/support",
          buttonText: "Contact Support",
        },
      },
      { status: 500 }
    );
  }
};
