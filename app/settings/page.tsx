'use client'

import { useSettings } from '@/lib/contexts/SettingsContext'

export default function SettingsPage() {
  const { weightUnit, toggleWeightUnit } = useSettings()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
            Settings
          </h1>
          <p className="text-slate-400 mt-2">Customize your workout tracking experience</p>
        </div>

        {/* Settings Cards */}
        <div className="space-y-4">
          {/* Weight Unit Toggle */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 backdrop-blur-md hover:border-slate-600 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Weight Unit</h3>
                  <p className="text-sm text-slate-400 mt-0.5">Choose between kilograms and pounds</p>
                </div>
              </div>
              <button
                onClick={toggleWeightUnit}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                  weightUnit === 'kg' ? 'bg-emerald-500' : 'bg-cyan-500'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    weightUnit === 'kg' ? 'translate-x-1' : 'translate-x-9'
                  }`}
                />
                <span className="absolute inset-0 flex items-center justify-between px-2 text-xs font-bold text-white pointer-events-none">
                  <span className={weightUnit === 'kg' ? 'opacity-100' : 'opacity-0'}>kg</span>
                  <span className={weightUnit === 'lbs' ? 'opacity-100' : 'opacity-0'}>lbs</span>
                </span>
              </button>
            </div>
            <div className="mt-4 bg-slate-700/30 rounded-lg p-3">
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-white">Current setting:</span>{' '}
                {weightUnit === 'kg' ? 'Kilograms (kg)' : 'Pounds (lbs)'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Example: 100kg = {weightUnit === 'kg' ? '100kg' : '220.5lbs'}
              </p>
            </div>
          </div>


          {/* Info Card */}
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-cyan-400 mb-1">Settings are saved automatically</h4>
                <p className="text-sm text-slate-300">
                  Your preferences are stored in your browser and will be remembered on your next visit. These settings
                  apply to all your workouts and analytics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
