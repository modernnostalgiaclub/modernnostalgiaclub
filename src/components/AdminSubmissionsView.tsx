import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useAuditLog } from '@/hooks/useAuditLog';
import { ExternalLink, Clock, Eye, CheckCircle, AlertCircle, Loader2, X, Shield, Music, Sparkles, FolderOpen } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type SubmissionStatus = Database['public']['Enums']['submission_status'];
type SubmissionType = Database['public']['Enums']['submission_type'];

interface AdminSubmission {
  id: string;
  user_id: string;
  title: string;
  submission_type: SubmissionType;
  disco_url: string;
  notes: string | null;
  status: SubmissionStatus;
  reviewer_notes: string | null;
  internal_notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
  profiles?: { name: string | null } | null;
}

const statusConfig: Record<SubmissionStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  'pending': { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
  'in-review': { label: 'In Review', color: 'bg-blue-500/20 text-blue-400', icon: Loader2 },
  'reviewed': { label: 'Reviewed', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
  'needs-revision': { label: 'Needs Revision', color: 'bg-orange-500/20 text-orange-400', icon: AlertCircle },
};

const submissionTypes: { value: SubmissionType; label: string }[] = [
  { value: 'sync-review', label: 'Sync Review' },
  { value: 'catalog-audit', label: 'Catalog Audit' },
  { value: 'branding', label: 'Branding Materials' },
  { value: 'project-proposal', label: 'Project Proposal' },
  { value: 'audio-mission', label: 'Audio Mission' },
  { value: 'producer-mission', label: 'Producer Mission' },
];

const isAudioMission = (type: SubmissionType) => type === 'audio-mission' || type === 'producer-mission';

export function AdminSubmissionsView() {
  const { user } = useAuth();
  const { logAccess } = useAuditLog();
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<AdminSubmission | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [newStatus, setNewStatus] = useState<SubmissionStatus>('pending');
  const [filter, setFilter] = useState<SubmissionStatus | 'all'>('all');

  useEffect(() => {
    fetchAllSubmissions();
  }, []);

  // Log when admin views submissions list
  useEffect(() => {
    if (submissions.length > 0) {
      logAccess({
        tableName: 'submissions',
        action: 'view_list',
        details: { count: submissions.length },
      });
    }
  }, [submissions.length]);

  async function fetchAllSubmissions() {
    // Use the secure RPC function for fetching submissions
    // For admins/moderators, this returns all submissions with full access
    const { data, error } = await supabase.rpc('get_user_submissions');

    if (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load submissions');
      setSubmissions([]);
      setLoading(false);
      return;
    }
    
    // Fetch profile names and internal_notes separately for admin view
    const userIds = [...new Set((data || []).map(s => s.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, name')
      .in('user_id', userIds);
    
    // Fetch internal_notes directly from submissions table (admins have access)
    const submissionIds = (data || []).map(s => s.id);
    const { data: internalData } = await supabase
      .from('submissions')
      .select('id, internal_notes')
      .in('id', submissionIds);
    
    const profileMap = new Map(profiles?.map(p => [p.user_id, p.name]) || []);
    const internalNotesMap = new Map(internalData?.map(s => [s.id, s.internal_notes]) || []);
    
    const submissionsWithProfiles = (data || [])
      .map(s => ({
        ...s,
        internal_notes: internalNotesMap.get(s.id) || null,
        profiles: { name: profileMap.get(s.user_id) || null }
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    setSubmissions(submissionsWithProfiles);
    setLoading(false);
  }

  async function handleUpdateSubmission() {
    if (!selectedSubmission || !user) return;

    const { error } = await supabase
      .from('submissions')
      .update({
        status: newStatus,
        reviewer_notes: reviewerNotes,
        internal_notes: internalNotes,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', selectedSubmission.id);

    if (error) {
      toast.error('Failed to update submission');
      return;
    }

    // Log the update action
    logAccess({
      tableName: 'submissions',
      action: 'update',
      recordId: selectedSubmission.id,
      details: { 
        new_status: newStatus,
        submission_type: selectedSubmission.submission_type,
      },
    });

    toast.success('Submission updated');
    setSelectedSubmission(null);
    fetchAllSubmissions();
  }

  function openReview(submission: AdminSubmission) {
    setSelectedSubmission(submission);
    setReviewerNotes(submission.reviewer_notes || '');
    setInternalNotes(submission.internal_notes || '');
    setNewStatus(submission.status);
    
    // Log when admin opens a specific submission for review
    logAccess({
      tableName: 'submissions',
      action: 'view_detail',
      recordId: submission.id,
      details: { 
        submission_type: submission.submission_type,
        title: submission.title,
      },
    });
  }

  const filteredSubmissions = filter === 'all'
    ? submissions
    : submissions.filter(s => s.status === filter);

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
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-maroon" />
          <span className="font-medium">Admin View</span>
        </div>
        <div className="flex items-center gap-2">
          <Label>Filter:</Label>
          <Select value={filter} onValueChange={(v) => setFilter(v as SubmissionStatus | 'all')}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-review">In Review</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="needs-revision">Needs Revision</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Badge variant="outline">{filteredSubmissions.length} submissions</Badge>
      </div>

      {/* Review Panel */}
      {selectedSubmission && (
        <Card className="border-maroon/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Review: {selectedSubmission.title}</span>
              <Button variant="ghost" size="icon" onClick={() => setSelectedSubmission(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              By {selectedSubmission.profiles?.name || 'Unknown'} • {' '}
              {submissionTypes.find(t => t.value === selectedSubmission.submission_type)?.label}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">DISCO URL:</p>
              <a
                href={selectedSubmission.disco_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-maroon hover:underline break-all"
              >
                {selectedSubmission.disco_url}
              </a>
              {selectedSubmission.notes && (
                <>
                  <p className="text-sm font-medium mt-4 mb-2">User Notes:</p>
                  <p className="text-sm text-muted-foreground">{selectedSubmission.notes}</p>
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={newStatus} onValueChange={(v: SubmissionStatus) => setNewStatus(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-review">In Review</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="needs-revision">Needs Revision</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reviewer Notes (visible to user)</Label>
              <Textarea
                value={reviewerNotes}
                onChange={e => setReviewerNotes(e.target.value)}
                placeholder="Feedback for the user..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-maroon" />
                Internal Notes (only visible to moderators)
              </Label>
              <Textarea
                value={internalNotes}
                onChange={e => setInternalNotes(e.target.value)}
                placeholder="Private notes..."
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="maroon" onClick={handleUpdateSubmission}>Save Review</Button>
              <Button variant="outline" onClick={() => setSelectedSubmission(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <Card variant="console" className="p-8 text-center">
          <p className="text-muted-foreground">No submissions found.</p>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Audio Mission Submissions */}
          {filteredSubmissions.filter(s => isAudioMission(s.submission_type)).length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-display text-maroon flex items-center gap-2">
                <Music className="w-5 h-5" />
                Audio Mission Submissions ({filteredSubmissions.filter(s => isAudioMission(s.submission_type)).length})
              </h3>
              {filteredSubmissions.filter(s => isAudioMission(s.submission_type)).map((submission) => {
                const config = statusConfig[submission.status];
                const StatusIcon = config.icon;
                const isProducerMission = submission.submission_type === 'producer-mission';

                return (
                  <Card key={submission.id} variant="feature" className={`${selectedSubmission?.id === submission.id ? 'ring-2 ring-maroon' : ''} ${isProducerMission ? 'border-purple-500/30 bg-purple-500/5' : ''}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <CardTitle>{submission.title}</CardTitle>
                            <Badge className={config.color}>
                              <StatusIcon className={`w-3 h-3 mr-1 ${submission.status === 'in-review' ? 'animate-spin' : ''}`} />
                              {config.label}
                            </Badge>
                            {isProducerMission && (
                              <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                                <Sparkles className="w-3 h-3 mr-1" />
                                Producer
                              </Badge>
                            )}
                          </div>
                          <CardDescription>
                            {submission.profiles?.name || 'Unknown'} • {' '}
                            {submissionTypes.find(t => t.value === submission.submission_type)?.label} • {' '}
                            {new Date(submission.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button variant="outline" size="sm" asChild>
                            <a href={submission.disco_url} target="_blank" rel="noopener noreferrer">
                              {isProducerMission ? 'Link' : 'DISCO'}
                              <ExternalLink className="ml-2 w-4 h-4" />
                            </a>
                          </Button>
                          <Button variant="maroonOutline" size="sm" onClick={() => openReview(submission)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Review
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {(submission.internal_notes || submission.reviewer_notes) && (
                      <CardContent className="pt-0">
                        {submission.internal_notes && (
                          <div className="p-3 bg-maroon/10 rounded-lg mb-3 border border-maroon/20">
                            <p className="text-xs text-maroon uppercase mb-1 flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              Internal Notes
                            </p>
                            <p className="text-sm">{submission.internal_notes}</p>
                          </div>
                        )}
                        {submission.reviewer_notes && (
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground uppercase mb-1">Reviewer Feedback</p>
                            <p className="text-sm">{submission.reviewer_notes}</p>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {/* Other Submissions */}
          {filteredSubmissions.filter(s => !isAudioMission(s.submission_type)).length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-display flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                Other Submissions ({filteredSubmissions.filter(s => !isAudioMission(s.submission_type)).length})
              </h3>
              {filteredSubmissions.filter(s => !isAudioMission(s.submission_type)).map((submission) => {
                const config = statusConfig[submission.status];
                const StatusIcon = config.icon;

                return (
                  <Card key={submission.id} variant="feature" className={selectedSubmission?.id === submission.id ? 'ring-2 ring-maroon' : ''}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <CardTitle>{submission.title}</CardTitle>
                            <Badge className={config.color}>
                              <StatusIcon className={`w-3 h-3 mr-1 ${submission.status === 'in-review' ? 'animate-spin' : ''}`} />
                              {config.label}
                            </Badge>
                          </div>
                          <CardDescription>
                            {submission.profiles?.name || 'Unknown'} • {' '}
                            {submissionTypes.find(t => t.value === submission.submission_type)?.label} • {' '}
                            {new Date(submission.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button variant="outline" size="sm" asChild>
                            <a href={submission.disco_url} target="_blank" rel="noopener noreferrer">
                              DISCO
                              <ExternalLink className="ml-2 w-4 h-4" />
                            </a>
                          </Button>
                          <Button variant="maroonOutline" size="sm" onClick={() => openReview(submission)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Review
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {(submission.internal_notes || submission.reviewer_notes) && (
                      <CardContent className="pt-0">
                        {submission.internal_notes && (
                          <div className="p-3 bg-maroon/10 rounded-lg mb-3 border border-maroon/20">
                            <p className="text-xs text-maroon uppercase mb-1 flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              Internal Notes
                            </p>
                            <p className="text-sm">{submission.internal_notes}</p>
                          </div>
                        )}
                        {submission.reviewer_notes && (
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground uppercase mb-1">Reviewer Feedback</p>
                            <p className="text-sm">{submission.reviewer_notes}</p>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
