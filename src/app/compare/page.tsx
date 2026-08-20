import React, { Suspense } from "react";
import CompareMatrix from "@/features/compare/CompareMatrix";

export default function ComparePage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="p-8 text-center font-mono font-bold">LOADING NETA MATRIX...</div>}>
        <CompareMatrix />
      </Suspense>
    </div>
  );
}
