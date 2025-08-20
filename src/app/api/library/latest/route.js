import { getUserId } from "@/helpers/auth";
import { updateCredits } from "@/helpers/update-credit";
import dbConnect from "@/lib/dbConnect";
import Image from "@/models/Image";
import { NextResponse } from "next/server";
import { track } from "@/lib/track";

// Helper function to simplify tracking calls for the image library
const trackLibraryEvent = async ({
  typeKey,
  status,
  severity,
  userId,
  metadata,
}) => {
  await track({
    typeKey,
    kind: "system", // Assuming most events here are system-related
    status,
    severity,
    userId,
    metadata: {
      ...metadata,
    },
    context: { url: "/api/library/latest" }, // Corrected URL
  });
};

export const GET = async (req) => {
  let userId = null; // Declare userId outside the try block

  try {
    await dbConnect();

    // Assuming getUserId does not take a parameter based on the original code, but if it does, it should be (req).
    const authResult = await getUserId(req);
    userId = authResult?.userId;

    if (!userId) {
      await trackLibraryEvent({
        typeKey: "UNAUTHORIZED_ACCESS",
        status: "failure",
        severity: "high",
        userId: null,
        metadata: {},
      });
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

    // Credit deduction should happen before returning images
    const creditUpdate = await updateCredits(userId, 1);
    if (!creditUpdate.success) {
      await trackLibraryEvent({
        typeKey: "CREDIT_UPDATE_FAILED",
        kind: "billing",
        status: "failure",
        severity: "medium",
        userId,
        metadata: { reason: creditUpdate.message },
      });
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

    await trackLibraryEvent({
      typeKey: "RANDOM_IMAGES_FETCHED",
      status: "success",
      severity: "low",
      userId,
      metadata: {
        filters,
        limit,
        returnedCount: results.length,
        remainingCredits: creditUpdate.credits,
      },
    });

    return NextResponse.json(
      {
        results,
        limit,
        credits: creditUpdate.credits,
        message: "Random images fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[RANDOM_IMAGES_ERROR]", error);

    await trackLibraryEvent({
      typeKey: "RANDOM_IMAGES_ERROR",
      status: "failure",
      severity: "critical",
      userId,
      metadata: { error: error.message },
    });

    return NextResponse.json(
      { error: "An error occurred while fetching random images." },
      { status: 500 }
    );
  }
};
