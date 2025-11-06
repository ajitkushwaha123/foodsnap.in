"use client";

import { Check, Sparkles, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Pricing({ plans }) {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-b from-white to-neutral-50 dark:from-[#09090f] dark:to-[#0c0c15]">
      {/* background light glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-violet-500/10 blur-[160px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 text-center">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight"
        >
          Pick the Right Plan for Your Needs
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-lg text-gray-600 dark:text-gray-400 mb-16 max-w-2xl mx-auto"
        >
          Choose the plan that fits your restaurant’s photo needs — from a small
          trial to unlimited access.
        </motion.p>

        {/* Pricing Cards */}
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 place-items-stretch">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 40 }}
              animate={loaded ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              whileHover={{
                y: -5,
                scale: 1.03,
                boxShadow: "0px 10px 40px rgba(139,92,246,0.2)",
              }}
              className={`relative rounded-3xl p-8 transition-all duration-300 border text-left
                ${
                  plan.highlight
                    ? "bg-gradient-to-b from-violet-50 to-white dark:from-violet-900/30 dark:to-[#121226]/70 border-violet-400/60 shadow-[0_0_35px_-10px_rgba(139,92,246,0.4)]"
                    : "bg-white/90 dark:bg-[#0b0b17]/70 border-neutral-200/70 dark:border-neutral-700/60"
                }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 right-6 px-3 py-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold rounded-full shadow-lg">
                  MOST POPULAR
                </div>
              )}

              <div className="flex flex-col items-start gap-3">
                <div className="flex items-center justify-between w-full">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {plan.name}
                  </h3>
                  {plan.highlight && (
                    <Sparkles className="text-violet-500 h-5 w-5" />
                  )}
                </div>

                <motion.p
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl font-extrabold mt-2 text-gray-900 dark:text-white"
                >
                  {plan.price}
                </motion.p>

                <div className="mt-3 flex items-center gap-2 text-violet-600 dark:text-violet-400 font-semibold text-sm bg-violet-100/50 dark:bg-violet-900/30 px-3 py-1 rounded-full">
                  <ImageIcon className="h-4 w-4" />
                  <span>{plan.downloads} image downloads</span>
                </div>

                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                  {plan.description}
                </p>
              </div>

              <Button
                onClick={() => router.push(plan.link || "#")}
                className={`mt-10 w-full py-3 rounded-xl font-semibold tracking-wide flex items-center justify-center gap-2 text-base transition-all
                  ${
                    plan.highlight
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-lg"
                      : "bg-neutral-100 text-gray-900 hover:bg-neutral-200 dark:bg-[#ffffff10] dark:text-white dark:hover:bg-[#ffffff20]"
                  }`}
              >
                {plan.button}
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 mx-auto text-left">
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white/70 dark:bg-[#0b0b17]/60 backdrop-blur-md p-6">
            <ul className="grid sm:grid-cols-2 gap-3 text-sm text-gray-700 dark:text-neutral-300">
              {[
                "Zomato & Swiggy approved images",
                "Access to entire photo library",
                "High-quality food photos",
                "Priority upload approval",
                "Access to seasonal & trending photo packs",
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-1" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-500 mt-10 text-center">
          All plans include 18% GST. Cancel or upgrade anytime.
        </p>
      </div>
    </section>
  );
}
