"use client";
import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <span className="text-xl font-bold text-blue-600">Society Hub</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-blue-600"
            >
              Dashboard
            </Link>
            <Link
              href="/societies"
              className="text-gray-700 hover:text-blue-600"
            >
              Societies
            </Link>
            <Link href="/events" className="text-gray-700 hover:text-blue-600">
              Events
            </Link>
            <Link
              href="/announcements"
              className="text-gray-700 hover:text-blue-600"
            >
              Announcements
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">{user.name || user.email}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-blue-600"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-2 pt-2 pb-3 space-y-1">
          <Link
            href="/dashboard"
            className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Dashboard
          </Link>
          <Link
            href="/societies"
            className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Societies
          </Link>
          <Link
            href="/events"
            className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Events
          </Link>
          <Link
            href="/announcements"
            className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Announcements
          </Link>

          {user ? (
            <>
              <span className="block px-3 py-2 text-gray-700">
                {user.name || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="w-full text-left block px-3 py-2 text-red-600 hover:bg-gray-100 rounded-md"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
