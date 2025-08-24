import { getUserId } from "@/helpers/auth";
import { updateCredits } from "@/helpers/update-credit";
import dbConnect from "@/lib/dbConnect";
import Image from "@/models/Image";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  let userId = null;

  try {
    await dbConnect();

    const authResult = await getUserId(req);
    userId = authResult?.userId;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = 12;

    const filters = { approved: false };
    const category = searchParams.get("category");
    const region = searchParams.get("region");
    const premium = searchParams.get("premium");

    if (category) filters.category = category;
    if (region) filters.region = region;
    if (premium === "true") filters.premium = true;

    // Deduct credits before fetching images
    const creditUpdate = await updateCredits(userId, 1);
    if (!creditUpdate.success) {
      return NextResponse.json(
        { error: creditUpdate.message },
        { status: 402 }
      );
    }

    const randomPipeline = [
      { $match: filters },
      { $sample: { size: limit } },
      {
        $project: {
          title: 1,
          tags: 1,
          cuisine: 1,
          image_url: 1,
          category: 1,
          region: 1,
          quality_score: 1,
        },
      },
    ];

    const results = await Image.aggregate(randomPipeline);

    return NextResponse.json(
      {
        results,
        limit,
        credits: creditUpdate.credits,
        message: "Random images fetched successfully",
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "An error occurred while fetching random images." },
      { status: 500 }
    );
  }
};
