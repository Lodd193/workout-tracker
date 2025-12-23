'use client'

import { useState } from 'react'
import { PersonalRecord } from '@/lib/types'
import { CATEGORY_COLORS } from '@/lib/exercises'

interface PersonalRecordsGridProps {
  records: PersonalRecord[]
}

export default function PersonalRecordsGrid({ records }: PersonalRecordsGridProps) {
  const [sortBy, setSortBy] = useState<'weight' | 'date' | 'name'>('weight')
  const [searchTerm, setSearchTerm] = useState('')

  // Filter and sort records
  const filteredRecords = records
    .filter((record) => record.exercise_name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'weight') return b.max_weight - a.max_weight
      if (sortBy === 'date') return new Date(b.date_achieved).getTime() - new Date(a.date_achieved).getTime()
      return a.exercise_name.localeCompare(b.exercise_name)
    })

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Personal Records</h2>
          <p className="text-slate-400 text-sm mt-1">Your best lifts for each exercise</p>
        </div>

        {/* Search and Sort */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 pl-9
                       text-white text-sm placeholder:text-slate-500
                       focus:outline-none focus:ring-2 focus:ring-emerald-500 w-40"
            />
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Sort Buttons */}
          <div className="flex gap-1 bg-slate-700/30 rounded-lg p-1">
            {[
              { key: 'weight' as const, label: 'Weight' },
              { key: 'date' as const, label: 'Date' },
              { key: 'name' as const, label: 'A-Z' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  sortBy === key ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Records Grid */}
      {filteredRecords.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400">No records found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecords.map((record) => {
            const gradientColor = CATEGORY_COLORS[record.category as keyof typeof CATEGORY_COLORS] || 'from-slate-500 to-slate-600'
            const dateFormatted = new Date(record.date_achieved).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })

            return (
              <div
                key={record.exercise_name}
                className="bg-slate-700/40 border border-slate-600 rounded-xl p-4
                         hover:border-slate-500 transition-all duration-200 group"
              >
                {/* Exercise Name with Category Badge */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-white text-sm flex-1 group-hover:text-emerald-400 transition-colors">
                    {record.exercise_name}
                  </h3>
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${gradientColor} ml-2 mt-1`} />
                </div>

                {/* PR Weight */}
                <div className="mb-3">
                  <div className="text-3xl font-bold text-emerald-400">
                    {record.max_weight} <span className="text-lg text-slate-400">kg</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{record.reps_at_max} reps @ max</div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-600">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {dateFormatted}
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    {record.total_sessions} sessions
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
