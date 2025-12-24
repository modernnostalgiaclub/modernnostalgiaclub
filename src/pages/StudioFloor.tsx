import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { SectionLabel } from '@/components/SectionLabel';
import { TierGate } from '@/components/TierBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth, PatreonTier } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { isValidDiscoUrl } from '@/lib/urlValidation';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, ExternalLink, Info, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

type SubmissionStatus = 'pending' | 'in-review' | 'reviewed' | 'needs-revision';
type SubmissionType = 'sync-review' | 'catalog-audit' | 'branding' | 'project-proposal';

interface Submission {
  id: string;
  title: string;
  submission_type: SubmissionType;
  disco_url: string;
  notes: string | null;
  status: SubmissionStatus;
  reviewer_notes: string | null;
  created_at: string;
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
];

export default function StudioFloor() {
  const { user, profile, loading: authLoading, hasRole } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [submissionType, setSubmissionType] = useState<SubmissionType | ''>('');
  const [discoUrl, setDiscoUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [discoError, setDiscoError] = useState('');

  const userTier = (profile?.patreon_tier || 'lab-pass') as PatreonTier;
  const canViewInternalNotes = hasRole('admin') || hasRole('moderator');

  useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
  }, [user]);

  async function fetchSubmissions() {
    // Use the secure RPC function that excludes internal_notes for regular users
    const { data, error } = await supabase
      .rpc('get_user_submissions', { _user_id: user!.id });

    if (error) {
      console.error('Error fetching submissions:', error);
      setSubmissions([]);
    } else {
      // Sort by created_at descending since the function doesn't order
      const sortedData = (data || []).sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setSubmissions(sortedData);
    }
    setLoading(false);
  }

  const handleDiscoUrlChange = (value: string) => {
    setDiscoUrl(value);
    if (value && !isValidDiscoUrl(value)) {
      setDiscoError('Please enter a valid DISCO URL (https://disco.ac/...)');
    } else {
      setDiscoError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!submissionType) {
      toast.error('Please select a submission type');
      return;
    }
    if (!discoUrl.trim() || !isValidDiscoUrl(discoUrl)) {
      toast.error('Please enter a valid DISCO URL');
      return;
    }

    setSubmitting(true);

    const { error } = await supabase
      .from('submissions')
      .insert({
        user_id: user!.id,
        title: title.trim(),
        submission_type: submissionType,
        disco_url: discoUrl.trim(),
        notes: notes.trim() || null,
      });

    if (error) {
      console.error('Error creating submission:', error);
      toast.error('Failed to create submission');
    } else {
      toast.success('Submission created successfully');
      setTitle('');
      setSubmissionType('');
      setDiscoUrl('');
      setNotes('');
      setShowForm(false);
      fetchSubmissions();
    }

    setSubmitting(false);
  };

  // Redirect to home if not logged in
  if (!authLoading && !user) {
    return <Navigate to="/" replace />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background studio-grain">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <Skeleton className="h-12 w-64 mb-8" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background studio-grain">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={fadeIn} className="mb-8">
              <SectionLabel className="mb-4">Studio Floor</SectionLabel>
              <h1 className="text-4xl md:text-5xl font-display mb-4">
                Submissions & Reviews
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Submit your work for professional review. All audio is delivered through DISCO—the industry standard for sync and licensing.
              </p>
            </motion.div>
            
            {/* DISCO Notice */}
            <motion.div variants={fadeIn}>
              <Card variant="console" className="mb-8">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Info className="w-5 h-5 text-maroon shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm mb-3">
                        This Lab uses DISCO for professional catalog delivery. This mirrors real-world licensing workflows.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <Button variant="maroonOutline" size="sm" asChild>
                          <a href="https://disco.ac/signup?b=5076&u=23831" target="_blank" rel="noopener noreferrer">
                            Create a DISCO account
                            <ExternalLink className="ml-2 w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <TierGate 
              requiredTier="creator-accelerator" 
              currentTier={userTier}
              lockedContent={
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">Studio Floor access requires Creator Accelerator tier or higher.</p>
                  <Button variant="maroon" asChild>
                    <a href="https://patreon.com" target="_blank" rel="noopener noreferrer">
                      Upgrade on Patreon
                    </a>
                  </Button>
                </div>
              }
            >
              {/* New Submission Button */}
              <motion.div variants={fadeIn} className="mb-8">
                <Button 
                  variant="hero" 
                  onClick={() => setShowForm(!showForm)}
                  className="w-full md:w-auto"
                >
                  <Plus className="mr-2 w-5 h-5" />
                  New Submission
                </Button>
              </motion.div>
              
              {/* Submission Form */}
              {showForm && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8"
                >
                  <Card variant="elevated">
                    <CardHeader>
                      <CardTitle>Submit for Review</CardTitle>
                      <CardDescription>
                        All submissions require a DISCO playlist link for audio content.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="title">Title</Label>
                          <Input 
                            id="title" 
                            placeholder="e.g., Summer Vibes EP - Sync Review" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="type">Submission Type</Label>
                          <Select value={submissionType} onValueChange={(v) => setSubmissionType(v as SubmissionType)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {submissionTypes.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="disco">DISCO Playlist Link</Label>
                          <Input 
                            id="disco" 
                            placeholder="https://disco.ac/playlist/..." 
                            value={discoUrl}
                            onChange={(e) => handleDiscoUrlChange(e.target.value)}
                            className={discoError ? 'border-destructive' : ''}
                          />
                          {discoError ? (
                            <p className="text-xs text-destructive">{discoError}</p>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              Paste the share link from your DISCO playlist
                            </p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="notes">Additional Notes (Optional)</Label>
                          <Textarea 
                            id="notes" 
                            placeholder="Any context or specific feedback you're looking for..."
                            rows={4}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                          />
                        </div>
                        
                        <div className="flex gap-3">
                          <Button variant="maroon" type="submit" disabled={submitting}>
                            {submitting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              'Submit'
                            )}
                          </Button>
                          <Button variant="outline" type="button" onClick={() => setShowForm(false)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              
              {/* Submissions List */}
              <motion.div variants={fadeIn}>
                <h2 className="font-display text-2xl mb-6">Your Submissions</h2>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2].map(i => (
                      <Card key={i} variant="feature">
                        <CardHeader>
                          <Skeleton className="h-6 w-48" />
                          <Skeleton className="h-4 w-32 mt-2" />
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                ) : submissions.length > 0 ? (
                  <div className="space-y-4">
                    {submissions.map((submission) => {
                      const config = statusConfig[submission.status];
                      const StatusIcon = config.icon;
                      
                      return (
                        <Card key={submission.id} variant="feature">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-3 mb-1">
                                  <CardTitle>{submission.title}</CardTitle>
                                  <Badge className={config.color}>
                                    <StatusIcon className={`w-3 h-3 mr-1 ${submission.status === 'in-review' ? 'animate-spin' : ''}`} />
                                    {config.label}
                                  </Badge>
                                </div>
                                <CardDescription>
                                  {submissionTypes.find(t => t.value === submission.submission_type)?.label} • 
                                  {new Date(submission.created_at).toLocaleDateString()}
                                </CardDescription>
                              </div>
                              <Button variant="outline" size="sm" asChild>
                                <a href={submission.disco_url} target="_blank" rel="noopener noreferrer">
                                  View on DISCO
                                  <ExternalLink className="ml-2 w-4 h-4" />
                                </a>
                              </Button>
                            </div>
                          </CardHeader>
                          {(submission.notes || submission.reviewer_notes) && (
                            <CardContent className="pt-0">
                              {submission.notes && (
                                <div className="mb-3">
                                  <p className="text-xs text-muted-foreground uppercase mb-1">Your Notes</p>
                                  <p className="text-sm">{submission.notes}</p>
                                </div>
                              )}
                              {submission.reviewer_notes && (
                                <div className="p-3 bg-maroon/10 rounded-lg">
                                  <p className="text-xs text-maroon uppercase mb-1">Reviewer Feedback</p>
                                  <p className="text-sm">{submission.reviewer_notes}</p>
                                </div>
                              )}
                            </CardContent>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card variant="console" className="p-8 text-center">
                    <p className="text-muted-foreground">No submissions yet. Create your first one above.</p>
                  </Card>
                )}
              </motion.div>
            </TierGate>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
