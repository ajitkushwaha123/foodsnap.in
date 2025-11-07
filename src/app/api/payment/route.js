import { NextResponse } from "next/server";
import { getUserId } from "@/helpers/auth";
import { razorpay } from "@/lib/razorpay";

export async function POST(request) {
  try {
    const authResult = await getUserId(request);
    const userId = authResult?.userId;

    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, planKey } = body || {};

    if (!amount || !planKey) {
      return NextResponse.json(
        { error: "Amount and planKey are required." },
        { status: 400 }
      );
    }

    const options = {
      amount: Math.round(amount), 
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: userId.toString(),
        planKey,
        origin: "Foodsnap Checkout",
      },
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return NextResponse.json(
        { error: "Failed to create Razorpay order." },
        { status: 500 }
      );
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("Payment Order Creation Error:", error);
    return NextResponse.json(
      {
        error:
          error?.message ||
          "An unexpected error occurred while creating the order.",
      },
      { status: 500 }
    );
  }
}
