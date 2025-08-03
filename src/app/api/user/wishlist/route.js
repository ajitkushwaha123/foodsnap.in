import { getUserId } from "@/helpers/auth";
import Wishlist from "@/models/Wishlist";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserId(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const wishlist = await Wishlist.find({ userId: user }).populate({
      path: "Image",
      model: "Image",
      select: "image_url title _id",
    });

    return NextResponse.json({ wishlist }, { status: 200 });
  } catch (err) {
    console.error("GET Wishlist Error:", err);
    return NextResponse.json(
      { message: "An error occurred while fetching wishlist." },
      { status: 500 }
    );
  }
};

export const POST = async (req) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { imageId } = await req.json();
    if (!imageId) {
      return NextResponse.json(
        { message: "Image ID is required" },
        { status: 400 }
      );
    }

    const user = await getUserId(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const existing = await Wishlist.findOne({
      userId: user,
      Image: imageId,
    });
    if (existing) {
      return NextResponse.json(
        { message: "Image already in wishlist" },
        { status: 409 }
      );
    }

    const newWishlist = await Wishlist.create({
      userId: user._id,
      Image: imageId,
    });
    const populatedWishlist = await newWishlist.populate({
      path: "Image",
      model: "Image",
      select: "image_url title _id",
    });

    return NextResponse.json({ wishlist: populatedWishlist }, { status: 201 });
  } catch (err) {
    console.error("POST Wishlist Error:", err);
    return NextResponse.json(
      { message: "An error occurred while adding to wishlist." },
      { status: 500 }
    );
  }
};

export const DELETE = async (req) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { imageId } = await req.json();
    if (!imageId) {
      return NextResponse.json(
        { message: "Image ID is required" },
        { status: 400 }
      );
    }

    const user = await getUserId(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const wishlistItem = await Wishlist.findOneAndDelete({
      userId: user,
      Image: imageId,
    });

    if (!wishlistItem) {
      return NextResponse.json(
        { message: "Image not found in wishlist" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Image removed from wishlist successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE Wishlist Error:", err);
    return NextResponse.json(
      { message: "An error occurred while removing from wishlist." },
      { status: 500 }
    );
  }
};
