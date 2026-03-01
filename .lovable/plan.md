
## Store Redesign: 4-Column Product Grid + 4-Column Membership Tiers

### What the user wants
1. **Products section** — proper 4-column grid (`grid-cols-2 md:grid-cols-4`) with fresh stock images that better match each product's content
2. **The 4 "buttons" (membership tiers)** — rendered as side-by-side columns in a single `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` row — treating the Catalog Audit as the 4th tier column alongside Lab Pass, Creator Accelerator, and Creative Economy Lab

---

### Products Grid (4 columns)

New stock photos chosen for visual accuracy:

| Product | Stock Photo Concept | Unsplash URL |
|---|---|---|
| Split Sheet | Contract signing / pen on paper | `https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80` |
| Pro Tools Template | Studio mixer / DAW close-up | `https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&q=80` |
| Just Make Noise Bundle | Solo artist at desk, moody light | `https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&q=80` |
| Be Loud Bundle | Producer confident at console | `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80` |

Card layout stays the same (image top, price badge, title, description, purchase button) but:
- Grid becomes `grid-cols-2 md:grid-cols-4` for a true 4-column layout on desktop and 2-column on tablet/mobile
- Image height stays `h-48`

---

### Membership Columns: 4 across (new layout)

Currently: 3-column grid (Lab Pass, Creator Accelerator, Creative Economy Lab)

New: **4-column grid** — Lab Pass, Creator Accelerator, Creative Economy Lab, + **Catalog Audit** as a 4th "tier" column

```
┌──────────┬──────────┬──────────┬──────────┐
│ Lab Pass │ Creator  │ Creative │ Catalog  │
│  $5/mo   │ Accel.   │ Econ Lab │  Audit   │
│          │ $10/mo   │ $150 1x  │  $249    │
│ [signup] │[patreon] │ [apply]  │ [book]   │
└──────────┴──────────┴──────────┴──────────┘
```

The Catalog Audit column strips out the long FAQ/full-description — that stays in the dedicated service section below. The 4th column just shows: title, price badge ("Professional Service"), short description, key features list (5 bullets from `whatsIncluded`), and a "Book Audit" button (confirmation checkbox stays in the full service section below).

Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`

Cards are made more compact to fit 4 across:
- Reduced padding: `p-5`
- Smaller price text: `text-3xl`
- Feature list: `text-xs space-y-2`
- Badge stays positioned with `absolute -top-3`

The separate Catalog Audit full section (with FAQ and confirmation checkbox) stays below as-is — the 4th column is just a summary card that scrolls down to the full section when "Book Audit" is clicked (via `scrollIntoView` on an anchor).

---

### Files Changed

| File | Change |
|---|---|
| `src/pages/Store.tsx` | New PRODUCT_PHOTOS map; grid becomes `grid-cols-2 md:grid-cols-4`; membership section becomes 4-column with Catalog Audit as 4th card |

No DB changes, no new files.
