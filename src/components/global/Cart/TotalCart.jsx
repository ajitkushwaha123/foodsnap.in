import PriceFormatter from "@/helpers/maths/priceFormatter";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const TotalCart = ({
  amount,
  discountedAmount,
  planKey,
  discountPercentage,
  showButton = true,
}) => {
  const router = useRouter();
  const [showCoupon, setShowCoupon] = useState(false);

  return (
    <div className="rounded-2xl lg:ml-8 shadow-lg bg-white dark:bg-gray-900 p-6 border border-gray-200 dark:border-gray-800 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Subtotal
        </h3>
        <div className="text-right">
          <s className="text-muted-foreground">
            <PriceFormatter price={amount} />
          </s>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            <PriceFormatter price={discountedAmount} />
          </p>
        </div>
      </div>

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

      {/* <div className="flex justify-between text-sm">
        <p>
          Additional Taxes{" "}
          <span className="text-orange-600 font-medium">
            +{cartData?.taxPercentage}%
          </span>
        </p>
        <p className="text-orange-600">
          +{" "}
          <PriceFormatter
            price={cartData?.price * (cartData?.taxPercentage / 100)}
          />
        </p>
      </div> */}

      <div>
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
              className="flex-1 h-10 px-3 border border-border rounded-lg bg-muted text-foreground"
              placeholder="Enter coupon code"
            />
            <button className="bg-indigo-600 hover:bg-indigo-700 transition text-white font-semibold px-4 py-2 rounded-lg">
              Apply
            </button>
          </div>
        )}
      </div>

      {showButton && (
        <button
          onClick={() => router.push(`/payment/checkout?plan=${planKey}`)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 transition text-white font-semibold px-4 py-2 rounded-lg mt-4"
        >
          Proceed to Checkout
        </button>
      )}
    </div>
  );
};

export default TotalCart;
