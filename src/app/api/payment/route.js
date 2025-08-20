import { NextResponse } from "next/server";
import { getUserId } from "@/helpers/auth";
import { razorpay } from "@/lib/razorpay";
import { track } from "@/lib/track";

// Helper function to simplify tracking calls for payment generation
const trackPaymentEvent = async ({
  typeKey,
  status,
  severity,
  userId,
  metadata,
}) => {
  await track({
    typeKey,
    kind: "system",
    status,
    severity,
    userId,
    metadata: {
      ...metadata,
    },
    context: { url: "/api/payment" },
  });
};

export async function POST(request) {
  let userId = null;
  let amount = null;

  try {
    const authResult = await getUserId(request);
    userId = authResult?.userId;

    const body = await request.json();
    amount = body?.amount;

    // Track the initial attempt to generate a payment order
    await trackPaymentEvent({
      typeKey: "PAYMENT_ATTEMPT",
      status: "info",
      severity: "low",
      userId,
      metadata: { amount },
    });

    if (!userId) {
      await trackPaymentEvent({
        typeKey: "UNAUTHORIZED_ACCESS",
        status: "failure",
        severity: "high",
        userId: null,
        metadata: { amount },
      });
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    if (!amount) {
      await trackPaymentEvent({
        typeKey: "PAYMENT_FAILED",
        status: "failure",
        severity: "low",
        userId,
        metadata: { reason: "MISSING_AMOUNT" },
      });
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

    // Track a successful order creation
    await trackPaymentEvent({
      typeKey: "ORDER_CREATED_SUCCESS",
      status: "success",
      severity: "low",
      userId,
      metadata: { amount, orderId: order.id },
    });

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("Payment Order Creation Error:", error);

    // Track any unexpected errors during the process
    await trackPaymentEvent({
      typeKey: "API_ERROR",
      status: "failure",
      severity: "critical",
      userId,
      metadata: { error: error.message, amount },
    });

    return NextResponse.json(
      { error: error.message || "An internal server error occurred." },
      { status: 500 }
    );
  }
}
