import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    // Create a JSON response and immediately clear the token cookie.
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
    });

    return response;
  } catch (err) {

    return NextResponse.json(
      { success: false, message: "An internal server error occurred." },
      { status: 500 }
    );
  }
};
