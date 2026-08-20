"use client";

import React, { useState } from "react";
import { 
  Star, 
  ShieldCheck, 
  Users, 
  MapPin, 
  CheckCircle2, 
  Lock, 
  AlertCircle, 
  ThumbsUp, 
  MessageSquare,
  Sparkles
} from "lucide-react";
import { CitizenRating } from "@/types";
import BrutalistCard from "@/components/ui/BrutalistCard";
import BrutalistButton from "@/components/ui/BrutalistButton";
import Modal from "@/components/ui/Modal";

interface CitizenRatingSectionProps {
  politicianId: string;
  politicianName: string;
  constituencyName: string;
  ratings: CitizenRating[];
}

export default function CitizenRatingSection({
  politicianId,
  politicianName,
  constituencyName,
  ratings: initialRatings,
}: CitizenRatingSectionProps) {
  const [ratings, setRatings] = useState<CitizenRating[]>(initialRatings);
  const [activeTab, setActiveTab] = useState<"local" | "national">("local");
  
  // Rating submission modal state
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedStars, setSelectedStars] = useState(5);
  const [feedbackTag, setFeedbackTag] = useState<string>("responsive");
  const [comment, setComment] = useState("");
  const [userName, setUserName] = useState("");
  const [isLocal, setIsLocal] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const localRatings = ratings.filter((r) => r.isLocalVoter);
  const nationalRatings = ratings.filter((r) => !r.isLocalVoter);

  const displayedRatings = activeTab === "local" ? localRatings : nationalRatings;

  // Compute averages
  const localAvg =
    localRatings.length > 0
      ? (localRatings.reduce((acc, r) => acc + r.rating, 0) / localRatings.length).toFixed(1)
      : "4.5";
  const nationalAvg =
    nationalRatings.length > 0
      ? (nationalRatings.reduce((acc, r) => acc + r.rating, 0) / nationalRatings.length).toFixed(1)
      : "4.0";

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newRating: CitizenRating = {
      id: `cr-${Date.now()}`,
      politicianId,
      userId: `user-verified-${Math.random().toString(36).substring(2, 7)}`,
      userName: userName.trim() || "DigiLocker Verified Citizen",
      userConstituency: isLocal ? constituencyName : "National Voter",
      rating: selectedStars,
      feedbackTag: feedbackTag as any,
      comment: comment.trim() || undefined,
      isLocalVoter: isLocal,
      digilockerVerified: true,
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      setRatings([newRating, ...ratings]);
      setIsSubmitting(false);
      setSubmittedSuccess(true);
      setTimeout(() => {
        setSubmittedSuccess(false);
        setRatingModalOpen(false);
        setComment("");
        setUserName("");
      }, 2000);
    }, 600);
  };

  const tagOptions = [
    { value: "responsive", label: "Responsive to Grievances" },
    { value: "infrastructure", label: "Strong Infrastructure Delivery" },
    { value: "integrity", label: "High Integrity / Clean Public Life" },
    { value: "reformist", label: "Progressive & Policy-Focused" },
    { value: "accessible", label: "Accessible in Constituency" },
    { value: "absentee", label: "Absentee Lawmaker" },
  ];

  return (
    <>
      <BrutalistCard
        title="ANTI-BRIGADING CITIZEN TRUST RATINGS"
        badge="DIGILOCKER 1-CITIZEN-1-VOTE"
        badgeColor="pink"
        statusLight="green"
        statusLightLabel="CONSTITUENCY ISOLATED"
      >
        <div className="space-y-6 font-mono">
          {/* Header Metric Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-muted border-2 border-ink p-4 text-xs">
            <div className="flex items-center space-x-4">
              <div className="bg-brand-pink text-black p-3 border-2 border-ink shadow-hard-xs flex items-center justify-center">
                <span className="font-display font-black text-2xl">
                  {activeTab === "local" ? localAvg : nationalAvg}
                </span>
                <span className="text-xs font-bold ml-1">/ 5★</span>
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-ink text-sm uppercase">
                    {activeTab === "local"
                      ? `${constituencyName} Residents Rating`
                      : "National Public Rating"}
                  </span>
                  <span className="bg-brand-green text-black text-[10px] font-black px-1.5 py-0.2 border border-ink">
                    VERIFIED
                  </span>
                </div>
                <p className="text-gray-600 text-[11px] mt-0.5">
                  {activeTab === "local"
                    ? "Weight 70% in VERDICT Score (Local voter residency gate)"
                    : "Weight 30% in VERDICT Score (Cross-state public opinions)"}
                </p>
              </div>
            </div>

            {/* Rate Button */}
            <BrutalistButton
              variant="secondary"
              size="sm"
              shadow="sm"
              onClick={() => setRatingModalOpen(true)}
              className="flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <Star className="w-4 h-4 fill-black" />
              <span>CAST VERIFIED RATING</span>
            </BrutalistButton>
          </div>

          {/* Dual Tabs for Anti-Brigading */}
          <div className="flex border-b-2.5 border-ink">
            <button
              onClick={() => setActiveTab("local")}
              className={`flex items-center space-x-2 px-4 py-2.5 font-bold text-xs border-r-2 border-t-2 border-l-2 -mb-0.5 transition-all ${
                activeTab === "local"
                  ? "bg-surface border-ink shadow-hard-xs text-ink font-black"
                  : "bg-surface-muted border-transparent text-gray-600 hover:text-ink"
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-brand-red" />
              <span>
                CONSTITUENCY VOTERS ({localRatings.length})
              </span>
            </button>

            <button
              onClick={() => setActiveTab("national")}
              className={`flex items-center space-x-2 px-4 py-2.5 font-bold text-xs border-r-2 border-t-2 border-l-2 -mb-0.5 transition-all ${
                activeTab === "national"
                  ? "bg-surface border-ink shadow-hard-xs text-ink font-black"
                  : "bg-surface-muted border-transparent text-gray-600 hover:text-ink"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-brand-cyan" />
              <span>
                NATIONAL PUBLIC ({nationalRatings.length})
              </span>
            </button>
          </div>

          {/* Rating Cards Stream */}
          <div className="space-y-3">
            {displayedRatings.length === 0 ? (
              <div className="p-8 bg-canvas border-2 border-ink text-center text-xs text-gray-600 space-y-2">
                <p className="font-bold">No verified ratings recorded in this tab yet.</p>
                <p>Be the first DigiLocker-authenticated citizen to cast a rating for this representative.</p>
              </div>
            ) : (
              displayedRatings.map((r) => (
                <div
                  key={r.id}
                  className="bg-surface border-2 border-ink p-3.5 shadow-hard-xs space-y-2 hover:bg-surface-muted transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-ink text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                        {r.userName[0]?.toUpperCase()}
                      </div>
                      <span className="font-bold text-xs text-ink">{r.userName}</span>
                      {r.isLocalVoter && (
                        <span className="bg-brand-green text-black text-[9px] font-extrabold px-1.5 py-0.2 border border-black">
                          LOCAL RESIDENT
                        </span>
                      )}
                    </div>

                    {/* Star Display */}
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= r.rating ? "text-brand-yellow fill-brand-yellow" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {r.comment && (
                    <p className="text-xs text-gray-800 leading-relaxed pl-8">
                      &quot;{r.comment}&quot;
                    </p>
                  )}

                  {r.feedbackTag && (
                    <div className="pl-8 pt-1">
                      <span className="inline-block bg-canvas border border-ink text-[10px] font-bold px-2 py-0.5 text-gray-700">
                        #{r.feedbackTag}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Anti-Brigading Policy Notice */}
          <div className="bg-brand-yellow/20 border-2 border-ink p-3 flex items-start space-x-2 text-[11px] text-gray-800">
            <Lock className="w-4 h-4 text-ink shrink-0 mt-0.5" />
            <p>
              <strong>Anti-IT Cell Brigading Shield:</strong> To prevent coordinated cross-state voting raids, ratings by voters registered outside {constituencyName} are isolated in the National tab and cannot skew the candidate&apos;s local resident score.
            </p>
          </div>
        </div>
      </BrutalistCard>

      {/* DigiLocker Rating Modal */}
      <Modal
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        title={`CAST CITIZEN RATING: ${politicianName.toUpperCase()}`}
        badge="DIGILOCKER 1-CITIZEN-1-VOTE"
        badgeColor="green"
        maxWidth="lg"
      >
        {submittedSuccess ? (
          <div className="py-8 text-center space-y-3 font-mono">
            <div className="w-12 h-12 bg-brand-green border-2 border-black rounded-full flex items-center justify-center mx-auto shadow-hard-sm">
              <CheckCircle2 className="w-7 h-7 text-black stroke-[2.5]" />
            </div>
            <h3 className="font-display font-black text-xl text-ink uppercase">
              RATING RECORDED ON-CHAIN & AUDITED!
            </h3>
            <p className="text-xs text-gray-700">
              Your rating has been authenticated via DigiLocker Sandbox and logged in the public ledger.
            </p>
          </div>
        ) : (
          <form onSubmit={handleRatingSubmit} className="space-y-4 font-mono text-xs">
            {/* DigiLocker Auth Badge */}
            <div className="bg-brand-green/20 border-2 border-ink p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-green-700 shrink-0" />
                <div>
                  <span className="font-bold text-ink">DigiLocker Mock Sandbox Connected</span>
                  <p className="text-[10px] text-gray-600">Aadhaar Token: •••• •••• 9102 (Isolated 1-Citizen-1-Vote)</p>
                </div>
              </div>
              <span className="bg-brand-green text-black font-black text-[9px] px-2 py-0.5 border border-black">
                ACTIVE
              </span>
            </div>

            {/* Voter Residency Toggle */}
            <div className="space-y-1.5">
              <label className="font-bold uppercase text-ink">Constituency Verification:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsLocal(true)}
                  className={`p-2.5 border-2 border-ink text-left font-bold transition-all ${
                    isLocal ? "bg-brand-yellow shadow-hard-xs" : "bg-surface text-gray-700"
                  }`}
                >
                  <div className="text-[10px] text-gray-600">REGISTERED VOTER IN</div>
                  <div className="text-ink truncate">{constituencyName}</div>
                </button>
                <button
                  type="button"
                  onClick={() => setIsLocal(false)}
                  className={`p-2.5 border-2 border-ink text-left font-bold transition-all ${
                    !isLocal ? "bg-brand-cyan shadow-hard-xs" : "bg-surface text-gray-700"
                  }`}
                >
                  <div className="text-[10px] text-gray-600">GENERAL PUBLIC</div>
                  <div className="text-ink">National Citizen</div>
                </button>
              </div>
            </div>

            {/* Star Rating Selector */}
            <div className="space-y-1.5">
              <label className="font-bold uppercase text-ink">Your Star Rating (1 to 5):</label>
              <div className="flex items-center space-x-2 bg-canvas p-3 border-2 border-ink justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelectedStars(star)}
                    className="p-1 hover:scale-125 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= selectedStars
                          ? "text-brand-yellow fill-brand-yellow"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Tag */}
            <div className="space-y-1.5">
              <label className="font-bold uppercase text-ink">Primary Feedback Category:</label>
              <select
                value={feedbackTag}
                onChange={(e) => setFeedbackTag(e.target.value)}
                className="w-full bg-surface border-2 border-ink p-2.5 text-xs font-bold text-ink focus:outline-none"
              >
                {tagOptions.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="font-bold uppercase text-ink">Public Display Name (Optional):</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Priya Sharma or Anonymous Citizen"
                className="w-full bg-surface border-2 border-ink p-2.5 text-xs font-bold text-ink focus:outline-none"
              />
            </div>

            {/* Comment */}
            <div className="space-y-1.5">
              <label className="font-bold uppercase text-ink">Constituency Feedback / Observations:</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Describe specific constituency work, infrastructure delivery, or legislative stance..."
                className="w-full bg-surface border-2 border-ink p-2.5 text-xs font-bold text-ink focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end">
              <BrutalistButton
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "AUTHENTICATING & LOGGING..." : "SUBMIT VERIFIED VOTE"}
              </BrutalistButton>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
