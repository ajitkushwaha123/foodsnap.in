import { getUserId } from "@/helpers/auth";
import dbConnect from "@/lib/dbConnect";
import Download from "@/models/Download";
import Image from "@/models/Image";
import User from "@/models/User";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  try {
    await dbConnect();

    const { userId } = await getUserId(req);

    if (!userId) {
      return NextResponse.json(
        {
          error: "You must be logged in to download images.",
          action: { redirect: "/login", buttonText: "Login" },
        },
        { status: 401 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        {
          error: "User account not found.",
          action: { redirect: "/support", buttonText: "Get Help" },
        },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const imageId = searchParams.get("imageId");

    if (!imageId) {
      return NextResponse.json(
        {
          error: "Invalid image request.",
          action: { redirect: "/", buttonText: "Browse Images" },
        },
        { status: 400 }
      );
    }

    const image = await Image.findById(imageId);

    if (!image) {
      return NextResponse.json(
        {
          error: "Image not found.",
          action: { redirect: "/", buttonText: "Back to Gallery" },
        },
        { status: 404 }
      );
    }

    const existingDownload = await Download.findOne({
      userId,
      imageId,
    });

    if (existingDownload) {
      const fileRes = await fetch(image.image_url);

      if (!fileRes.ok) {
        return NextResponse.json(
          {
            error: "Failed to fetch image file.",
            action: { redirect: "/support", buttonText: "Contact Support" },
          },
          { status: 500 }
        );
      }

      return new NextResponse(fileRes.body, {
        status: 200,
        headers: {
          "Content-Disposition": `attachment; filename="${image.title}.jpg"`,
          "Content-Type":
            fileRes.headers.get("content-type") || "application/octet-stream",
        },
      });
    }

    if (user.credits < 1) {
      return NextResponse.json(
        {
          error: "You are out of credits.",
          action: { redirect: "/pricing", buttonText: "Buy Credits" },
        },
        { status: 402 }
      );
    }

    const newDownload = await Download.create({
      userId,
      imageId,
      creditsUsed: 1,
    });

    user.credits -= 1;
    user.totalImagesDownloaded += 1;
    await user.save();

    image.downloads += 1;
    await image.save();

    const fileRes = await fetch(image.image_url);

    if (!fileRes.ok) {
      await Download.findByIdAndDelete(newDownload._id);

      user.credits += 1;
      user.totalImagesDownloaded -= 1;
      await user.save();

      image.downloads -= 1;
      await image.save();

      return NextResponse.json(
        {
          error: "Failed to retrieve image file.",
          action: { redirect: "/support", buttonText: "Contact Support" },
        },
        { status: 500 }
      );
    }

    return new NextResponse(fileRes.body, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${image.title}.jpg"`,
        "Content-Type":
          fileRes.headers.get("content-type") || "application/octet-stream",
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: err.message || "Something went wrong while processing download.",
        action: { redirect: "/support", buttonText: "Contact Support" },
      },
      { status: 500 }
    );
  }
};
