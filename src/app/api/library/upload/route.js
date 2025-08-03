import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { addProductToQueue } from "@/lib/job/addProductToQueue";

export const POST = async (req) => {
  try {
    await dbConnect();

    const {
      img: file,
      title,
      category,
      sub_category,
      food_type,
      description,
      resId,
    } = await req.json();

    await addProductToQueue({
      title,
      category,
      sub_category,
      food_type,
      description,
      resId,
      file,
    });

    return NextResponse.json({ success: true, message: "Job added to queue" });
  } catch (error) {
    console.error("[IMAGE_UPLOAD_ERROR]", error);
    return NextResponse.json(
      { error: "An error occurred while queuing the image upload." },
      { status: 500 }
    );
  }
};
