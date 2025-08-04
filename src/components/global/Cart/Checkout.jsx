import React, { useState } from "react";
import CheckoutForm from "./CheckoutForm";
import TotalCart from "./TotalCart";
import { TiArrowBackOutline } from "react-icons/ti";
import { useParams, useNavigate } from "react-router-dom";

const Checkout = () => {
  const { subscriptionType } = useParams();
  const navigate = useNavigate();

  const [cartValue, setCartValue] = useState(0);

  return (
    <div className="font-poppins py-[30px] bg-secondary px-[20px] md:px-[100px] w-full">
      <button
        onClick={() => {
          navigate(`/cart/${subscriptionType}`);
        }}
        className="font-medium mb-[20px] flex justify-center items-center bg-primary px-[20px] py-2 text-white rounded-md"
      >
        <TiArrowBackOutline /> <span className="ml-[10px]">Back</span>
      </button>
      <div className="w-full lg:flex justify-center">
        <div className="lg:w-[60%]">
          <CheckoutForm cartValue={cartValue} />
        </div>
        <div className="lg:w-[40%] lg:ml-[40px]">
          <TotalCart finalCart={setCartValue} />
        </div>
      </div>
    </div>
  );
};

export default Checkout;
