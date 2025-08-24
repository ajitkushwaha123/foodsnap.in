import { getUserId } from "@/helpers/auth";
import Image from "@/models/Image";
import User from "@/models/User";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  let userId = null;
  let imageId = null;

  try {
    const authResult = await getUserId(req);
    userId = authResult?.userId;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    imageId = searchParams.get("imageId");

    if (!imageId) {
      return NextResponse.json(
        { success: false, message: "imageId is required" },
        { status: 400 }
      );
    }

    const image = await Image.findById(imageId);
    if (!image) {
      return NextResponse.json(
        { success: false, message: "Image not found" },
        { status: 404 }
      );
    }

    if (user.credits < 1) {
      return NextResponse.json(
        { success: false, message: "Insufficient credits" },
        { status: 403 }
      );
    }

    // Update user and image stats
    user.totalImagesDownloaded += 1;
    user.credits -= 1;
    await user.save();
    image.downloads += 1;
    await image.save();

    // Fetch the image from the external URL
    const fileRes = await fetch(image.image_url);
    if (!fileRes.ok) {
      // Revert credit deduction on failure
      user.credits += 1;
      user.totalImagesDownloaded -= 1;
      await user.save();
      image.downloads -= 1;
      await image.save();

      throw new Error("Failed to fetch image");
    }

    // Stream the image back to the client
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
    console.error("Image download error:", err);

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Error downloading image",
      },
      { status: 500 }
    );
  }
};
