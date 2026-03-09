
## Replace MNCPlayer with DISCO Playlist Embed

The user wants to swap the custom `MNCPlayer` React component for the official DISCO iframe embed:
```
https://geohworks.disco.ac/e/p/28389354?download=false&s=vkGsc11Q4t-yDoVG_oa3knlKgXY%3A2zm102ef&artwork=true&color=%234E98FF&theme=dark
```
Size: 480×395px.

### Approach

**1. Replace `MNCPlayer.tsx`** — Rewrite the component to be a simple, styled section that wraps the DISCO iframe. No more audio state, Supabase RPC, or edge function calls. Just:
- A section wrapper matching the current landing page styling (`py-20 border-t border-border/30`)
- A centered card container (`max-w-3xl mx-auto`) with a rounded border to match the existing design language
- A small header bar above the iframe: "MN.C Player" label + "Songs by MN.C Members" title (keeps the branding)
- The `<iframe>` set to `width="100%"` with `height="395"`, `allowFullScreen`, `frameBorder="0"`, and `title` for accessibility
- The iframe is responsive: container `max-w-[480px]` centered, or full-width up to 480px

**2. `LandingPage.tsx`** — No change needed. It already imports and renders `<MNCPlayer />` at line 531. The component swap is transparent.

**3. No DB/edge function changes needed.** The ingested tracks and `artist-track-download` function remain intact (they're still used by the admin Artist Tracks panel for downloads). Only the landing page presentation changes.

### Component Structure

```text
<section py-20 border-t>
  <div container mx-auto px-6>
    <div max-w-3xl mx-auto>

      [Header bar: Music2 icon | "MN.C Player" / "Songs by MN.C Members" | animated bars]

      <div rounded-2xl overflow-hidden border bg-card shadow-lg>
        <iframe
          src="https://geohworks.disco.ac/e/p/28389354?..."
          width="100%"
          height="395"
          allowFullScreen
          title="MN.C Member Tracks"
        />
      </div>

    </div>
  </div>
</section>
```

The header bar above the iframe keeps the existing visual branding. The iframe itself is the full player — DISCO handles playback, tracklist, artwork, and controls natively with their dark theme + blue `#4E98FF` accent (which matches the site's primary blue).

### Files Changed
- `src/components/MNCPlayer.tsx` — complete rewrite, ~30 lines instead of ~376
