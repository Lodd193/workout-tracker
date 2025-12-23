import { SelectedExercise } from '@/lib/types'
import { CATEGORY_COLORS } from '@/lib/exercises'
import SetInput from './SetInput'

interface ExerciseCardProps {
  exercise: SelectedExercise
  index: number
  onRemove: () => void
  onUpdateSet: (setIndex: number, field: 'weight' | 'reps', value: string) => void
}

export default function ExerciseCard({ exercise, index, onRemove, onUpdateSet }: ExerciseCardProps) {
  const gradientColor = CATEGORY_COLORS[exercise.category]

  return (
    <div
      className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5
                 backdrop-blur-md transition-all duration-300 hover:border-slate-600
                 shadow-lg hover:shadow-xl animate-slideIn"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span
            className={`w-10 h-10 bg-gradient-to-br ${gradientColor} rounded-lg
                       flex items-center justify-center text-sm font-bold text-white
                       shadow-lg`}
          >
            {index + 1}
          </span>
          <div>
            <h3 className="font-semibold text-white text-lg">{exercise.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{exercise.category.replace(/_/g, ' ')}</p>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20
                     text-red-400 hover:text-red-300 transition-all duration-200
                     flex items-center justify-center group"
          aria-label="Remove exercise"
        >
          <svg
            className="w-5 h-5 group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Sets Grid */}
      <div className="grid grid-cols-4 gap-3">
        {exercise.sets.map((set, setIndex) => (
          <SetInput
            key={setIndex}
            setNumber={setIndex + 1}
            setData={set}
            onWeightChange={(value) => onUpdateSet(setIndex, 'weight', value)}
            onRepsChange={(value) => onUpdateSet(setIndex, 'reps', value)}
          />
        ))}
      </div>
    </div>
  )
}
