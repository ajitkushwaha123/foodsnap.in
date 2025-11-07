import dbConnect from "@/lib/dbConnect";
import Plan from "@/models/Plan";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    await dbConnect();

    const plans = await Plan.find({ isActive: true }).sort({ sortOrder: 1 });

    return NextResponse.json(
      {
        success: true,
        data: plans,
        message: "Plans fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error fetching plans:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch plans",
      },
      { status: 500 }
    );
  }
};

// ✅ POST — Create a new plan
export const POST = async (req) => {
  try {
    await dbConnect();
    const body = await req.json();

    const requiredFields = [
      "key",
      "name",
      "price",
      "description",
      "features",
      "button",
      "link",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing field: ${field}` },
          { status: 400 }
        );
      }
    }

    const newPlan = await Plan.create({
      key: body.key,
      name: body.name,
      price: body.price,
      description: body.description,
      features: body.features,
      button: body.button,
      link: body.link,
      highlight: body.highlight || false,
      sortOrder: body.sortOrder || 0,
      isActive: true,
    });

    return NextResponse.json(
      {
        success: true,
        data: newPlan,
        message: "Plan created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error creating plan:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create plan",
      },
      { status: 500 }
    );
  }
};
