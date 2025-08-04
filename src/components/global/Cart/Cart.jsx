"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Offer from "./Offer";
import toast, { Toaster } from "react-hot-toast";
import PriceFormatter from "@/helpers/maths/priceFormatter";

const PLAN_CONFIG = {
  "premium-monthly": {
    name: "Premium",
    price: 899,
    duration: 30,
    discountPercentage: 20,
    taxPercentage: 18,
    onRenewPercentageDiscount: 10,
  },
  "premium-yearly": {
    name: "Premium",
    price: 8990,
    duration: 365,
    discountPercentage: 30,
    taxPercentage: 18,
    onRenewPercentageDiscount: 10,
  },
  "pro-monthly": {
    name: "Pro",
    price: 1898,
    duration: 30,
    discountPercentage: 10,
    taxPercentage: 18,
    onRenewPercentageDiscount: 5,
  },
  "pro-yearly": {
    name: "Pro",
    price: 18980,
    duration: 365,
    discountPercentage: 20,
    taxPercentage: 18,
    onRenewPercentageDiscount: 10,
  },
};

const Cart = () => {
  const [showCoupon, setShowCoupon] = useState(false);
  const [cartData, setCartData] = useState({});

  const router = useRouter();
  const searchParams = useSearchParams();
  const planKey = searchParams.get("plan");

  useEffect(() => {
    const plan = PLAN_CONFIG[planKey];
    if (plan) {
      setCartData(plan);
      localStorage.setItem("cartDetails", JSON.stringify(plan));
    } else {
      toast.error("Invalid plan selected");
      router.push("/pricing");
    }
  }, [planKey]);

  const handleClick = (e) => {
    e.preventDefault();
    router.push(`/checkout/${planKey}`);
  };

  const calculatePricePerMonth = (duration, price) => {
    if (duration === 365) return price / 12;
    if (duration === 180) return price / 6;
    if (duration === 30) return price;
    return 0;
  };

  const renewAbleDate = (duration) => {
    const today = new Date();
    const future = new Date(today);
    future.setDate(today.getDate() + duration);
    return future.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="w-full min-h-screen font-poppins bg-background text-foreground px-4 sm:px-8 lg:px-12 py-10 transition-colors duration-300">
      <Toaster position="top-center" reverseOrder={false} />
      <Offer />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Side - Plan Details */}
        <div className="bg-[#10101a] w-full lg:w-2/3 rounded-2xl shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 text-primary">
            {cartData?.name}
          </h3>
          <hr className="border-border mb-4" />

          <div className="flex flex-col lg:flex-row justify-between gap-4 items-center mb-4">
            <input
              readOnly
              value={
                cartData?.duration === 30
                  ? "Monthly"
                  : cartData?.duration === 365
                  ? "Yearly"
                  : "N/A"
              }
              className="w-full lg:w-1/3 h-12 px-4 border border-border rounded-lg bg-[#10101a] text-foreground font-medium"
            />

            <div className="flex flex-col lg:flex-row items-center gap-4 lg:ml-auto">
              <span className="bg-emerald-600 text-white text-sm font-semibold px-4 py-1.5 rounded-xl">
                Save <PriceFormatter price={cartData.price * 0.3} />
              </span>

              <div className="text-right">
                <p className="text-lg text-primary font-semibold">
                  <PriceFormatter
                    price={calculatePricePerMonth(
                      cartData?.duration,
                      cartData?.price -
                        (cartData?.discountPercentage * cartData?.price) / 100 +
                        cartData?.price * (cartData?.taxPercentage / 100)
                    )}
                  />{" "}
                  /Month
                </p>
                <s className="text-sm text-[#10101a]-foreground">
                  <PriceFormatter
                    price={calculatePricePerMonth(
                      cartData?.duration,
                      cartData?.price
                    )}
                  />
                  /Month
                </s>
              </div>
            </div>
          </div>

          <p className="text-sm text-[#10101a]-foreground">
            Renews at{" "}
            <PriceFormatter
              price={
                (calculatePricePerMonth(
                  cartData?.duration,
                  cartData?.price -
                    (cartData?.discountPercentage * cartData?.price) / 100 +
                    cartData?.price * (cartData?.taxPercentage / 100)
                ) *
                  (100 - cartData?.onRenewPercentageDiscount)) /
                100
              }
            />
            /month after {renewAbleDate(cartData?.duration)}
          </p>
        </div>

        <div className="bg-[#10101a] w-full lg:w-1/3 rounded-2xl shadow-md p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Subtotal</h3>
            <div className="text-right">
              <s className="text-[#10101a]-foreground">
                <PriceFormatter price={2 * cartData?.price} />
              </s>
              <p className="text-xl font-bold">
                <PriceFormatter price={cartData?.price} />
              </p>
            </div>
          </div>

          <div className="flex justify-between text-sm">
            <p>
              Plan Discount{" "}
              <span className="text-emerald-600">
                -{cartData?.discountPercentage}%
              </span>
            </p>
            <p className="text-emerald-600">
              -{" "}
              <PriceFormatter
                price={(cartData?.discountPercentage * cartData?.price) / 100}
              />
            </p>
          </div>

          <div className="flex justify-between text-sm">
            <p>
              Additional Taxes{" "}
              <span className="text-orange-600">
                +{cartData?.taxPercentage}%
              </span>
            </p>
            <p className="text-orange-600">
              +{" "}
              <PriceFormatter
                price={cartData?.price * (cartData?.taxPercentage / 100)}
              />
            </p>
          </div>

          {/* Coupon */}
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
                  className="flex-1 h-10 px-3 border border-border rounded-lg bg-[#10101a]"
                  placeholder="Enter coupon code"
                />
                <button className="bg-indigo-600 hover:bg-indigo-700 transition text-white font-semibold px-4 py-2 rounded-lg">
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Pay Button */}
          <button
            onClick={handleClick}
            className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-700 transition text-white font-semibold rounded-xl text-lg flex justify-center items-center gap-2"
          >
            Pay{" "}
            <PriceFormatter
              price={Math.max(
                0,
                cartData?.price -
                  (cartData?.discountPercentage * cartData?.price) / 100 +
                  cartData?.price * (cartData?.taxPercentage / 100)
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
