import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { RefreshCw, Eye, X, Mail, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';

interface Application {
  id: string;
  full_name: string;
  email: string;
  artist_name: string | null;
  genre: string | null;
  years_active: string | null;
  goals: string;
  portfolio_url: string | null;
  referral_source: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: 'Pending', variant: 'outline' },
  reviewing: { label: 'Reviewing', variant: 'secondary' },
  approved: { label: 'Approved', variant: 'default' },
  rejected: { label: 'Rejected', variant: 'destructive' },
};

export function AdminIncubatorApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Application | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updating, setUpdating] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    let query = supabase
      .from('incubator_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (error) {
      toast.error('Failed to load applications');
    } else {
      setApplications(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchApplications(); }, [statusFilter]);

  const updateApplication = async (id: string, status: string) => {
    setUpdating(true);
    const { error } = await supabase
      .from('incubator_applications')
      .update({ status, admin_notes: adminNotes || null })
      .eq('id', id);
    setUpdating(false);

    if (error) {
      toast.error('Failed to update application');
    } else {
      toast.success(`Application ${status}`);
      setSelected(null);
      fetchApplications();
    }
  };

  const openDetail = (app: Application) => {
    setSelected(app);
    setAdminNotes(app.admin_notes || '');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle>Incubator Applications</CardTitle>
            <CardDescription>{applications.length} application(s)</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={fetchApplications}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : applications.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No applications found.</p>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => {
              const sc = statusConfig[app.status] || statusConfig.pending;
              return (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => openDetail(app)}
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{app.full_name}</p>
                    <p className="text-sm text-muted-foreground truncate">{app.email}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {format(new Date(app.created_at), 'MMM d, yyyy')}
                    </span>
                    <Badge variant={sc.variant}>{sc.label}</Badge>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.full_name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Email</span>
                    <p className="font-medium">{selected.email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Artist Name</span>
                    <p className="font-medium">{selected.artist_name || '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Genre</span>
                    <p className="font-medium">{selected.genre || '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Experience</span>
                    <p className="font-medium">{selected.years_active || '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Referral</span>
                    <p className="font-medium">{selected.referral_source || '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Applied</span>
                    <p className="font-medium">{format(new Date(selected.created_at), 'MMM d, yyyy h:mm a')}</p>
                  </div>
                </div>

                {selected.portfolio_url && (
                  <div>
                    <span className="text-sm text-muted-foreground">Portfolio</span>
                    <a
                      href={selected.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-primary hover:underline truncate"
                    >
                      {selected.portfolio_url}
                    </a>
                  </div>
                )}

                <div>
                  <span className="text-sm text-muted-foreground">Goals</span>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{selected.goals}</p>
                </div>

                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Admin Notes</span>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Internal notes about this applicant..."
                    maxLength={2000}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="default"
                    className="flex-1 gap-1"
                    disabled={updating}
                    onClick={() => updateApplication(selected.id, 'approved')}
                  >
                    <CheckCircle className="h-4 w-4" /> Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 gap-1"
                    disabled={updating}
                    onClick={() => updateApplication(selected.id, 'rejected')}
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </Button>
                  <Button
                    variant="secondary"
                    className="gap-1"
                    disabled={updating}
                    onClick={() => updateApplication(selected.id, 'reviewing')}
                  >
                    <Clock className="h-4 w-4" /> Review
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
