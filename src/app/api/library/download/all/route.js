import { getUserId } from "@/helpers/auth";
import dbConnect from "@/lib/dbConnect";
import Download from "@/models/Download";
import User from "@/models/User";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  try {
    await dbConnect();

    const { userId } = await getUserId(req);
    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized access.",
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
          error: "User not found.",
          action: {
            redirect: "/support",
            buttonText: "Get Help",
          },
        },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    const totalCount = await Download.countDocuments({ userId });

    if (totalCount === 0) {
      return NextResponse.json(
        {
          downloads: [],
          pagination: {
            totalCount: 0,
            totalPages: 0,
            page: 1,
            limit,
          },
          message: "No downloads found.",
        },
        { status: 200 }
      );
    }

    const downloads = await Download.find({ userId })
      .populate({
        path: "imageId",
        select: "image_url title",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json(
      {
        downloads,
        pagination: {
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          page,
          limit,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("DOWNLOAD API ERROR:", err);
    return NextResponse.json(
      {
        error: "Server Error. Please try again later.",
        action: {
          redirect: "/support",
          buttonText: "Contact Support",
        },
      },
      { status: 500 }
    );
  }
};
