"use client";

import { useState } from "react";
import { createOrder, loadRazorpayScript, verifyPayment } from "@/lib/razorpay";
import toast from "react-hot-toast";
import { FaSpinner } from "react-icons/fa";

const PaymentButton = ({ amount, name, email, contact, planKey }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!amount || !name || !email || !contact || !planKey) {
      toast.error("Missing required information.");
      return;
    }

    setLoading(true);

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      toast.error("Failed to load Razorpay SDK. Please try again.");
      setLoading(false);
      return;
    }

    try {
      const order = await createOrder(amount * 100, planKey);

      if (!order || !order.id) {
        throw new Error("Order creation failed");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Foodsnap",
        description: `${planKey} Plan Payment`,
        order_id: order.id,
        handler: async (response) => {
          try {
            const verification = await verifyPayment({ ...response, planKey });

            if (verification.success) {
              toast.success("Payment successful!");
              window.location.href = `/success?orderId=${order.id}&txnId=${response.razorpay_payment_id}`;
            } else {
              toast.error(verification.error || "Payment verification failed.");
            }
          } catch (err) {
            console.error("Verification error:", err);
            toast.error("Payment verification failed.");
          }
        },
        prefill: {
          name,
          email,
          contact,
        },
        theme: {
          color: "#000000",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast("Payment cancelled.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment Error:", err);
      toast.error("Something went wrong while processing payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={`w-full md:w-auto px-6 py-3 text-white rounded-xl flex items-center justify-center gap-2 transition-all font-semibold ${
        loading
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-black hover:bg-gray-900"
      }`}
    >
      {loading ? (
        <>
          <FaSpinner className="animate-spin" />
          Processing...
        </>
      ) : (
        `Pay ₹${amount}`
      )}
    </button>
  );
};

export default PaymentButton;
