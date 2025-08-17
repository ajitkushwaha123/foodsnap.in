import { getUserId } from "@/helpers/auth";
import Image from "@/models/Image";
import User from "@/models/User";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  try {
    const { userId } = await getUserId(req);
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const imageId = searchParams.get("imageId");

    if (!imageId) {
      return NextResponse.json(
        { message: "imageId required" },
        { status: 400 }
      );
    }

    const image = await Image.findById(imageId);
    if (!image) {
      return NextResponse.json({ message: "Image not found" }, { status: 404 });
    }

    if (user.credits < 1) {
      return NextResponse.json(
        { message: "Insufficient credits" },
        { status: 403 }
      );
    }

    user.totalImagesDownloaded += 1;
    user.credits -= 1;
    await user.save();

    image.downloads += 1;
    await image.save();

    const fileRes = await fetch(image.image_url);
    if (!fileRes.ok) {
      throw new Error("Failed to fetch image");
    }

    return new NextResponse(fileRes.body, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${
          image.title || "download.jpg"
        }"`,
        "Content-Type":
          fileRes.headers.get("content-type") || "application/octet-stream",
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        message: err.message || "Error downloading image",
        status: false,
      },
      { status: 500 }
    );
  }
};
