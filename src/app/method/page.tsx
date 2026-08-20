import React from "react";
import Link from "next/link";
import { Scale, BookOpen, ShieldCheck, Calculator, AlertTriangle, FileText, CheckCircle2, Lock } from "lucide-react";
import { IPC_DICTIONARY } from "@/data/ipc-dictionary";
import { getSeverityBadge } from "@/lib/utils";
import BrutalistCard from "@/components/ui/BrutalistCard";
import BrutalistButton from "@/components/ui/BrutalistButton";

export default function MethodologyPage() {
  const allSections = Object.values(IPC_DICTIONARY);

  return (
    <div className="space-y-10 font-mono">
      {/* Header */}
      <div className="border-3 border-ink bg-surface p-6 sm:p-8 shadow-hard-lg space-y-3">
        <div className="inline-flex items-center space-x-2 bg-brand-cyan px-2.5 py-1 border-2 border-ink text-xs font-black uppercase shadow-hard-xs">
          <Scale className="w-4 h-4 text-black" />
          <span>OPEN-SOURCE CIVIC TECH METHODOLOGY</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl uppercase text-ink">
          THE VERDICT SCORE ALGORITHM & IPC DICTIONARY
        </h1>
        <p className="text-xs sm:text-sm text-gray-700 max-w-3xl leading-relaxed">
          How VERDICT computes tamper-proof accountability ratings (0.0 – 10.0) strictly from verifiable government records, mitigating editorial bias and defamation risks.
        </p>
      </div>

      {/* 1. The Mathematical Engine */}
      <BrutalistCard
        title="1. MATHEMATICAL FORMULA SPECIFICATION"
        badge="OBJECTIVE SCORING"
        badgeColor="green"
      >
        <div className="space-y-6 text-xs text-gray-800">
          <div className="bg-canvas border-2.5 border-ink p-4 space-y-2">
            <span className="font-bold text-xs uppercase text-ink">CORE MATHEMATICAL FORMULA:</span>
            <div className="bg-surface border-2 border-ink p-3 text-xs sm:text-sm font-bold text-ink overflow-x-auto">
              VERDICT Score = clamp( Σ(Positive Weights) - Σ(Penal Deductions), 0.0, 10.0 )
            </div>
          </div>

          <div className="border-2 border-ink overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-ink text-white">
                  <th className="p-3 border-r border-gray-700">PARAMETER</th>
                  <th className="p-3 border-r border-gray-700">DATA SOURCE</th>
                  <th className="p-3 border-r border-gray-700">MAX WEIGHT</th>
                  <th className="p-3">LOGIC & BENCHMARK</th>
                </tr>
              </thead>
              <tbody className="divide-y border-t border-ink">
                <tr className="hover:bg-surface-muted">
                  <td className="p-3 font-bold border-r border-gray-300">Parliament Attendance</td>
                  <td className="p-3 border-r border-gray-300">Sansad.in / PRS India</td>
                  <td className="p-3 font-black text-green-700 border-r border-gray-300">+2.0 pts</td>
                  <td className="p-3">&gt;90% = +2.0 | 75-90% = +1.5 | 50-74% = +1.0 | &lt;50% = +0.5</td>
                </tr>
                <tr className="hover:bg-surface-muted">
                  <td className="p-3 font-bold border-r border-gray-300">Asset Growth Trajectory</td>
                  <td className="p-3 border-r border-gray-300">ECI Form 26 Affidavits</td>
                  <td className="p-3 font-black text-green-700 border-r border-gray-300">+2.0 pts</td>
                  <td className="p-3">Normal (&lt;200%) = +2.0 | High (200-500%) = +1.0 | Outlier (&gt;500%) = 0.0</td>
                </tr>
                <tr className="hover:bg-surface-muted">
                  <td className="p-3 font-bold border-r border-gray-300">DigiLocker Citizen Rating</td>
                  <td className="p-3 border-r border-gray-300">Aadhaar Mock Sandbox</td>
                  <td className="p-3 font-black text-green-700 border-r border-gray-300">+2.5 pts</td>
                  <td className="p-3">(Weighted Avg / 5) × 2.5 (70% weight to verified local constituency residents)</td>
                </tr>
                <tr className="hover:bg-surface-muted">
                  <td className="p-3 font-bold border-r border-gray-300">AI Media Sentiment</td>
                  <td className="p-3 border-r border-gray-300">90-Day NLP Press Scrape</td>
                  <td className="p-3 font-black text-green-700 border-r border-gray-300">+1.0 pts</td>
                  <td className="p-3">Net Positive = +1.0 | Neutral = +0.5 | Net Critical = 0.0</td>
                </tr>
                <tr className="hover:bg-surface-muted">
                  <td className="p-3 font-bold border-r border-gray-300">UGC Degree Verification</td>
                  <td className="p-3 border-r border-gray-300">UGC / AICTE Archive</td>
                  <td className="p-3 font-black text-green-700 border-r border-gray-300">+0.5 pts</td>
                  <td className="p-3">Verified = +0.5 | Digital Archive = +0.2 | Suspicious = 0.0</td>
                </tr>
                <tr className="hover:bg-surface-muted">
                  <td className="p-3 font-bold border-r border-gray-300">Party Loyalty Track</td>
                  <td className="p-3 border-r border-gray-300">ECI Election History</td>
                  <td className="p-3 font-black text-green-700 border-r border-gray-300">+0.5 pts</td>
                  <td className="p-3">0 switches = +0.5 | 1 switch = +0.3 | ≥2 switches = 0.0</td>
                </tr>
                <tr className="hover:bg-surface-muted">
                  <td className="p-3 font-bold border-r border-gray-300">Legislative Engagement</td>
                  <td className="p-3 border-r border-gray-300">Lok Sabha Debates / Questions</td>
                  <td className="p-3 font-black text-green-700 border-r border-gray-300">+1.0 pts</td>
                  <td className="p-3">High debates/questions asked above house averages = up to +1.0 pts</td>
                </tr>
                <tr className="hover:bg-surface-muted bg-brand-red/10">
                  <td className="p-3 font-bold border-r border-gray-300 text-brand-red">Criminal Penalties</td>
                  <td className="p-3 border-r border-gray-300">eCourts (NJDG) Live</td>
                  <td className="p-3 font-black text-brand-red border-r border-gray-300">Up to -4.0 pts</td>
                  <td className="p-3">Minor (-0.5) | Moderate (-1.0) | Serious (-2.0) | Severe (-3.5) | Conviction (2x)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </BrutalistCard>

      {/* 2. Plain-English IPC Dictionary Reference */}
      <BrutalistCard
        title="2. PLAIN-ENGLISH IPC & STATUTORY OFFENSE DICTIONARY"
        badge="30+ SECTIONS TRANSLATED"
        badgeColor="yellow"
      >
        <div className="space-y-4 text-xs">
          <p className="text-gray-700 leading-relaxed">
            Statutory Indian Penal Code sections and special acts (POCSO, Prevention of Corruption Act, PMLA) translated into objective layman definitions with standardized severity tiers:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allSections.map((item) => {
              const sev = getSeverityBadge(item.severityTier);
              return (
                <div
                  key={item.section}
                  className="bg-surface border-2.5 border-ink p-4 shadow-hard-xs space-y-2 hover:bg-surface-muted transition-colors"
                >
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <div>
                      <span className="font-display font-black text-base text-ink">{item.section}</span>
                      <span className="text-[10px] text-gray-500 font-bold block">{item.category}</span>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-black border ${sev.classNames}`}>
                      {sev.label} (-{item.deductionPoints.toFixed(1)} pts)
                    </span>
                  </div>

                  <h5 className="font-bold text-xs text-gray-900">{item.title}</h5>

                  <div className="bg-canvas border border-ink p-2 space-y-0.5">
                    <span className="text-[9px] font-bold text-brand-red uppercase">PLAIN ENGLISH TRANSLATION:</span>
                    <p className="text-gray-800 leading-snug">{item.plainEnglish}</p>
                  </div>

                  <div className="text-[10px] text-gray-600 flex justify-between pt-1">
                    <span>Max Sentence: <strong>{item.maxSentence}</strong></span>
                    <span>{item.bailable ? "Bailable" : "Non-Bailable"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </BrutalistCard>

      {/* 3. Legal Defamation Immunity & Defense Architecture */}
      <BrutalistCard
        title="3. LEGAL DEFAMATION IMMUNITY & ANTI-BRIGADING ARCHITECTURE"
        badge="ARTICLE 19(1)(a)"
        badgeColor="cyan"
      >
        <div className="space-y-4 text-xs text-gray-800 leading-relaxed">
          <div className="bg-surface-muted border-2 border-ink p-4 space-y-2">
            <h4 className="font-bold text-sm text-ink uppercase flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-green-700" />
              <span>JUDICIAL DEFENSE POSITION (SUPREME COURT PRECEDENT)</span>
            </h4>
            <p>
              In <em>Union of India v. Association for Democratic Reforms (2002) 5 SCC 294</em> and <em>People&apos;s Union for Civil Liberties (PUCL) v. Union of India (2003) 4 SCC 399</em>, the Supreme Court held that citizens possess a fundamental right under Article 19(1)(a) to know the criminal antecedents, assets, and qualifications of candidates.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface border-2 border-ink p-3 space-y-1 shadow-hard-xs">
              <strong className="text-ink block">1. Verbatim Aggregation</strong>
              <p className="text-gray-600 text-[11px]">
                Zero editorial adjectives. Replaces accusatory words with factual labels: &quot;Unusual Growth Outlier&quot; and &quot;Declared vs Spent Discrepancy&quot;.
              </p>
            </div>

            <div className="bg-surface border-2 border-ink p-3 space-y-1 shadow-hard-xs">
              <strong className="text-ink block">2. Anti-IT Cell Shield</strong>
              <p className="text-gray-600 text-[11px]">
                DigiLocker sandbox authentication restricts local voter ratings to verified constituency residents.
              </p>
            </div>

            <div className="bg-surface border-2 border-ink p-3 space-y-1 shadow-hard-xs">
              <strong className="text-ink block">3. Direct Document Linking</strong>
              <p className="text-gray-600 text-[11px]">
                Every data line item links to official ECI Form 26 PDF dockets and eCourts NJDG portals.
              </p>
            </div>
          </div>
        </div>
      </BrutalistCard>
    </div>
  );
}
