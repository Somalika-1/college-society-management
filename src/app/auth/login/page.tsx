// src/app/auth/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user, login, error, loading } = useAuth();
  const router = useRouter();
  console.log(router);

  useEffect(() => {
    console.log("useEffect: Checking user state");
    if (loading) {
      console.log("useEffect: Loading...");
      return;
    }

    if (user) {
      console.log("useEffect: User is logged in, redirecting...");
      const roleBasedPath =
        user.role === "admin"
          ? "/dashboard/admin"
          : user.role === "society_head"
          ? "/dashboard/society"
          : "/dashboard";

      console.log(`Redirecting to ...: ${roleBasedPath}`);

      router.push(roleBasedPath);
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleSubmit: Attempting to log in...");
    try {
      const userRole = await login(email, password);
      console.log(`handleSubmit: Login successful, user role: ${userRole}`);
      if (userRole) {
        const roleBasedPath =
          userRole === "admin"
            ? "/dashboard/admin"
            : userRole === "society_head"
            ? "/dashboard/society"
            : "/dashboard";

        console.log(`handleSubmit: Redirecting to: ${roleBasedPath}`);
        router.replace(roleBasedPath);
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-3xl font-bold text-center">
          Sign in to your account
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="Email address"
            />
          </div>
          <div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="Password"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Sign in
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <Link href="/auth/register" className="text-blue-600 hover:underline">
            Don't have an account? Register
          </Link>
        </div>
      </div>
    </div>
  );
}
