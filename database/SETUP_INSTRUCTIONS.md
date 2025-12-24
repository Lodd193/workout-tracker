# Authentication Setup Instructions

Follow these steps carefully to enable authentication in your Workout Tracker app.

## Prerequisites
- You need access to your Supabase dashboard
- You should have your Supabase project URL and anon key in `.env.local`

---

## Step 1: Install Required Package

First, install the Supabase auth helpers:

```bash
npm install @supabase/auth-helpers-nextjs
```

---

## Step 2: Run Database Migration

1. Open your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `database/migration_add_auth.sql`
6. Paste it into the SQL editor
7. Click **Run** (or press Ctrl+Enter)

You should see: "Success. No rows returned"

---

## Step 3: Create Your First User Account

1. Build and start your app:
   ```bash
   npm run build
   npm start
   ```

2. Open your app in a browser (http://localhost:3000)
3. You'll be redirected to `/login`
4. Click **"Sign up"**
5. Enter your email and password
6. Click **"Sign Up"**

You're now logged in with your new account!

---

## Step 4: Migrate Existing Workout Data

Now we need to assign all your existing workouts to your new user account.

1. Go back to Supabase Dashboard → **SQL Editor**
2. Create a new query and run:
   ```sql
   SELECT id, email FROM auth.users;
   ```
3. Copy your `id` (it looks like: `a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6`)
4. Run this query, replacing `YOUR_USER_ID_HERE` with your actual ID:
   ```sql
   UPDATE workout_logs 
   SET user_id = 'YOUR_USER_ID_HERE'
   WHERE user_id IS NULL;
   ```
5. It should say something like: "Success. X rows affected" (where X is your number of workout logs)

---

## Step 5: Make user_id Required (Optional but Recommended)

Once all data is migrated, make `user_id` required:

```sql
ALTER TABLE workout_logs ALTER COLUMN user_id SET NOT NULL;
```

---

## Step 6: Verify Everything Works

1. Refresh your app (http://localhost:3000)
2. You should see all your historical workout data
3. Try logging a new workout - it should save successfully
4. Try logging out (click **Logout** in navigation)
5. Try logging back in

---

## Step 7: Deploy to Production

Once everything works locally:

1. Commit and push your changes to GitHub:
   ```bash
   git add .
   git commit -m "Add authentication system"
   git push
   ```

2. Your deployment service (Vercel/Netlify) should automatically redeploy
3. Make sure your `.env.local` variables are set in your deployment environment

---

## Testing Data Isolation

To verify users can only see their own data:

1. Create a second test account (different email)
2. Log in with the new account
3. You should see NO workout data (empty state)
4. Add a test workout
5. Log out and log back in with your original account
6. You should NOT see the test account's workout

This confirms Row Level Security is working! 🎉

---

## Troubleshooting

### "You must be logged in to save workouts"
- Make sure you're logged in (you should see a Logout button in navigation)
- Try logging out and back in

### "Error saving: new row violates row-level security policy"
- Your user_id isn't being set correctly
- Check that you've run the migration
- Verify RLS policies are created: `SELECT * FROM pg_policies WHERE tablename = 'workout_logs';`

### Can't log in after creating account
- Check your browser console for errors
- Verify Supabase Auth is enabled in your project settings
- Check that your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct

### Existing data not showing up
- Make sure you ran Step 4 (Migrate Existing Data)
- Verify: `SELECT COUNT(*) FROM workout_logs WHERE user_id = 'YOUR_USER_ID';`

---

## Security Notes

✅ **What's now secure:**
- All workout data is isolated by user
- Row Level Security prevents unauthorized access
- Even if someone gets your anon key, they can only access their own data
- Passwords are hashed by Supabase (never stored in plain text)

⚠️ **Additional security recommendations:**
- Use a strong password for your account
- Enable email confirmations in Supabase settings (prevents spam signups)
- Consider adding email verification for production
- Set up password reset flow if needed

---

## Need Help?

If you run into issues, check:
1. Supabase Dashboard → Logs (for backend errors)
2. Browser Console (F12) for frontend errors
3. Verify environment variables are set correctly

---

**You're all set!** Your Workout Tracker now has secure user authentication. 🔐💪
