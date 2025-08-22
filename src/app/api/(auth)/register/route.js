import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { cookies } from "next/headers";
import { signToken } from "@/lib/jwt";
import { track } from "@/lib/track";

const trackRegistration = async ({
  typeKey,
  status,
  severity,
  userId,
  metadata,
}) => {
  await track({
    typeKey,
    kind: "system",
    status,
    severity,
    userId,
    metadata: {
      ...metadata,
    },
    context: { url: "/api/register" },
  });
};

export const POST = async (req) => {
  try {
    await dbConnect();

    const body = await req.json();
    const { phone, password } = body;

    await trackRegistration({
      typeKey: "AUTH_REGISTER_ATTEMPT",
      status: "info",
      severity: "low",
      userId: null,
      metadata: { phone },
    });

    if (!phone || !password || password.length < 6) {
      await trackRegistration({
        typeKey: "AUTH_REGISTER_FAILED",
        status: "failure",
        severity: "low",
        userId: null,
        metadata: {
          errorCode: 400,
          reason: "INVALID_INPUT",
          phone,
        },
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
      await trackRegistration({
        typeKey: "AUTH_REGISTER_FAILED",
        status: "failure",
        severity: "medium",
        userId: existingUser._id,
        metadata: {
          errorCode: 409,
          reason: "USER_ALREADY_EXISTS",
          phone,
        },
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
      credits: 0,
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

    // Track successful registration with the new user ID
    await trackRegistration({
      typeKey: "AUTH_REGISTER_SUCCESS",
      status: "success",
      severity: "low",
      userId: newUser._id,
      metadata: { phone: newUser.phone },
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

    // Track the error and include the phone number for context
    await trackRegistration({
      typeKey: "API_ERROR",
      status: "failure",
      severity: "high",
      userId: null,
      metadata: {
        errorCode: 500,
        reason: error.message || "UNKNOWN_ERROR",
        phone: body?.phone || null,
      },
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
