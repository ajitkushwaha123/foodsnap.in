import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { load } from "@cashfreepayments/cashfree-js";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const PaymentButton = ({values}) => {
  const [orderId, setOrderId] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL;
  const environment = import.meta.env.VITE_ENVIRONMENT;
  const [paymentTried , setPaymentTried] = useState(false); 
  const [paymentData , setPaymentData] = useState(values);
  
  console.log("Payment Data:", paymentData);

  const navigate = useNavigate();
  const cashfree = useRef(null);

  useEffect(() => {
    const initialiseSdk = async () => {
      try {
        cashfree.current = await load({
          mode: environment,
        });
        console.log("Cashfree SDK initialized");
      } catch (error) {
        console.error("Error initializing Cashfree SDK", error);
      }
    };

    initialiseSdk();
  }, [environment]);

  const getSessionData = async (paymentData) => {
    try {
      console.log("Fetching session ID");
      const res = await axios.post(`${apiUrl}/api/payment`  , paymentData);
      console.log("Response:", res);

      if (res.data && res.data.payment_session_id) {
        setOrderId(res.data.order_id);
        return res.data;
      }
    } catch (err) {
      console.error("Error fetching session ID", err);
    }
  };

  const handleClick = async (e) => {
    e.preventDefault();

    try {
      const sessionPromise = getSessionData(paymentData);
      toast.promise(sessionPromise, {
        loading: "Initializing Payment ...",
        success: "Payment Initialized ...",
        error:
          "Could not create payment session, refresh or contact support ...!",
      });

      const sessionData = await sessionPromise;

      console.log("Session Data:", sessionData);
      const sessionId = sessionData?.payment_session_id;

      if (!sessionId) {
        toast.error(
          "Could not create payment session, refresh or contact support ...!"
        );
        return;
      }

      // Store orderId locally here to avoid relying on async setOrderId
      const currentOrderId = sessionData?.order_id;

      let checkoutOptions = {
        paymentSessionId: sessionId,
        redirectTarget: "_modal",
      };

      cashfree.current.checkout(checkoutOptions).then((result) => {
        if (result.error) {
          toast.error(
            "User has closed the popup or there is some payment error. Check for Payment Status"
          );
          console.log(result.error);
        }

        if (result.redirect) {
          toast("Payment will be redirected");
        }

        if (result.paymentDetails) {
          toast.success(result.paymentDetails.paymentMessage);

          if (!currentOrderId) {
            toast.error(
              setPaymentTried(true),
              "Could not generate OrderId, refresh or contact support ...!"
            );
            return;
          }

          navigate("/payment-status/" + currentOrderId);
        }
      });
    } catch (err) {
      console.error("Error handling click", err);
    }
  };


  const handlePaymentTried = async (e) => {
    e.preventDefault();
    if (!orderId) {
      toast.error("Could not Generate OrderId, Refresh or Contact Support ...!");
      return;
    }
    navigate("/payment-status/" + orderId);
  }

  return (
    <div>
      <Toaster reverseOrder={false} position="top-center"></Toaster>
      {paymentTried ? (
        <button
          onClick={(e) => handlePaymentTried(e)}
          className="hover:bg-white font-poppins px-[20px] mt-[30px] text-white sm:text-[18px] border-2 border-white flex bg-primary border-primary hover:border-primary text-white hover:text-primary font-medium justify-center items-center sm:px-4 px-3 sm:py-2 py-3 rounded-md"
        >
          Check Payment Status
        </button>
      ) : (
        <button
          onClick={(e) => handleClick(e)}
          className="hover:bg-white font-poppins px-[20px] mt-[30px] text-white sm:text-[18px] border-2 border-white flex bg-primary border-primary hover:border-primary text-white hover:text-primary font-medium justify-center items-center sm:px-4 px-3 sm:py-2 py-3 rounded-md"
        >
          Pay Now
        </button>
      )}
    </div>
  );
};

export default PaymentButton;
