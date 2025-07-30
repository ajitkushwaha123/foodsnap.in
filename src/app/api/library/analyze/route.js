import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { analyzeImageWithGemini } from "@/lib/gemini";

export const POST = async (req) => {
  try {
    await dbConnect();
    const body = await req.json();

    const {
      image_url,
      title,
      category,
      sub_category,
      food_type,
      description,
      resId,
    } = body;

    if (!image_url || !title || !category || !food_type) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: image_url, title, category, food_type",
        },
        { status: 400 }
      );
    }

    const analysisResult = await analyzeImageWithGemini({
      image_url,
      title,
      category,
      sub_category,
      food_type,
      description,
      resId,
    });

    console.log("Analysis result:", analysisResult);

    return NextResponse.json(
      { success: true, image: analysisResult },
      { status: 201 }
    );
  } catch (error) {
    console.error("[IMAGE_UPLOAD_ERROR]", error);
    return NextResponse.json(
      { error: "An error occurred while uploading the image." },
      { status: 500 }
    );
  }
};
