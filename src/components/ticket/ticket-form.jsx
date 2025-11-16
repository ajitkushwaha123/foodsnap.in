"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Phone, User, MessageSquare, Tag } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useTicket } from "@/store/hooks/useTicket";

export default function TicketForm() {
  const [loading, setLoading] = useState(false);

  const { handleCreateTicket, loadTickets } = useTicket();

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
        await handleCreateTicket(values);
        loadTickets();
        resetForm();
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="py-10 min-h-screen">
      <div className="max-w-2xl mx-auto text-center mb-8">
        <h1 className="md:text-4xl text-3xl font-bold tracking-tight">
          Support & Feedback
        </h1>
        <p className="text-gray-600 mt-3 text-sm md:text-lg">
          Have a question, issue, or feature request? We're here to help you.
        </p>
      </div>

      <Card className="w-full shadow-xl border-0 rounded-2xl bg-white/70 backdrop-blur-lg">
        <CardContent className="p-8">
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    name="name"
                    className="h-12 pl-10"
                    placeholder="Your name"
                    {...formik.getFieldProps("name")}
                  />
                </div>
                {formik.touched.name && formik.errors.name && (
                  <p className="text-sm text-red-500 mt-1">
                    {formik.errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    name="phone"
                    className="h-12 pl-10"
                    placeholder="(123) 456-7890"
                    {...formik.getFieldProps("phone")}
                  />
                </div>
                {formik.touched.phone && formik.errors.phone && (
                  <p className="text-sm text-red-500 mt-1">
                    {formik.errors.phone}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  className="h-12 pl-10"
                  placeholder="you@example.com"
                  {...formik.getFieldProps("email")}
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Subject
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <Input
                  id="subject"
                  name="subject"
                  className="h-12 pl-10"
                  placeholder="Issue or feature request"
                  {...formik.getFieldProps("subject")}
                />
              </div>
              {formik.touched.subject && formik.errors.subject && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.subject}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Message
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <Textarea
                  id="message"
                  name="message"
                  rows={5}
                  className="pl-10"
                  placeholder="Explain your issue in detail..."
                  {...formik.getFieldProps("message")}
                />
              </div>
              {formik.touched.message && formik.errors.message && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl text-base bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin h-4 w-4" /> Sending...
                </span>
              ) : (
                "Submit Request"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-gray-500 mt-6 text-sm">
        We typically respond within{" "}
        <span className="font-medium">2–6 hours</span>.
      </p>
    </div>
  );
}
