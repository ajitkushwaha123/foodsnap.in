import { getUserId } from "@/helpers/auth";
import dbConnect from "@/lib/dbConnect";
import Image from "@/models/Image";
import User from "@/models/User";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);

    const skip = (page - 1) * limit;

    const authResult = await getUserId(req);
    const userId = authResult?.userId;

    if (!userId) {
      return NextResponse.json(
        {
          error: "You must be logged in to access the library.",
          action: { redirect: "/login", buttonText: "Login" },
        },
        { status: 401 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        {
          error: "Account not found.",
          action: { redirect: "/support", buttonText: "Contact Support" },
        },
        { status: 404 }
      );
    }

    if (user.credits <= 0) {
      return NextResponse.json(
        {
          error: "You are out of credits.",
          action: { redirect: "/pricing", buttonText: "View Plans" },
        },
        { status: 402 }
      );
    }

    const matchStage = { approved: true };

    const total = await Image.countDocuments(matchStage);
    const totalPages = Math.ceil(total / limit);

    const results = await Image.aggregate([
      { $match: matchStage },
      { $addFields: { randomScore: { $rand: {} } } },
      { $sort: { randomScore: 1 } },
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
        },
      },
    ]);

    return NextResponse.json(
      {
        results,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        message: "Latest images fetched successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[LATEST_RANDOM_ERROR]", error);

    return NextResponse.json(
      {
        error: "Server error while fetching images.",
        action: { redirect: "/support", buttonText: "Contact Support" },
      },
      { status: 500 }
    );
  }
};
