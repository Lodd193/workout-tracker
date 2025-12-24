'use client'

interface CardioInputProps {
  duration: number
  onDurationChange: (duration: number) => void
}

export default function CardioInput({ duration, onDurationChange }: CardioInputProps) {
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
      <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide mb-2">
        Duration
      </label>
      <div className="flex items-center gap-3">
        <input
          type="number"
          min="0"
          value={duration || ''}
          onChange={(e) => onDurationChange(parseInt(e.target.value) || 0)}
          placeholder="0"
          className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
        />
        <span className="text-slate-400 font-medium">minutes</span>
      </div>

      {/* Quick add buttons */}
      <div className="flex gap-2 mt-3">
        {[10, 15, 20, 30, 45, 60].map((mins) => (
          <button
            key={mins}
            type="button"
            onClick={() => onDurationChange(mins)}
            className="flex-1 px-2 py-1.5 rounded-lg text-xs font-medium bg-sky-500/10 border border-sky-500/30 text-sky-400 hover:bg-sky-500/20 hover:text-sky-300 transition-all"
          >
            {mins}m
          </button>
        ))}
      </div>
    </div>
  )
}
