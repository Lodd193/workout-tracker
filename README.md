# 🏋️ Workout Tracker

A modern, full-stack workout tracking application built with Next.js and Supabase. Track your exercises, monitor progress, and achieve your fitness goals with a beautiful, responsive interface.

![Workout Tracker](https://img.shields.io/badge/Next.js-16.1.0-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Database-green?style=for-the-badge&logo=supabase)

## ✨ Features

### 🔒 **Secure Authentication**
- Email/password authentication via Supabase Auth
- Row Level Security (RLS) for data isolation
- Protected routes with middleware
- Persistent sessions

### 💪 **Workout Tracking**
- Log workouts with date, exercise, weight, and reps
- 70+ exercises across 13 categories:
  - Chest (Upper, Mid, Lower)
  - Back (Vertical, Horizontal)
  - Shoulders
  - Arms (Biceps, Triceps)
  - Legs (Quads, Hamstrings, Glutes, Calves)
  - Core
- Multiple sets per exercise
- Quick data entry with bulk fill
- Progressive overload tracking

### 📊 **Analytics & Progress**
- Personal records (PRs) for each exercise
- Weight progression charts
- Volume tracking over time
- 1RM estimation using Epley formula
- Workout frequency heatmap
- Week-over-week comparisons
- Current and longest workout streaks

### 📝 **Workout History**
- Complete workout history with dates
- Edit and delete past workouts
- View sets, reps, and weights
- Filter by exercise or date

### ⚙️ **Customization**
- Toggle between kg/lbs units
- Dark mode interface
- Workout templates (save and reuse)
- Responsive mobile design

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (recommended)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account ([sign up free](https://supabase.com))

### 1. Clone the Repository

```bash
git clone https://github.com/Lodd193/workout-tracker.git
cd workout-tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Table Editor** and create the `workout_logs` table:

```sql
CREATE TABLE workout_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  workout_type TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  set_number INTEGER NOT NULL,
  weight_kg NUMERIC NOT NULL,
  reps INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX workout_logs_user_id_idx ON workout_logs(user_id);
CREATE INDEX workout_logs_date_idx ON workout_logs(date);
```

3. **Enable Row Level Security:**

Run the migration SQL from `database/migration_add_auth.sql` in the Supabase SQL Editor.

This will:
- Enable RLS on `workout_logs`
- Create policies to isolate user data
- Ensure users can only access their own workouts

### 4. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Get your Supabase credentials:
   - Go to **Supabase Dashboard** → **Settings** → **API**
   - Copy **Project URL** and **anon/public key**

3. Update `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Create Your Account

1. Visit the app (you'll be redirected to `/login`)
2. Click **"Sign up"**
3. Enter your email and password
4. You're ready to start tracking workouts! 🎉

## 📖 Detailed Setup Guide

For step-by-step authentication setup instructions, see:
- **[database/SETUP_INSTRUCTIONS.md](database/SETUP_INSTRUCTIONS.md)**

This includes:
- Database migration steps
- Email confirmation settings
- Testing authentication
- Troubleshooting tips

## 🏗️ Project Structure

```
workout-tracker/
├── app/
│   ├── components/        # React components
│   │   ├── WorkoutForm.tsx
│   │   ├── ExerciseSelector.tsx
│   │   ├── Navigation.tsx
│   │   └── ...
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   ├── history/          # Workout history page
│   ├── progress/         # Analytics page
│   ├── settings/         # Settings page
│   └── layout.tsx        # Root layout
├── lib/
│   ├── contexts/         # React contexts
│   │   ├── AuthContext.tsx
│   │   └── SettingsContext.tsx
│   ├── api/              # API functions
│   │   └── analytics.ts
│   ├── exercises.ts      # Exercise library
│   ├── supabase.ts       # Supabase client
│   └── types.ts          # TypeScript types
├── database/
│   ├── migration_add_auth.sql
│   └── SETUP_INSTRUCTIONS.md
└── middleware.ts         # Route protection
```

## 🎯 Usage

### Logging a Workout

1. Select today's date (or any past date)
2. Click **"Add Exercise"**
3. Search or browse for an exercise
4. Enter weight and reps for each set
5. Click **"Save Workout"**

### Viewing Progress

- **History**: See all past workouts, edit or delete entries
- **Progress**: View charts, PRs, volume trends, and analytics
- **Settings**: Toggle units (kg/lbs)

### Using Templates

1. Create a workout with your favorite exercises
2. Click **"Save as Template"**
3. Load templates for future workouts with one click

## 🔐 Security

- **Row Level Security (RLS)**: Database enforces user data isolation
- **Protected Routes**: Unauthenticated users can't access the app
- **Secure Sessions**: Supabase handles authentication securely
- **Environment Variables**: Sensitive keys stored in `.env.local` (not committed)

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Click **"New Project"**
4. Import your GitHub repository
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click **"Deploy"**

Your app will be live in minutes! 🎉

### Other Platforms

The app works on any platform that supports Next.js:
- Netlify
- Railway
- Render
- Self-hosted

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 💪 Built With

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a service
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## 🙏 Acknowledgments

Built with assistance from Claude Code - Anthropic's official CLI for Claude.

---

**Start tracking your fitness journey today!** 🏋️‍♂️💪
