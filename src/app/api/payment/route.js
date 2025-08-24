import { NextResponse } from "next/server";
import { getUserId } from "@/helpers/auth";
import { razorpay } from "@/lib/razorpay";

export async function POST(request) {
  let userId = null;
  let amount = null;

  try {
    const authResult = await getUserId(request);
    userId = authResult?.userId;

    const body = await request.json();
    amount = body?.amount;

    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    if (!amount) {
      return NextResponse.json(
        { error: "Amount is required" },
        { status: 400 }
      );
    }

    const options = {
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: { userId: userId.toString() },
    };

    // Create a new order with Razorpay
    const order = await razorpay.orders.create(options);

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("Payment Order Creation Error:", error);

    return NextResponse.json(
      { error: error.message || "An internal server error occurred." },
      { status: 500 }
    );
  }
}
