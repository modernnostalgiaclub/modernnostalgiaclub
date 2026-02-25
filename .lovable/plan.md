
# Two Changes: Restore Patreon Login + Dashboard Migration Banner

## What's Changing

### 1. Login Page — Restore Patreon to a Visible Position

The Patreon button is currently buried in a collapsed "Legacy Access" section. Since Patreon is still the majority login method, it should be fully visible. The updated layout will be:

```
[Continue with Google]
──── or ────
[Continue with Patreon]
──── or sign in with email ────
[Email / Password tabs]
```

The collapsible wrapper and the "Legacy Access" label will be removed. The Patreon button will sit at the same visual weight as Google — both prominent, both always visible. The "Legacy Access" text and `ChevronDown` toggle will be gone.

### 2. Dashboard — Migration Offer Banner for Patreon Members

When a user is logged in via Patreon (`profile.patreon_id` is set) but does NOT have a Google-linked account, show a dismissible upgrade banner in the dashboard. This banner will:

- Appear at the top of the dashboard content (below the header, above the welcome card)
- Be styled as a standout `Card` with a warm/maroon color treatment to draw attention
- Show: "You're a founding Patreon member. Upgrade to Creative Economy Lab — free, permanently."
- Have a prominent CTA button: "Claim Your Free Upgrade →" which links to `/migrate`
- Have a small dismiss/close button (X) that hides the banner for the session (not persisted — if they reload, it shows again unless they've already migrated)

**How to detect who should see it:**
- `profile.patreon_id` is not null (they're a Patreon member)
- `profile.patreon_tier` is NOT `creative-economy-lab` (they haven't been upgraded yet)

This means once they complete the migration flow and their tier is upgraded, the banner auto-disappears permanently on next login.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/Login.tsx` | Remove `Collapsible` wrapper from Patreon button; make it a visible peer to Google. Remove `legacyOpen` state. |
| `src/pages/Dashboard.tsx` | Add migration banner component inline, shown conditionally when `profile.patreon_id` is set and tier is not `creative-economy-lab`. |

---

## Technical Notes

- No database changes needed
- No edge function changes needed
- The `profile` object already contains both `patreon_id` and `patreon_tier` — these are available from `useAuth()` in Dashboard
- The dismiss is session-only (`useState`) — no persistence needed since the banner disappears permanently once the migration is complete and the tier changes
- The `/migrate` page already handles the full upgrade flow
