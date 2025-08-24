import { NextResponse } from "next/server";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import { signToken } from "@/lib/jwt";

export const POST = async (req) => {
  try {
    await dbConnect();

    const { phone, password } = await req.json();

    if (!phone || !password || password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Phone is required and password must be at least 6 characters.",
        },
        { status: 400 }
      );
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found! Register now." },
        { status: 404 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid password" },
        { status: 401 }
      );
    }

    const token = signToken(user);

    const res = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        phone: user.phone,
        isAdmin: user.isAdmin,
        subscription: user.subscription,
        credits: user.credits,
        totalSearches: user.totalSearches,
        totalImagesDownloaded: user.totalImagesDownloaded,
      },
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    console.error("Login Error:", err);

    return NextResponse.json(
      { success: false, message: "Login failed. Please try again later." },
      { status: 500 }
    );
  }
};
