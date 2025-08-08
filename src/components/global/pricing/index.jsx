"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Pricing({ plans }) {
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoaded(true);
    }, 50);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <section className="py-16 bg-white dark:bg-[#09090f]">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Simple & Transparent Pricing
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-12">
          Whether you're just starting or scaling up — we’ve got you covered.
        </p>

        <div
          className={`grid gap-6 ${
            plans.length === 1
              ? "grid-cols-1 md:grid-cols-1 justify-items-center"
              : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
          }`}
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 50 }}
              animate={loaded ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className={`relative rounded-2xl transition-all duration-300 p-6 md:p-10 text-left shadow-md hover:shadow-xl 
        ${
          plan.highlight
            ? "bg-gradient-to-b from-violet-100 to-white dark:from-[#1d1b3d] dark:to-[#121026] border border-violet-400"
            : "bg-white dark:bg-[#0a092d] border border-neutral-300 dark:border-neutral-700"
        }
      `}
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {plan.name}
              </h3>
              <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                {plan.price}
              </p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {plan.description}
              </p>

              <ul className="space-y-3 text-sm text-gray-700 dark:text-neutral-300 mt-6 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-1" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => {
                  router.push(plan.link || "#");
                }}
                className={`w-full py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all
          ${
            plan.highlight
              ? "bg-black text-white hover:bg-neutral-900 dark:bg-white dark:text-black dark:hover:bg-neutral-100"
              : "bg-neutral-100 text-black hover:bg-neutral-200 dark:bg-[#ffffff10] dark:text-white dark:hover:bg-[#ffffff20]"
          }
        `}
              >
                {plan.button}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
