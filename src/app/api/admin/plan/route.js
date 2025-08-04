import { NextResponse } from "next/server";
import Plan from "@/models/Plan";
import dbConnect from "@/lib/dbConnect";

export const POST = async (req) => {
  try {
    await dbConnect();

    const body = await req.json();
    const {
      name,
      description,
      billingCycle,
      prices,
      discount,
      isPopular,
      isActive,
      trialDays,
      sortOrder,
      badge,
      features,
    } = body;

    if (
      !name ||
      !billingCycle ||
      !features ||
      !prices ||
      typeof prices.monthly !== "number" ||
      typeof prices.yearly !== "number"
    ) {
      return NextResponse.json(
        { success: false, message: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    if (prices.monthly < 0 || prices.yearly < 0) {
      return NextResponse.json(
        { success: false, message: "Invalid pricing values" },
        { status: 400 }
      );
    }

    const newPlan = await Plan.create({
      name,
      description,
      billingCycle,
      prices,
      discount,
      isPopular,
      isActive,
      trialDays,
      sortOrder,
      badge,
      features,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Plan created successfully",
        data: newPlan,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "An unexpected error occurred.",
      },
      { status: 500 }
    );
  }
};

export const GET = async (req) => {
  try {
    await dbConnect();
    const plans = await Plan.find({
      isActive: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Plans fetched successfully",
        data: plans,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "An unexpected error occurred.",
      },
      { status: 500 }
    );
  }
};
