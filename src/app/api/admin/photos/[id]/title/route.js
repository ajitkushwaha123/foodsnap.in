import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Image from "@/models/Image";

export const PUT = async (req, { params }) => {
  try {
    await dbConnect();

    const { id } = params;
    const { title } = await req.json();

    if (!id || !title) {
      return NextResponse.json(
        { error: "ID and title are required." },
        { status: 400 }
      );
    }

    const image = await Image.findByIdAndUpdate(id, { title }, { new: true });

    if (!image) {
      return NextResponse.json({ error: "Image not found." }, { status: 404 });
    }

    return NextResponse.json(image);
  } catch (error) {
    console.error("[UPDATE_IMAGE_ERROR]", error);
    return NextResponse.json(
      { error: "An error occurred while updating the image." },
      { status: 500 }
    );
  }
};
