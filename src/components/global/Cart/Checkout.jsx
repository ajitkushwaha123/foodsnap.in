"use client";

import React, { useState, useEffect } from "react";
import { TiArrowBackOutline } from "react-icons/ti";
import { useRouter, useSearchParams } from "next/navigation";
import CheckoutForm from "./CheckoutForm";
import TotalCart from "./TotalCart";
import { plans, services } from "@/constants";

const Checkout = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const planKey = searchParams.get("plan");
  const [cartData, setCartData] = useState(null);
  useEffect(() => {
    const plan = plans.find((p) => p.key === planKey);
    const service = services.find((s) => s.key === planKey);

    if (plan) {
      setCartData(plan);
    } else if (service) {
      setCartData(service);
    } else {
      toast.error("Invalid plan selected");
      router.push("/cart");
    }
  }, [planKey]);

  return (
    <div className="font-poppins py-10 bg-secondary px-5 md:px-20 w-full">
      {/* <button
        // onClick={() => router.push(`/payment/cart?plan=${plan}`)}
        className="font-medium mb-6 flex items-center bg-primary px-5 py-2 text-white rounded-md hover:bg-primary/90 transition-colors"
      >
        <TiArrowBackOutline size={20} />
        <span className="ml-2">Back</span>
      </button> */}

      <div className="w-full lg:flex justify-center">
        <div className="lg:w-[65%]">
          <CheckoutForm />
        </div>
        <div className="mt-6 lg:ml-8 lg:w-[35%] lg:mt-0">
          <TotalCart
            amount={cartData?.amount}
            discountedAmount={cartData?.discountedAmount}
            planKey={planKey}
            discountPercentage={cartData?.discountPercentage}
            showButton={false}
          />
        </div>
      </div>
    </div>
  );
};

export default Checkout;
