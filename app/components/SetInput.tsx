import { SetData } from '@/lib/types'

interface SetInputProps {
  setNumber: number
  setData: SetData
  onWeightChange: (value: string) => void
  onRepsChange: (value: string) => void
}

export default function SetInput({ setNumber, setData, onWeightChange, onRepsChange }: SetInputProps) {
  return (
    <div className="space-y-2">
      <div className="text-xs text-slate-500 font-medium text-center uppercase tracking-wide">
        Set {setNumber}
      </div>
      <input
        type="number"
        placeholder="kg"
        value={setData.weight}
        onChange={(e) => onWeightChange(e.target.value)}
        className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-2 py-2.5
                   text-white text-center text-sm font-medium
                   focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                   placeholder:text-slate-600 transition-all duration-200
                   hover:border-slate-500 focus:scale-105"
      />
      <input
        type="number"
        placeholder="reps"
        value={setData.reps}
        onChange={(e) => onRepsChange(e.target.value)}
        className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-2 py-2.5
                   text-white text-center text-sm font-medium
                   focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                   placeholder:text-slate-600 transition-all duration-200
                   hover:border-slate-500 focus:scale-105"
      />
    </div>
  )
}
