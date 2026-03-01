
## Store Redesign + Pricing Column Update

### Summary of all changes

**Store page (`src/pages/Store.tsx`)**:
1. Products section becomes a proper image-forward grid — stock photo hero per card
2. New Memberships column section replaces the plain member CTA banner
3. The $150 Creative Economy Lab tier becomes its own column with "Apply Now" linking to `/lab-application` and embedding the JotForm inline
4. The Catalog Audit service section stays but uses the confirmation-gate approach already in place

**Landing Page (`src/pages/LandingPage.tsx`)**:
- Change `$1` → `$5` in the Lab Pass pricing column
- Update the pricing grid from `md:grid-cols-2` → `md:grid-cols-3` and add the Creative Economy Lab as a full third column with the JotForm (no more footer footnote pointing to `/lab-application`)
- Change the footnote at line 596 to remove the `$150/mo` reference (it becomes one-time)

---

### Store Page — Detailed Design

**Section 1: Product Grid**

All non-service products rendered in a `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` grid. Each card gets a tall cover photo at the top using Unsplash stock images matched to content:

| Product ID | Stock Photo Concept | Unsplash URL |
|---|---|---|
| `split-sheet` | Two people signing documents / handshake in studio | `https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80` |
| `pro-tools-template` | Close-up of DAW interface / mixing session | `https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=600&q=80` |
| `just-make-noise-bundle` | Artist working alone, moody studio light | `https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=600&q=80` |
| `be-loud-bundle` | Producer at mixing board, confident | `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80` |

Card layout per product:
```
┌─────────────────────┐
│  [Stock Photo 200px]│
├─────────────────────┤
│ Badge  $Price       │
│ Title               │
│ Description (3 lines│
│ External link?      │
│ [Purchase Button]   │
└─────────────────────┘
```

**Section 2: Memberships (new)**

Replaces the existing "Members Get Everything Free" / "You're a Member" banner. Renders a proper `grid-cols-1 md:grid-cols-3` pricing column layout — same visual style as LandingPage pricing section but embedded directly in the Store page.

Three columns:

| Column | Name | Price | CTA |
|---|---|---|---|
| 1 | Lab Pass | $5/mo | "Get Started" → `/login?tab=signup` |
| 2 | Creator Accelerator | $10/mo | "Start Training" → Patreon |
| 3 | Creative Economy Lab | $150 one-time | "Apply Now" — opens JotForm inline |

The Creative Economy Lab column, when "Apply Now" is clicked, expands an inline section below it (using `useState`) showing the JotForm script `https://pci.jotform.com/jsform/253309376850058` via a `<script>` tag injected into the page using `useEffect`, or alternatively rendered as an `<iframe src="https://pci.jotform.com/form/253309376850058">` (same approach as `LabApplication.tsx`).

Using the iframe approach is cleaner and consistent with the existing LabApplication page. The CTA says "Apply Now — $150 one-time" and clicking it scrolls to/reveals the JotForm below the columns.

**Section 3: Catalog Audit Service**

Stays as-is — full-width featured card with FAQ accordion and confirmation checkbox. No changes to this section.

---

### Landing Page Pricing Changes

**Line 519**: `$1` → `$5`

**Line 507**: Change grid from `md:grid-cols-2` to `md:grid-cols-3` and add a third column for Creative Economy Lab:
- Name: Creative Economy Lab
- Price: $150 one-time
- Badge: "By Application"
- Features: Everything in Creator Accelerator + 1-on-1 strategy sessions, sync catalog review, priority feedback, network access
- CTA: "Apply Now" → `/lab-application`

**Line 596**: Update footnote — remove the parenthetical `$150/mo` reference since it's now displayed in the grid.

---

### Files to Modify

| File | Change |
|---|---|
| `src/pages/Store.tsx` | Full redesign — product grid with stock photos + membership columns with JotForm |
| `src/pages/LandingPage.tsx` | $1 → $5, 2-col → 3-col pricing grid, add CEL column |
| `src/lib/storeProducts.ts` | No changes needed |

### No DB changes required
This is purely a UI update. No new tables, RLS policies, or migrations.

---

### Technical Notes

- The JotForm embed in the Store uses `<iframe src="https://pci.jotform.com/form/253309376850058">` in an expandable section, toggled by a `useState` boolean
- Stock photos use direct Unsplash URLs with `w=600&q=80` params — no download needed
- The membership grid in the Store is self-contained JSX (not imported from LandingPage) since the Store has a different surrounding context
- `$1` → `$5` is updated in `LandingPage.tsx` only; the `storeProducts.ts` file does not store tier pricing
