
# Testing & Fixing the /migrate Page

## What Was Found

### Current Implementation Status
The `/migrate` route, `MigrateToGoogle.tsx` page, and `claim-migration-upgrade` edge function are all wired up correctly. The route is registered in `App.tsx` at line 87, the Google OAuth button uses `lovable.auth.signInWithOAuth('google')`, and the edge function verifies JWT → checks `patreon_id` → upgrades tier.

### Issues Identified

**Issue 1: Race condition in the auth state listener**
In `MigrateToGoogle.tsx`, the `useEffect` calls `claimUpgrade` inside `onAuthStateChange`. However, `claimUpgrade` is defined outside the `useEffect` but closes over stale state — the function reference is recreated on every render, but `onAuthStateChange` captures the initial closure. This can cause `claimUpgrade` to silently fail or be called with a stale reference.

The fix is to use `useCallback` or restructure so `claimUpgrade` is called inline inside the effect with the session token directly.

**Issue 2: `claimUpgrade` is called even when a user is already signed in on page load**
The `useEffect` first calls `getSession()` and sets the session, but it also subscribes to `onAuthStateChange`. If the user is already signed in when they land on `/migrate` (e.g., they signed in with Google previously and came back), the auth state change fires with `SIGNED_IN` and triggers `claimUpgrade` immediately — but the user may not have a `patreon_id` yet since they might be a new Google-only user.

The fix is to only trigger `claimUpgrade` on the `SIGNED_IN` event that comes *after* the user clicks the button, not on initial page load if a session already exists.

**Issue 3: `claimUpgrade` is not guarded against double-calls**
If `onAuthStateChange` fires multiple times (it can emit multiple events during OAuth), `claimUpgrade` can be called multiple times. A guard ref is needed.

**Issue 4: `already_upgraded` response shows success toast even if no upgrade was needed**
When a user who is already at `creative-economy-lab` tier visits the page, they get a misleading "🎉 Welcome to Creative Economy Lab!" toast. It should say "You're already at the highest tier!" instead.

**Issue 5: `patreon_migration` upsert conflict key may fail**
The `upsert` uses `onConflict: "patreon_user_id"` — this requires a unique constraint on `patreon_user_id` in the `patreon_migration` table. Looking at the schema, no unique constraint was defined in the migration. If the constraint is missing, the upsert will always INSERT, potentially creating duplicate rows.

**Issue 6: Missing `DialogTitle` accessibility warning in console**
The console shows a `DialogContent requires a DialogTitle` error — this is from a different component (likely `EmailCaptureDialog` or another dialog) but should be fixed for accessibility.

---

## Fixes to Implement

### Fix 1 & 2 & 3: Restructure `MigrateToGoogle.tsx` auth flow
Refactor the `useEffect` to:
- Check if there's already a session on mount → if yes, immediately call `claimUpgrade` (don't wait for auth change)
- Use a `hasClaimed` ref to prevent double-calls
- Only call `claimUpgrade` on `SIGNED_IN` auth events (not `TOKEN_REFRESHED` or other events)

```typescript
const hasClaimed = useRef(false);

useEffect(() => {
  // Check existing session first
  supabase.auth.getSession().then(({ data }) => {
    if (data.session && !hasClaimed.current) {
      hasClaimed.current = true;
      setSession(data.session);
      claimUpgrade(data.session.access_token);
    }
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
    if (event === 'SIGNED_IN' && s && !hasClaimed.current) {
      hasClaimed.current = true;
      setSession(s);
      claimUpgrade(s.access_token);
    }
  });

  return () => subscription.unsubscribe();
}, []);
```

### Fix 4: Better toast messaging for already-upgraded users
```typescript
if (data?.already_upgraded) {
  toast.info('You\'re already at the Creative Economy Lab tier!');
} else {
  toast.success('🎉 Welcome to Creative Economy Lab! Your account has been upgraded.');
}
```

### Fix 5: Add unique constraint on `patreon_migration.patreon_user_id`
Run a database migration to add the missing unique constraint:
```sql
ALTER TABLE public.patreon_migration 
  ADD CONSTRAINT patreon_migration_patreon_user_id_key 
  UNIQUE (patreon_user_id);
```

### Fix 6: Accessibility — add `DialogTitle` to dialogs missing it
The console shows `DialogContent` missing a `DialogTitle`. This will be fixed in whichever dialog is triggering it (likely `EmailCaptureDialog.tsx`).

---

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/MigrateToGoogle.tsx` | Fix auth flow race condition, double-call guard, better toast messages |
| `supabase/migrations/` | Add unique constraint on `patreon_migration.patreon_user_id` |
| Whichever dialog has the missing `DialogTitle` | Add accessible `DialogTitle` with `VisuallyHidden` if needed |

---

## Flow After Fix

```
User visits /migrate
      ↓
Already signed in? → YES → claimUpgrade() immediately
      ↓                         ↓
      NO                  Has patreon_id? → YES → Upgrade tier → Success toast → /dashboard
      ↓                         ↓
Click "Continue          NO → Error toast: "No Patreon account found" → /dashboard
with Google"
      ↓
Google OAuth flow
      ↓
Returns to /migrate with session
      ↓
onAuthStateChange fires SIGNED_IN
      ↓
claimUpgrade() called (once, guarded)
      ↓
Edge function verifies JWT → checks patreon_id → upgrades tier
      ↓
Success toast → redirect to /dashboard
```

No database migration is required beyond the unique constraint fix. The `patreon_migration` table already exists with the correct columns.
