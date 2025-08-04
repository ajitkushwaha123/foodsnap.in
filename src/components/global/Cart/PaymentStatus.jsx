import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import PaymentModal from "../../Modal/PaymentModal";
import { success } from "../../assets";

const PaymentStatus = () => {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  const { orderId } = useParams();

  const [paymentData, setPaymentData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");

  useEffect(() => {
    const verifyPayment = async (orderId) => {
      setIsLoading(true);
      try {
        let verifyPromise = axios.post(`${apiUrl}/api/payment/verify`, {
          orderId: orderId,
        });

        const response = await verifyPromise;
        const  data  = response?.data;

        console.log("res", data);

        if (data && data[0]?.payment_status === "SUCCESS") {
          setPaymentData(data[0]);
          setPaymentStatus("SUCCESS");
          setIsLoading(false);
        } else {
          setPaymentData(data[0]);
          setPaymentStatus("FAILED");
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error verifying payment", err);
        setPaymentStatus("FAILED");
        setIsLoading(false);
      }
    };
    
    verifyPayment(orderId);
  }, [orderId]);

  return (
    <div>
      <Toaster position="top-center" reverseOrder="false"></Toaster>

      <div>
        {isLoading ? (
          <div>
            <PaymentModal
              paymentStatus={paymentStatus}
              description="Payment Processing ! . We are verifying your payment ."
            />
          </div>
        ) : (
          <div>
            {paymentStatus === "SUCCESS" ? (
              <PaymentModal
                paymentStatus={paymentStatus}
                description="Payment successful! We are activating your Subscription ."
              />
            ) : (
              <PaymentModal
                paymentStatus={paymentStatus}
                description="There was an issue with your payment. Contact our Customer Support."
                orderId={orderId}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStatus;
