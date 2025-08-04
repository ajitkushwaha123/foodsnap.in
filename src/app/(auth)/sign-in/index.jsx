"use client";

import { useState } from "react";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser } from "@/redux/hooks/useUser";
import { emailValidator, passwordValidator } from "@/utils/validators/common";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const { loginNewUser, loginLoading, loginError } = useUser();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validate: (values) => {
      const errors = {};
      if (!emailValidator(values.email)) {
        errors.email = "Invalid email address";
      }
      if (!passwordValidator(values.password)) {
        errors.password = "Password must be at least 6 characters";
      }
      return errors;
    },
    onSubmit: async (values) => {
      const loginPromise = loginNewUser(values);
      await toast.promise(loginPromise, {
        loading: "Logging in...",
        success: () => {
          router.push("/");
          return "Login successful!";
        },
        error: (err) => {
          try {
            const parsed = JSON.parse(err?.message);
            return parsed?.message || "Login failed.";
          } catch {
            return err?.message || "Something went wrong.";
          }
        },
      });
    },
  });

  return (
    <div className="flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-2xl rounded-2xl animate-fade-in">
        <CardHeader className="flex justify-center items-center">
          <img
            src="/logo.png"
            width="60"
            className="rounded-md shadow-sm"
            alt="logo"
          />
        </CardHeader>
        <CardContent className="px-6">
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div>
              <Label className={"mb-2"} htmlFor="email">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                placeholder="you@example.com"
                type="email"
                onChange={formik.handleChange}
                value={formik.values.email}
              />
            </div>

            <div>
              <Label className={"mb-2"} htmlFor="password">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  onChange={formik.handleChange}
                  value={formik.values.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {formik.submitCount > 0 &&
              Object.keys(formik.errors).length > 0 && (
                <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded text-sm">
                  {Object.values(formik.errors)[0]}
                </div>
              )}

            {loginError && (
              <p className="bg-red-100 border border-red-400 text-red-700 p-3 rounded text-sm">
                {loginError}
              </p>
            )}

            <Button
              type="submit"
              className="w-full hover:bg-green-500 bg-green-600"
              disabled={loginLoading}
            >
              {loginLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Logging in...
                </div>
              ) : (
                "Login"
              )}
            </Button>

            <div className="flex items-center my-4">
              <div className="flex-1 h-px bg-muted-foreground/20"></div>
              <span className="mx-3 text-muted-foreground text-sm">or</span>
              <div className="flex-1 h-px bg-muted-foreground/20"></div>
            </div>

            <Button
              variant="outline"
              className="w-full flex items-center gap-2 justify-center"
              type="button"
              onClick={() => alert("Google login coming soon")}
            >
              <FcGoogle size={20} />
              Sign in with Google
            </Button>

            <p className="text-sm text-center text-muted-foreground mt-4">
              Don’t have an account?{" "}
              <Link href="/register" className="text-green-500 hover:underline">
                Register
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
