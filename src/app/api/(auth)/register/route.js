import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { cookies } from "next/headers";
import { signToken } from "@/lib/jwt";
import { track } from "@/lib/track";

export const POST = async (req) => {
  try {
    await dbConnect();

    const body = await req.json();
    const { phone, password } = body;

    await track({
      typeKey: "AUTH_REGISTER_ATTEMPT",
      kind: "system",
      userId: null,
      status: "info",
      severity: "low",
      metadata: { phone },
      context: { url: "/api/register" },
    });

    if (!phone || !password || password.length < 6) {
      await track({
        typeKey: "AUTH_REGISTER_FAILED",
        kind: "system",
        userId: null,
        status: "failure",
        severity: "low",
        metadata: {
          errorCode: 400,
          reason: "INVALID_INPUT",
          phone,
        },
        context: { url: "/api/register" },
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "Phone and password are required and password must be at least 6 characters long.",
        },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      await track({
        typeKey: "AUTH_REGISTER_FAILED",
        kind: "system",
        userId: existingUser._id,
        status: "failure",
        severity: "medium",
        metadata: {
          errorCode: 409,
          reason: "USER_ALREADY_EXISTS",
          phone,
        },
        context: { url: "/api/register" },
      });

      return NextResponse.json(
        { success: false, message: "User already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      phone,
      password: hashedPassword,
      credits: 50,
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
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    await track({
      typeKey: "AUTH_REGISTER_SUCCESS",
      kind: "system",
      userId: newUser._id,
      status: "success",
      severity: "low",
      metadata: {
        phone: newUser.phone,
      },
      context: { url: "/api/register" },
    });

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    await track({
      typeKey: "API_ERROR",
      kind: "system",
      userId: null,
      status: "failure",
      severity: "high",
      metadata: {
        errorCode: 500,
        reason: error.message || "UNKNOWN_ERROR",
      },
      context: { url: "/api/register" },
    });

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }
};
