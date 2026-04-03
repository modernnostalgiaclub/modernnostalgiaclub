

## Problem

On mobile (viewport < 768px), the sidebar component switches from an inline panel to a hidden Sheet overlay. The only `SidebarTrigger` button lives **inside** the sidebar, so once it's closed there's no way to reopen it — it's effectively invisible.

## Fix

Add a `SidebarTrigger` button to the **Header** component that is visible on mobile/tablet screens (below `lg` breakpoint). This gives users a persistent way to open the sidebar.

### Changes

**1. `src/components/Header.tsx`**
- Import `SidebarTrigger` and `useSidebar` from the sidebar UI
- Import `useAuth` to conditionally show the trigger only for signed-in users
- Add a `SidebarTrigger` button (e.g. a `PanelLeft` or `Menu` icon) on the left side of the header, visible only below `lg` breakpoint (`lg:hidden`)
- Only render it when the user is authenticated (since the sidebar is only available for signed-in users)

**2. `src/components/AppSidebar.tsx`** (optional cleanup)
- Keep the existing internal `SidebarTrigger` so users can collapse/expand when the sidebar is visible on desktop
- No other changes needed

This is a small, targeted fix — one conditional trigger button added to the header.

