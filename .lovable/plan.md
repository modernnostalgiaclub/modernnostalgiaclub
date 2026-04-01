

## Plan: Replace Playfair Display with Poppins Bold for all serif headings

The font shown in the screenshot is **Playfair Display** (`font-serif` in Tailwind). The user wants to swap it to **Poppins Bold** everywhere it appears.

### Changes

**1. `index.html`** — Add Poppins Google Font import (alongside existing DM Sans and Playfair Display imports). Keep Playfair Display import in case it's used elsewhere.

**2. `tailwind.config.ts`** — Change the `fontFamily.serif` definition from Playfair Display to Poppins:
```ts
serif: ["Poppins", "system-ui", "sans-serif"],
```

This single change will update every `font-serif` usage across the entire codebase (206 occurrences across 7 files including MusicBlogHome, BlogIndex, Artists, Dashboard, AboutPage, LandingPage, and more) without touching any component files.

**3. Verify font weights** — Poppins Bold (700) and Semibold (600) weights need to be included in the Google Fonts import since they're used via `font-bold` and `font-semibold` classes throughout.

### Scope
- 2 files modified: `index.html`, `tailwind.config.ts`
- Zero component files need changing — everything flows through the `font-serif` Tailwind class

