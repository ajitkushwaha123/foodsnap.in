import dbConnect from "@/lib/dbConnect";
import Image from "@/models/Image";
import { NextResponse } from "next/server";


export const GET = async (request) => {
  try {
    dbConnect();
    const { searchParams } = new URL(request.url);

    const cuisine = searchParams.get("cuisine");
    const premium = searchParams.get("premium");
    const category = searchParams.get("category");
    const sub_category = searchParams.get("sub_category");
    const food_type = searchParams.get("food_type");
    const search = searchParams.get("search");
    const approved = searchParams.get("approved");

    const query = {};

    if (cuisine) query.cuisine = cuisine;
    if (category) query.category = category;
    if (sub_category) query.sub_category = sub_category;
    if (food_type) query.food_type = food_type;
    if (premium !== null) query.premium = premium === "true";
    if (approved !== null) query.approved = approved === "true";

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const images = await Image.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      message: "Images fetched successfully",
      images,
      total: await Image.countDocuments(query),
    });
  } catch (error) {
    console.error("[FILTER_IMAGE_ERROR]", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
};
