import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    const { img, count } = await req.json();

    if (!img) {
      return NextResponse.json(
        { error: "Image data is required." },
        { status: 400 }
      );
    }

    console.log("Received image data:", img);
    console.log("Received count data:", count);

    return NextResponse.json(
      { message: "Image uploaded successfully.", img, count },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "An error occurred while processing your request.",
        details: error.message,
      },
      { status: 500 }
    );
  }
};
