'use client'

interface SkeletonProps {
  className?: string
}

/**
 * Base skeleton component with pulsing animation
 */
export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse bg-slate-700/50 rounded ${className}`} />
}

/**
 * Card skeleton with header and content area
 */
export function SkeletonCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-slate-800/60 border border-slate-700 rounded-2xl p-6 backdrop-blur-md animate-pulse ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-slate-700/50 rounded-lg" />
        <div className="flex-1">
          <div className="h-5 bg-slate-700/50 rounded w-2/3 mb-2" />
          <div className="h-3 bg-slate-700/30 rounded w-1/3" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-slate-700/30 rounded" />
        <div className="h-4 bg-slate-700/30 rounded w-5/6" />
        <div className="h-4 bg-slate-700/30 rounded w-4/6" />
      </div>
    </div>
  )
}

/**
 * Text line skeleton
 */
export function SkeletonText({
  width = '100%',
  className = '',
}: { width?: string | number; className?: string }) {
  return (
    <div
      className={`h-4 bg-slate-700/50 rounded animate-pulse ${className}`}
      style={{ width }}
    />
  )
}

/**
 * Avatar/circle skeleton
 */
export function SkeletonAvatar({
  size = 'md',
  className = '',
}: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }

  return (
    <div
      className={`${sizeClasses[size]} bg-slate-700/50 rounded-full animate-pulse ${className}`}
    />
  )
}

/**
 * Button skeleton
 */
export function SkeletonButton({
  size = 'md',
  className = '',
}: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = {
    sm: 'h-8 w-20',
    md: 'h-10 w-28',
    lg: 'h-12 w-36',
  }

  return (
    <div
      className={`${sizeClasses[size]} bg-slate-700/50 rounded-lg animate-pulse ${className}`}
    />
  )
}

/**
 * Chart skeleton (matches existing ChartSkeleton)
 */
export function SkeletonChart({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-slate-800/60 border border-slate-700 rounded-2xl p-6 backdrop-blur-md animate-pulse ${className}`}>
      <div className="h-6 bg-slate-700 rounded w-1/3 mb-4" />
      <div className="h-4 bg-slate-700/50 rounded w-1/2 mb-6" />
      <div className="h-64 bg-slate-700/30 rounded" />
    </div>
  )
}

/**
 * Table skeleton with rows
 */
export function SkeletonTable({
  rows = 5,
  columns = 4,
  className = '',
}: { rows?: number; columns?: number; className?: string }) {
  return (
    <div className={`bg-slate-800/60 border border-slate-700 rounded-2xl p-6 backdrop-blur-md animate-pulse ${className}`}>
      {/* Header row */}
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={`header-${i}`} className="h-4 bg-slate-700/50 rounded" />
        ))}
      </div>
      {/* Data rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div
            key={`row-${rowIdx}`}
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, colIdx) => (
              <div
                key={`cell-${rowIdx}-${colIdx}`}
                className="h-4 bg-slate-700/30 rounded"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Workout card skeleton (for history page)
 */
export function SkeletonWorkoutCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-slate-800/60 border border-slate-700 rounded-2xl p-6 backdrop-blur-md animate-pulse ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-slate-700/50 rounded" />
          <div>
            <div className="h-6 bg-slate-700/50 rounded w-40 mb-2" />
            <div className="h-3 bg-slate-700/30 rounded w-32" />
          </div>
        </div>
        <div className="h-10 w-32 bg-slate-700/50 rounded-lg" />
      </div>
    </div>
  )
}

/**
 * Stats card skeleton
 */
export function SkeletonStats({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-slate-800/60 border border-slate-700 rounded-2xl p-4 backdrop-blur-md animate-pulse ${className}`}>
      <div className="h-3 bg-slate-700/50 rounded w-1/2 mb-3" />
      <div className="h-8 bg-slate-700/50 rounded w-2/3" />
    </div>
  )
}

/**
 * Exercise card skeleton
 */
export function SkeletonExerciseCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-slate-800/60 border border-slate-700 rounded-2xl p-5 backdrop-blur-md animate-pulse ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-700/50 rounded-lg" />
          <div>
            <div className="h-5 bg-slate-700/50 rounded w-32 mb-2" />
            <div className="h-3 bg-slate-700/30 rounded w-20" />
          </div>
        </div>
        <div className="w-8 h-8 bg-slate-700/30 rounded-lg" />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 bg-slate-700/30 rounded w-1/2 mx-auto" />
            <div className="h-16 bg-slate-700/30 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Page loading skeleton (full page placeholder)
 */
export function SkeletonPage({ className = '' }: SkeletonProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4 ${className}`}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center animate-pulse">
          <div className="h-10 bg-slate-700/50 rounded w-64 mx-auto mb-3" />
          <div className="h-4 bg-slate-700/30 rounded w-48 mx-auto" />
        </div>
        {/* Content */}
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  )
}
