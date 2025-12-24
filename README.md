# 📊 IronInsights

**Data-Driven Strength Training Analytics**

A powerful, full-stack fitness analytics platform built with Next.js and Supabase. Leverage advanced analytics, predictive insights, and progressive overload tracking to optimize your strength training and achieve your fitness goals faster.

![IronInsights](https://img.shields.io/badge/Next.js-16.1.0-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Database-green?style=for-the-badge&logo=supabase)

## ✨ Features

### 📱 **Progressive Web App**
- **Install on any device** - Works like a native app
- **Offline support** - Log workouts without internet connection
- **Background sync** - Automatically syncs when connection is restored
- **Fast loading** - Service worker caching for instant access
- **Push notifications ready** - Stay motivated with reminders

### 🔒 **Secure Authentication**
- Email/password authentication via Supabase Auth
- Row Level Security (RLS) for data isolation
- Protected routes with middleware
- Persistent sessions

### 💪 **Workout Tracking**
- Log workouts with date, exercise, weight, and reps
- 70+ exercises across 14 categories:
  - **Cardio** (Bike, Run, Walk, Row) - Duration-based tracking
  - Chest (Upper, Mid, Lower)
  - Back (Vertical, Horizontal)
  - Shoulders
  - Arms (Biceps, Triceps)
  - Legs (Quads, Hamstrings, Glutes, Calves)
  - Core
- Multiple sets per exercise (strength training)
- **Duration tracking for cardio** exercises in minutes
- Quick data entry with bulk fill
- Progressive overload tracking with smart suggestions
- **Delete confirmations** to prevent accidental data loss
- **Time-based personalized greetings** (Good morning/afternoon/evening)
- Real-time workout timer

### 📊 **Analytics & Progress**
- **Personal records (PRs)** displayed with 🏆 badges on exercise cards
- **Exercise history** showing last performance and smart progression suggestions
- **Interactive calendar view** with GitHub-style workout heat map
- **Workout streaks tracker** - current streak, longest streak, and consistency stats
- Weight progression charts with trend analysis
- Volume tracking over time
- 1RM estimation using Epley formula
- Week-over-week performance comparisons
- **Weekly cardio tracker** - Monitor cardio minutes with 150min/week goal
- Weight progression charts with trend analysis
- Volume tracking over time
- 1RM estimation using Epley formula
- Week-over-week performance comparisons
- Average workouts per week calculation

### 📝 **Workout History**
- Complete workout history with dates
- Edit and delete past workouts
- View sets, reps, and weights
- Filter by exercise or date

### ⚙️ **Customization**
- Toggle between kg/lbs units
- Dark mode interface
- **Pre-made workout templates** - PPL, Upper/Lower, Full Body, Bro Split, Starting Strength
- Custom templates (save and reuse your own routines)
- Responsive mobile design
- **Progressive Web App (PWA)** - Install on any device
- **Full offline support** with service worker caching
- Background sync for offline workouts

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
│   │   ├── ExerciseCard.tsx
│   │   ├── CardioInput.tsx          # NEW: Duration input for cardio
│   │   ├── WeeklyCardioTracker.tsx  # NEW: Weekly cardio progress
│   │   ├── WorkoutCalendar.tsx      # Calendar with streaks
│   │   ├── TemplateSelector.tsx     # Pre-made & custom templates
│   │   ├── ConfirmDialog.tsx        # Delete confirmations
│   │   ├── PWAInstaller.tsx         # Service worker registration
│   │   ├── Navigation.tsx
│   │   └── ...
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   ├── history/          # Workout history page
│   ├── progress/         # Analytics page (with calendar & cardio tracker)
│   ├── settings/         # Settings page
│   └── layout.tsx        # Root layout
├── lib/
│   ├── contexts/         # React contexts
│   │   ├── AuthContext.tsx
│   │   └── SettingsContext.tsx
│   ├── api/              # API functions
│   │   └── analytics.ts  # Includes PR tracking, streaks, etc.
│   ├── exercises.ts      # Exercise library (70+ exercises)
│   ├── premadeTemplates.ts  # NEW: Pre-made workout templates
│   ├── supabase.ts       # Supabase client
│   └── types.ts          # TypeScript types
├── public/
│   ├── manifest.json     # PWA manifest
│   ├── sw.js             # Service worker for offline support
│   ├── offline.html      # Offline fallback page
│   └── icon-*.png        # PWA icons
├── database/
│   ├── migration_add_auth.sql
│   └── SETUP_INSTRUCTIONS.md
└── middleware.ts         # Route protection
```

## 🎯 Usage

### Installing as a PWA

1. Open the app in your browser (Chrome, Edge, Safari)
2. Look for the install icon in the address bar
3. Click **"Install"** to add to your home screen/desktop
4. Launch the app anytime - even offline!

### Logging a Workout

#### Strength Training:
1. Select today's date (or any past date)
2. Click **"Add Exercise"**
3. Search or browse for an exercise
4. See your **last performance** and **personal record** for that exercise
5. Use **quick fill** to populate all sets with the same weight/reps
6. Enter weight and reps for each set (or modify individually)
7. Click **"Save Workout"**

#### Cardio:
1. Select a cardio exercise (Bike, Run, Walk, or Row)
2. Enter the total duration in minutes
3. Use quick-add buttons (10, 15, 20, 30, 45, 60 min) for faster entry
4. Click **"Save Workout"**
5. Track your weekly cardio progress toward the 150min goal on the Progress page

### Viewing Progress

- **History**: See all past workouts, edit or delete entries
- **Progress**: View charts, PRs, volume trends, and analytics
  - **Calendar**: Visual heat map of your workout consistency (cardio shown in sky-blue)
  - **Weekly Cardio Tracker**: Monitor cardio minutes with progress bar
  - **Streaks**: Track your current and longest workout streaks
  - **Personal Records**: All-time bests for each exercise
  - **Charts**: Weight progression and volume trends
- **Settings**: Toggle units (kg/lbs), manage account

### Using Templates

#### Pre-Made Templates:
1. Click **"Load Template"** when starting a workout
2. Select the **"Pre-Made"** tab
3. Choose from 11 proven workout routines:
   - **PPL (Push/Pull/Legs)**: Push Day, Pull Day, Legs Day
   - **Upper/Lower**: Upper Day, Lower Day
   - **Full Body Workout**
   - **Bro Split**: Chest, Back, Shoulders, Arms, Legs
   - **Starting Strength**
4. Template loads all exercises - edit as needed

#### Custom Templates:
1. Create a workout with your favorite exercises
2. Click **"Save as Template"**
3. Load from the **"Custom"** tab for future workouts

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
