import { getUserId } from "@/helpers/auth";
import dbConnect from "@/lib/dbConnect";
import Image from "@/models/Image";
import User from "@/models/User";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  let userId = null;
  let imageId = null;

  try {
    await dbConnect();

    const authResult = await getUserId(req);
    userId = authResult?.userId;

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
    imageId = searchParams.get("imageId");

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

    if (user.credits < 1) {
      return NextResponse.json(
        {
          error: "You are out of credits.",
          action: { redirect: "/pricing", buttonText: "Buy Credits" },
        },
        { status: 402 }
      );
    }

    user.totalImagesDownloaded += 1;
    user.credits -= 1;
    await user.save();

    image.downloads += 1;
    await image.save();

    const fileRes = await fetch(image.image_url);

    if (!fileRes.ok) {
      user.credits += 1;
      user.totalImagesDownloaded -= 1;
      await user.save();

      image.downloads -= 1;
      await image.save();

      throw new Error("Failed to retrieve image file.");
    }

    return new NextResponse(fileRes.body, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${
          image.title || "download.jpg"
        }.jpg"`,
        "Content-Type":
          fileRes.headers.get("content-type") || "application/octet-stream",
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err.message || "Something went wrong while processing your download.",
        action: { redirect: "/support", buttonText: "Contact Support" },
      },
      { status: 500 }
    );
  }
};
