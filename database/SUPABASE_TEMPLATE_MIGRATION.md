# Template Migration to Supabase

## Overview
This migration moves custom workout templates from browser localStorage to Supabase database for cross-device syncing and data persistence.

## Benefits After Migration
✅ **Sync across all devices** - Templates available on desktop, mobile, any browser
✅ **Survive browser clearing** - Templates backed up in cloud database
✅ **Automatic backup** - Data never lost
✅ **Multi-device access** - Same templates on laptop, phone, tablet

---

## Step 1: Create the Database Table

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `database/create_workout_templates_table.sql`
6. Paste into the SQL editor
7. Click **Run** (or press Cmd/Ctrl + Enter)

### Expected Result:
You should see success messages like:
```
CREATE TABLE
CREATE INDEX
CREATE INDEX
ALTER TABLE
CREATE POLICY
CREATE POLICY
CREATE POLICY
CREATE POLICY
```

---

## Step 2: Verify the Table

1. Click **Table Editor** in the left sidebar
2. You should see a new table: `workout_templates`
3. Click on it to verify the columns:
   - `id` (uuid)
   - `user_id` (uuid)
   - `name` (text)
   - `exercises` (jsonb)
   - `created_at` (timestamptz)
   - `updated_at` (timestamptz)

---

## Step 3: Verify RLS Policies

1. Click on the `workout_templates` table
2. Click the **RLS** button at the top
3. You should see 4 policies:
   - ✅ Users can view own templates (SELECT)
   - ✅ Users can create own templates (INSERT)
   - ✅ Users can update own templates (UPDATE)
   - ✅ Users can delete own templates (DELETE)
4. Ensure **RLS is enabled** (toggle should be ON)

---

## Step 4: Deploy the Code

The code changes are ready to deploy. When you push to GitHub:

1. Vercel will automatically deploy the new code
2. When you log in, the app will automatically:
   - Check for old localStorage templates
   - Migrate them to Supabase (one-time only)
   - Clear localStorage after successful migration
   - Load templates from Supabase going forward

---

## What Happens During Migration

### First Login After Update:
```
1. User logs in
2. App checks localStorage for templates
3. If templates exist AND Supabase has 0 templates:
   → Migrate all templates to Supabase
   → Clear localStorage
   → Show console message: "✅ Migrated X templates"
4. Load templates from Supabase
```

### Subsequent Logins:
```
1. User logs in
2. Load templates directly from Supabase
3. No migration needed
```

---

## Testing the Migration

### Test Scenario 1: User with existing localStorage templates
1. Before updating, create a few templates
2. Deploy the code
3. Run the SQL migration
4. Log in
5. Check browser console - should see migration message
6. Verify templates appear in app
7. Check Supabase Table Editor - templates should be there

### Test Scenario 2: New user
1. Create account after deployment
2. Create templates
3. Templates go directly to Supabase
4. Log in from different browser/device
5. Templates should sync automatically

### Test Scenario 3: Cross-device sync
1. Create template on Desktop Chrome
2. Log in on Mobile Safari
3. Template should appear immediately
4. Edit template on mobile
5. Changes should appear on desktop

---

## Rollback Plan

If something goes wrong:

1. **Rollback code**: Revert to previous commit
2. **Keep database table**: Don't drop it - templates are safe
3. **Templates in localStorage**: Still accessible until cleared
4. **Fix and redeploy**: Templates won't be lost

---

## Database Schema

```sql
CREATE TABLE public.workout_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_template_name_per_user UNIQUE (user_id, name)
);
```

### Indexes:
- `idx_workout_templates_user_id` - Fast lookup by user
- `idx_workout_templates_created_at` - Fast sorting by date

### RLS Policies:
All policies use `(select auth.uid()) = user_id` for optimal performance

---

## Monitoring

After deployment, monitor:
1. **Browser console** - Look for migration messages
2. **Supabase Table Editor** - Verify templates are being saved
3. **No errors** - Check for Supabase API errors in console

---

## Support

If users report missing templates:
1. Check if localStorage migration ran (console logs)
2. Verify RLS policies are correct
3. Check Supabase Table Editor for their user_id
4. Ensure they're logged in when creating templates

---

**Status**: Ready to deploy ✅
**Last Updated**: December 25, 2025
