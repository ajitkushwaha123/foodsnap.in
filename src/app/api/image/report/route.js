import { getUserId } from "@/helpers/auth";
import dbConnect from "@/lib/dbConnect";
import Report from "@/models/Report";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    await dbConnect();
    const { userId } = await getUserId();

    if (!userId) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    const { key, imageId } = await req.json();

    if (!key || !imageId) {
      return NextResponse.json(
        {
          message: "Missing required fields",
        },
        {
          status: 400,
        }
      );
    }

    const newReport = Report({
      userId,
      reason: key,
      imageId,
      status: "pending",
    });

    await newReport.save();

    return NextResponse.json(
      {
        message: "Report submitted successfully",
      },
      {
        status: 201,
      }
    );
  } catch (err) {
    return NextResponse.json(
      {
        message: err.message || "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
};
