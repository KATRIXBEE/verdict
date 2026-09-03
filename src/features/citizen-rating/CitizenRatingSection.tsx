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
  Sparkles,
  Info
} from "lucide-react";
import { CitizenRating, FeedbackCategory } from "@/types";
import BrutalistCard from "@/components/ui/BrutalistCard";
import BrutalistButton from "@/components/ui/BrutalistButton";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { showToast } = useToast();

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

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          politicianId,
          rating: selectedStars,
          userName: userName.trim() || "Anonymous Citizen",
          comment: comment.trim() || undefined,
          userConstituency: isLocal ? constituencyName : "National Voter",
          feedbackTag: feedbackTag as FeedbackCategory,
        }),
      });

      if (response.status === 429) {
        setErrorMessage("Too many ratings submitted. Please try again in a minute.");
        showToast("Too many requests. Please wait a moment.", "warning");
        setIsSubmitting(false);
        return;
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData?.error?.message || "Failed to submit citizen rating. Please try again.";
        setErrorMessage(errMsg);
        showToast("Failed to submit rating. Try again.", "error");
        setIsSubmitting(false);
        return;
      }

      const resJson = await response.json();
      const savedData = resJson.data || resJson;

      const newRating: CitizenRating = {
        id: savedData.id || `cr-${Date.now()}`,
        politicianId,
        userId: savedData.userId || `user-anon-${Math.random().toString(36).substring(2, 7)}`,
        userName: savedData.userName || userName.trim() || "Anonymous Citizen",
        userConstituency: savedData.userConstituency || (isLocal ? constituencyName : "National Voter"),
        rating: savedData.rating || selectedStars,
        feedbackTag: savedData.feedbackTag || (feedbackTag as FeedbackCategory),
        comment: savedData.comment || comment.trim() || undefined,
        isLocalVoter: Boolean(savedData.isLocalVoter),
        digilockerVerified: Boolean(savedData.digilockerVerified),
        createdAt: savedData.createdAt || new Date().toISOString(),
      };

      setRatings([newRating, ...ratings]);
      setSubmittedSuccess(true);
      showToast("Rating submitted successfully!", "success");
      setTimeout(() => {
        setSubmittedSuccess(false);
        setRatingModalOpen(false);
        setComment("");
        setUserName("");
        setErrorMessage(null);
      }, 2000);
    } catch (err) {
      console.error("[RATING_SUBMISSION_ERROR]", err);
      setErrorMessage("Network error. Please check your connection and try again.");
      showToast("Network error. Check your connection.", "error");
    } finally {
      setIsSubmitting(false);
    }
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
        title="CITIZEN TRUST RATINGS"
        badge="COMMUNITY FEEDBACK"
        badgeColor="yellow"
        statusLight="green"
        statusLightLabel="IP RATE LIMITED"
      >
        <div className="space-y-6 font-mono">
          {/* Informational Status Banner */}
          <div className="bg-brand-cyan/20 border-2 border-ink p-3 flex items-start space-x-2 text-[11px] text-gray-900">
            <Info className="w-4 h-4 text-ink shrink-0 mt-0.5" />
            <p>
              <strong>Public Ledger Notice:</strong> Ratings are currently recorded as unverified community feedback. Official DigiLocker 1-Citizen-1-Vote authentication integration is coming in the next release.
            </p>
          </div>

          {/* Header Metric Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-muted border-2 border-ink p-4 text-xs">
            <div className="flex items-center space-x-4">
              <div className="bg-brand-pink text-black p-3 border-2 border-ink shadow-hard-xs flex items-center justify-center">
                <span className="font-display font-black text-2xl">
                  {activeTab === "local" ? localAvg : nationalAvg}
                </span>
                <span className="text-xs font-bold ml-1 inline-flex items-center">
                  / 5 <Star className="w-3 h-3 ml-0.5 fill-black stroke-black" aria-hidden="true" />
                </span>
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-ink text-sm uppercase">
                    {activeTab === "local"
                      ? `${constituencyName} Community Ratings`
                      : "National Public Opinions"}
                  </span>
                  <span className="bg-brand-yellow text-black text-[10px] font-black px-1.5 py-0.2 border border-ink">
                    COMMUNITY
                  </span>
                </div>
                <p className="text-gray-600 text-[11px] mt-0.5">
                  {activeTab === "local"
                    ? "Weight 70% in VERDICT Score (Constituency resident focus)"
                    : "Weight 30% in VERDICT Score (Cross-state public perspective)"}
                </p>
              </div>
            </div>

            {/* Rate Button */}
            <BrutalistButton
              variant="secondary"
              size="sm"
              shadow="sm"
              onClick={() => {
                setErrorMessage(null);
                setRatingModalOpen(true);
              }}
              className="flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <Star className="w-4 h-4 fill-black" />
              <span>SUBMIT CITIZEN RATING</span>
            </BrutalistButton>
          </div>

          {/* Dual Tabs */}
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
                CONSTITUENCY FEEDBACK ({localRatings.length})
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
                <p className="font-bold">No community ratings recorded in this tab yet.</p>
                <p>Be the first citizen to submit a rating for this representative.</p>
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
                        {r.userName ? r.userName[0]?.toUpperCase() : "C"}
                      </div>
                      <span className="font-bold text-xs text-ink">{r.userName}</span>
                      {r.digilockerVerified ? (
                        <span className="bg-brand-green text-black text-[9px] font-extrabold px-1.5 py-0.2 border border-black">
                          DIGILOCKER VERIFIED
                        </span>
                      ) : (
                        <span className="bg-surface-muted text-gray-700 text-[9px] font-bold px-1.5 py-0.2 border border-ink">
                          COMMUNITY
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
        </div>
      </BrutalistCard>

      {/* Citizen Rating Modal */}
      <Modal
        isOpen={ratingModalOpen}
        onClose={() => {
          setRatingModalOpen(false);
          setErrorMessage(null);
        }}
        title={`SUBMIT RATING: ${politicianName.toUpperCase()}`}
        badge="COMMUNITY LEDGER"
        badgeColor="yellow"
        maxWidth="lg"
      >
        {submittedSuccess ? (
          <div className="py-8 text-center space-y-3 font-mono">
            <div className="w-12 h-12 bg-brand-green border-2 border-black rounded-full flex items-center justify-center mx-auto shadow-hard-sm">
              <CheckCircle2 className="w-7 h-7 text-black stroke-[2.5]" />
            </div>
            <h3 className="font-display font-black text-xl text-ink uppercase">
              RATING RECORDED IN PUBLIC LEDGER!
            </h3>
            <p className="text-xs text-gray-700">
              Your feedback has been logged into the VERDICT community ratings storage.
            </p>
          </div>
        ) : (
          <form onSubmit={handleRatingSubmit} className="space-y-4 font-mono text-xs">
            {errorMessage && (
              <div className="bg-brand-red/10 border-2 border-brand-red p-3 flex items-start space-x-2 text-brand-red text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Residency Category */}
            <div className="space-y-1.5">
              <label className="font-bold uppercase text-ink">Constituency Residency:</label>
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
              <label className="font-bold uppercase text-ink">Your Rating (1 to 5 Stars):</label>
              <div className="flex items-center space-x-1 sm:space-x-2 bg-canvas p-3 border-2 border-ink justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelectedStars(star)}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center p-1.5 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                    aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={`w-7 h-7 stroke-[2] ${
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
              <label className="font-bold uppercase text-ink">Primary Evaluation Area:</label>
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
                {isSubmitting ? "LOGGING RATING..." : "SUBMIT CITIZEN RATING"}
              </BrutalistButton>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
