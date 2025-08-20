import { getUserId } from "@/helpers/auth";
import { track } from "@/lib/track";
import Image from "@/models/Image";
import User from "@/models/User";
import { NextResponse } from "next/server";

// Helper function to simplify tracking calls for image downloads
const trackImageDownload = async ({
  typeKey,
  kind,
  status,
  severity,
  userId,
  metadata,
}) => {
  await track({
    typeKey,
    kind: kind || "system", // Set a default kind if none is provided
    status,
    severity,
    userId,
    metadata: {
      ...metadata,
    },
    context: { url: "/api/image/download" },
  });
};

export const GET = async (req) => {
  let userId = null;
  let imageId = null;

  try {
    const authResult = await getUserId(req);
    userId = authResult?.userId;

    if (!userId) {
      await trackImageDownload({
        typeKey: "UNAUTHORIZED_ACCESS",
        kind: "auth",
        status: "failure",
        severity: "high",
        userId: null,
        metadata: {},
      });
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      await trackImageDownload({
        typeKey: "USER_NOT_FOUND",
        kind: "system",
        status: "failure",
        severity: "high",
        userId,
        metadata: {},
      });
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    imageId = searchParams.get("imageId");

    await trackImageDownload({
      typeKey: "IMAGE_DOWNLOAD_ATTEMPT",
      status: "info",
      severity: "low",
      userId: user._id,
      metadata: { imageId },
    });

    if (!imageId) {
      await trackImageDownload({
        typeKey: "IMAGE_ID_MISSING",
        kind: "validation",
        status: "failure",
        severity: "medium",
        userId: user._id,
        metadata: {},
      });
      return NextResponse.json(
        { success: false, message: "imageId is required" },
        { status: 400 }
      );
    }

    const image = await Image.findById(imageId);
    if (!image) {
      await trackImageDownload({
        typeKey: "IMAGE_NOT_FOUND",
        status: "failure",
        severity: "medium",
        userId: user._id,
        metadata: { imageId },
      });
      return NextResponse.json(
        { success: false, message: "Image not found" },
        { status: 404 }
      );
    }

    if (user.credits < 1) {
      await trackImageDownload({
        typeKey: "INSUFFICIENT_CREDITS",
        kind: "billing",
        status: "failure",
        severity: "high",
        userId: user._id,
        metadata: { currentCredits: user.credits },
      });
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

    await trackImageDownload({
      typeKey: "CREDIT_DEDUCTED",
      kind: "billing",
      status: "success",
      severity: "low",
      userId: user._id,
      metadata: {
        imageId,
        remainingCredits: user.credits,
        totalDownloads: user.totalImagesDownloaded,
      },
    });

    // Fetch the image from the external URL
    const fileRes = await fetch(image.image_url);
    if (!fileRes.ok) {
      // Revert credit deduction on failure
      user.credits += 1;
      user.totalImagesDownloaded -= 1;
      await user.save();
      image.downloads -= 1;
      await image.save();

      await trackImageDownload({
        typeKey: "IMAGE_FETCH_FAILED",
        status: "failure",
        severity: "high",
        userId: user._id,
        metadata: { imageUrl: image.image_url },
      });
      throw new Error("Failed to fetch image");
    }

    await trackImageDownload({
      typeKey: "IMAGE_DOWNLOAD_SUCCESS",
      status: "success",
      severity: "low",
      userId: user._id,
      metadata: { imageId, title: image.title },
    });

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

    await trackImageDownload({
      typeKey: "API_ERROR",
      kind: "system",
      status: "failure",
      severity: "critical",
      userId,
      metadata: { error: err.message, imageId },
    });

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Error downloading image",
      },
      { status: 500 }
    );
  }
};
