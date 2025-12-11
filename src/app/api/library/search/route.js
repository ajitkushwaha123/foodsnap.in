import { getUserId } from "@/helpers/auth";
import dbConnect from "@/lib/dbConnect";
import Image from "@/models/Image";
import User from "@/models/User";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  try {
    await dbConnect();

    // --- Auth ---
    const authResult = await getUserId(req);
    const userId = authResult?.userId;
    if (!userId)
      return NextResponse.json({ error: "Login required" }, { status: 401 });

    const user = await User.findById(userId);
    if (!user)
      return NextResponse.json({ error: "Invalid user" }, { status: 404 });

    if (user.subscription.plan === "free")
      return NextResponse.json({ error: "Upgrade to search" }, { status: 402 });

    if (user.credits <= 0)
      return NextResponse.json({ error: "No credits left" }, { status: 402 });

    // --- Search Params ---
    const { searchParams } = new URL(req.url);
    const rawQuery = searchParams.get("search")?.trim();

    if (!rawQuery)
      return NextResponse.json({ error: "Query required" }, { status: 400 });

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 12;
    const skip = (page - 1) * limit;

    const category = searchParams.get("category");
    const isCombo = searchParams.get("isCombo") === "true";
    const isThali = searchParams.get("isThali") === "true";

    // ---- Search Processing ----
    const safeQuery = rawQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const tokens = safeQuery.split(/\s+/).filter((t) => t.length > 0);

    // Build Regex
    const exactRegex = new RegExp(`^${safeQuery}$`, "i");
    const phraseRegex = new RegExp(`${safeQuery}`, "i");
    const tokensRegex = tokens.map((t) => new RegExp(t, "i")); // IMPORTANT FIX

    // ---- Aggregation Pipeline ----
    const pipeline = [
      {
        $match: {
          approved: true,
          ...(category ? { category } : {}),
          ...(isCombo ? { isCombo: true } : {}),
          ...(isThali ? { isThali: true } : {}),
          $or: [{ title: phraseRegex }, { title: { $in: tokensRegex } }],
        },
      },

      // ---- Relevance Scoring ----
      {
        $addFields: {
          scoreExact: {
            $cond: [
              { $regexMatch: { input: "$title", regex: exactRegex } },
              10000,
              0,
            ],
          },
          scorePhrase: {
            $cond: [
              { $regexMatch: { input: "$title", regex: phraseRegex } },
              5000,
              0,
            ],
          },
          scoreToken: {
            $multiply: [
              {
                $size: {
                  $filter: {
                    input: tokensRegex,
                    as: "token",
                    cond: {
                      $regexMatch: {
                        input: "$title",
                        regex: "$$token",
                      },
                    },
                  },
                },
              },
              1000, // per token match
            ],
          },
        },
      },

      // ---- Final Ranking ----
      {
        $addFields: {
          finalRank: {
            $add: [
              "$scoreExact",
              "$scorePhrase",
              "$scoreToken",
              { $multiply: ["$downloads", 0.5] }, // light metadata influence
              { $cond: [{ $eq: ["$premium", true] }, 100, 0] },
            ],
          },
        },
      },

      // ---- Deterministic Sort ----
      {
        $sort: {
          finalRank: -1,
          downloads: -1,
          _id: 1,
        },
      },

      // ---- Pagination ----
      {
        $facet: {
          paginatedResults: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                id: 1,
                title: 1,
                image_url: 1,
                finalRank: 1,
              },
            },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const searchResult = await Image.aggregate(pipeline);

    const results = searchResult[0]?.paginatedResults || [];
    const total = searchResult[0]?.totalCount[0]?.count || 0;

    return NextResponse.json(
      {
        results,
        pagination: {
          page,
          totalPages: Math.ceil(total / limit),
          total,
          limit,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
        ...(results.length === 0
          ? {
              message: `Couldn't find results for "${rawQuery}". Try submitting a request.`,
            }
          : {}),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[SEARCH_ERROR]", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
};
