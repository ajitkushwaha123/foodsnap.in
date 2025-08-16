import Image from "@/models/Image";
import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";

const allowedOrigin =
  process.env.NODE_ENV === "production"
    ? "https://foodsnap.in"
    : "http://localhost:3000";

const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

export const OPTIONS = async () =>
  new NextResponse(null, { status: 204, headers: corsHeaders });

export const GET = async () => {
  try {
    // ✅ ensure DB is connected
    await dbConnect();

    // ✅ fetch unique titles
    const titles = await Image.distinct("title");

    return NextResponse.json(
      {
        success: true,
        message: "Titles fetched successfully",
        data: titles,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error("Error fetching titles:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch titles",
        error: err.message || "Internal Server Error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
};
