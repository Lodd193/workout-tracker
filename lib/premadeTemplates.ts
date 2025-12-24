import { WorkoutTemplate } from './types'

export const PREMADE_TEMPLATES: WorkoutTemplate[] = [
  // ============ PPL (Push/Pull/Legs) ============
  {
    id: 'ppl-push',
    name: 'PPL - Push Day',
    exercises: [
      { exerciseId: 'flat-bb-press', name: 'Flat Barbell Bench Press', category: 'chest_mid' },
      { exerciseId: 'incline-db-press', name: 'Incline Dumbbell Bench Press', category: 'chest_upper' },
      { exerciseId: 'ohp-bb', name: 'Overhead Press (Barbell)', category: 'shoulders' },
      { exerciseId: 'lateral-raise', name: 'Lateral Raises', category: 'shoulders' },
      { exerciseId: 'tricep-pushdown', name: 'Tricep Pushdowns', category: 'arms_triceps' },
      { exerciseId: 'overhead-tricep-ext', name: 'Overhead Tricep Extension', category: 'arms_triceps' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ppl-pull',
    name: 'PPL - Pull Day',
    exercises: [
      { exerciseId: 'pull-ups', name: 'Pull-Ups', category: 'back_vertical' },
      { exerciseId: 'bb-row', name: 'Barbell Row', category: 'back_horizontal' },
      { exerciseId: 'wide-lat-pulldown', name: 'Wide-Grip Lat Pulldown', category: 'back_vertical' },
      { exerciseId: 'face-pull', name: 'Face Pulls', category: 'shoulders' },
      { exerciseId: 'bb-curl', name: 'Barbell Curl', category: 'arms_biceps' },
      { exerciseId: 'hammer-curl', name: 'Hammer Curls', category: 'arms_biceps' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ppl-legs',
    name: 'PPL - Leg Day',
    exercises: [
      { exerciseId: 'back-squat', name: 'Back Squat', category: 'legs_quad' },
      { exerciseId: 'romanian-deadlift', name: 'Romanian Deadlift', category: 'legs_hamstring' },
      { exerciseId: 'leg-press', name: 'Leg Press', category: 'legs_quad' },
      { exerciseId: 'hamstring-curl', name: 'Hamstring Curl', category: 'legs_hamstring' },
      { exerciseId: 'standing-calf-raise', name: 'Standing Calf Raise', category: 'legs_calves' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // ============ UPPER/LOWER ============
  {
    id: 'upper-lower-upper',
    name: 'Upper/Lower - Upper Day',
    exercises: [
      { exerciseId: 'flat-bb-press', name: 'Flat Barbell Bench Press', category: 'chest_mid' },
      { exerciseId: 'bb-row', name: 'Barbell Row', category: 'back_horizontal' },
      { exerciseId: 'db-shoulder-press', name: 'Dumbbell Shoulder Press', category: 'shoulders' },
      { exerciseId: 'wide-lat-pulldown', name: 'Wide-Grip Lat Pulldown', category: 'back_vertical' },
      { exerciseId: 'lateral-raise', name: 'Lateral Raises', category: 'shoulders' },
      { exerciseId: 'bb-curl', name: 'Barbell Curl', category: 'arms_biceps' },
      { exerciseId: 'tricep-pushdown', name: 'Tricep Pushdowns', category: 'arms_triceps' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'upper-lower-lower',
    name: 'Upper/Lower - Lower Day',
    exercises: [
      { exerciseId: 'back-squat', name: 'Back Squat', category: 'legs_quad' },
      { exerciseId: 'romanian-deadlift', name: 'Romanian Deadlift', category: 'legs_hamstring' },
      { exerciseId: 'leg-press', name: 'Leg Press', category: 'legs_quad' },
      { exerciseId: 'hamstring-curl', name: 'Hamstring Curl', category: 'legs_hamstring' },
      { exerciseId: 'hip-thrust', name: 'Hip Thrust', category: 'legs_glutes' },
      { exerciseId: 'standing-calf-raise', name: 'Standing Calf Raise', category: 'legs_calves' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // ============ FULL BODY ============
  {
    id: 'full-body',
    name: 'Full Body Workout',
    exercises: [
      { exerciseId: 'back-squat', name: 'Back Squat', category: 'legs_quad' },
      { exerciseId: 'flat-bb-press', name: 'Flat Barbell Bench Press', category: 'chest_mid' },
      { exerciseId: 'pull-ups', name: 'Pull-Ups', category: 'back_vertical' },
      { exerciseId: 'ohp-bb', name: 'Overhead Press (Barbell)', category: 'shoulders' },
      { exerciseId: 'romanian-deadlift', name: 'Romanian Deadlift', category: 'legs_hamstring' },
      { exerciseId: 'bb-curl', name: 'Barbell Curl', category: 'arms_biceps' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // ============ BRO SPLIT ============
  {
    id: 'bro-chest',
    name: 'Bro Split - Chest Day',
    exercises: [
      { exerciseId: 'flat-bb-press', name: 'Flat Barbell Bench Press', category: 'chest_mid' },
      { exerciseId: 'incline-db-press', name: 'Incline Dumbbell Bench Press', category: 'chest_upper' },
      { exerciseId: 'decline-bb-press', name: 'Decline Barbell Bench Press', category: 'chest_lower' },
      { exerciseId: 'cable-crossover-mid', name: 'Cable Crossovers (Mid Height)', category: 'chest_mid' },
      { exerciseId: 'dips-chest', name: 'Dips (Chest Focused)', category: 'chest_lower' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bro-back',
    name: 'Bro Split - Back Day',
    exercises: [
      { exerciseId: 'pull-ups', name: 'Pull-Ups', category: 'back_vertical' },
      { exerciseId: 'bb-row', name: 'Barbell Row', category: 'back_horizontal' },
      { exerciseId: 'wide-lat-pulldown', name: 'Wide-Grip Lat Pulldown', category: 'back_vertical' },
      { exerciseId: 'seated-cable-row', name: 'Seated Cable Row', category: 'back_horizontal' },
      { exerciseId: 'straight-arm-pulldown', name: 'Straight-Arm Pulldown', category: 'back_vertical' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bro-shoulders',
    name: 'Bro Split - Shoulder Day',
    exercises: [
      { exerciseId: 'ohp-bb', name: 'Overhead Press (Barbell)', category: 'shoulders' },
      { exerciseId: 'lateral-raise', name: 'Lateral Raises', category: 'shoulders' },
      { exerciseId: 'front-raise', name: 'Front Raises', category: 'shoulders' },
      { exerciseId: 'reverse-pec-deck', name: 'Reverse Pec Deck', category: 'shoulders' },
      { exerciseId: 'face-pull', name: 'Face Pulls', category: 'shoulders' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bro-arms',
    name: 'Bro Split - Arm Day',
    exercises: [
      { exerciseId: 'bb-curl', name: 'Barbell Curl', category: 'arms_biceps' },
      { exerciseId: 'tricep-pushdown', name: 'Tricep Pushdowns', category: 'arms_triceps' },
      { exerciseId: 'hammer-curl', name: 'Hammer Curls', category: 'arms_biceps' },
      { exerciseId: 'overhead-tricep-ext', name: 'Overhead Tricep Extension', category: 'arms_triceps' },
      { exerciseId: 'preacher-curl', name: 'Preacher Curls', category: 'arms_biceps' },
      { exerciseId: 'dips-triceps', name: 'Dips (Tricep Focused)', category: 'arms_triceps' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bro-legs',
    name: 'Bro Split - Leg Day',
    exercises: [
      { exerciseId: 'back-squat', name: 'Back Squat', category: 'legs_quad' },
      { exerciseId: 'leg-press', name: 'Leg Press', category: 'legs_quad' },
      { exerciseId: 'romanian-deadlift', name: 'Romanian Deadlift', category: 'legs_hamstring' },
      { exerciseId: 'hamstring-curl', name: 'Hamstring Curl', category: 'legs_hamstring' },
      { exerciseId: 'hip-thrust', name: 'Hip Thrust', category: 'legs_glutes' },
      { exerciseId: 'standing-calf-raise', name: 'Standing Calf Raise', category: 'legs_calves' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // ============ STARTING STRENGTH ============
  {
    id: 'starting-strength',
    name: 'Starting Strength - Day A/B',
    exercises: [
      { exerciseId: 'back-squat', name: 'Back Squat', category: 'legs_quad' },
      { exerciseId: 'flat-bb-press', name: 'Flat Barbell Bench Press', category: 'chest_mid' },
      { exerciseId: 'romanian-deadlift', name: 'Romanian Deadlift', category: 'legs_hamstring' },
      { exerciseId: 'bb-row', name: 'Barbell Row', category: 'back_horizontal' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]
