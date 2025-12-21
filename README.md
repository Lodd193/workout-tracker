# Workout Tracker

Web-app workout tracker for personal use. Track your weightlifting workouts with specific exercises, sets, weights, and reps.

## Features

- Track three workout types: Upper Hypertrophy, Upper Strength, and Lower Body
- Log up to 4 sets per exercise with weight (kg) and reps
- Data stored in Supabase database
- Modern dark-themed UI with Tailwind CSS
- Mobile-friendly responsive design

## Tech Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase
- **Deployment**: Vercel

## Getting Started

First, install dependencies:

\`\`\`bash
npm install
\`\`\`

Create a \`.env.local\` file with your Supabase credentials:

\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

Run the development server:

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

## Deploy on Vercel

The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new):

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables (Supabase URL and key)
4. Deploy

## Database Setup

Create a \`workout_logs\` table in Supabase with the following schema:

\`\`\`sql
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
\`\`\`
