// src/app/events/scan/page.tsx

"use client";
import React, { useState } from "react";
import { QrReader } from "@blackbox-vision/react-qr-reader";
import { Card } from "@/components/common/Card";
import { Loader2 } from "lucide-react";

interface ScanResult {
  eventId: string;
  title: string;
  date: string;
  venue: string;
}

export default function EventScanner() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string>("");
  const [isScanning, setIsScanning] = useState(true);

  const handleScan = (result: any) => {
    if (result?.text) {
      try {
        const data = JSON.parse(result.text) as ScanResult;
        setScanResult(data);
        setError("");
        setIsScanning(false);
      } catch (err) {
        setError("Invalid QR code. Please try again.");
        setScanResult(null);
      }
    } else {
      setError("No QR code detected. Please try again.");
    }
  };

  const handleRetry = () => {
    setScanResult(null);
    setError("");
    setIsScanning(true);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Event Check-in Scanner</h2>

        {isScanning && (
          <div className="aspect-square w-full mb-4 relative">
            <QrReader
              onResult={handleScan}
              constraints={{ facingMode: "environment" }}
              containerStyle={{ width: "100%", height: "100%" }}
              videoStyle={{ width: "100%", height: "100%" }}
            />
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
            <div className="text-red-700">
              {error}
              <button
                onClick={handleRetry}
                className="mt-2 w-full py-2 px-4 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {scanResult && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Valid Registration
              </h3>
              <div className="text-green-700">
                <div className="space-y-2">
                  <p>
                    <span className="font-semibold">Event:</span>{" "}
                    {scanResult.title}
                  </p>
                  <p>
                    <span className="font-semibold">Date:</span>{" "}
                    {new Date(scanResult.date).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-semibold">Venue:</span>{" "}
                    {scanResult.venue}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleRetry}
              className="w-full py-2 px-4 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50"
            >
              Scan Another Code
            </button>
          </div>
        )}

        <p className="text-sm text-gray-500 mt-4 text-center">
          Position the QR code within the camera frame to scan
        </p>
      </Card>
    </div>
  );
}
