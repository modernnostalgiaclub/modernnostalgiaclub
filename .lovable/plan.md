
## Two-Bug Fix: Migration for Existing Accounts + Reset Password with MFA

### Bug 1: `/migrate` — Account Already Exists, No Password

**What's happening:** `ge@modernnostalgia.club` was created via Patreon OAuth — the account exists but has never had a password set. When the migrate page tries `signUp()`, the backend returns `422 User already registered`. The code throws it and shows an error toast. Dead end.

**The fix — Magic Link fallback:**

When `signUp` returns "User already registered", instead of showing an error, automatically send a **magic link (OTP email)** to that address. The user clicks the link in their email, gets signed in via `SIGNED_IN` event, and `claimUpgrade()` fires as normal.

New flow for the email tab when a pre-filled email exists:
1. User sees their email pre-filled + a password field
2. They click "Create Account & Claim Upgrade"
3. If `signUp` returns `user_already_exists` → silently call `signInWithOtp({ email })` → show "Check your email — we've sent you a sign-in link. Click it to complete your upgrade."
4. User clicks the email link → lands back on `/migrate` → `SIGNED_IN` fires → `claimUpgrade()` runs → redirect to dashboard

This is the cleanest path because: (a) it doesn't require a password if MFA is blocking password resets, (b) it works regardless of whether the account is new or existing.

**Secondary improvement:** Change the button label and subtext to reflect the situation — when the email is pre-filled, lead with "Send me a sign-in link" as the primary action, with password as a secondary option for truly new accounts.

---

### Bug 2: `/reset-password` — MFA Blocks `updateUser`

**What's happening:** The auth logs show `401: AAL2 session is required to update email or password when MFA is enabled`. A password recovery link gives an AAL1 session. Since the account has 2FA enrolled, updating the password requires completing the MFA challenge first (AAL2).

**The fix — MFA gate before password update:**

After the recovery session is established (`ready = true`), check the assurance level. If it's AAL1 and MFA factors exist, show the TOTP input before showing the password form.

Flow:
1. User clicks recovery link → `PASSWORD_RECOVERY` event fires → `ready = true`
2. Page calls `getAuthenticatorAssuranceLevel()` → if `nextLevel === 'aal2'`, show MFA prompt first
3. User enters their authenticator code → `mfa.challengeAndVerify()` → session upgrades to AAL2
4. Password form appears → `updateUser({ password })` succeeds

The existing `MFAVerification` component already does exactly this. We'll reuse it inline on the reset-password page.

---

### Files to Change

**`src/pages/MigrateToGoogle.tsx`:**
- When `signUp` throws `user_already_exists` (422), catch it and call `signInWithOtp({ email, options: { shouldCreateUser: false } })`
- Switch UI to a "check your email" confirmation state
- Update button label: when email is pre-filled, show "Send Sign-in Link" as primary, with a "Set a password instead" toggle
- Remove the `isSignUp` / `Already have an account?` toggle confusion — it's irrelevant when the email is locked

**`src/pages/ResetPassword.tsx`:**
- After `ready = true`, call `supabase.auth.mfa.getAuthenticatorAssuranceLevel()`
- If `nextLevel === 'aal2'` (MFA required), show TOTP input using inline MFA challenge logic (same pattern as `MFAVerification.tsx`)
- Only show the password form once AAL2 is satisfied
- Clear, friendly messaging: "Your account has two-factor authentication enabled. Enter your authenticator code to continue."

No database changes, no edge function changes needed — this is purely frontend logic.
