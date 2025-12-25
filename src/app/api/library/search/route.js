import { getUserId } from "@/helpers/auth";
import dbConnect from "@/lib/dbConnect";
import Image from "@/models/Image";
import User from "@/models/User";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  try {
    await dbConnect();

    // --- Auth Checks ---
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

    // if (user.subscription.plan === "free") {
    //   return NextResponse.json(
    //     {
    //       error: "Upgrade Your Plan to search.",
    //       action: {
    //         redirect: "/pricing",
    //         buttonText: "View Plans",
    //       },
    //     },
    //     { status: 402 }
    //   );
    // }

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

    // --- Search Params ---
    const { searchParams } = new URL(req.url);
    const rawQuery = searchParams.get("search")?.trim();

    if (!rawQuery) {
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    }

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 12;
    const skip = (page - 1) * limit;

    const category = searchParams.get("category");
    const isCombo = searchParams.get("isCombo") === "true";
    const isThali = searchParams.get("isThali") === "true";

    // --- Logic Fix: Escape & Tokenize ---
    const safeQuery = rawQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const tokens = safeQuery.split(/\s+/).filter((t) => t.length > 0);

    // Regex Patterns
    const exactRegex = new RegExp(`^${safeQuery}$`, "i");
    const phraseRegex = new RegExp(`${safeQuery}`, "i");
    const tokensRegex = tokens.map((t) => new RegExp(t, "i"));

    const pipeline = [
      {
        $match: {
          approved: true,
          ...(category ? { category } : {}),
          ...(isCombo ? { isCombo: true } : {}),
          ...(isThali ? { isThali: true } : {}),
          // Strict Filter: Must match at least one word from the query
          $or: [{ title: phraseRegex }, { title: { $in: tokensRegex } }],
        },
      },
      {
        $addFields: {
          // --- SCORING REBALANCED FOR STABILITY ---
          // Text matches now give massive points to overpower metadata (downloads)
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
                    input: tokens,
                    as: "token",
                    cond: {
                      $regexMatch: {
                        input: "$title",
                        regex: { $concat: ["", "$$token"] },
                        options: "i",
                      },
                    },
                  },
                },
              },
              1000, // 1000 points per matching word
            ],
          },
        },
      },
      {
        $addFields: {
          finalRank: {
            $add: [
              "$scoreExact",
              "$scorePhrase",
              "$scoreToken",
              // Metadata is now just a "nudge" (Max impact ~500 points)
              // This prevents a popular "Red Car" from outranking a "Red Apple" for query "Apple"
              { $multiply: ["$downloads", 0.5] },
              { $cond: [{ $eq: ["$premium", true] }, 100, 0] },
            ],
          },
        },
      },
      // --- CRITICAL FIX: DETERMINISTIC SORTING ---
      // 1. Sort by Rank (Relevance)
      // 2. Tie-breaker 1: Sort by Downloads (Popularity)
      // 3. Tie-breaker 2: Sort by ID (Guarantees consistent order every time)
      { $sort: { finalRank: -1, downloads: -1, _id: 1 } },
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
    const totalPages = Math.ceil(total / limit);

    const responseData = {
      results,
      pagination: {
        page,
        totalPages,
        total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit,
      },
    };

    if (results.length === 0) {
      responseData.message = `Couldn't find results for "${rawQuery}". Try Submitting a Request.`;
    }

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("[SEARCH_ERROR]", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
};
