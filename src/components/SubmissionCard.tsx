import { Submission } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SafeExternalLink } from '@/components/SafeExternalLink';
import { ExternalLink, Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubmissionCardProps {
  submission: Submission;
  showInternalNotes?: boolean;
}

const statusConfig = {
  'submitted': { label: 'Submitted', icon: Clock, color: 'bg-muted text-muted-foreground' },
  'in-review': { label: 'In Review', icon: Clock, color: 'bg-amber/20 text-amber' },
  'needs-revision': { label: 'Needs Revision', icon: AlertCircle, color: 'bg-destructive/20 text-destructive' },
  'approved': { label: 'Approved', icon: CheckCircle, color: 'bg-green-500/20 text-green-400' },
};

const typeLabels = {
  'sync-review': 'Sync Review',
  'catalog-audit': 'Catalog Audit',
  'branding': 'Branding Materials',
  'project-proposal': 'Project Proposal',
};

export function SubmissionCard({ submission, showInternalNotes = false }: SubmissionCardProps) {
  const status = statusConfig[submission.status];
  const StatusIcon = status.icon;
  
  return (
    <Card variant="feature" className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg">{submission.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              by {submission.submittedBy} · {submission.createdAt.toLocaleDateString()}
            </p>
          </div>
          <Badge variant="outline" className={cn("shrink-0", status.color)}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{typeLabels[submission.type]}</span>
        </div>
        
        {submission.discoLink && (
          <div className="p-4 bg-secondary/50 rounded-lg border border-border/50">
            <p className="text-xs text-muted-foreground mb-2">DISCO Playlist</p>
            <div className="flex items-center justify-between">
              <code className="text-xs text-foreground/80 truncate flex-1">
                {submission.discoLink}
              </code>
              <SafeExternalLink 
                href={submission.discoLink} 
                requireDisco={true}
                fallback={
                  <span className="text-xs text-muted-foreground">Invalid DISCO link</span>
                }
              >
                <Button variant="ghost" size="sm">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </SafeExternalLink>
            </div>
          </div>
        )}
        
        {showInternalNotes && submission.internalNotes && (
          <div className="p-4 bg-amber/10 rounded-lg border border-amber/20">
            <p className="text-xs text-amber mb-1 font-medium">Internal Notes</p>
            <p className="text-sm text-foreground/80">{submission.internalNotes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
