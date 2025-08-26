"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // ✅ Import useSearchParams
import { useFormik } from "formik";
import * as Yup from "yup";
import { Phone, Eye, EyeOff, Lock, Loader2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser } from "@/store/hooks/useUser";
import Alert from "@/components/global/alert";

const Divider = ({ title }) => (
  <div className="flex items-center gap-2 my-4">
    <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
    <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
    <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
  </div>
);

export default function Page() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams(); // ✅ For reading redirect param
  const { login, loading, error: apiError } = useUser();

  const formik = useFormik({
    initialValues: {
      phone: "",
      password: "",
    },
    validationSchema: Yup.object({
      phone: Yup.string()
        .required("Phone number is required")
        .matches(/^[6-9]\d{9}$/, "Enter a valid phone number"),
      password: Yup.string()
        .required("Password is required")
        .min(6, "Password must be at least 6 characters"),
    }),
    onSubmit: async (values) => {
      try {
        await login(values);
        const redirectPath = searchParams.get("redirect") || "/";
        router.push(redirectPath);
      } catch (err) {
        console.error("Login error:", err);
      }
    },
  });

  const firstError =
    formik.submitCount > 0 && Object.keys(formik.errors).length > 0
      ? Object.values(formik.errors)[0]
      : apiError || null;

  return (
    <div className="flex items-center justify-center min-h-screen px-2 md:px-4 bg-gray-100 dark:bg-gray-900 transition-colors">
      <Card className="w-full py-0 max-w-md border rounded-md shadow-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
        <div className="relative">
          <img
            src="/logo.png"
            alt="Cover"
            className="rounded-t-md w-full object-cover"
          />
        </div>

        <CardContent className="px-4 md:px-6 pb-8 pt-4">
          <form onSubmit={formik.handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <div className="relative mt-2">
                <Phone
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  id="phone"
                  name="phone"
                  placeholder="9876543210"
                  type="tel"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.phone}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-2">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                  className="pl-10 pr-10 h-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300"
                  aria-label="Toggle Password Visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {firstError && (
              <Alert
                showButton={false}
                type="error"
                message={firstError}
                className="mt-2"
              />
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base bg-[#0025cc] hover:bg-indigo-500 text-white font-medium"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <Loader2 className="animate-spin w-4 h-4" />
                  Loading
                </span>
              ) : (
                "LOGIN"
              )}
            </Button>

            <Divider title="OR" />

            <p className="text-sm text-center text-muted-foreground mt-2">
              Don’t have an account?{" "}
              <a
                href={`/sign-up?redirect=${encodeURIComponent(
                  searchParams.get("redirect") || "/"
                )}`}
                className="text-[#0025cc] dark:text-indigo-400 hover:underline"
              >
                Register
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
