import React from "react";
import Pricing from "@/components/global/Pricing";
import { services } from "@/constant";

const page = () => {
  return (
    <div>
      <Pricing plans={services} />
    </div>
  );
};

export default page;
