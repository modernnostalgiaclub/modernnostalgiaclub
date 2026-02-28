import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Download, Database, Loader2, CheckCircle2 } from 'lucide-react';

const TABLES = [
  'courses', 'lessons', 'user_lesson_progress',
  'profiles', 'user_roles',
  'submissions', 'beat_license_submissions',
  'community_sections', 'community_posts', 'community_comments', 'chat_messages',
  'example_tracks', 'reference_resources',
  'notifications', 'site_settings', 'networking_contacts', 'networking_links',
  'download_email_captures', 'sync_quiz_results',
  'audit_logs', 'tracker_sessions', 'tracker_progress', 'tracker_reflections',
] as const;

type TableName = typeof TABLES[number];

interface TableResult {
  name: string;
  rowCount: number;
  status: 'pending' | 'loading' | 'done' | 'error';
}

export function AdminDatabaseBackup() {
  const [exporting, setExporting] = useState(false);
  const [tableResults, setTableResults] = useState<TableResult[]>([]);
  const [progress, setProgress] = useState(0);

  async function fetchTable(table: TableName) {
    const { data, error } = await supabase.from(table).select('*');
    if (error) throw new Error(`${table}: ${error.message}`);
    return data || [];
  }

  async function exportAllTables() {
    setExporting(true);
    setProgress(0);
    const results: TableResult[] = TABLES.map(name => ({ name, rowCount: 0, status: 'pending' as const }));
    setTableResults([...results]);

    const backup: Record<string, unknown[]> = {};
    let completed = 0;

    for (const table of TABLES) {
      const idx = TABLES.indexOf(table);
      results[idx].status = 'loading';
      setTableResults([...results]);

      try {
        const data = await fetchTable(table);
        backup[table] = data;
        results[idx] = { name: table, rowCount: data.length, status: 'done' };
      } catch (e: any) {
        results[idx] = { name: table, rowCount: 0, status: 'error' };
        console.error(e);
      }

      completed++;
      setProgress(Math.round((completed / TABLES.length) * 100));
      setTableResults([...results]);
    }

    // Trigger download
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `site-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Backup exported successfully');
    setExporting(false);
  }

  async function exportSingleTable(table: TableName) {
    try {
      const data = await fetchTable(table);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${table}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${data.length} rows from ${table}`);
    } catch {
      toast.error(`Failed to export ${table}`);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Backup
          </CardTitle>
          <CardDescription>
            Export all database tables to a single JSON file. Uses your admin access to read every table.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={exportAllTables} disabled={exporting} className="gap-2">
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {exporting ? 'Exporting...' : 'Export All Tables'}
          </Button>

          {exporting && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground">{progress}% — {tableResults.filter(t => t.status === 'done').length} / {TABLES.length} tables</p>
            </div>
          )}

          {tableResults.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 pt-2">
              {tableResults.map(t => (
                <div key={t.name} className="flex items-center gap-2 text-sm rounded-md border border-border px-3 py-2">
                  {t.status === 'done' && <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />}
                  {t.status === 'loading' && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />}
                  {t.status === 'error' && <span className="text-destructive shrink-0">✕</span>}
                  {t.status === 'pending' && <span className="h-3.5 w-3.5 shrink-0" />}
                  <span className="truncate">{t.name}</span>
                  {t.status === 'done' && <Badge variant="secondary" className="ml-auto text-xs">{t.rowCount}</Badge>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Individual Table Export</CardTitle>
          <CardDescription>Export a single table if you only need specific data.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {TABLES.map(table => (
              <Button key={table} variant="outline" size="sm" onClick={() => exportSingleTable(table)} disabled={exporting}>
                {table}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
