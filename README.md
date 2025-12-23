# Workout Tracker

A comprehensive web app for tracking your weightlifting workouts and visualizing your progress over time.

## Features

### Workout Logging
- **Dynamic Exercise Selection**: Choose from 70+ exercises organized by movement categories
- **Flexible Workouts**: Build custom workouts by adding any exercises you want
- **Detailed Tracking**: Log weight (kg) and reps for up to 4 sets per exercise
- **Exercise Categories**: Chest (Upper/Mid/Lower), Back (Vertical/Horizontal), Shoulders, Arms, Legs, Core
- **Search & Filter**: Find exercises quickly with search and category filtering

### Progress Analytics
- **Weight Progression Charts**: Visualize strength gains over time for each exercise with interactive line charts
- **Personal Records**: Track your best lifts with max weight, reps, and date achieved
- **Workout Frequency Heatmap**: GitHub-style calendar showing your training consistency over 12 months
- **Summary Statistics**:
  - Total workouts and sets
  - Unique exercises performed
  - Current and longest workout streaks
  - Average workouts per week

### User Experience
- **Modern Dark Theme**: Professional glassmorphism design with emerald/cyan accents
- **Smooth Animations**: Polished interactions and transitions
- **Mobile Responsive**: Works seamlessly on all devices
- **Navigation**: Easy switching between Log Workout and Progress pages
- **Loading States**: Skeleton loaders and empty states for better UX

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Lodd193/workout-tracker.git
cd workout-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with your Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) to see the app.

## Database Setup

Create a `workout_logs` table in Supabase with the following schema:

```sql
CREATE TABLE workout_logs (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  workout_type TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  set_number INTEGER NOT NULL,
  weight_kg DECIMAL NOT NULL,
  reps INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Optional: Add indexes for better query performance
CREATE INDEX idx_workout_logs_date ON workout_logs(date DESC);
CREATE INDEX idx_workout_logs_exercise ON workout_logs(exercise_name);
```

## Deploy on Vercel

The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new):

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

Vercel will automatically deploy updates when you push to the main branch.

## Project Structure

```
workout-tracker/
├── app/
│   ├── components/
│   │   ├── Navigation.tsx           # Navigation bar
│   │   ├── WorkoutForm.tsx          # Workout logging form
│   │   ├── ExerciseCard.tsx         # Exercise display component
│   │   ├── ExerciseSelector.tsx     # Modal for selecting exercises
│   │   └── charts/                  # Progress tracking charts
│   │       ├── WeightProgressionChart.tsx
│   │       ├── PersonalRecordsGrid.tsx
│   │       └── WorkoutFrequencyHeatmap.tsx
│   ├── progress/
│   │   └── page.tsx                 # Progress analytics page
│   ├── page.tsx                     # Home page (workout logging)
│   └── layout.tsx                   # Root layout
├── lib/
│   ├── api/
│   │   └── analytics.ts             # Data fetching & processing
│   ├── exercises.ts                 # Exercise library (70+ exercises)
│   ├── types.ts                     # TypeScript type definitions
│   └── supabase.ts                  # Supabase client
└── package.json
```

## Screenshots

### Workout Logging
- Dynamic exercise selection from 70+ exercises
- Category-based organization
- Real-time search and filtering

### Progress Tracking
- Interactive weight progression charts
- Personal records grid with search/sort
- 12-month workout frequency heatmap
- Summary statistics with streak tracking

## License

MIT

## Acknowledgments

Built with [Next.js](https://nextjs.org/), [Supabase](https://supabase.com/), and [Recharts](https://recharts.org/).
