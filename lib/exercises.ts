export const workoutTypes = [
  { value: 'upper_hypertrophy', label: 'Upper Hypertrophy' },
  { value: 'upper_strength', label: 'Upper Strength' },
  { value: 'lower_body', label: 'Lower Body' },
] as const

export const exercisesByWorkout: Record<string, string[]> = {
  upper_hypertrophy: [
    'Incline DB Bench Press',
    'Incline Cable Crossovers',
    'Wide-Grip Lat Pulldown',
    'Chest-Supported DB Rows',
    'Hanging Knee Raises',
  ],
  upper_strength: [
    'Flat Barbell Bench Press',
    'Barbell Row',
    'Overhead Press',
    'Lat Pulldown',
    'Pec Deck Machine',
  ],
  lower_body: [
    'Squat / Leg Press',
    'Romanian Deadlift',
    'Hamstring Curl',
    'Quad Extension',
    'Glute Machine',
    'Calf Raises',
  ],
}
