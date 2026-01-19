import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { RefreshCw, Download, Search, Target, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useAuditLog } from '@/hooks/useAuditLog';
import { format } from 'date-fns';
import type { Json } from '@/integrations/supabase/types';

interface QuizResult {
  id: string;
  email: string;
  result_type: string;
  score: number;
  answers: Json;
  created_at: string;
}

type ResultFilter = 'all' | 'sync-ready' | 'almost-ready' | 'not-ready';

const resultConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  'sync-ready': { 
    label: 'Sync-Ready', 
    color: 'bg-green-500/10 text-green-600 border-green-500/20',
    icon: CheckCircle 
  },
  'almost-ready': { 
    label: 'Almost Ready', 
    color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    icon: AlertTriangle 
  },
  'not-ready': { 
    label: 'Not Ready', 
    color: 'bg-red-500/10 text-red-600 border-red-500/20',
    icon: XCircle 
  },
};

export function AdminSyncQuizResults() {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<ResultFilter>('all');
  const [exporting, setExporting] = useState(false);
  const { logAccess } = useAuditLog();

  useEffect(() => {
    fetchResults();
    logAccess({ tableName: 'sync_quiz_results', action: 'view_list' });
  }, [logAccess]);

  async function fetchResults() {
    setLoading(true);
    const { data, error } = await supabase
      .from('sync_quiz_results')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching quiz results:', error);
      toast.error('Failed to load quiz results');
    } else {
      setResults(data || []);
    }
    setLoading(false);
  }

  const filteredResults = results.filter(result => {
    const matchesSearch = result.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || result.result_type === filterType;
    return matchesSearch && matchesFilter;
  });

  // Statistics
  const stats = {
    total: results.length,
    syncReady: results.filter(r => r.result_type === 'sync-ready').length,
    almostReady: results.filter(r => r.result_type === 'almost-ready').length,
    notReady: results.filter(r => r.result_type === 'not-ready').length,
  };

  async function exportToCSV() {
    setExporting(true);
    try {
      const csvContent = [
        ['Email', 'Result Type', 'Score', 'Date'].join(','),
        ...filteredResults.map(result => [
          `"${result.email}"`,
          result.result_type,
          result.score,
          format(new Date(result.created_at), 'yyyy-MM-dd HH:mm'),
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sync-quiz-results-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      await logAccess({ 
        tableName: 'sync_quiz_results', 
        action: 'export',
        details: { count: filteredResults.length, filter: filterType }
      });
      toast.success(`Exported ${filteredResults.length} results`);
    } catch (error) {
      toast.error('Failed to export results');
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-12" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Submissions</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sync-Ready</CardDescription>
            <CardTitle className="text-2xl text-green-600 dark:text-green-400">{stats.syncReady}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {stats.total > 0 ? ((stats.syncReady / stats.total) * 100).toFixed(1) : 0}% of total
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Almost Ready</CardDescription>
            <CardTitle className="text-2xl text-yellow-600 dark:text-yellow-400">{stats.almostReady}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {stats.total > 0 ? ((stats.almostReady / stats.total) * 100).toFixed(1) : 0}% of total
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Not Ready</CardDescription>
            <CardTitle className="text-2xl text-red-600 dark:text-red-400">{stats.notReady}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {stats.total > 0 ? ((stats.notReady / stats.total) * 100).toFixed(1) : 0}% of total
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterType} onValueChange={(v: ResultFilter) => setFilterType(v)}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Filter by result" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Results</SelectItem>
              <SelectItem value="sync-ready">Sync-Ready</SelectItem>
              <SelectItem value="almost-ready">Almost Ready</SelectItem>
              <SelectItem value="not-ready">Not Ready</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchResults} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportToCSV} 
            disabled={exporting || filteredResults.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredResults.length} of {results.length} results
        {filterType !== 'all' && ` (filtered by ${resultConfig[filterType]?.label})`}
      </p>

      {/* Results Table */}
      {filteredResults.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              {results.length === 0 
                ? 'No quiz submissions yet' 
                : 'No results match your search'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Result</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.map((result) => {
                const config = resultConfig[result.result_type] || resultConfig['not-ready'];
                const Icon = config.icon;
                return (
                  <TableRow key={result.id}>
                    <TableCell className="font-medium">{result.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`gap-1 ${config.color}`}>
                        <Icon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-mono text-sm">{result.score}/21</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(result.created_at), 'MMM d, yyyy h:mm a')}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
