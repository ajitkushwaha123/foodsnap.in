import { getUserId } from "@/helpers/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils";

const PLAN_DETAILS = {
  trial: { amount: 299, credits: 15, name: "Trial Plan" },
  basic: { amount: 499, credits: 40, name: "Basic Plan" },
  pro: { amount: 999, credits: 100, name: "Pro Plan" },
  unlimited: { amount: 1999, credits: 100000, name: "Unlimited Plan" },
};

export async function POST(req) {
  try {
    await dbConnect();

    const authResult = await getUserId(req);
    const userId = authResult?.userId;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User not authenticated" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      planKey,
    } = body;

    console.log("🔍 Payment Verification Body:", body);

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Incomplete payment details" },
        { status: 400 }
      );
    }

    if (!planKey || !PLAN_DETAILS[planKey]) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing plan key" },
        { status: 400 }
      );
    }

    const isValid = validatePaymentVerification(
      { order_id: razorpay_order_id, payment_id: razorpay_payment_id },
      razorpay_signature,
      process.env.RAZORPAY_KEY_SECRET
    );

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid payment signature" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const { credits, name } = PLAN_DETAILS[planKey];

    user.subscription = {
      plan: planKey,
      isActive: true,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    };

    user.credits = (user.credits || 0) + credits;

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: `${name} activated successfully.`,
        subscription: user.subscription,
        credits: user.credits,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("❌ Payment Verification Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
