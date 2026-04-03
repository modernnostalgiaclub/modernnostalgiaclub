

## Dashboard: White Background + Grey-Black Text + Blue Icons

### Problem
Multiple dashboard sections (Four Pillars, Onboarding Checklist, Learning Progress, Next Up, Tier Features) use dark backgrounds (`hsl(222 40% 7%)`) making text hard to read. The user wants all sections to have white backgrounds with grey-black text and blue icons. Additionally, "Enter the Lab" should say "Quick Links", and Member Downloads should be moved to the Ebooks page.

### Changes

**File: `src/pages/Dashboard.tsx`**

1. **Four Pillars section (line 330)**: Change label from "Enter the Lab" to "Quick Links". Change card backgrounds from dark (`hsl(222 40% 7% / 0.8)`) to white with a light border. Text → `text-gray-900`, subtitle → `text-gray-500`.

2. **Onboarding Checklist (lines 363-414)**: Change container background from `hsl(222 40% 7%)` to white. Section header text, checklist labels → `text-gray-900`. Muted text → `text-gray-500`. Hover state → `hover:bg-gray-50` instead of `hover:bg-white/5`.

3. **Remove `<MemberDownloads />` (line 417)**: Delete this line entirely from the Dashboard.

4. **Learning Progress card (lines 422-450)**: Background from dark to white. Text → grey-black. Icon backgrounds stay blue-tinted.

5. **Next Up card (lines 453-473)**: Background from dark gradient to white with subtle blue tint. Text → grey-black.

6. **Tier Features section (lines 477-498)**: Background from dark to white. Feature items background from `hsl(222 30% 10%)` to light grey (`bg-gray-50`). Feature text → `text-gray-700`.

7. **Remove unused `MemberDownloads` import** (line 7).

**File: `src/pages/Ebooks.tsx`**

8. **Add MemberDownloads content**: Import and render the `MemberDownloads` component at the top of the Ebooks page (above the database-fetched ebooks), so users can still access those static downloads. Update MemberDownloads styling to match the white/grey-black theme.

**File: `src/components/MemberDownloads.tsx`**

9. **Update styling**: Change card colors to use grey-black text and blue icons instead of maroon, matching the new white-background theme.

### Summary
- 6 dark sections → white background, grey-black text, blue icons
- "Enter the Lab" → "Quick Links"
- Member Downloads removed from Dashboard, added to Ebooks page

