"use client";

import { usePlan } from "@/store/hooks/usePlan";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Loader2, PackageSearch } from "lucide-react";
import { useEffect } from "react";

export default function PricingSection() {
  const { plans, loading, error, getAllActivePlans } = usePlan();

  useEffect(() => {
    getAllActivePlans();
  }, []);

  return (
    <section className="relative px-6 py-20 md:py-28 text-center bg-background text-foreground overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-b from-muted/10 to-transparent blur-3xl" />
      </div>

      {/* Heading */}
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
      >
        Choose Your Perfect Plan
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="text-muted-foreground max-w-2xl mx-auto mb-14"
      >
        Affordable and scalable pricing designed for food businesses — from
        startups to restaurant chains.
      </motion.p>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin w-8 h-8 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            Fetching your plans...
          </p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-red-500 font-medium mb-3">
            Failed to load plans. Please try again.
          </p>
          <button
            onClick={refetch}
            className="px-4 py-2 border border-border rounded-md hover:bg-foreground hover:text-background transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && plans.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 text-muted-foreground"
        >
          <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-muted/20 mb-6">
            <PackageSearch className="w-10 h-10 opacity-70" />
          </div>
          <h3 className="text-2xl font-semibold text-foreground mb-2">
            No Active Plan
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            You don’t have an active plan right now. Explore our latest plans
            and get access to high-quality, Zomato-approved food images
            instantly.
          </p>
          <motion.a
            href="/pricing"
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium border border-border hover:bg-foreground hover:text-background transition-all"
          >
            View Plans <ArrowRight className="w-4 h-4" />
          </motion.a>
        </motion.div>
      )}

      {!loading && !error && plans.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
        >
          {plans.map((plan, i) => (
            <motion.div
              key={plan._id || plan.key || i}
              whileHover={{ scale: 1.03, y: -4 }}
              transition={{ type: "spring", stiffness: 170, damping: 15 }}
              className={`group relative flex flex-col justify-between border rounded-2xl p-6 backdrop-blur-sm transition-all duration-300
                ${
                  plan.highlight
                    ? "border-foreground/30 bg-foreground/5"
                    : "border-border bg-card/50"
                }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold bg-foreground text-background px-3 py-1 rounded-full shadow-sm">
                  Most Popular
                </span>
              )}

              <div className="text-left mb-6">
                <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                <p className="text-4xl font-bold mb-2">{plan.price}</p>
                <p className="text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 text-start text-sm mb-8">
                {plan.features?.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-foreground/80" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.a
                href={plan.link}
                whileTap={{ scale: 0.97 }}
                className={`mt-auto w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 border transition-all duration-300
                  ${
                    plan.highlight
                      ? "bg-foreground text-background hover:bg-foreground/90"
                      : "border-border hover:bg-foreground/10"
                  }`}
              >
                {plan.button || "Get Started"}
                <ArrowRight className="w-4 h-4" />
              </motion.a>
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
