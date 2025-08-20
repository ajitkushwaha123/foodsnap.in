import { NextResponse } from "next/server";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import { signToken } from "@/lib/jwt";
import { track } from "@/lib/track";

export const POST = async (req) => {
  try {
    await dbConnect();

    const { phone, password } = await req.json();

    await track({
      typeKey: "AUTH_LOGIN_ATTEMPT",
      kind: "system",
      userId: null,
      status: "info",
      severity: "low",
      metadata: {
        phone,
      },
      context: { url: "/api/login" },
    });

    if (!phone || !password || password.length < 6) {
      await track({
        typeKey: "AUTH_LOGIN_FAILED",
        kind: "system",
        userId: null,
        status: "failure",
        severity: "low",
        metadata: {
          errorCode: 400,
          reason: "INVALID_INPUT",
          phone: phone,
        },
        context: { url: "/api/login" },
      });

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
      await track({
        typeKey: "AUTH_LOGIN_FAILED",
        kind: "system",
        userId: null,
        status: "failure",
        severity: "medium",
        metadata: {
          errorCode: 404,
          reason: "USER_NOT_FOUND",
          phone: phone,
        },
        context: { url: "/api/login" },
      });

      return NextResponse.json(
        { success: false, message: "User not found! Register now." },
        { status: 404 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await track({
        typeKey: "AUTH_LOGIN_FAILED",
        kind: "system",
        userId: user._id,
        status: "failure",
        severity: "low",
        metadata: {
          errorCode: 401,
          reason: "INVALID_PASSWORD",
          phone: phone,
        },
        context: { url: "/api/login" },
      });

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

    await track({
      typeKey: "AUTH_LOGIN_SUCCESS",
      kind: "system",
      userId: user._id,
      status: "success",
      severity: "low",
      metadata: {
        phone: user.phone,
      },
      context: { url: "/api/login" },
    });

    return res;
  } catch (err) {
    console.error("Login Error:", err);

    await track({
      typeKey: "API_ERROR",
      kind: "system",
      userId: null,
      status: "failure",
      severity: "high",
      metadata: {
        errorCode: 500,
        reason: err.message || "UNKNOWN_ERROR",
      },
      context: { url: "/api/login" },
    });

    return NextResponse.json(
      { success: false, message: "Login failed. Please try again later." },
      { status: 500 }
    );
  }
};
