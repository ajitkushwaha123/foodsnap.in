"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import PriceFormatter from "@/helpers/math";

const TotalCart = ({
  amount,
  discountedAmount,
  planKey,
  discountPercentage,
  taxPercentage = 0,
  showButton = true,
}) => {
  const router = useRouter();
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  // Calculate tax and total after discount
  const taxAmount = (discountedAmount * taxPercentage) / 100;
  const totalAmount = discountedAmount + taxAmount;

  const handleCheckoutClick = () => {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "InitiateCheckout", {
        value: totalAmount,
        currency: "INR",
        content_ids: [planKey],
        content_type: "product",
      });
    }

    router.push(`/payment/checkout?plan=${planKey}`);
  };

  return (
    <div className="rounded-2xl shadow-lg bg-white dark:bg-gray-900 p-6 border border-gray-200 dark:border-gray-800 space-y-5">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Subtotal
        </h3>
        <div className="text-right">
          {amount !== discountedAmount && (
            <s className="text-muted-foreground block">
              <PriceFormatter price={amount} />
            </s>
          )}
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            <PriceFormatter price={discountedAmount} />
          </p>
        </div>
      </div>

      {discountPercentage > 0 && (
        <div className="flex justify-between text-sm">
          <p>
            Plan Discount{" "}
            <span className="text-emerald-600 font-medium">
              -{discountPercentage}%
            </span>
          </p>
          <p className="text-emerald-600">
            - <PriceFormatter price={amount - discountedAmount} />
          </p>
        </div>
      )}

      <div className="flex justify-between text-sm">
        <p>Additional Charges ({taxPercentage}%)</p>
        <p>
          + <PriceFormatter price={taxAmount} />
        </p>
      </div>

      <hr className="border-border" />

      <div className="flex justify-between items-center">
        <p className="text-lg font-semibold text-gray-900 dark:text-white">
          Total
        </p>
        <p className="text-xl font-bold text-indigo-600">
          <PriceFormatter price={totalAmount} />
        </p>
      </div>

      {/* <div>
        <button
          onClick={() => setShowCoupon(!showCoupon)}
          className="text-sm text-indigo-600 hover:underline font-medium"
        >
          {showCoupon ? "Hide Coupon" : "Have a Coupon?"}
        </button>

        {showCoupon && (
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="flex-1 h-10 px-3 border border-border rounded-lg bg-muted text-foreground"
              placeholder="Enter coupon code"
            />
            <button className="bg-indigo-600 hover:bg-indigo-700 transition text-white font-semibold px-4 py-2 rounded-lg">
              Apply
            </button>
          </div>
        )}
      </div> */}

      {showButton && (
        <button
          onClick={handleCheckoutClick}
          className="w-full bg-indigo-600 hover:bg-indigo-700 transition text-white font-semibold px-4 py-2 rounded-lg mt-4"
        >
          Proceed to Checkout
        </button>
      )}

      <p className="text-xs text-muted-foreground text-center mt-2">
        * Once your image credits are exhausted, you can upgrade or buy more
        credits anytime.
      </p>
    </div>
  );
};

export default TotalCart;
