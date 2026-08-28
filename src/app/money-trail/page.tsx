import React from "react";
import type { Metadata } from "next";
import MoneyTrailClient from "./MoneyTrailClient";

export const metadata: Metadata = {
  title: "Money Trail — India's Government Fund Misuse Tracker | VERDICT",
  description:
    "Verified CAG audit findings on ₹4.83 lakh crore in government fund misuse, overpriced infrastructure, and welfare scheme fraud. All sourced from official government audit reports.",
  openGraph: {
    title: "Money Trail — India's Government Fund Misuse Tracker | VERDICT",
    description:
      "Verified CAG audit findings on ₹4.83 lakh crore in government fund misuse, overpriced infrastructure, and welfare scheme fraud.",
    type: "website",
  },
};

export default function MoneyTrailPage() {
  return <MoneyTrailClient />;
}
