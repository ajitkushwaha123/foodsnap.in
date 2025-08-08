import { NextResponse } from "next/server";
import { getUserId } from "@/helpers/auth";
import { razorpay } from "@/lib/razorpay";

export async function POST(request) {
  try {
    const { userId } = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount } = body;

    const options = {
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: { key: "value" },
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
