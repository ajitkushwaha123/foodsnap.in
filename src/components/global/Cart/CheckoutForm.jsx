"use client";

import { useEffect, useState } from "react";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import { FaCheck } from "react-icons/fa";
import PaymentButton from "./PaymentButton";
import { useUser } from "@/store/hooks/useUser";

const checkOutFields = [
  { name: "name", title: "Full Name", type: "text", placeholder: "John Doe" },
  {
    name: "email",
    title: "Email",
    type: "email",
    placeholder: "example@mail.com",
  },
  { name: "phone", title: "Phone", type: "tel", placeholder: "+91 9876543210" },
];

const CheckoutForm = () => {
  const [step, setStep] = useState(1);
  const [payStatus, setPayStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const { user } = useUser();

  const getLocal = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key)) || {};
    } catch {
      return {};
    }
  };

  const cartData = getLocal("cartDetails");

  const formik = useFormik({
    initialValues: {
      name: getLocal("checkoutDetails").name || "",
      email: getLocal("checkoutDetails").email || "",
      phone: user?.phone || getLocal("checkoutDetails").phone || "",
    },
    validate: (values) => {
      const errors = {};
      if (!values.name) errors.name = "Required";
      if (!values.email) errors.email = "Required";
      if (!values.phone) errors.phone = "Required";
      return errors;
    },
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const res = await fetch("/api/payment/billing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to save billing details");
        }

        toast.success("Billing details saved successfully!");
        localStorage.setItem("checkoutDetails", JSON.stringify(values));
        setStep(2);
      } catch (err) {
        toast.error(err.message || "Something went wrong!");
      } finally {
        setLoading(false);
      }
    },
  });

  const renderInputField = (field) => (
    <div key={field.name} className="col-span-1">
      <label
        htmlFor={field.name}
        className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {field.title}
      </label>
      <input
        id={field.name}
        name={field.name}
        type={field.type}
        placeholder={field.placeholder}
        value={formik.values[field.name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#1c1c1c] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
      />
      {formik.touched[field.name] && formik.errors[field.name] && (
        <p className="text-sm text-red-500 mt-1">{formik.errors[field.name]}</p>
      )}
    </div>
  );

  return (
    <div className="w-full">
      {/* Billing Section */}
      <div className="w-full shadow-md p-8 font-poppins bg-white dark:bg-[#121212] rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <p className="flex items-center">
            <span
              className={`w-8 h-8 flex justify-center items-center font-bold rounded-full border-2 ${
                step === 1
                  ? "border-slate-300 text-primary"
                  : "border-primary text-primary"
              }`}
            >
              {step === 1 ? "1" : <FaCheck size={14} />}
            </span>
            <h3 className="text-xl ml-3 font-semibold text-gray-800 dark:text-white">
              Billing Address
            </h3>
          </p>
          {step !== 1 && (
            <button
              onClick={() => setStep(1)}
              className="text-primary font-semibold hover:underline"
            >
              Edit
            </button>
          )}
        </div>

        {step === 1 ? (
          <form onSubmit={formik.handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              {checkOutFields.map(renderInputField)}
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`mt-6 py-2 px-6 rounded-md border-2 border-primary font-semibold transition-colors ${
                loading
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-[#0025cc] text-white hover:bg-white hover:text-primary"
              }`}
            >
              {loading ? "Saving..." : "Continue"}
            </button>
          </form>
        ) : (
          <div className="mt-6 space-y-1 text-gray-600 dark:text-gray-400">
            <p>{formik.values.name}</p>
            <p>{formik.values.phone}</p>
            <p>{formik.values.email}</p>
          </div>
        )}
      </div>

      <div className="w-full my-8 shadow-md p-8 font-poppins bg-white dark:bg-[#121212] rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <p className="flex items-center">
            <span
              className={`w-8 h-8 flex justify-center items-center font-bold rounded-full border-2 ${
                payStatus !== "SUCCESS"
                  ? "border-slate-300 text-primary"
                  : "border-primary text-primary"
              }`}
            >
              {payStatus !== "SUCCESS" ? "2" : <FaCheck size={14} />}
            </span>
            <h3
              className={`text-xl ml-3 font-semibold ${
                step === 1
                  ? "text-gray-400 dark:text-gray-500"
                  : "text-gray-800 dark:text-white"
              }`}
            >
              Payment
            </h3>
          </p>
        </div>

        {step === 2 && (
          <PaymentButton
            amount={cartData?.discountedAmount}
            name={formik.values.name}
            email={formik.values.email}
            contact={formik.values.phone}
          />
        )}
      </div>
    </div>
  );
};

export default CheckoutForm;
