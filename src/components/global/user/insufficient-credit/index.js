"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Alert from "../../alert";

const InsufficientCredits = () => {
  const router = useRouter();

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      router.push("/pricing");
    }, 2000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="flex items-center justify-center w-full bg-white dark:bg-[#0a0a0a]">
      <Alert
        message="You’re on free plan. Redirecting you to the pricing page…"
        redirectPath="/pricing"
        buttonText="Upgrade Now"
        showImage={true}
      />
    </div>
  );
};

export default InsufficientCredits;
