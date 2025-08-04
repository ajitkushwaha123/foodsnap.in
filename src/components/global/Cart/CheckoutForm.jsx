import React, { useEffect, useState } from "react";
import InputField from "../../components/InputField";
import { checkOutFields } from "../../constants";
import { useFormik } from "formik";
import { checkoutDetailsValidate } from "../../helper/validate";
import toast, { Toaster } from "react-hot-toast";
import Icon from "../../components/Icon";
import { useNavigate } from "react-router-dom";
import PaymentButton from "./PaymentButton";
import { submitCheckoutDetails } from "../../helper/helper";

const CheckoutForm = () => {

  const [payStatus, setPayStatus] = useState("");
  const [step, setStep] = useState(1);
  const [localStorageData, setLocalStorageData] = useState({});
  const navigate = useNavigate();


  const getLocalCheckoutData = () => {
    try {
      let checkoutData = localStorage.getItem("checkoutDetails");
      console.log("Checkout data from localStorage:", checkoutData); // Log the checkout data
      const parsedData = checkoutData ? JSON.parse(checkoutData) : {};
      console.log("Parsed checkout data:", parsedData); 
      return parsedData;
    } catch (error) {
      console.error("Error parsing checkout data from localStorage:", error);
      return {};
    }
  };

  const getLocalCartData = () => {
    try {
      let cartData = localStorage.getItem("cartDetails");
      console.log("Cart data from localStorage:", cartData);
      const parsedData = cartData ? JSON.parse(cartData) : {};
      console.log("Parsed cart data:", parsedData);
      return parsedData;
    } catch (error) {
      console.error("Error parsing cart data from localStorage:", error);
      return {};
    }
  };

  const formik = useFormik({
    initialValues: {
      name: getLocalCheckoutData()?.name || "",
      company: getLocalCheckoutData()?.company || "",
      email: getLocalCheckoutData()?.email || "",
      phone: getLocalCheckoutData()?.phone || "",
      state: getLocalCheckoutData()?.state || "",
      address: getLocalCheckoutData()?.address || "",
      city: getLocalCheckoutData()?.city || "",
      postalCode: getLocalCheckoutData()?.postalCode || "",
      cartTotal:
        getLocalCartData()?.price -
          getLocalCartData()?.price *
            (getLocalCartData()?.discountPercentage / 100) +
          getLocalCartData()?.price *
            (getLocalCartData()?.taxPercentage / 100) || 0,
    },
    validate: checkoutDetailsValidate,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: (values) => {
      console.log(values);
    },
  });

  useEffect(() => {
    localStorage.setItem("checkoutDetails", JSON.stringify(formik.values));
  }, [formik.values]);

  const handleInputChange = (field, value) => {
    formik.setFieldValue(field, value);
  };

  const handleCheckoutDetailSubmit = async (e) => {
    e.preventDefault();
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      return;
    }

    console.log("Formik values:", formik.values);

    setLocalStorageData(formik.values);
    setStep(2);

    console.log("Formik values:", formik.values);

    await submitDetails();
  };

  const handlePayment = (e) => {
    e.preventDefault();
    navigate('/cart');
  }

  const submitDetails = async () => {
    try{
      const response = await submitCheckoutDetails(formik.values);
      if(response.status === "true"){
        toast.success(response.message);
        setStep(2);
      }else{
        toast.error(response.message);
      }
    }catch(err){
      toast.error("Error submitting checkout details:", err.message);
    }
  }

  return (
    <div>
      <div className="w-full shadow-lg shadow-indigo-500/40 p-[40px] font-poppins bg-white rounded-xl">
        <Toaster position="top-center" reverseOrder={false}></Toaster>
        <div className="flex justify-between items-center">
          <p className="flex items-center">
            {step === 1 ? (
              <span className="text-primary w-[30px] h-[30px] flex justify-center items-center font-bold rounded-full border-2 border-slate-200">
                1
              </span>
            ) : (
              <span className="text-primary w-[30px] h-[30px] flex justify-center items-center font-bold rounded-full border-2 border-primary">
                <Icon name="FaCheck" />
              </span>
            )}
            <h3 className="text-xl ml-[10px] font-semibold">Billing Address</h3>
          </p>

          <button>
            {step !== 1 && (
              <p
                onClick={() => setStep(1)}
                className="font-semibold text-primary"
              >
                Edit
              </p>
            )}
          </button>
        </div>

        {step === 1 && (
          <form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-[20px]">
              {checkOutFields.map((fields, index) => (
                <div key={index} className="col-span-1 md:col-span-1">
                  <InputField
                    title={fields.title}
                    icon={fields.icon}
                    type={fields.type}
                    placeholder={fields.placeholder}
                    inputChange={(value) =>
                      handleInputChange(fields.name, value)
                    }
                    inputValue={formik.values[fields.name]}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={(e) => handleCheckoutDetailSubmit(e)}
              className="hover:bg-white px-[20px] mt-[30px] text-white sm:text-[18px] border-2 border-white flex bg-primary border-2 border-primary hover:border-2 hover:border-primary text-white hover:text-primary font-medium font-poppins justify-center items-center sm:px-4 px-3 sm:py-2 py-3 rounded-md"
            >
              Continue
            </button>
          </form>
        )}

        {step !== 1 && (
          <div className="mt-[30px]">
            <ul>
              <li>
                <span className="text-slate-500">{localStorageData.name}</span>
              </li>
              <li>
                <span className="text-slate-500">{localStorageData.phone}</span>
              </li>
              <li>
                <span className="text-slate-500">{localStorageData.email}</span>
              </li>
              <li>
                <span className="text-slate-500">
                  {localStorageData.address} , {localStorageData.city} ,
                  {localStorageData.state} - {localStorageData.postalCode}
                </span>
              </li>
            </ul>
          </div>
        )}
      </div>

      <div className="w-full my-[30px] shadow-lg shadow-indigo-500/40 p-[40px] font-poppins bg-white rounded-xl">
        <Toaster position="top-center" reverseOrder={false}></Toaster>
        <div className="flex justify-between items-center">
          <p className="flex items-center">
            {payStatus !== "SUCCESS" ? (
              <span className="text-primary w-[30px] h-[30px] flex justify-center items-center font-bold rounded-full border-2 border-slate-200">
                2
              </span>
            ) : (
              <span className="text-primary w-[30px] h-[30px] flex justify-center items-center font-bold rounded-full border-2 border-primary">
                <Icon name="FaCheck" />
              </span>
            )}
            <h3
              className={`text-xl ml-[10px] ${
                step === 1 ? "text-slate-500" : "text-black"
              } font-semibold`}
            >
              Payment
            </h3>
          </p>
        </div>

        {step === 2 && <PaymentButton values={formik.values} />}
      </div>
    </div>
  );
};

export default CheckoutForm;
