"use client";

import React from "react";
import Link from "next/link";
import { WifiOff, Scale, RefreshCw, AlertTriangle } from "lucide-react";
import BrutalistButton from "@/components/ui/BrutalistButton";

export default function OfflinePage() {
  const handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center font-mono py-12 px-4">
      <div className="bg-surface border-3 border-ink p-6 sm:p-10 shadow-hard-xl max-w-lg w-full text-center space-y-6">
        {/* Logo & Offline Icon Badge */}
        <div className="flex justify-center items-center space-x-3">
          <div className="bg-brand-red text-white p-3 border-2.5 border-ink shadow-hard-sm">
            <Scale className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div className="bg-gray-200 text-ink p-3 border-2.5 border-ink shadow-hard-sm">
            <WifiOff className="w-8 h-8 text-brand-red" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-block bg-brand-yellow text-black font-black text-xs px-2.5 py-1 border border-ink shadow-hard-xs uppercase">
            CONNECTION SEVERED
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-ink uppercase tracking-tight">
            YOU&apos;RE OFFLINE
          </h1>
        </div>

        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-bold border-y-2 border-gray-300 py-4">
          VERDICT needs internet to load real-time politician scores, criminal affidavits, asset growth filings, and parliamentary transcripts. Please check your cellular data or Wi-Fi connection.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <BrutalistButton variant="primary" size="md" onClick={handleReload} className="w-full sm:w-auto">
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>TRY RECONNECTING</span>
            </div>
          </BrutalistButton>

          <Link href="/" className="w-full sm:w-auto">
            <BrutalistButton variant="outline" size="md" className="w-full">
              SAVED HOME
            </BrutalistButton>
          </Link>
        </div>

        <div className="text-[10px] text-gray-500 pt-2 flex items-center justify-center space-x-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-brand-orange" />
          <span>VERDICT Progressive Web App — Cached Shell Mode</span>
        </div>
      </div>
    </div>
  );
}
