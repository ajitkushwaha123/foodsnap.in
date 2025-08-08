"use client";

import { useState } from "react";
import { createOrder, loadRazorpayScript, verifyPayment } from "@/lib/razorpay";
import toast from "react-hot-toast";
import { FaSpinner } from "react-icons/fa";
import { useRouter } from "next/navigation";

const PaymentButton = ({
  amount,
  name,
  email,
  contact,
  description = "Purchase from Foodsnap.in",
  notes = {},
}) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    if (!amount || !name || !email || !contact) {
      toast.error("Missing required information.");
      return;
    }

    setLoading(true);

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      toast.error("Razorpay SDK failed to load.");
      setLoading(false);
      return;
    }

    try {
      const order = await createOrder(amount * 100);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Foodsnap",
        description,
        order_id: order.id,
        notes,
        handler: async (response) => {
          const verification = await verifyPayment(response);
          if (verification.status === "success") {
            toast.success("Payment successful!");
            window.location.href = `/`;
          } else {
            toast.error("Payment verification failed.");
          }
        },
        prefill: {
          name,
          email,
          contact,
        },
        theme: {
          color: "#6366f1",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={`px-6 py-3 text-white rounded flex items-center justify-center gap-2 ${
        loading
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-indigo-600 hover:bg-indigo-700"
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
