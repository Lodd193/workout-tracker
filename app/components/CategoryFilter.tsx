import { ExerciseCategory } from '@/lib/types'
import { ALL_CATEGORIES, CATEGORY_LABELS } from '@/lib/exercises'

interface CategoryFilterProps {
  selectedCategory: ExerciseCategory | 'all'
  onSelectCategory: (category: ExerciseCategory | 'all') => void
}

export default function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  const categories = ['all', ...ALL_CATEGORIES] as const

  return (
    <div className="flex flex-wrap gap-3">
      {categories.map((category) => {
        const isActive = selectedCategory === category
        const label = category === 'all' ? 'All' : CATEGORY_LABELS[category as ExerciseCategory]

        return (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`px-5 py-3 rounded-lg text-base font-semibold transition-all duration-200
                       ${
                         isActive
                           ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                           : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white'
                       }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
