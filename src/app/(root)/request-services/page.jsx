import React from "react";
import { services } from "@/constants";
import Pricing from "@/components/global/pricing";

const page = () => {
  return (
    <div>
      <Pricing plans={services} />
    </div>
  );
};

export default page;
