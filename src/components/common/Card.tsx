// src/components/common/Card.tsx
import React from "react";

export default function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-lg shadow-md capitalize p-6 ${className}`}
    >
      {children}
    </div>
  );
}
export { Card };
