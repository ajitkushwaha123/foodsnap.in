"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function PaymentSuccess({
  amount = 999,
  currency = "INR",
  dateTime = new Date(),
}) {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";
  const txnId = searchParams.get("txnId") || "";

  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl shadow-xl">
          {/* Success header */}
          <div className="p-8 text-center relative">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              className="mx-auto mb-4 w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 ring-8 ring-emerald-100 dark:ring-emerald-900/10 flex items-center justify-center"
              aria-hidden
            >
              <CheckCircle2 className="w-9 h-9 text-emerald-600 dark:text-emerald-400" />
            </motion.div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Payment Successful
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-neutral-400">
              Thank you! Your payment has been processed.
            </p>
          </div>

          {/* Details */}
          <div className="p-6 grid gap-3 text-sm">
            <InfoRow label="Amount Paid" value={formattedAmount} />
            <InfoRow label="Order ID" value={orderId} />
            <InfoRow label="Transaction ID" value={txnId} />
            <InfoRow label="Date & Time" value={dateTime.toLocaleString()} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200/70 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 px-4 py-2">
      <span className="text-slate-500 dark:text-neutral-400 text-xs uppercase tracking-wider">
        {label}
      </span>
      <span
        className="font-medium truncate max-w-[200px] md:max-w-[240px]"
        title={String(value)}
      >
        {value}
      </span>
    </div>
  );
}
