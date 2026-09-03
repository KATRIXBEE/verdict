import React from 'react'
import BrutalistButton from '@/components/ui/BrutalistButton'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  subtitle?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({
  icon = '🔍',
  title,
  subtitle,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-10 sm:p-16 text-center bg-canvas border-2 border-dashed border-ink/40 min-h-[200px] space-y-4 font-mono">
      <div className="text-4xl" aria-hidden="true">{icon}</div>
      <div className="font-display font-black text-base uppercase text-ink tracking-wide">
        {title}
      </div>
      {subtitle && (
        <p className="text-xs text-gray-600 max-w-xs leading-relaxed">
          {subtitle}
        </p>
      )}
      {action && (
        <BrutalistButton
          variant="primary"
          size="sm"
          onClick={action.onClick}
          className="mt-2"
        >
          {action.label}
        </BrutalistButton>
      )}
    </div>
  )
}

// Pre-built context-specific empty states
export const EMPTY_STATES = {
  searchNoResults: (query: string, onClear: () => void) => (
    <EmptyState
      icon="🔍"
      title={`No results for "${query}"`}
      subtitle="Try a different name, party, constituency, or state."
      action={{ label: 'CLEAR SEARCH', onClick: onClear }}
    />
  ),

  noPolticianData: () => (
    <EmptyState
      icon="📋"
      title="Data Not Yet Available"
      subtitle="This section is updated periodically from government sources. Check back soon."
    />
  ),

  noCriminalCases: () => (
    <EmptyState
      icon="✅"
      title="No Criminal Cases Declared"
      subtitle="This politician declared no criminal cases in their ECI Form 26 affidavit. Source: Election Commission of India."
    />
  ),

  noGroundTruth: () => (
    <EmptyState
      icon="📰"
      title="No Stories Yet"
      subtitle="Ground Truth stories are updated daily from verified journalism sources. Check back tomorrow."
    />
  ),

  noRatings: () => (
    <EmptyState
      icon="⭐"
      title="No Citizen Ratings Yet"
      subtitle="Be the first to rate this politician. Your rating is recorded in the public ledger."
    />
  ),

  filterNoResults: (onReset: () => void) => (
    <EmptyState
      icon="🏛️"
      title="No Politicians Match These Filters"
      subtitle="Try removing some filters or changing your selection."
      action={{ label: 'RESET ALL FILTERS', onClick: onReset }}
    />
  ),
}
