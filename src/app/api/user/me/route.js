
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken"; 
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export const GET = async () => {
  try {

    await dbConnect();
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await User.findById(userId).select("-password -__v");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User data fetched successfully",
      user,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err?.message || "An error occurred" },
      { status: 500 }
    );
  }
};
