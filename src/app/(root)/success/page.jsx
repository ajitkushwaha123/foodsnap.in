"use client";
import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function PaymentSuccessWrapper(props) {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <PaymentSuccess {...props} />
    </Suspense>
  );
}

function PaymentSuccess() {
  const searchParams = useSearchParams();
  // Still received from route—but not displayed
  const orderId = searchParams.get("orderId");
  const txnId = searchParams.get("txnId");
  const amount = searchParams.get("amount");
  const currency = searchParams.get("currency");
  const dateTime = searchParams.get("dateTime");

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        <div className="relative overflow-hidden rounded-2xl border border-green-200/70 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl shadow-xl">
          <div className="p-8 text-center">
            <motion.img
              src="https://i.pinimg.com/originals/20/b8/1e/20b81edb88baba24e4a0e5c527c6a1f2.gif"
              alt="Payment Success"
              className="mx-auto mb-4 rounded-lg"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            />

            <h1 className="text-2xl font-semibold tracking-tight">
              Payment Successful
            </h1>

            <p className="mt-2 text-sm text-slate-600 dark:text-neutral-400">
              Thank you for your purchase!
            </p>

            <Button
              onClick={() => (window.location.href = "/")}
              className="mt-6 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-md text-sm font-medium transition"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
