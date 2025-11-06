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
    const { name, phone, password } = body;

    if (!phone || !password || password.length < 6 || !name) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Name, Phone and password are required and password must be at least 6 characters long.",
        },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
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

    await cookies().set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
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
    console.error("Registration Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }
};
