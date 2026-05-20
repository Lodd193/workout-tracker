'use client'

import { useState } from 'react'
import { PersonalRecord } from '@/lib/types'
import { CATEGORY_COLORS } from '@/lib/exercises'
import { useSettings } from '@/lib/contexts/SettingsContext'

interface PersonalRecordsGridProps {
  records: PersonalRecord[]
}

export default function PersonalRecordsGrid({ records }: PersonalRecordsGridProps) {
  const { formatWeight } = useSettings()
  const [sortBy, setSortBy] = useState<'weight' | 'date' | 'name'>('weight')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredRecords = records
    .filter((record) => record.exercise_name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'weight') return b.max_weight - a.max_weight
      if (sortBy === 'date') return new Date(b.date_achieved).getTime() - new Date(a.date_achieved).getTime()
      return a.exercise_name.localeCompare(b.exercise_name)
    })

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white">Personal Records</h2>
          <p className="text-zinc-600 text-sm mt-0.5">Best lift per exercise</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#1A1A1A] border border-[#222222] rounded-lg px-3 py-2 pl-9
                         text-white text-sm placeholder:text-zinc-700
                         focus:outline-none focus:border-lime-400 transition-colors w-40"
            />
            <svg
              className="w-4 h-4 text-zinc-600 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex gap-1 bg-[#1A1A1A] rounded-lg p-1">
            {[
              { key: 'weight' as const, label: 'Weight' },
              { key: 'date' as const, label: 'Date' },
              { key: 'name' as const, label: 'A–Z' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                  sortBy === key ? 'bg-lime-400 text-black' : 'text-zinc-500 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-600">No records found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredRecords.map((record) => {
            const gradientColor = CATEGORY_COLORS[record.category as keyof typeof CATEGORY_COLORS] || 'from-zinc-500 to-zinc-600'
            const dateFormatted = new Date(record.date_achieved).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })

            return (
              <div
                key={record.exercise_name}
                className="bg-[#0D0D0D] border border-[#222222] rounded-xl p-4
                           hover:border-[#333333] transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-white text-sm flex-1 group-hover:text-lime-400 transition-colors">
                    {record.exercise_name}
                  </h3>
                  <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${gradientColor} ml-2 mt-1 flex-shrink-0`} />
                </div>

                <div className="mb-3">
                  <div className="text-3xl font-black text-lime-400">
                    {formatWeight(record.max_weight)}
                  </div>
                  <div className="text-xs text-zinc-600 mt-1">{record.reps_at_max} reps at max</div>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-500 pt-3 border-t border-[#222222]">
                  <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {dateFormatted}
                  </div>
                  <div>{record.total_sessions} sessions</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
