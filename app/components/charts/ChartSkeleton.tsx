export default function ChartSkeleton() {
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 backdrop-blur-md animate-pulse">
      <div className="h-6 bg-slate-700 rounded w-1/3 mb-4" />
      <div className="h-4 bg-slate-700/50 rounded w-1/2 mb-6" />
      <div className="h-64 bg-slate-700/30 rounded" />
    </div>
  )
}
