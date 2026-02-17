

# Add Email/Password Authentication with Patreon as Bonus Login

## Overview
Add a standard email/password sign-up and sign-in flow so users can join without Patreon. Patreon login stays as an "Or continue with" option -- OG Patreon members keep their perks, and eventually you can phase out the Patreon-only requirement entirely.

## What Changes

### New Page: `/login` (Sign In + Sign Up)
A clean login page inspired by the reference screenshot:
- **Sign In tab**: Email + Password fields, "Sign In" button
- **Sign Up tab**: Email + Password + Confirm Password, "Create Account" button
- Divider: "Or continue with"
- Patreon button below (calls existing `signInWithPatreon`)
- "Forgot password?" link on Sign In tab
- Logo at the top, dark themed to match existing site

### New Page: `/reset-password`
- Accepts the recovery token from the email link
- Shows a form to set a new password
- Calls `supabase.auth.updateUser({ password })`

### Updated: Header Component
- "Log In" button now navigates to `/login` instead of triggering Patreon OAuth directly
- "Join" / "Sign Up" button also routes to `/login?tab=signup`

### Updated: ProtectedRoute
- Redirects unauthenticated users to `/login` instead of `/`

### Updated: AuthContext
- Add `signInWithEmail(email, password)` method
- Add `signUpWithEmail(email, password)` method
- Add `resetPassword(email)` method
- Keep existing `signInWithPatreon()` for Patreon OAuth flow

### Updated: App.tsx (Routes)
- Add `/login` route pointing to the new Login page
- Add `/reset-password` route for password recovery

### Profile Handling for Email Sign-Ups
- New email/password users get a profile created with `patreon_tier: 'lab-pass'` (free tier) and `patreon_id: null`
- This distinguishes them from Patreon members who have a `patreon_id` set
- Existing tier-based access checks continue to work -- non-Patreon users default to the lowest tier

### Database Migration
- Add a trigger on `auth.users` insertions to auto-create a `profiles` row for new email/password signups (the Patreon flow already handles profile creation server-side, but direct signups need this)
- The trigger will set default values: `patreon_tier = 'lab-pass'`, `patreon_id = null`

## Technical Details

### New Files
1. **`src/pages/Login.tsx`** -- Sign in / Sign up page with tabs, email+password forms, Patreon "continue with" button, forgot password link
2. **`src/pages/ResetPassword.tsx`** -- Password reset form that handles the recovery token

### Modified Files
1. **`src/contexts/AuthContext.tsx`** -- Add `signInWithEmail`, `signUpWithEmail`, `resetPassword` to context
2. **`src/components/Header.tsx`** -- Route "Log In" button to `/login`, "Join" to `/login?tab=signup`
3. **`src/components/ProtectedRoute.tsx`** -- Redirect to `/login` instead of `/`
4. **`src/App.tsx`** -- Add `/login` and `/reset-password` routes

### Database Migration
```sql
-- Function to auto-create profile for new auth users (email/password signups)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, patreon_tier)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    'lab-pass'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## What Stays the Same
- All existing Patreon OAuth flow remains intact
- Tier-based access control unchanged -- Patreon members keep their tier perks
- MFA system unchanged
- All existing RLS policies still apply
- Admin/moderator role system unchanged

