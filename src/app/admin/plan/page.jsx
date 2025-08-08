"use client";

import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Input, Label, Textarea, Switch, Button } from "@/components/ui";
import { Plus, Trash } from "lucide-react";
import StatusBar from "@/components/notification";

const page = () => {
  const [loading, setLoading] = useState(false);
  const [features, setFeatures] = useState([{ title: "", included: true }]);
  const [formError, setFormError] = useState(null);

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      billingCycle: ["monthly", "yearly"],
      prices: {
        monthly: 0,
        yearly: 0,
      },
      discount: {
        percentage: 0,
        note: "",
      },
      isPopular: false,
      isActive: true,
      trialDays: 0,
      sortOrder: 0,
      badge: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      prices: Yup.object({
        monthly: Yup.number().min(0).required("Monthly price is required"),
        yearly: Yup.number().min(0).required("Yearly price is required"),
      }),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setFormError(null);

      try {
        const payload = {
          ...values,
          features,
        };
        await axios.post("/api/plans", payload);
        formik.resetForm();
        setFeatures([{ title: "", included: true }]);
      } catch (err) {
        if (err.response?.data?.message) {
          setFormError(err.response.data.message);
        } else {
          setFormError("Failed to create plan. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    },
  });

  const handleFeatureChange = (index, field, value) => {
    const updated = [...features];
    updated[index][field] = value;
    setFeatures(updated);
  };

  const addFeature = () => {
    setFeatures([...features, { title: "", included: true }]);
  };

  const removeFeature = (index) => {
    const updated = [...features];
    updated.splice(index, 1);
    setFeatures(updated);
  };

  return (
    <div className="px-4">
      <form
        onSubmit={formik.handleSubmit}
        className="space-y-6 border-r border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#10101a] shadow-lg dark:shadow-black/20 transition-colors p-6 rounded-xl border"
      >
        <h2 className="text-2xl font-semibold">Create Plan</h2>

        <div>
          <Label className="mb-1 block">Name</Label>
          <Input className="h-12" {...formik.getFieldProps("name")} />
        </div>

        <div>
          <Label className="mb-1 block">Description</Label>
          <Textarea {...formik.getFieldProps("description")} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-1 block">Monthly Price</Label>
            <Input
              className="h-12"
              type="number"
              {...formik.getFieldProps("prices.monthly")}
            />
          </div>
          <div>
            <Label className="mb-1 block">Yearly Price</Label>
            <Input
              className="h-12"
              type="number"
              {...formik.getFieldProps("prices.yearly")}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-1 block">Discount (%)</Label>
            <Input
              className="h-12"
              type="number"
              {...formik.getFieldProps("discount.percentage")}
            />
          </div>
          <div>
            <Label className="mb-1 block">Discount Note</Label>
            <Input
              className="h-12"
              {...formik.getFieldProps("discount.note")}
            />
          </div>
        </div>

        <div>
          <Label className="mb-1 block">Badge (Optional)</Label>
          <Input className="h-12" {...formik.getFieldProps("badge")} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-1 block">Trial Days</Label>
            <Input
              className="h-12"
              type="number"
              {...formik.getFieldProps("trialDays")}
            />
          </div>

          <div>
            <Label className="mb-1 block">Sort Order</Label>
            <Input
              className="h-12"
              type="number"
              {...formik.getFieldProps("sortOrder")}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={formik.values.isPopular}
              onCheckedChange={(val) => formik.setFieldValue("isPopular", val)}
            />
            <Label>Is Popular?</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={formik.values.isActive}
              onCheckedChange={(val) => formik.setFieldValue("isActive", val)}
            />
            <Label>Is Active?</Label>
          </div>
        </div>

        <div>
          <Label className="mb-2 block">Features</Label>
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <Input
                  className="h-12"
                  placeholder="Feature title"
                  value={feature.title}
                  onChange={(e) =>
                    handleFeatureChange(index, "title", e.target.value)
                  }
                />
                <div className="flex items-center gap-1">
                  <Switch
                    checked={feature.included}
                    onCheckedChange={(val) =>
                      handleFeatureChange(index, "included", val)
                    }
                  />
                  <Label>Included</Label>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => removeFeature(index)}
                >
                  <Trash className="w-4 text-red-400 h-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addFeature}>
              <Plus className="mr-2 h-4 w-4" /> Add Feature
            </Button>
          </div>
        </div>

        {formik.errors.name && (
          <StatusBar
            icon={""}
            showButton={false}
            message={formik.errors.name}
          />
        )}
        {formik.errors.prices?.monthly && (
          <StatusBar
            showButton={false}
            message={formik.errors.prices.monthly}
          />
        )}
        {formik.errors.prices?.yearly && (
          <StatusBar showButton={false} message={formik.errors.prices.yearly} />
        )}
        {formError && <StatusBar showButton={false} message={formError} />}

        <Button className="h-12 w-full mt-2" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Plan"}
        </Button>
      </form>
    </div>
  );
};

export default page;
