"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Phone, Eye, EyeOff, Lock, Loader2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser } from "@/store/hooks/useUser";

const Divider = ({ title }) => (
  <div className="flex items-center gap-2 my-4">
    <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
    <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
    <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
  </div>
);

export default function page() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login, loading, error } = useUser();

  const formik = useFormik({
    initialValues: {
      phone: "",
      password: "",
    },
    validationSchema: Yup.object({
      phone: Yup.string()
        .matches(/^[6-9]\d{9}$/, "Enter a valid phone number")
        .required("Phone number is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    }),
    onSubmit: async (values) => {
      try {
        await login(values); 
        router.push("/");
      } catch (err) {
        console.error("Login error:", err);
      }
    },
  });

  return (
    <div className="flex items-center justify-center  px-4 bg-gray-100 dark:bg-gray-900 transition-colors">
      <Card className="w-full max-w-md border rounded-md shadow-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
        <div className="relative">
          <img
            src="/image.png"
            alt="Cover"
            className="rounded-t-md w-full object-cover h-36"
          />
        </div>
        <CardContent className="px-6 pb-8 pt-4">
          <form onSubmit={formik.handleSubmit} className="space-y-5">
            <h2 className="text-xl font-semibold text-center">Sign In</h2>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative mt-1">
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
                  value={formik.values.phone}
                  className="pl-10 h-12"
                />
              </div>
              {formik.touched.phone && formik.errors.phone && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.phone}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
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
              {formik.touched.password && formik.errors.password && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.password}
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-100 dark:bg-red-500/10 border border-red-400 text-red-700 dark:text-red-300 p-3 rounded text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base bg-[#0025cc] hover:bg-indigo-500 text-white font-medium"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <Loader2 className="animate-spin w-4 h-4" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>

            <Divider title="OR" />

            <p className="text-sm text-center text-muted-foreground mt-2">
              Don’t have an account?{" "}
              <a
                href="/register"
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
