"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Offer from "./Offer";
import { plans, services } from "@/constants";
import TotalCart from "./TotalCart";
import PriceFormatter from "@/helpers/math";

const Cart = () => {
  const [cartData, setCartData] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const planKey = searchParams.get("plan");

  useEffect(() => {
    const plan = plans.find((p) => p.key === planKey);
    const service = services.find((s) => s.key === planKey);

    if (!plan && !service) {
      toast.error("Invalid plan or service selected");
      router.push("/pricing");
      return;
    }

    setCartData(plan || service);
    localStorage.setItem("cartDetails", JSON.stringify(plan || service));
  }, [planKey, router]);

  const formatDuration = (days) => {
    if (days === 30) return "Monthly";
    if (days === 365) return "Yearly";
    if (days === 180) return "6 Months";
    return `${days} Days`;
  };

  const getRenewDate = (duration) => {
    const date = new Date();
    date.setDate(date.getDate() + duration);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!cartData) return null;

  return (
    <div className="w-full min-h-screen font-poppins bg-background text-foreground px-4 sm:px-8 lg:px-12 py-10 transition-colors duration-300">
      <Toaster position="top-center" />
      {/* <Offer /> */}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-2/3 rounded-2xl shadow-lg bg-white dark:bg-gray-900 p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {cartData.name}
          </h3>
          <hr className="border-border mb-4" />

          <div className="flex flex-col lg:flex-row lg:justify-between gap-4 lg:items-center mb-4">
            <input
              readOnly
              value={formatDuration(cartData.duration)}
              className="w-full lg:w-1/3 h-12 px-4 border border-border rounded-lg bg-muted text-foreground font-medium"
            />

            <div className="flex flex-col lg:flex-row items-start gap-4 lg:ml-auto">
              <span className="bg-emerald-600 text-white text-sm font-semibold px-4 py-1.5 rounded-xl">
                Save{" "}
                <PriceFormatter
                  price={cartData.amount - cartData.discountedAmount}
                />
              </span>

              <div className="lg:text-right">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  <PriceFormatter price={cartData.discountedAmount} /> /month
                </p>
                <s className="text-sm text-muted-foreground">
                  <PriceFormatter price={cartData.amount} /> /month
                </s>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Renews at <PriceFormatter price={cartData.renewPrice || "-"} />
            /month after {getRenewDate(cartData.duration)}
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
