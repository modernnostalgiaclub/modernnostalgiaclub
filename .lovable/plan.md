
## Update Store Stock Photos

### What's changing

Three photo swaps in `src/pages/Store.tsx`, plus adding a hero photo to the full Catalog Audit service card below the membership columns.

---

### Photo Map Updates (`PRODUCT_PHOTOS` — lines 49–54)

| Product | New Concept | New Unsplash URL |
|---|---|---|
| `just-make-noise-bundle` | Person in recording studio, moody | `https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=600&q=80` |
| `be-loud-bundle` | Beat machine / drum machine close-up | `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80` |
| `split-sheet` | No change — contract/pen already fits | keep as-is |
| `pro-tools-template` | No change — DAW already fits | keep as-is |

Better URLs for the two changed items:
- **Just Make Noise** → recording studio with producer at console: `https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&q=80` (studio desk/gear close-up) — actually a better fit is `https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=600&q=80` (person alone in studio, dark moody)
- **Be Loud** → beat machine/MPC: `https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&q=80` (drum machine / beat pads lit up)
- **Catalog Audit** column card (in membership grid) + full service section → person with headphones in studio: `https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=600&q=80`

---

### Catalog Audit Full Section — Add Hero Image

The full service card (`ref={auditFullRef}`, line ~330) currently starts with just an icon + text. Adding a hero banner photo at the top of the card — a person with headphones in a studio — using the same URL as the column card for visual consistency. It renders as a `w-full h-48 object-cover` image before the `p-8` content area.

---

### Files Changed

| File | Change |
|---|---|
| `src/pages/Store.tsx` | Update `PRODUCT_PHOTOS` map (2 URL swaps); add `catalog-audit` key to map; add hero `<img>` to the full Catalog Audit service card |

No other files, no DB changes.
