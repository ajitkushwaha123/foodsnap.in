import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Image from "@/models/Image";
import axios from "axios";
import { uploadImageToCloudinary } from "@/lib/uploadToCloudinary";

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

    // const formData = await req.formData();
    // const file = formData.get("file");

    // if (!file) {
    //   return NextResponse.json({ error: "No file provided." }, { status: 400 });
    // }

    const imageUrl = await uploadImageToCloudinary(file);

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image upload failed." },
        { status: 500 }
      );
    }

    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/library/analyze`,
      {
        image_url: imageUrl,
        title,
        category,
        sub_category,
        food_type,
        description,
        resId,
      }
    );

    if (!data || !data.success) {
      return NextResponse.json(
        { error: "Image analysis failed." },
        { status: 500 }
      );
    }

    const imageDoc = await Image.create(data.image);

    return NextResponse.json({ success: true, image: imageDoc });
  } catch (error) {
    console.error("[IMAGE_UPLOAD_ERROR]", error);
    return NextResponse.json(
      { error: "An error occurred while uploading the image." },
      { status: 500 }
    );
  }
};
