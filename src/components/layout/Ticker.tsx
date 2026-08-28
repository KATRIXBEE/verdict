import React from "react";
import { AlertCircle, FileText, Scale, Landmark, ShieldCheck } from "lucide-react";

export default function Ticker() {
  const tickerItems = [
    { icon: Landmark, text: "PARLIAMENT LIVE: 18th Lok Sabha Monsoon Session Active | 543 MPs Indexed" },
    { icon: Scale, text: "eCOURTS LIVE: 1,420 Active Case Dockets Synchronized with NJDG Portal" },
    { icon: FileText, text: "ECI FORM 26: 2024 Election Affidavits Audited & Digitized" },
    { icon: ShieldCheck, text: "DIGILOCKER 1-CITIZEN-1-VOTE: Anti-Brigading Constituency Isolation Active" },
    { icon: AlertCircle, text: "UGC VERIFICATION: Degree records matched against National Academic Depository" },
  ];

  return (
    <div className="bg-ink text-white border-b-2.5 border-ink py-1.5 px-3 sm:px-4 w-full max-w-full overflow-x-hidden relative select-none">
      <div className="flex items-center">
        {/* Left static label */}
        <div className="hidden sm:flex items-center space-x-1.5 bg-brand-red text-white text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 border border-white shrink-0 mr-4 z-10 shadow-hard-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span>DATA FEED</span>
        </div>

        {/* Marquee ticker stream */}
        <div className="overflow-hidden flex-1 flex whitespace-nowrap">
          <div className="animate-marquee-smooth flex items-center space-x-10 text-xs font-mono">
            {tickerItems.concat(tickerItems).map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-center space-x-2 text-surface">
                  <Icon className="w-3.5 h-3.5 text-brand-green shrink-0" />
                  <span className="tracking-wider">{item.text}</span>
                  <span className="text-brand-yellow font-black">{"///"}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
