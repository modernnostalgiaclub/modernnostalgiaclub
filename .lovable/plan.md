
## Compact the Landing Page Pricing Section

### What's correct (no changes needed)
- The 3-column grid (`grid-cols-1 md:grid-cols-3`) stacks to single-column on mobile correctly
- "Apply Now" at line 636 already links to `/lab-application` — this is already right

### What's being tightened

**File: `src/pages/LandingPage.tsx`** — lines 507–644

Reduce vertical bulk across all three pricing cards and the section itself:

| Element | Current | Compact |
|---|---|---|
| Section vertical padding | `py-24` | `py-16` |
| Card padding | `p-8` | `p-5` |
| Header block bottom margin | `mb-6` | `mb-4` |
| Price font size | `text-4xl` | `text-3xl` |
| Description margin | `mb-6` | `mb-4` |
| Feature list spacing | `space-y-3 mb-8` | `space-y-2 mb-5` |
| Feature list item size | `text-sm` | `text-xs` |
| Gap between columns | `gap-6` | `gap-4` |
| Max width | `max-w-5xl` | `max-w-4xl` |

The "Most Popular" and "By Application" badge positioning (`absolute -top-3`) stays the same since it depends on card padding being at least ~1.25rem.

The footer note (`mt-8`) reduced to `mt-6`.

These changes apply identically to all three cards — Lab Pass, Creator Accelerator, and Creative Economy Lab. The maroon border highlight on the middle card stays as the visual anchor.

### No logic, routing, or DB changes
Purely a density/spacing update. The `/lab-application` link and 3-col grid wiring are already correct.
