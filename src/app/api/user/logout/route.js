import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    response.cookies.set("token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      expires: new Date(0), 
    });

    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: err.message || "An error occurred" },
      { status: 500 }
    );
  }
};
