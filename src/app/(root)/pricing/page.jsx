import Pricing from "@/components/global/pricing";
import { plans } from "@/constants";
import React from "react";

const page = () => {
  return (
    <div>
      <Pricing plans={plans} />
    </div>
  );
};

export default page;
