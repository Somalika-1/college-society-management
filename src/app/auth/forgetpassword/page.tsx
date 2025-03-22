"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebase/config"; // Firebase config
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Reset link sent! Check your email.");
    } catch (err: any) {
      console.error("Reset Error:", err);
      setError("Invalid email or user does not exist.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Reset Password
        </h2>
        <p className="text-gray-600 text-center mt-1">
          Enter your email to receive a reset link.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleResetPassword}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200"
              placeholder="Enter your email"
            />
          </div>

          {error && (
            <div className="text-red-700 text-sm text-center bg-red-100 p-3 rounded-lg border border-red-400">
              {error}
            </div>
          )}

          {message && (
            <div className="text-green-700 text-sm text-center bg-green-100 p-3 rounded-lg border border-green-400">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="w-full flex justify-center items-center gap-2 py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition duration-200 ease-in-out"
            disabled={isLoading}
          >
            {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600 mt-4">
          <Link href="./login" className="hover:text-blue-600">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
