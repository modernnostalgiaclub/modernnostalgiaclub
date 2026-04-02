

## Add Role Permissions Reference to Admin Panel

**What**: Add a "Roles & Permissions" section in the Admin panel that clearly documents what each role (Admin, Moderator, User) can access and manage — so you don't have to remember or ask.

**Where**: New tab or section within the existing Admin page, alongside Users, Memberships, etc.

### Permissions Matrix

A readable table showing:

```text
Feature / Area              │ Admin │ Moderator │ User
────────────────────────────┼───────┼───────────┼──────
User Management             │  ✓    │           │
Role Assignment             │  ✓    │           │
Membership Plans / Pricing  │  ✓    │           │
Site Settings               │  ✓    │           │
Database Backup             │  ✓    │           │
Notifications (send)        │  ✓    │           │
Submission Review           │  ✓    │     ✓     │
Community Moderation        │  ✓    │     ✓     │
Content Flagging            │  ✓    │     ✓     │
Own Profile / Settings      │  ✓    │     ✓     │  ✓
Submit Audio / Projects     │  ✓    │     ✓     │  ✓
Community Participation     │  ✓    │     ✓     │  ✓
Courses & Dashboard         │  ✓    │     ✓     │  ✓
```

### Implementation

1. **Create `src/components/AdminRolesPermissions.tsx`** — A card-based or table view showing the permissions matrix above, styled consistently with the admin panel.

2. **Add a "Roles" tab** in `src/pages/Admin.tsx` so it's accessible from the admin navigation alongside Users, Memberships, Settings, etc.

No database changes needed — this is a static reference view built from the existing role logic in the codebase.

