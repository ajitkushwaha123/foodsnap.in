import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { cookies } from "next/headers";
import { signToken } from "@/lib/jwt";

export const POST = async (req) => {
  try {
    await dbConnect();

    const body = await req.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json(
        { success: false, error: "Phone and password are required." },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User already exists." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      phone,
      password: hashedPassword,
      credits: 10,
      isAdmin: false,
      subscription: {
        isActive: true,
        expiresAt: null,
        plan: "free",
      },
      totalSearches: 0,
      totalImagesDownloaded: 0,
    });

    await newUser.save();

    const token = signToken(newUser);

    cookies().set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Something went wrong.",
      },
      { status: 500 }
    );
  }
};
