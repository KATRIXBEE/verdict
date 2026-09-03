import { SkeletonGrid } from '@/components/ui/SkeletonCard'

export default function Loading() {
  return (
    <div className="space-y-10 sm:space-y-14 font-mono">
      {/* Hero skeleton */}
      <div className="border-3 border-ink bg-surface shadow-hard-xl p-6 sm:p-10 lg:p-12">
        <div className="max-w-4xl mx-auto space-y-4">
          <style>{`
            @keyframes verdictShimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
            .skeleton-line {
              background: linear-gradient(90deg, #DEDAD4 25%, #EBE8E1 50%, #DEDAD4 75%);
              background-size: 200% 100%;
              animation: verdictShimmer 1.5s infinite;
            }
          `}</style>
          <div className="skeleton-line h-6 w-48 mx-auto" />
          <div className="skeleton-line h-12 w-3/4 mx-auto" />
          <div className="skeleton-line h-5 w-1/2 mx-auto" />
          <div className="skeleton-line h-14 w-full" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-surface border-3 border-ink p-5 shadow-hard-md">
            <div className="skeleton-line h-3 w-2/3 mb-3" />
            <div className="skeleton-line h-10 w-1/2 mb-2" />
            <div className="skeleton-line h-3 w-full" />
          </div>
        ))}
      </div>

      {/* Grid skeleton */}
      <SkeletonGrid count={9} />
    </div>
  )
}
