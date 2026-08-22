"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { UserCheck, MapPin, Building, Award, ArrowRight } from "lucide-react";
import { Politician } from "@/types";
import Modal from "@/components/ui/Modal";
import BrutalistButton from "@/components/ui/BrutalistButton";
import { getScoreColor, getProxiedImageUrl } from "@/lib/utils";

interface DisambiguationModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  candidates: Politician[];
}

export default function DisambiguationModal({
  isOpen,
  onClose,
  query,
  candidates,
}: DisambiguationModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`DISAMBIGUATION: "${query}"`}
      badge={`${candidates.length} MATCHES FOUND`}
      badgeColor="yellow"
      maxWidth="2xl"
    >
      <div className="space-y-4 font-mono">
        <div className="bg-brand-yellow/30 border-2 border-ink p-3 text-xs leading-relaxed">
          <span className="font-bold text-brand-red">▲ MULTIPLE LAWMAKERS IDENTIFIED:</span> Multiple elected representatives share this name or query. Please select the specific politician dossier below:
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {candidates.map((c) => {
            const scoreColor = getScoreColor(c.calculatedVerdictScore);
            return (
              <div
                key={c.id}
                className="bg-surface border-2.5 border-ink p-4 flex flex-col justify-between shadow-hard-md hover:-translate-y-0.5 hover:shadow-hard-lg transition-all relative"
              >
                {/* Score Pill */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`font-mono font-black text-xs px-2 py-0.5 border border-black ${scoreColor.bg} ${scoreColor.text}`}
                  >
                    {c.calculatedVerdictScore.toFixed(1)} / 10
                  </span>
                </div>

                <div className="flex items-start space-x-3 mb-4">
                  {/* Portrait thumbnail */}
                  <div className="w-14 h-14 border-2 border-ink bg-gray-200 overflow-hidden relative shrink-0">
                    <img
                      src={getProxiedImageUrl(c.photoUrl)}
                      alt={c.fullName}
                      className="w-full h-full object-cover grayscale contrast-125"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/default-politician.svg";
                      }}
                    />
                  </div>

                  <div className="flex-1 pr-12 truncate">
                    <h4 className="font-display font-black text-base uppercase text-ink truncate">
                      {c.fullName}
                    </h4>
                    <span
                      className="inline-block font-mono text-[11px] font-bold px-1.5 py-0.5 border border-ink mt-1"
                      style={{ backgroundColor: c.partyColor + "33" }}
                    >
                      {c.currentParty} ({c.partyAbbr})
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-gray-800 border-t-2 border-ink pt-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-brand-red shrink-0" />
                    <span className="font-bold truncate">
                      {c.currentConstituency.name}, {c.currentConstituency.state}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
                    <span>{c.house} • Age: {c.age} yrs</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="w-3.5 h-3.5 text-brand-green shrink-0" />
                    <span>{c.attendancePercentage}% Attendance</span>
                  </div>
                </div>

                <Link
                  href={`/politician/${c.slug}`}
                  onClick={onClose}
                  className="w-full"
                >
                  <BrutalistButton variant="primary" size="sm" className="w-full justify-between">
                    <span>VIEW DOSSIER</span>
                    <ArrowRight className="w-4 h-4" />
                  </BrutalistButton>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
