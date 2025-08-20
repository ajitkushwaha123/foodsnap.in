import { getUserId } from "@/helpers/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils";
import { track } from "@/lib/track";

// Helper function to simplify tracking calls for payment verification
const trackVerificationEvent = async ({
  typeKey,
  status,
  severity,
  userId,
  metadata,
}) => {
  await track({
    typeKey,
    kind: "billing",
    status,
    severity,
    userId,
    metadata: {
      ...metadata,
    },
    context: { url: "/api/payment/verify" },
  });
};

export async function POST(req) {
  let userId = null;
  let razorpay_payment_id = null;
  let razorpay_order_id = null;

  try {
    await dbConnect();
    const authResult = await getUserId(req);
    userId = authResult?.userId;

    const body = await req.json();
    razorpay_payment_id = body?.razorpay_payment_id;
    razorpay_order_id = body?.razorpay_order_id;
    const razorpay_signature = body?.razorpay_signature;

    // Track the initial verification attempt
    await trackVerificationEvent({
      typeKey: "PAYMENT_VERIFICATION_ATTEMPT",
      status: "info",
      severity: "low",
      userId,
      metadata: {
        razorpay_order_id,
        razorpay_payment_id,
      },
    });

    if (!userId) {
      await trackVerificationEvent({
        typeKey: "UNAUTHORIZED_ACCESS",
        status: "failure",
        severity: "high",
        userId: null,
        metadata: {
          razorpay_order_id,
          razorpay_payment_id,
        },
      });
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const isValid = validatePaymentVerification(
      { order_id: razorpay_order_id, payment_id: razorpay_payment_id },
      razorpay_signature,
      process.env.RAZORPAY_KEY_SECRET
    );

    if (!isValid) {
      await trackVerificationEvent({
        typeKey: "PAYMENT_FAILED_INVALID_SIGNATURE",
        status: "failure",
        severity: "medium",
        userId,
        metadata: {
          razorpay_order_id,
          razorpay_payment_id,
        },
      });
      return NextResponse.json(
        { status: "failure", message: "Invalid signature" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      await trackVerificationEvent({
        typeKey: "USER_NOT_FOUND",
        status: "failure",
        severity: "high",
        userId,
        metadata: {
          razorpay_order_id,
          razorpay_payment_id,
        },
      });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentExpiry = user.subscription?.expiresAt || Date.now();
    const newExpiry = new Date(
      Math.max(currentExpiry, Date.now()) + 30 * 24 * 60 * 60 * 1000
    );

    user.subscription = {
      plan: "premium",
      isActive: true,
      expiresAt: newExpiry,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    };
    user.credits = (user.credits || 0) + 10000;

    await user.save();

    await trackVerificationEvent({
      typeKey: "PAYMENT_SUCCESS",
      status: "success",
      severity: "low",
      userId,
      metadata: {
        razorpay_order_id,
        razorpay_payment_id,
        newExpiry,
        newCredits: user.credits,
      },
    });

    return NextResponse.json({
      status: "success",
      subscription: user.subscription,
      credits: user.credits,
    });
  } catch (error) {
    console.error("Payment Verification Error:", error);

    await trackVerificationEvent({
      typeKey: "API_ERROR",
      status: "failure",
      severity: "critical",
      userId,
      metadata: {
        error: error.message,
        razorpay_order_id,
        razorpay_payment_id,
      },
    });

    return NextResponse.json(
      { error: error.message || "An internal server error occurred." },
      { status: 500 }
    );
  }
}
