"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import toast from "react-hot-toast";

export default function SupportPage() {
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Required"),
      email: Yup.string().email("Invalid email").required("Required"),
      phone: Yup.string().required("Required"),
      subject: Yup.string().required("Required"),
      message: Yup.string().required("Required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      try {
        await axios.post("/api/support", values);
        toast.success("Your request has been submitted.");
        resetForm();
      } catch (err) {
        toast.error("Something went wrong. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="py-12 bg-gray-50 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-2">Support & Feedback</h1>
        <p className="text-muted-foreground mb-6">
          Have a question, facing an issue, or want to suggest a new feature?
          We're here to help.
        </p>
      </div>

      <Card className="max-w-2xl mx-auto shadow-md border border-border">
        <CardContent className="p-6 space-y-4">
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Name
              </label>
              <Input
                id="name"
                name="name"
                className="h-12"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.name}
                placeholder="Your name"
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.name}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1">
                Phone
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                className="h-12"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.phone}
                placeholder="(123) 456-7890"
              />
              {formik.touched.phone && formik.errors.phone && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.phone}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                className="h-12"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                placeholder="you@example.com"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.email}
                </p>
              )}
            </div>

            {/* Subject */}
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium mb-1"
              >
                Subject
              </label>
              <Input
                id="subject"
                name="subject"
                className="h-12"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.subject}
                placeholder="Issue or Feature Request"
              />
              {formik.touched.subject && formik.errors.subject && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.subject}
                </p>
              )}
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium mb-1"
              >
                Message
              </label>
              <Textarea
                id="message"
                name="message"
                rows={5}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.message}
                placeholder="Explain the issue or feature request in detail"
              />
              {formik.touched.message && formik.errors.message && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin w-4 h-4" /> Sending...
                </span>
              ) : (
                "Submit Request"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
