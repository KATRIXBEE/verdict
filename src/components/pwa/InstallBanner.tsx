"use client";

import React, { useState, useEffect } from "react";
import { Download, X, Smartphone, Scale, Sparkles } from "lucide-react";
import BrutalistButton from "@/components/ui/BrutalistButton";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [timerReady, setTimerReady] = useState(false);

  useEffect(() => {
    // Check if dismissed before
    const isDismissed = localStorage.getItem("verdict_pwa_dismissed") === "true";
    if (isDismissed) return;

    // 30 seconds timer
    const timer = setTimeout(() => {
      setTimerReady(true);
    }, 30000);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    if (timerReady && deferredPrompt && !localStorage.getItem("verdict_pwa_dismissed")) {
      setIsVisible(true);
    }
  }, [timerReady, deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    setIsVisible(false);
    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === "accepted") {
      localStorage.setItem("verdict_pwa_installed", "true");
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("verdict_pwa_dismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300 font-mono">
      <div className="bg-surface border-3 border-ink p-4 sm:p-5 shadow-hard-xl space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="bg-brand-red text-white p-2 border-2 border-ink shadow-hard-xs shrink-0">
              <Scale className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="bg-brand-green text-black font-black text-[9px] px-1.5 py-0.2 border border-black uppercase">
                  NATIVE APP
                </span>
                <span className="text-[10px] text-gray-500 font-bold">PWA READY</span>
              </div>
              <h4 className="font-display font-black text-sm uppercase text-ink mt-0.5">
                Install VERDICT on your phone
              </h4>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            aria-label="Close install prompt"
            className="text-gray-400 hover:text-black p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-gray-700 leading-snug">
          Get fast one-tap access to live affidavits, criminal dossiers, and neta face-offs directly from your home screen.
        </p>

        <div className="flex items-center space-x-2 pt-1">
          <button
            onClick={handleInstallClick}
            className="flex-1 bg-brand-red hover:bg-brand-red/90 text-white font-mono font-bold text-xs py-2 px-3 border-2 border-ink shadow-hard-xs hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-1.5 uppercase cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>

          <button
            onClick={handleDismiss}
            className="bg-surface-muted hover:bg-gray-300 text-ink font-mono font-bold text-xs py-2 px-3 border-2 border-ink shadow-hard-xs hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all uppercase cursor-pointer"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
