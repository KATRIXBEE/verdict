"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MapPin, Users, ArrowRight, Eye, AlertCircle, Compass, Layers } from "lucide-react";
import { GroundTruthArticle } from "@/types";
import BrutalistButton from "@/components/ui/BrutalistButton";

interface GroundTruthMapProps {
  articles: GroundTruthArticle[];
}

export default function GroundTruthMap({ articles }: GroundTruthMapProps) {
  const [activeArticle, setActiveArticle] = useState<GroundTruthArticle>(articles[0] || null);

  // Map markers relative placement coordinates for interactive canvas representation
  // Normalized percentage position relative to India's geography bounds:
  // Lat: ~8 to ~35 N, Lng: ~68 to ~97 E
  const getMarkerPosition = (coords?: [number, number]) => {
    if (!coords) return { top: "50%", left: "50%" };
    const [lat, lng] = coords;
    // Map bounding box calibration:
    // Top (36N) to Bottom (8N) => 28 deg span
    // Left (68E) to Right (96E) => 28 deg span
    const topPct = Math.max(8, Math.min(88, ((36 - lat) / 28) * 100));
    const leftPct = Math.max(10, Math.min(88, ((lng - 68) / 28) * 100));
    return { top: `${topPct}%`, left: `${leftPct}%` };
  };

  return (
    <div className="bg-surface border-3 border-ink shadow-hard-lg font-mono overflow-hidden">
      {/* Map Control Titlebar */}
      <div className="bg-ink text-white px-4 py-2.5 flex items-center justify-between border-b-2.5 border-ink text-xs">
        <div className="flex items-center space-x-2 font-bold uppercase">
          <Compass className="w-4 h-4 text-brand-cyan animate-spin-slow" />
          <span>INTERACTIVE DISTRICT INVESTIGATION RADAR</span>
        </div>
        <div className="flex items-center space-x-2 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
          <span>{articles.length} DISTRICT HOTSPOTS MAPPED</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
        {/* Left: Interactive Canvas Map with Coordinate Pins */}
        <div className="lg:col-span-8 bg-canvas border-b-2.5 lg:border-b-0 lg:border-r-2.5 border-ink relative p-6 flex items-center justify-center overflow-hidden min-h-[380px]">
          {/* Subtle Grid overlay */}
          <div className="absolute inset-0 bg-grid-matrix opacity-40 pointer-events-none" />

          {/* India Regional Sector Guides */}
          <div className="absolute top-4 left-4 text-[10px] text-gray-500 font-bold">
            LAT 36°N (NORTHERN FRONTIER)
          </div>
          <div className="absolute bottom-4 left-4 text-[10px] text-gray-500 font-bold">
            LAT 08°N (INDIAN OCEAN BASIN)
          </div>
          <div className="absolute bottom-4 right-4 text-[10px] text-gray-500 font-bold">
            LNG 96°E (EASTERN BENGAL DELTA)
          </div>

          {/* Stylized Geo Container */}
          <div className="w-full h-full relative max-w-lg aspect-square border-2 border-dashed border-gray-400 bg-surface/40 p-4">
            {/* Compass Rose */}
            <div className="absolute top-3 right-3 text-center text-[9px] font-black text-gray-600 bg-surface border border-ink px-1.5 py-0.5 shadow-hard-xs">
              N ▲
            </div>

            {/* Plot Article Pins */}
            {articles.map((art) => {
              const isSelected = activeArticle?.id === art.id;
              const pos = getMarkerPosition(art.location.coordinates);

              return (
                <div
                  key={art.id}
                  style={{ top: pos.top, left: pos.left }}
                  onClick={() => setActiveArticle(art)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                >
                  {/* Outer pulse circle */}
                  <div
                    className={`w-8 h-8 rounded-full border-2 border-ink flex items-center justify-center transition-all shadow-hard-xs ${
                      isSelected
                        ? "bg-brand-red text-white scale-125 z-30 shadow-hard-red"
                        : "bg-brand-yellow text-black hover:scale-110"
                    }`}
                  >
                    <MapPin className="w-4 h-4 fill-current stroke-[2.5]" />
                  </div>

                  {/* Marker Tooltip on Hover */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:block z-40 whitespace-nowrap bg-ink text-white text-[10px] font-bold px-2 py-1 border border-white shadow-hard-xs pointer-events-none">
                    {art.location.district}, {art.location.state}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Article Preview Panel */}
        <div className="lg:col-span-4 p-5 sm:p-6 flex flex-col justify-between space-y-4 bg-surface text-xs">
          {activeArticle ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-ink pb-2">
                <span className="bg-brand-yellow text-black font-extrabold text-[10px] px-2 py-0.5 border border-black uppercase">
                  {activeArticle.category}
                </span>
                <span className="text-[10px] font-bold text-gray-600">
                  {new Date(activeArticle.date).toLocaleDateString("en-IN")}
                </span>
              </div>

              {/* Location Badge */}
              <div className="flex items-center space-x-1 text-brand-red font-bold text-xs">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {activeArticle.location.state} &gt; {activeArticle.location.district}
                </span>
              </div>

              {/* Headline */}
              <h4 className="font-display font-black text-base text-ink uppercase leading-snug">
                {activeArticle.headline}
              </h4>

              {/* Summary */}
              <p className="text-xs text-gray-700 leading-relaxed">
                {activeArticle.summary}
              </p>

              {/* Affected Metric */}
              <div className="bg-surface-muted p-2.5 border border-ink space-y-1">
                <span className="text-[10px] text-gray-500 font-bold uppercase block">
                  COMMUNITY IMPACT:
                </span>
                <div className="flex items-center space-x-2 text-ink font-bold">
                  <Users className="w-4 h-4 text-brand-red" />
                  <span>{activeArticle.affectedPeopleCount.toLocaleString("en-IN")} Citizens Affected</span>
                </div>
              </div>

              {/* Read full link */}
              <div className="pt-2">
                <Link href={`/ground-truth/${activeArticle.slug}`}>
                  <BrutalistButton variant="primary" size="sm" className="w-full justify-between">
                    <span>OPEN FULL INVESTIGATION</span>
                    <ArrowRight className="w-4 h-4" />
                  </BrutalistButton>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              Select a district pin on the map to inspect the investigative report.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
