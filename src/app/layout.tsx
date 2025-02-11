import type { Metadata } from "next";
import "@/styles/globals.css"; // Import global styles

export const metadata: Metadata = {
  title: "Society Management System",
  description: "Manage societies, events, and announcements easily!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
