import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuditLog } from '@/hooks/useAuditLog';
import { DollarSign, Mail, User, Music, Clock, CheckCircle, AlertCircle, X, Eye, ExternalLink } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type BeatLicenseSubmission = Database['public']['Tables']['beat_license_submissions']['Row'];

type PaymentStatus = 'pending' | 'paid' | 'cancelled' | 'refunded';

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  'pending': { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
  'paid': { label: 'Paid', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
  'cancelled': { label: 'Cancelled', color: 'bg-red-500/20 text-red-400', icon: X },
  'refunded': { label: 'Refunded', color: 'bg-orange-500/20 text-orange-400', icon: AlertCircle },
};

export function BeatLicenseManager() {
  const { logAccess } = useAuditLog();
  const [submissions, setSubmissions] = useState<BeatLicenseSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<BeatLicenseSubmission | null>(null);
  const [newStatus, setNewStatus] = useState<PaymentStatus>('pending');
  const [filter, setFilter] = useState<PaymentStatus | 'all'>('all');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Log when admin views beat license submissions
  useEffect(() => {
    if (submissions.length > 0) {
      logAccess({
        tableName: 'beat_license_submissions',
        action: 'view_list',
        details: { count: submissions.length },
      });
    }
  }, [submissions.length]);

  async function fetchSubmissions() {
    const { data, error } = await supabase
      .from('beat_license_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching beat license submissions:', error);
      toast.error('Failed to load beat license submissions');
      setSubmissions([]);
    } else {
      setSubmissions(data || []);
    }
    setLoading(false);
  }

  async function handleUpdateStatus() {
    if (!selectedSubmission) return;

    const { error } = await supabase
      .from('beat_license_submissions')
      .update({ payment_status: newStatus })
      .eq('id', selectedSubmission.id);

    if (error) {
      toast.error('Failed to update payment status');
      return;
    }

    // Log the update
    logAccess({
      tableName: 'beat_license_submissions',
      action: 'update_status',
      recordId: selectedSubmission.id,
      details: { 
        new_status: newStatus,
        customer_email: selectedSubmission.email,
      },
    });

    toast.success('Payment status updated');
    setSelectedSubmission(null);
    fetchSubmissions();
  }

  function openDetails(submission: BeatLicenseSubmission) {
    setSelectedSubmission(submission);
    setNewStatus(submission.payment_status as PaymentStatus);

    // Log when admin views specific submission details
    logAccess({
      tableName: 'beat_license_submissions',
      action: 'view_detail',
      recordId: submission.id,
      details: { 
        customer_email: submission.email,
        license_option: submission.license_option,
      },
    });
  }

  const filteredSubmissions = filter === 'all'
    ? submissions
    : submissions.filter(s => s.payment_status === filter);

  const totalRevenue = submissions
    .filter(s => s.payment_status === 'paid')
    .reduce((sum, s) => sum + s.total_amount, 0);

  const pendingCount = submissions.filter(s => s.payment_status === 'pending').length;

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} variant="feature">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32 mt-2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Music className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{submissions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Label>Filter:</Label>
          <Select value={filter} onValueChange={(v) => setFilter(v as PaymentStatus | 'all')}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Badge variant="outline">{filteredSubmissions.length} submissions</Badge>
      </div>

      {/* Detail Panel */}
      {selectedSubmission && (
        <Card className="border-maroon/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>License Request Details</span>
              <Button variant="ghost" size="icon" onClick={() => setSelectedSubmission(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              Submitted {new Date(selectedSubmission.created_at).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase mb-1">Customer</p>
                  <p className="font-medium">{selectedSubmission.full_name}</p>
                  {selectedSubmission.artist_name && (
                    <p className="text-sm text-muted-foreground">Artist: {selectedSubmission.artist_name}</p>
                  )}
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase mb-1">Email</p>
                  <a href={`mailto:${selectedSubmission.email}`} className="text-maroon hover:underline">
                    {selectedSubmission.email}
                  </a>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase mb-1">License Option</p>
                  <p className="font-medium">{selectedSubmission.license_option}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase mb-1">Total Amount</p>
                  <p className="text-xl font-bold text-green-400">${selectedSubmission.total_amount.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground uppercase mb-1">Beats Interested In</p>
              <p className="text-sm whitespace-pre-wrap">{selectedSubmission.beats_interested}</p>
            </div>

            {selectedSubmission.special_requests && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground uppercase mb-1">Special Requests</p>
                <p className="text-sm whitespace-pre-wrap">{selectedSubmission.special_requests}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Payment Status</Label>
              <Select value={newStatus} onValueChange={(v: PaymentStatus) => setNewStatus(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button variant="maroon" onClick={handleUpdateStatus}>Update Status</Button>
              <Button variant="outline" onClick={() => setSelectedSubmission(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <Card variant="console" className="p-8 text-center">
          <p className="text-muted-foreground">No beat license submissions found.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => {
            const config = statusConfig[submission.payment_status] || statusConfig['pending'];
            const StatusIcon = config.icon;

            return (
              <Card 
                key={submission.id} 
                variant="feature" 
                className={selectedSubmission?.id === submission.id ? 'ring-2 ring-maroon' : ''}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {submission.full_name}
                        </CardTitle>
                        <Badge className={config.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                        <Badge variant="outline" className="text-green-400 border-green-400/50">
                          <DollarSign className="w-3 h-3 mr-1" />
                          ${submission.total_amount.toFixed(2)}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {submission.email}
                        </span>
                        <span>•</span>
                        <span>{submission.license_option}</span>
                        <span>•</span>
                        <span>{new Date(submission.created_at).toLocaleDateString()}</span>
                      </CardDescription>
                    </div>
                    <Button variant="maroonOutline" size="sm" onClick={() => openDetails(submission)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Details
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground uppercase mb-1">Beats Interested In</p>
                    <p className="text-sm line-clamp-2">{submission.beats_interested}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
