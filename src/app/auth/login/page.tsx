"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log("Attempting login for:", email);
      const userRole = await login(email, password);
      console.log("Login successful, role:", userRole);

      const redirectPath =
        userRole === "admin"
          ? "/dashboard/admin"
          : userRole === "society_head"
          ? "/dashboard/society"
          : "/dashboard";

      console.log("Redirecting to:", redirectPath);
      window.location.href = redirectPath;
      router.push(redirectPath);
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to login. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-100 p-6">
      <Card className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Login</h2>
          <p className="text-gray-600 mt-1">Access your account</p>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 ease-in-out focus:outline-none"
              placeholder="Enter your email"
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 ease-in-out focus:outline-none"
              placeholder="Enter your password"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-700 text-sm text-center bg-red-100 p-3 rounded-lg border border-red-400">
              {error}
            </div>
          )}

          {/* Login Button */}
          <div>
            <Button
              variant="primary"
              className="w-full flex justify-center items-center gap-2 py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition duration-200 ease-in-out"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </div>

          {/* Forgot Password & Signup Links */}
          <div className="text-center text-sm text-gray-600">
            <a href="@/forgetPassword" className="hover:text-blue-600">
              Forgot password?
            </a>{" "}
            •{" "}
            <a href="/signup" className="hover:text-blue-600">
              Sign up
            </a>
          </div>
        </form>
      </Card>
    </div>
  );
}
