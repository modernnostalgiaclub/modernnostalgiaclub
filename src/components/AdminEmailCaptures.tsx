import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { useAuditLog } from '@/hooks/useAuditLog';
import { Download, Mail, Search, RefreshCw, FileDown } from 'lucide-react';
import { format } from 'date-fns';

interface EmailCapture {
  id: string;
  email: string;
  track_id: string;
  track_title: string | null;
  created_at: string;
}

export function AdminEmailCaptures() {
  const [captures, setCaptures] = useState<EmailCapture[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [exporting, setExporting] = useState(false);
  const { logAccess } = useAuditLog();

  const fetchCaptures = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('download_email_captures')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCaptures(data || []);
      await logAccess({ tableName: 'download_email_captures', action: 'view_list', details: { count: data?.length } });
    } catch (error) {
      console.error('Error fetching email captures:', error);
      toast.error('Failed to load email captures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptures();
  }, []);

  const filteredCaptures = captures.filter(capture =>
    capture.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (capture.track_title?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get unique emails for stats
  const uniqueEmails = new Set(captures.map(c => c.email)).size;
  const uniqueTracks = new Set(captures.map(c => c.track_id)).size;

  const exportToCSV = async () => {
    setExporting(true);
    try {
      // Create CSV content
      const headers = ['Email', 'Track Title', 'Track ID', 'Captured At'];
      const rows = filteredCaptures.map(capture => [
        capture.email,
        capture.track_title || 'Unknown',
        capture.track_id,
        format(new Date(capture.created_at), 'yyyy-MM-dd HH:mm:ss')
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `email-captures-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      await logAccess({ 
        tableName: 'download_email_captures', 
        action: 'export', 
        details: { count: filteredCaptures.length, filtered: searchTerm ? true : false }
      });
      toast.success(`Exported ${filteredCaptures.length} email captures`);
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Failed to export email captures');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Captures</CardDescription>
            <CardTitle className="text-3xl">{captures.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Unique Emails</CardDescription>
            <CardTitle className="text-3xl">{uniqueEmails}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Downloads Tracked</CardDescription>
            <CardTitle className="text-3xl">{uniqueTracks}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Captures
              </CardTitle>
              <CardDescription>
                Emails collected from free download gates
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchCaptures}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button 
                variant="maroon" 
                size="sm" 
                onClick={exportToCSV}
                disabled={exporting || filteredCaptures.length === 0}
              >
                <FileDown className="h-4 w-4 mr-2" />
                {exporting ? 'Exporting...' : 'Export CSV'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or track..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Table */}
          {filteredCaptures.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No captures match your search' : 'No email captures yet'}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Track</TableHead>
                    <TableHead>Captured</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCaptures.map((capture) => (
                    <TableRow key={capture.id}>
                      <TableCell className="font-medium">{capture.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {capture.track_title || 'Unknown Track'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(capture.created_at), 'MMM d, yyyy h:mm a')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {filteredCaptures.length > 0 && (
            <p className="text-sm text-muted-foreground mt-4">
              Showing {filteredCaptures.length} of {captures.length} captures
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
