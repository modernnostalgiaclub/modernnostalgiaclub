
# Database Backup Export Tool

## Overview
Add an admin-only "Backup" tab to the Admin panel that lets you export all database tables to a single JSON file with one click. This gives you a portable snapshot of your entire site's data.

## What You'll Get
- A new "Backup" tab in the Admin panel with a "Export All Tables" button
- One-click download of a `.json` file containing all your database tables
- Progress indicator showing which tables are being exported
- Timestamp in the filename (e.g., `site-backup-2026-02-17.json`)
- Individual table export buttons if you only need specific data

## Tables Included
All 20 tables the admin role has access to:
- courses, lessons, user_lesson_progress
- profiles, user_roles
- submissions, beat_license_submissions
- community_sections, community_posts, community_comments, chat_messages
- example_tracks, reference_resources
- notifications, site_settings, networking_contacts, networking_links
- download_email_captures, sync_quiz_results
- audit_logs, tracker_sessions, tracker_progress, tracker_reflections

## Technical Details

### New File: `src/components/AdminDatabaseBackup.tsx`
- Creates a React component that queries each table via the Supabase client
- Uses the existing admin RLS policies (admin role can SELECT on all tables)
- Aggregates results into a single JSON object keyed by table name
- Triggers a browser download of the JSON blob
- Shows a progress bar and per-table row counts

### Modified File: `src/pages/Admin.tsx`
- Import the new `AdminDatabaseBackup` component
- Add a "Backup" tab (with a `Database` icon) to the existing TabsList
- Add corresponding `TabsContent` rendering the backup component

### No database changes needed
- All queries use existing admin-level RLS policies
- No new tables, functions, or migrations required
