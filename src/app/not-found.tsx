import React from "react";
import Link from "next/link";
import { AlertOctagon, ArrowLeft, Search, Scale } from "lucide-react";
import BrutalistButton from "@/components/ui/BrutalistButton";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 font-mono">
      <div className="max-w-md w-full bg-surface border-3 border-ink p-8 shadow-hard-lg text-center space-y-5">
        <div className="w-16 h-16 bg-brand-red text-white border-2 border-ink shadow-hard-xs flex items-center justify-center mx-auto">
          <AlertOctagon className="w-9 h-9 stroke-[2.5]" aria-hidden="true" />
        </div>

        <div className="space-y-1">
          <div className="inline-block px-2.5 py-0.5 bg-brand-yellow text-black border border-ink text-xs font-black uppercase shadow-hard-xs">
            HTTP 404 • RECORD NOT FOUND
          </div>
          <h1 className="font-display font-black text-3xl uppercase text-ink tracking-tight mt-2">
            DOSSIER UNAVAILABLE
          </h1>
          <p className="text-xs text-gray-700 font-bold leading-relaxed">
            The requested parliamentary record, investigation, or page does not exist in the VERDICT public registry.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="w-full sm:w-auto">
            <BrutalistButton variant="primary" size="sm" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-1.5 stroke-[2.5]" aria-hidden="true" />
              RETURN HOME
            </BrutalistButton>
          </Link>

          <Link href="/search?q=" className="w-full sm:w-auto">
            <BrutalistButton variant="secondary" size="sm" className="w-full">
              <Search className="w-4 h-4 mr-1.5 stroke-[2.5]" aria-hidden="true" />
              SEARCH NETAS
            </BrutalistButton>
          </Link>
        </div>

        <div className="pt-3 border-t border-ink/20 text-[10px] text-gray-500 font-bold uppercase">
          VERDICT CIVIC PLATFORM • DEMOCRATIC TRANSPARENCY
        </div>
      </div>
    </div>
  );
}
