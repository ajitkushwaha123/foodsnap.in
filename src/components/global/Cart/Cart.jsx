"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { plans } from "@/constants";
import TotalCart from "./TotalCart";
import PriceFormatter from "@/helpers/math";

const Cart = () => {
  const [cartData, setCartData] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const planKey = searchParams.get("plan");

  useEffect(() => {
    const plan = plans.find((p) => p.key === planKey);

    if (!plan) {
      toast.error("Invalid plan selected");
      router.push("/pricing");
      return;
    }

    setCartData(plan);
    localStorage.setItem("cartDetails", JSON.stringify(plan));
  }, [planKey, router]);

  if (!cartData) return null;

  return (
    <div className="w-full min-h-screen font-poppins bg-gradient-to-b from-white via-neutral-50 to-white dark:from-[#080808] dark:via-[#0c0c18] dark:to-[#080808] px-2 sm:px-4 lg:px-8 py-10 transition-colors duration-300">
      <Toaster position="top-center" />

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/3 rounded-2xl shadow-lg bg-white dark:bg-gray-900 p-8 border border-gray-200 dark:border-gray-800 transition-all hover:shadow-xl">
          <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            {cartData.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {cartData.description}
          </p>

          <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                <PriceFormatter price={cartData.discountedAmount} />
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                (one-time payment)
              </span>
            </div>

            {cartData.discountPercentage > 0 && (
              <div className="flex items-center gap-3">
                <s className="text-gray-400 text-sm">
                  <PriceFormatter price={cartData.amount} />
                </s>
                <span className="bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Save {cartData.discountPercentage}%
                </span>
              </div>
            )}
          </div>

          <div className="bg-neutral-50 dark:bg-[#10101a] border border-gray-200 dark:border-gray-800 rounded-xl p-5 mb-6">
            <p className="text-base font-medium text-gray-800 dark:text-gray-200 mb-1">
              Included in this plan:
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li>
                ✅{" "}
                {cartData.downloads === "unlimited"
                  ? "Unlimited image downloads"
                  : `${cartData.downloads} image downloads`}
              </li>
              <li>✅ Zomato & Swiggy approved food photos</li>
              <li>✅ High-quality, licensed food images</li>
              {cartData.key === "pro" || cartData.key === "unlimited" ? (
                <>
                  <li>✅ Access to full photo library</li>
                  <li>✅ Priority photo requests</li>
                </>
              ) : null}
              {cartData.key === "unlimited" && (
                <>
                  <li>✅ Early access to new collections</li>
                  <li>✅ Exclusive seasonal photo packs</li>
                </>
              )}
            </ul>
          </div>

          <p className="text-sm text-muted-foreground mt-3">
            ⚡ This is a one-time purchase. Once your{" "}
            {cartData.downloads === "unlimited"
              ? "unlimited credits"
              : `${cartData.downloads} credits`}{" "}
            are used, you can upgrade or purchase again anytime.
          </p>
        </div>

        <div className="lg:w-1/3">
          <TotalCart
            amount={cartData.amount}
            discountedAmount={cartData.discountedAmount}
            planKey={planKey}
            discountPercentage={cartData.discountPercentage}
          />
        </div>
      </div>
    </div>
  );
};

export default Cart;
