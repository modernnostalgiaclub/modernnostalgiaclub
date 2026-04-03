

## Fix: Artist Incubator "Apply Now" button in hero section

**Problem**: The hero/bottom pricing section (around line 520) still uses a hardcoded `<Link>` for all tiers, ignoring the `externalLink` property that's already set on the Artist Incubator tier. The other pricing section (line 424) already handles this correctly.

**Fix**: Update lines 520-525 in `src/pages/LandingPage.tsx` to add the same conditional check:
- If `tier.externalLink` exists (Artist Incubator) → render an `<a>` tag opening the JotForm URL in a new tab
- Otherwise (Club Pass, Accelerator) → keep the existing `<Link>` to `/signup` or `/checkout`

This is a one-line conditional change mirroring the pattern already at line 424-436. No other files need changes.

