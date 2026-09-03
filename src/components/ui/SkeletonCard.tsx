'use client'

export function SkeletonCard() {
  return (
    <div
      className="bg-surface border-3 border-ink shadow-hard-md overflow-hidden"
      style={{ animation: 'verdictPulse 1.5s ease-in-out infinite' }}
    >
      <style>{`
        @keyframes verdictPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }
        @keyframes verdictShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .skeleton-line {
          background: linear-gradient(
            90deg,
            #DEDAD4 25%,
            #EBE8E1 50%,
            #DEDAD4 75%
          );
          background-size: 200% 100%;
          animation: verdictShimmer 1.5s infinite;
        }
      `}</style>

      {/* Top bar */}
      <div className="skeleton-line h-7 w-full" />

      <div className="p-4 space-y-4">
        {/* Photo + name row */}
        <div className="flex items-start space-x-3">
          <div className="skeleton-line w-16 h-20 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton-line h-5 w-3/4" />
            <div className="skeleton-line h-4 w-1/2" />
            <div className="skeleton-line h-3 w-2/3" />
          </div>
        </div>

        {/* Score row */}
        <div className="skeleton-line h-14 w-full" />

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="skeleton-line h-10" />
          <div className="skeleton-line h-10" />
        </div>

        {/* Education row */}
        <div className="skeleton-line h-4 w-1/3" />
      </div>

      {/* Footer button */}
      <div className="p-3 border-t-2 border-ink">
        <div className="skeleton-line h-9 w-full" />
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonProfile() {
  return (
    <div className="space-y-8 font-mono">
      <style>{`
        @keyframes verdictShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .skeleton-line {
          background: linear-gradient(
            90deg,
            #DEDAD4 25%, #EBE8E1 50%, #DEDAD4 75%
          );
          background-size: 200% 100%;
          animation: verdictShimmer 1.5s infinite;
        }
      `}</style>

      {/* Breadcrumb */}
      <div className="bg-surface border-2.5 border-ink p-3 shadow-hard-sm">
        <div className="skeleton-line h-4 w-48" />
      </div>

      {/* Profile header card */}
      <div className="bg-surface border-3 border-ink p-6 shadow-hard-lg space-y-4">
        <div className="flex items-start gap-6">
          <div className="skeleton-line w-36 h-44 shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="skeleton-line h-8 w-3/5" />
            <div className="skeleton-line h-5 w-2/5" />
            <div className="skeleton-line h-4 w-1/2" />
            <div className="skeleton-line h-4 w-2/5" />
            <div className="flex gap-3 pt-2">
              <div className="skeleton-line h-10 w-28" />
              <div className="skeleton-line h-10 w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Score + stats grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-surface border-3 border-ink p-6 shadow-hard-md space-y-3">
          <div className="skeleton-line h-4 w-1/3" />
          <div className="skeleton-line h-14 w-1/4" />
          <div className="skeleton-line h-3 w-4/5" />
        </div>
        <div className="lg:col-span-5 bg-surface border-3 border-ink p-6 shadow-hard-md space-y-3">
          <div className="skeleton-line h-4 w-1/2" />
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton-line h-10 w-full" />
          ))}
        </div>
      </div>

      {/* Two-col content cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-surface border-3 border-ink p-5 shadow-hard-sm space-y-2">
            <div className="skeleton-line h-4 w-2/5" />
            <div className="skeleton-line h-6 w-3/5" />
            <div className="skeleton-line h-3 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  )
}
