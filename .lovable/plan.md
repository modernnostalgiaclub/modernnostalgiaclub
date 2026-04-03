

## Fix: Bring Cart and Notification Bell Closer Together

**File: `src/components/Header.tsx`**

**Line 134**: Change `gap-3` to `gap-1` on the container `div` that wraps the cart button, notification bell, and avatar dropdown. This reduces spacing from 12px to 4px, keeping them visually grouped as a tight utility cluster.

```
// Before
<div className="flex items-center gap-3">

// After
<div className="flex items-center gap-1">
```

One-line change, no other files affected.

