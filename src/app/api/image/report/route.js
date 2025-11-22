import { getUserId } from "@/helpers/auth";
import dbConnect from "@/lib/dbConnect";
import Image from "@/models/Image";
import Report from "@/models/Report";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    await dbConnect();

    const { userId } = await getUserId();

    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized. Please login to continue.",
          action: {
            redirect: "/login",
            buttonText: "Login",
          },
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { imageId } = body || {};

    if (!imageId) {
      return NextResponse.json(
        {
          error: "Missing required fields.",
          action: {
            redirect: "/support",
            buttonText: "Get Help",
          },
        },
        { status: 400 }
      );
    }

    const image = await Image.findById(imageId);

    if (!image) {
      return NextResponse.json(
        {
          error: "Image not found.",
          action: {
            redirect: "/",
            buttonText: "Explore Images",
          },
        },
        { status: 404 }
      );
    }

    image.approved = false;
    await image.save();

    await Report.create({
      userId,
      imageId,
      status: "pending",
    });

    return NextResponse.json(
      {
        message: "Report submitted successfully",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Report API Error:", err);

    return NextResponse.json(
      {
        error: err.message || "Internal Server Error",
        action: {
          redirect: "/support",
          buttonText: "Contact Support",
        },
      },
      { status: 500 }
    );
  }
};
