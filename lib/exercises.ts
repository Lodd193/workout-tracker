import { Exercise, ExerciseCategory } from './types'

// Comprehensive exercise library organized by movement categories
export const EXERCISES: Exercise[] = [
  // CHEST - UPPER
  { id: 'incline-db-press', name: 'Incline Dumbbell Bench Press', category: 'chest_upper', categoryLabel: 'Chest - Upper' },
  { id: 'incline-bb-press', name: 'Incline Barbell Bench Press', category: 'chest_upper', categoryLabel: 'Chest - Upper' },
  { id: 'incline-cable-fly', name: 'Incline Cable Flyes', category: 'chest_upper', categoryLabel: 'Chest - Upper' },
  { id: 'low-to-high-crossover', name: 'Low-to-High Cable Crossovers', category: 'chest_upper', categoryLabel: 'Chest - Upper' },
  { id: 'incline-smith-press', name: 'Incline Smith Machine Press', category: 'chest_upper', categoryLabel: 'Chest - Upper' },

  // CHEST - MID
  { id: 'flat-db-press', name: 'Flat Dumbbell Bench Press', category: 'chest_mid', categoryLabel: 'Chest - Mid' },
  { id: 'flat-bb-press', name: 'Flat Barbell Bench Press', category: 'chest_mid', categoryLabel: 'Chest - Mid' },
  { id: 'machine-chest-press', name: 'Machine Chest Press', category: 'chest_mid', categoryLabel: 'Chest - Mid' },
  { id: 'pec-deck', name: 'Pec Deck Machine', category: 'chest_mid', categoryLabel: 'Chest - Mid' },
  { id: 'cable-crossover-mid', name: 'Cable Crossovers (Mid Height)', category: 'chest_mid', categoryLabel: 'Chest - Mid' },
  { id: 'push-ups', name: 'Push-Ups', category: 'chest_mid', categoryLabel: 'Chest - Mid' },

  // CHEST - LOWER
  { id: 'decline-bb-press', name: 'Decline Barbell Bench Press', category: 'chest_lower', categoryLabel: 'Chest - Lower' },
  { id: 'decline-db-press', name: 'Decline Dumbbell Bench Press', category: 'chest_lower', categoryLabel: 'Chest - Lower' },
  { id: 'high-to-low-crossover', name: 'High-to-Low Cable Crossovers', category: 'chest_lower', categoryLabel: 'Chest - Lower' },
  { id: 'dips-chest', name: 'Dips (Chest Focused)', category: 'chest_lower', categoryLabel: 'Chest - Lower' },

  // BACK - VERTICAL PULL
  { id: 'wide-lat-pulldown', name: 'Wide-Grip Lat Pulldown', category: 'back_vertical', categoryLabel: 'Back - Vertical' },
  { id: 'close-lat-pulldown', name: 'Close-Grip Lat Pulldown', category: 'back_vertical', categoryLabel: 'Back - Vertical' },
  { id: 'pull-ups', name: 'Pull-Ups', category: 'back_vertical', categoryLabel: 'Back - Vertical' },
  { id: 'chin-ups', name: 'Chin-Ups', category: 'back_vertical', categoryLabel: 'Back - Vertical' },
  { id: 'straight-arm-pulldown', name: 'Straight-Arm Pulldown', category: 'back_vertical', categoryLabel: 'Back - Vertical' },

  // BACK - HORIZONTAL PULL
  { id: 'bb-row', name: 'Barbell Row', category: 'back_horizontal', categoryLabel: 'Back - Horizontal' },
  { id: 'db-row', name: 'Dumbbell Row', category: 'back_horizontal', categoryLabel: 'Back - Horizontal' },
  { id: 'chest-supported-row', name: 'Chest-Supported DB Rows', category: 'back_horizontal', categoryLabel: 'Back - Horizontal' },
  { id: 'seated-cable-row', name: 'Seated Cable Row', category: 'back_horizontal', categoryLabel: 'Back - Horizontal' },
  { id: 't-bar-row', name: 'T-Bar Row', category: 'back_horizontal', categoryLabel: 'Back - Horizontal' },
  { id: 'machine-row', name: 'Machine Row', category: 'back_horizontal', categoryLabel: 'Back - Horizontal' },

  // SHOULDERS
  { id: 'ohp-bb', name: 'Overhead Press (Barbell)', category: 'shoulders', categoryLabel: 'Shoulders' },
  { id: 'db-shoulder-press', name: 'Dumbbell Shoulder Press', category: 'shoulders', categoryLabel: 'Shoulders' },
  { id: 'lateral-raise', name: 'Lateral Raises', category: 'shoulders', categoryLabel: 'Shoulders' },
  { id: 'front-raise', name: 'Front Raises', category: 'shoulders', categoryLabel: 'Shoulders' },
  { id: 'reverse-pec-deck', name: 'Reverse Pec Deck', category: 'shoulders', categoryLabel: 'Shoulders' },
  { id: 'face-pull', name: 'Face Pulls', category: 'shoulders', categoryLabel: 'Shoulders' },
  { id: 'arnold-press', name: 'Arnold Press', category: 'shoulders', categoryLabel: 'Shoulders' },
  { id: 'upright-row', name: 'Upright Row', category: 'shoulders', categoryLabel: 'Shoulders' },

  // ARMS - BICEPS
  { id: 'bb-curl', name: 'Barbell Curl', category: 'arms_biceps', categoryLabel: 'Arms - Biceps' },
  { id: 'db-curl', name: 'Dumbbell Curl', category: 'arms_biceps', categoryLabel: 'Arms - Biceps' },
  { id: 'hammer-curl', name: 'Hammer Curl', category: 'arms_biceps', categoryLabel: 'Arms - Biceps' },
  { id: 'preacher-curl', name: 'Preacher Curl', category: 'arms_biceps', categoryLabel: 'Arms - Biceps' },
  { id: 'cable-curl', name: 'Cable Curl', category: 'arms_biceps', categoryLabel: 'Arms - Biceps' },
  { id: 'concentration-curl', name: 'Concentration Curl', category: 'arms_biceps', categoryLabel: 'Arms - Biceps' },

  // ARMS - TRICEPS
  { id: 'tricep-pushdown', name: 'Tricep Pushdown', category: 'arms_triceps', categoryLabel: 'Arms - Triceps' },
  { id: 'overhead-tricep-ext', name: 'Overhead Tricep Extension', category: 'arms_triceps', categoryLabel: 'Arms - Triceps' },
  { id: 'skull-crusher', name: 'Skull Crushers', category: 'arms_triceps', categoryLabel: 'Arms - Triceps' },
  { id: 'close-grip-bench', name: 'Close-Grip Bench Press', category: 'arms_triceps', categoryLabel: 'Arms - Triceps' },
  { id: 'dips-tricep', name: 'Dips (Tricep Focused)', category: 'arms_triceps', categoryLabel: 'Arms - Triceps' },

  // LEGS - QUADS
  { id: 'bb-squat', name: 'Barbell Squat', category: 'legs_quad', categoryLabel: 'Legs - Quads' },
  { id: 'leg-press', name: 'Leg Press', category: 'legs_quad', categoryLabel: 'Legs - Quads' },
  { id: 'quad-extension', name: 'Quad Extension', category: 'legs_quad', categoryLabel: 'Legs - Quads' },
  { id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', category: 'legs_quad', categoryLabel: 'Legs - Quads' },
  { id: 'hack-squat', name: 'Hack Squat', category: 'legs_quad', categoryLabel: 'Legs - Quads' },
  { id: 'front-squat', name: 'Front Squat', category: 'legs_quad', categoryLabel: 'Legs - Quads' },

  // LEGS - HAMSTRINGS
  { id: 'romanian-deadlift', name: 'Romanian Deadlift', category: 'legs_hamstring', categoryLabel: 'Legs - Hamstrings' },
  { id: 'hamstring-curl', name: 'Hamstring Curl', category: 'legs_hamstring', categoryLabel: 'Legs - Hamstrings' },
  { id: 'stiff-leg-deadlift', name: 'Stiff-Leg Deadlift', category: 'legs_hamstring', categoryLabel: 'Legs - Hamstrings' },
  { id: 'nordic-curl', name: 'Nordic Curls', category: 'legs_hamstring', categoryLabel: 'Legs - Hamstrings' },

  // LEGS - GLUTES
  { id: 'hip-thrust', name: 'Hip Thrust', category: 'legs_glutes', categoryLabel: 'Legs - Glutes' },
  { id: 'glute-machine', name: 'Glute Machine', category: 'legs_glutes', categoryLabel: 'Legs - Glutes' },
  { id: 'cable-kickback', name: 'Cable Kickbacks', category: 'legs_glutes', categoryLabel: 'Legs - Glutes' },

  // LEGS - CALVES
  { id: 'standing-calf-raise', name: 'Standing Calf Raise', category: 'legs_calves', categoryLabel: 'Legs - Calves' },
  { id: 'seated-calf-raise', name: 'Seated Calf Raise', category: 'legs_calves', categoryLabel: 'Legs - Calves' },
  { id: 'calf-press', name: 'Calf Press on Leg Press', category: 'legs_calves', categoryLabel: 'Legs - Calves' },

  // CORE
  { id: 'hanging-knee-raise', name: 'Hanging Knee Raises', category: 'core', categoryLabel: 'Core' },
  { id: 'ab-wheel', name: 'Ab Wheel', category: 'core', categoryLabel: 'Core' },
  { id: 'cable-crunch', name: 'Cable Crunches', category: 'core', categoryLabel: 'Core' },
  { id: 'plank', name: 'Plank Variations', category: 'core', categoryLabel: 'Core' },
  { id: 'russian-twist', name: 'Russian Twists', category: 'core', categoryLabel: 'Core' },
]

// Category labels for display
export const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  'chest_upper': 'Chest - Upper',
  'chest_mid': 'Chest - Mid',
  'chest_lower': 'Chest - Lower',
  'back_vertical': 'Back - Vertical',
  'back_horizontal': 'Back - Horizontal',
  'shoulders': 'Shoulders',
  'arms_biceps': 'Arms - Biceps',
  'arms_triceps': 'Arms - Triceps',
  'legs_quad': 'Legs - Quads',
  'legs_hamstring': 'Legs - Hamstrings',
  'legs_glutes': 'Legs - Glutes',
  'legs_calves': 'Legs - Calves',
  'core': 'Core',
  'cardio': 'Cardio',
}

// Category colors for visual identity (Tailwind gradient classes)
export const CATEGORY_COLORS: Record<ExerciseCategory, string> = {
  'chest_upper': 'from-red-500 to-pink-500',
  'chest_mid': 'from-red-600 to-pink-600',
  'chest_lower': 'from-red-700 to-pink-700',
  'back_vertical': 'from-blue-500 to-cyan-500',
  'back_horizontal': 'from-blue-600 to-cyan-600',
  'shoulders': 'from-orange-500 to-amber-500',
  'arms_biceps': 'from-purple-500 to-violet-500',
  'arms_triceps': 'from-purple-600 to-violet-600',
  'legs_quad': 'from-green-500 to-emerald-500',
  'legs_hamstring': 'from-green-600 to-emerald-600',
  'legs_glutes': 'from-green-700 to-emerald-700',
  'legs_calves': 'from-teal-500 to-cyan-500',
  'core': 'from-yellow-500 to-amber-500',
  'cardio': 'from-sky-500 to-indigo-500',
}

// Get all unique categories
export const ALL_CATEGORIES: ExerciseCategory[] = [
  'cardio',
  'chest_upper',
  'chest_mid',
  'chest_lower',
  'back_vertical',
  'back_horizontal',
  'shoulders',
  'arms_biceps',
  'arms_triceps',
  'legs_quad',
  'legs_hamstring',
  'legs_glutes',
  'legs_calves',
  'core',
]

// Utility function to get exercises by category
export const getExercisesByCategory = (category: ExerciseCategory): Exercise[] => {
  return EXERCISES.filter(ex => ex.category === category)
}

// Utility function to search exercises
export const searchExercises = (query: string): Exercise[] => {
  const lowerQuery = query.toLowerCase()
  return EXERCISES.filter(ex => ex.name.toLowerCase().includes(lowerQuery))
}
