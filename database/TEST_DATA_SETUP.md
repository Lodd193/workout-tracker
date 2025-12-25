# Setting Up Test Data for Gym Bestie

## Quick Start Guide

Follow these steps to create a test account with 3 months of realistic workout data.

---

## Step 1: Create Test User Account

1. Open your deployed Gym Bestie app
2. Click "Sign Up"
3. Create account with:
   - **Email:** `testuser@example.com`
   - **Password:** `TestPassword123!`
4. Verify email if required
5. Log in

---

## Step 2: Get User ID

### Option A: From Supabase Dashboard (Easiest)
1. Go to Supabase Dashboard → Authentication → Users
2. Find the test user (`testuser@example.com`)
3. Copy the UUID (looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

### Option B: From Browser Console
1. Log into the app as test user
2. Open browser console (F12)
3. Run: `supabase.auth.getUser().then(({data}) => console.log(data.user.id))`
4. Copy the UUID from console output

---

## Step 3: Clean Up Existing Data (Optional but Recommended)

If you've already tried running the seed script or have existing workout data:

1. Open `database/cleanup_test_user.sql` in a text editor
2. **Find & Replace**:
   - Find: `YOUR_USER_ID_HERE`
   - Replace with your actual UUID (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
3. Copy the entire contents
4. Go to **Supabase Dashboard** → **SQL Editor** → **New Query**
5. Paste and **Run**
6. Should show: `remaining_logs: 0, remaining_templates: 0, remaining_goals: 0`

---

## Step 4: Fix Database Constraint

The database needs to accept all valid exercise categories:

1. Go to **Supabase Dashboard** → **SQL Editor** → **New Query**
2. Copy the entire contents of `database/fix_workout_type_constraint.sql`
3. Paste and **Run**
4. You should see: `ALTER TABLE` and constraint definition

---

## Step 5: Load Test Data

1. Open `database/seed_test_data.sql` in a text editor
2. **Find & Replace**:
   - Find: `YOUR_USER_ID_HERE`
   - Replace with your actual UUID (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
   - Click "Replace All"
3. Copy the entire updated contents
4. Go to **Supabase Dashboard** → **SQL Editor** → **New Query**
5. Paste and **Run**
6. Wait for execution (should take 5-10 seconds)

---

## Step 6: Verify Data

You should see output like:
```
Data seeding complete!
total_workout_logs: 150+
total_templates: 4
total_goals: 3
```

And progression tables showing:
- Bench Press: 80kg → 105kg over 12 weeks
- Squat: 100kg → 147.5kg over 12 weeks

---

## Step 7: Explore the App

Log in as the test user and explore:

### Dashboard (Home Page)
- ✅ Recent workouts visible
- ✅ Exercise cards populated

### History Page
- ✅ 3 months of workout history
- ✅ Multiple exercises per day
- ✅ Date range filtering works

### Progress Page
- ✅ Charts showing progression
- ✅ Weight increases over time
- ✅ Volume trends
- ✅ Personal records displayed

### Settings Page
- ✅ 3 active goals
- ✅ Goal progress tracking
- ✅ Templates loaded

### Templates
- ✅ 4 custom templates (Push, Pull, Legs, Upper)
- ✅ Load any template to start workout

---

## What Test Data Includes

### 📊 Workout Logs (150+ entries)
- **12 weeks** of progressive overload training
- **Push/Pull/Legs** split (6 days per week)
- **Realistic progression:**
  - Bench Press: 80kg → 105kg (+25kg in 3 months)
  - Squat: 100kg → 147.5kg (+47.5kg in 3 months)
  - Romanian Deadlift: 80kg → 100kg
- **Deload weeks** (Week 4 and Week 8)
- **Variety:** 15+ different exercises
- **Cardio sessions** mixed in
- **Multiple muscle groups**

### 🎯 Goals (3 active)
1. Bench Press → 120kg (target date: 60 days)
2. Squat → 160kg (target date: 90 days)
3. Romanian Deadlift → 140kg (target date: 75 days)

### 📝 Templates (4 custom)
1. **Push Day** - Chest, shoulders, triceps (6 exercises)
2. **Pull Day** - Back, biceps, rear delts (7 exercises)
3. **Leg Day** - Quads, hamstrings, glutes, calves (6 exercises)
4. **Upper Body** - Full upper body (5 exercises)

---

## Progression Highlights

### Bench Press Journey
```
Week 1:  80.0kg × 10 reps
Week 2:  85.0kg × 10 reps
Week 3:  87.5kg × 10 reps
Week 4:  70.0kg × 10 reps (DELOAD)
Week 5:  90.0kg × 10 reps
Week 6:  92.5kg × 10 reps
Week 7:  95.0kg × 10 reps
Week 8:  75.0kg × 10 reps (DELOAD)
Week 9:  97.5kg × 10 reps
Week 10: 100.0kg × 10 reps
Week 11: 102.5kg × 10 reps
Week 12: 105.0kg × 10 reps (CURRENT)
```

### Squat Journey
```
Week 1:  100kg × 10 reps
Week 3:  110kg × 10 reps
Week 4:  85kg × 10 reps (DELOAD)
Week 5:  120kg × 10 reps
Week 6:  125kg × 10 reps
Week 7:  130kg × 10 reps
Week 8:  100kg × 10 reps (DELOAD)
Week 9:  135kg × 10 reps
Week 10: 140kg × 10 reps
Week 11: 145kg × 10 reps
Week 12: 147.5kg × 10 reps (CURRENT)
```

---

## Testing Scenarios

Once data is loaded, test these features:

### ✅ Progress Tracking
- View charts in Progress page
- See upward trend in weight
- Identify deload weeks (dips in weight)
- Check personal records

### ✅ Goal Tracking
- See goals in Settings
- View progress towards each goal
- Check "on track" status
- See estimated completion dates

### ✅ Workout History
- Filter by date range
- Search for specific exercises
- View workout details
- See progression over time

### ✅ Analytics
- Weekly volume trends
- Frequency heatmap
- Exercise distribution
- PR achievements

### ✅ Templates
- Load existing templates
- Edit templates
- Create new from existing workout
- Delete templates

---

## Cleanup (Optional)

To remove test data and start fresh:

```sql
-- Delete all data for test user
DELETE FROM workout_logs WHERE user_id = 'YOUR_USER_ID';
DELETE FROM workout_templates WHERE user_id = 'YOUR_USER_ID';
DELETE FROM user_goals WHERE user_id = 'YOUR_USER_ID';

-- Or delete the entire test account
-- (This cascades to all related data)
-- Go to Supabase → Authentication → Users → Delete user
```

---

## Troubleshooting

### "Permission denied" error
- Check RLS policies are enabled
- Verify you're logged in as the test user
- Confirm user_id matches in SQL script

### "No data showing in app"
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
- Clear service worker cache (see SECURITY_PROGRESS.md)
- Check Supabase Table Editor to verify data exists

### "Duplicate key" errors
- You may have run the script twice
- Clear existing data first (see Cleanup section)
- Then re-run the script

### "Variable 'test_user_id' not found"
- PostgreSQL variable syntax may not work in all clients
- Alternative: Find/replace all `:'test_user_id'` with `'your-actual-uuid'` in the SQL file

---

## Production Note

⚠️ **NEVER run this script on production database!**
- Only use on development/testing environments
- Creates fake data that could confuse real users
- Always test on a separate Supabase project

---

**Ready to Test!** 🚀

After running this script, you'll have a fully populated app showing 3 months of realistic training data, perfect for testing features and seeing the app in action!
